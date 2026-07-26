import { prisma } from "@/lib/prisma";
import { generateLicenseKey } from "@/lib/license";
import { sendLicenseKeyEmail, sendWelcomeEmail } from "@/lib/email";

export type PaymentProvider = "stripe" | "razorpay";

export async function fulfillVaultSubscription(opts: {
  email: string;
  planId: string;
  subscriptionId?: string;
  customerId?: string;
  provider?: PaymentProvider;
}) {
  const tier = opts.planId.includes("team") || opts.planId.includes("studio") ? "TEAM" : "PRO";
  const provider = opts.provider ?? "stripe";

  await prisma.subscriber.upsert({
    where: { email: opts.email },
    create: {
      email: opts.email,
      tier,
      status: "ACTIVE",
      ...(provider === "stripe"
        ? {
            stripeCustomerId: opts.customerId,
            stripeSubscriptionId: opts.subscriptionId,
          }
        : {
            razorpayCustomerId: opts.customerId,
            razorpaySubscriptionId: opts.subscriptionId,
          }),
    },
    update: {
      tier,
      status: "ACTIVE",
      ...(provider === "stripe"
        ? {
            stripeCustomerId: opts.customerId,
            stripeSubscriptionId: opts.subscriptionId,
          }
        : {
            razorpayCustomerId: opts.customerId,
            razorpaySubscriptionId: opts.subscriptionId,
          }),
    },
  });
  await sendWelcomeEmail(opts.email, tier);
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
    const existing =
      provider === "stripe"
        ? await prisma.licenseKey.findFirst({
            where: {
              OR: [
                { stripePaymentId: opts.paymentId },
                ...(opts.orderId ? [{ stripeCheckoutSessionId: opts.orderId }] : []),
              ],
            },
          })
        : await prisma.licenseKey.findUnique({ where: { razorpayPaymentId: opts.paymentId } });
    if (existing) return existing.key;
  }

  const key = generateLicenseKey();
  await prisma.licenseKey.create({
    data: {
      key,
      email: opts.email,
      tier,
      ...(provider === "stripe"
        ? {
            stripePaymentId: opts.paymentId,
            stripeCheckoutSessionId: opts.orderId,
          }
        : {
            razorpayPaymentId: opts.paymentId,
            razorpayOrderId: opts.orderId,
          }),
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
