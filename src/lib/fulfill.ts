import { prisma } from "@/lib/prisma";
import { generateLicenseKey } from "@/lib/license";
import { sendLicenseKeyEmail, sendWelcomeEmail } from "@/lib/email";
import { FOUNDRY_PLANS, VAULT_PLANS } from "@/lib/pricing";
import { securityLog } from "@/lib/secure";

export type PaymentProvider = "stripe" | "razorpay" | "paypal" | "xflow";

/** Paid plan ids only — never trust arbitrary client/webhook plan strings. */
export const FULFILLABLE_PLAN_IDS = new Set(
  [...VAULT_PLANS, ...FOUNDRY_PLANS]
    .filter((p) => p.mode !== "none")
    .map((p) => p.id)
);

export function isFulfillablePlanId(planId: string): boolean {
  return FULFILLABLE_PLAN_IDS.has(planId as (typeof VAULT_PLANS)[number]["id"]);
}

export async function fulfillVaultSubscription(opts: {
  email: string;
  planId: string;
  subscriptionId?: string;
  customerId?: string;
  provider?: PaymentProvider;
}) {
  const tier = opts.planId.includes("team") || opts.planId.includes("studio") ? "TEAM" : "PRO";
  const provider = opts.provider ?? "stripe";

  const existing = await prisma.subscriber.findUnique({ where: { email: opts.email } });
  const alreadyActiveSameTier =
    existing?.status === "ACTIVE" &&
    existing.tier === tier &&
    (provider === "stripe"
      ? Boolean(opts.subscriptionId) && existing.stripeSubscriptionId === opts.subscriptionId
      : provider === "razorpay"
        ? Boolean(opts.subscriptionId) && existing.razorpaySubscriptionId === opts.subscriptionId
        : existing.status === "ACTIVE" && existing.tier === tier);

  const stripeFields =
    provider === "stripe"
      ? {
          stripeCustomerId: opts.customerId,
          stripeSubscriptionId: opts.subscriptionId,
        }
      : {};
  const razorpayFields =
    provider === "razorpay"
      ? {
          razorpayCustomerId: opts.customerId,
          razorpaySubscriptionId: opts.subscriptionId,
        }
      : {};

  await prisma.subscriber.upsert({
    where: { email: opts.email },
    create: {
      email: opts.email,
      tier,
      status: "ACTIVE",
      ...stripeFields,
      ...razorpayFields,
    },
    update: {
      tier,
      status: "ACTIVE",
      ...stripeFields,
      ...razorpayFields,
    },
  });

  // Idempotent webhooks / verify retries must not spam welcome mail
  if (!alreadyActiveSameTier && !(existing?.status === "ACTIVE" && existing.tier === tier)) {
    await sendWelcomeEmail(opts.email, tier);
  }
}

export async function fulfillFoundryPurchase(opts: {
  email: string;
  planId: string;
  paymentId?: string;
  orderId?: string;
  provider?: PaymentProvider;
}) {
  const tier = opts.planId.includes("agency") ? "AGENCY" : "SOLO";
  const provider = opts.provider ?? "stripe";

  if (opts.paymentId) {
    let existing = null;
    if (provider === "stripe") {
      existing = await prisma.licenseKey.findFirst({
        where: {
          OR: [
            { stripePaymentId: opts.paymentId },
            ...(opts.orderId ? [{ stripeCheckoutSessionId: opts.orderId }] : []),
          ],
        },
      });
    } else if (provider === "razorpay") {
      existing = await prisma.licenseKey.findUnique({
        where: { razorpayPaymentId: opts.paymentId },
      });
    } else if (provider === "paypal") {
      existing = await prisma.licenseKey.findFirst({
        where: {
          OR: [
            { paypalCaptureId: opts.paymentId },
            ...(opts.orderId ? [{ paypalOrderId: opts.orderId }] : []),
          ],
        },
      });
    } else if (provider === "xflow") {
      existing = await prisma.licenseKey.findUnique({
        where: { xflowIntentId: opts.paymentId },
      });
    }
    if (existing) return existing.key;
  }

  const key = generateLicenseKey();
  const providerFields =
    provider === "stripe"
      ? {
          stripePaymentId: opts.paymentId,
          stripeCheckoutSessionId: opts.orderId,
        }
      : provider === "razorpay"
        ? {
            razorpayPaymentId: opts.paymentId,
            razorpayOrderId: opts.orderId,
          }
        : provider === "paypal"
          ? {
              paypalCaptureId: opts.paymentId,
              paypalOrderId: opts.orderId,
            }
          : {
              xflowIntentId: opts.paymentId,
            };

  await prisma.licenseKey.create({
    data: {
      key,
      email: opts.email,
      tier,
      ...providerFields,
    },
  });
  await sendLicenseKeyEmail(opts.email, key, tier);
  return key;
}

/** Bundle / annual / foundry unlocks — single entry used by verify + webhook. */
export async function fulfillPurchase(opts: {
  email: string;
  planId: string;
  paymentId?: string;
  orderId?: string;
  subscriptionId?: string;
  customerId?: string;
  provider?: PaymentProvider;
}): Promise<{ licenseKey?: string; product: string }> {
  const provider = opts.provider ?? "stripe";

  // Fail closed: refuse unknown / free / forged plan ids from notes or metadata
  if (!isFulfillablePlanId(opts.planId)) {
    securityLog("fulfill_unknown_plan", { planId: opts.planId.slice(0, 64), provider });
    return { product: "unknown" };
  }

  if (opts.planId === "bundle-launch") {
    const licenseKey = await fulfillFoundryPurchase({
      email: opts.email,
      planId: "foundry-solo",
      paymentId: opts.paymentId,
      orderId: opts.orderId,
      provider,
    });
    await fulfillVaultSubscription({
      email: opts.email,
      planId: "vault-pro-annual",
      provider,
    });
    return { licenseKey, product: "bundle" };
  }

  if (opts.planId.startsWith("foundry-")) {
    const licenseKey = await fulfillFoundryPurchase({ ...opts, provider });
    if (opts.planId === "foundry-solo") {
      await fulfillVaultSubscription({ email: opts.email, planId: "vault-pro", provider });
    }
    if (opts.planId === "foundry-agency") {
      await fulfillVaultSubscription({ email: opts.email, planId: "vault-team", provider });
    }
    return { licenseKey, product: "foundry" };
  }

  if (opts.planId.startsWith("vault-")) {
    await fulfillVaultSubscription({
      email: opts.email,
      planId: opts.planId,
      subscriptionId: opts.subscriptionId,
      customerId: opts.customerId,
      provider,
    });
    return { product: "vault" };
  }

  return { product: "unknown" };
}
