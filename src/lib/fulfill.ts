import { prisma } from "@/lib/prisma";
import { generateLicenseKey } from "@/lib/license";
import { sendLicenseKeyEmail, sendWelcomeEmail } from "@/lib/email";

export async function fulfillVaultSubscription(opts: {
  email: string;
  planId: string;
  subscriptionId?: string;
  customerId?: string;
}) {
  const tier = opts.planId.includes("team") || opts.planId.includes("studio") ? "TEAM" : "PRO";
  await prisma.subscriber.upsert({
    where: { email: opts.email },
    create: {
      email: opts.email,
      tier,
      status: "ACTIVE",
      razorpayCustomerId: opts.customerId,
      razorpaySubscriptionId: opts.subscriptionId,
    },
    update: {
      tier,
      status: "ACTIVE",
      razorpayCustomerId: opts.customerId,
      razorpaySubscriptionId: opts.subscriptionId,
    },
  });
  await sendWelcomeEmail(opts.email, tier);
}

export async function fulfillFoundryPurchase(opts: {
  email: string;
  planId: string;
  paymentId?: string;
  orderId?: string;
}) {
  const tier = opts.planId.includes("agency") ? "AGENCY" : "SOLO";
  const existing = opts.paymentId
    ? await prisma.licenseKey.findUnique({ where: { razorpayPaymentId: opts.paymentId } })
    : null;
  if (existing) return existing.key;

  const key = generateLicenseKey();
  await prisma.licenseKey.create({
    data: {
      key,
      email: opts.email,
      tier,
      razorpayPaymentId: opts.paymentId,
      razorpayOrderId: opts.orderId,
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
}): Promise<{ licenseKey?: string; product: string }> {
  if (opts.planId === "bundle-launch") {
    const licenseKey = await fulfillFoundryPurchase({
      email: opts.email,
      planId: "foundry-solo",
      paymentId: opts.paymentId,
      orderId: opts.orderId,
    });
    await fulfillVaultSubscription({
      email: opts.email,
      planId: "vault-pro-annual",
    });
    return { licenseKey, product: "bundle" };
  }

  if (opts.planId.startsWith("foundry-")) {
    const licenseKey = await fulfillFoundryPurchase(opts);
    // Solo includes 90 days Operator; Agency includes Studio year — mark PRO/TEAM
    if (opts.planId === "foundry-solo") {
      await fulfillVaultSubscription({ email: opts.email, planId: "vault-pro" });
    }
    if (opts.planId === "foundry-agency") {
      await fulfillVaultSubscription({ email: opts.email, planId: "vault-team" });
    }
    return { licenseKey, product: "foundry" };
  }

  if (opts.planId.startsWith("vault-")) {
    await fulfillVaultSubscription({
      email: opts.email,
      planId: opts.planId,
      subscriptionId: opts.subscriptionId,
    });
    return { product: "vault" };
  }

  return { product: "unknown" };
}
