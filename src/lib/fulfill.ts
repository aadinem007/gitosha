import { prisma } from "@/lib/prisma";
import { generateLicenseKey } from "@/lib/license";
import { sendLicenseKeyEmail, sendWelcomeEmail } from "@/lib/email";

/** Shared fulfillment used by webhook + payment-verify. Idempotent where possible. */
export async function fulfillVaultSubscription(opts: {
  email: string;
  planId: string;
  subscriptionId?: string;
  customerId?: string;
}) {
  const tier = opts.planId.includes("team") ? "TEAM" : "PRO";
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
