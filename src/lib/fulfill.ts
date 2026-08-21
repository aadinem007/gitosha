import { prisma } from "@/lib/prisma";
import { generateLicenseKey } from "@/lib/license";
import { sendLicenseKeyEmail, sendWelcomeEmail } from "@/lib/email";
import { FOUNDRY_PLANS, VAULT_PLANS } from "@/lib/pricing";
import { securityLog } from "@/lib/secure";

/** Historical provider tags still exist on old license/subscriber rows. New fulfill is Xflow. */
export type PaymentProvider = "xflow" | "stripe" | "razorpay" | "paypal";

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
  const provider = opts.provider ?? "xflow";

  const existing = await prisma.subscriber.findUnique({ where: { email: opts.email } });
  const alreadyActiveSameTier =
    existing?.status === "ACTIVE" &&
    existing.tier === tier &&
    (provider === "xflow"
      ? !opts.subscriptionId || existing.xflowSubscriptionId === opts.subscriptionId
      : existing.status === "ACTIVE" && existing.tier === tier);

  const xflowFields =
    provider === "xflow" && opts.subscriptionId
      ? { xflowSubscriptionId: opts.subscriptionId }
      : {};

  await prisma.subscriber.upsert({
    where: { email: opts.email },
    create: {
      email: opts.email,
      tier,
      status: "ACTIVE",
      ...xflowFields,
    },
    update: {
      tier,
      status: "ACTIVE",
      ...xflowFields,
    },
  });

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
  const provider = opts.provider ?? "xflow";

  if (opts.paymentId) {
    const existing = await prisma.licenseKey.findFirst({
      where: {
        OR: [
          { xflowIntentId: opts.paymentId },
          { stripePaymentId: opts.paymentId },
          { razorpayPaymentId: opts.paymentId },
          { paypalCaptureId: opts.paymentId },
          ...(opts.orderId
            ? [
                { stripeCheckoutSessionId: opts.orderId },
                { razorpayOrderId: opts.orderId },
                { paypalOrderId: opts.orderId },
              ]
            : []),
        ],
      },
    });
    if (existing) return existing.key;
  }

  const key = generateLicenseKey();
  await prisma.licenseKey.create({
    data: {
      key,
      email: opts.email,
      tier,
      ...(provider === "xflow" ? { xflowIntentId: opts.paymentId } : {}),
    },
  });
  await sendLicenseKeyEmail(opts.email, key, tier);
  return key;
}

export async function fulfillPurchase(opts: {
  email: string;
  planId: string;
  paymentId?: string;
  orderId?: string;
  subscriptionId?: string;
  customerId?: string;
  provider?: PaymentProvider;
}): Promise<{ licenseKey?: string; product: string }> {
  const provider = opts.provider ?? "xflow";

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
      subscriptionId: opts.subscriptionId,
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
