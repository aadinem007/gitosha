import { prisma } from "@/lib/prisma";

/**
 * Export app-held data for an authenticated owner email.
 * Includes license keys (user-owned). Omits other users' data and secrets (service keys).
 */
export async function buildUserDataExport(email: string) {
  const normalized = email.toLowerCase().trim();

  const [subscriber, licenses, consents, rights] = await Promise.all([
    prisma.subscriber.findUnique({ where: { email: normalized } }),
    prisma.licenseKey.findMany({
      where: { email: normalized },
      orderBy: { createdAt: "desc" },
    }),
    prisma.consentRecord.findMany({
      where: { email: normalized },
      orderBy: { updatedAt: "desc" },
      take: 20,
    }),
    prisma.dataRightsRequest.findMany({
      where: { email: normalized },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        type: true,
        status: true,
        createdAt: true,
        completedAt: true,
        details: true,
      },
    }),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    email: normalized,
    limitations: [
      "Does not include Supabase Auth internal records beyond what this app stores.",
      "Does not include full payment processor history (Razorpay/Stripe dashboards).",
      "Does not include Vercel/OpenAI/Resend provider logs.",
      "Chat messages are not stored in the app database by default.",
      "License keys are included because you are the authenticated owner.",
    ],
    subscriber: subscriber
      ? {
          id: subscriber.id,
          email: subscriber.email,
          tier: subscriber.tier,
          status: subscriber.status,
          createdAt: subscriber.createdAt,
          updatedAt: subscriber.updatedAt,
          hasStripeCustomer: Boolean(subscriber.stripeCustomerId),
          hasRazorpayCustomer: Boolean(subscriber.razorpayCustomerId),
          // IDs useful for support; not secrets
          stripeCustomerId: subscriber.stripeCustomerId,
          stripeSubscriptionId: subscriber.stripeSubscriptionId,
          razorpayCustomerId: subscriber.razorpayCustomerId,
          razorpaySubscriptionId: subscriber.razorpaySubscriptionId,
        }
      : null,
    licenses: licenses.map((l) => ({
      id: l.id,
      key: l.key,
      tier: l.tier,
      downloadCount: l.downloadCount,
      lastDownloadedAt: l.lastDownloadedAt,
      activatedAt: l.activatedAt,
      createdAt: l.createdAt,
      razorpayOrderId: l.razorpayOrderId,
      stripeCheckoutSessionId: l.stripeCheckoutSessionId,
    })),
    consents: consents.map((c) => ({
      id: c.id,
      preferences: c.preferences,
      policyVersion: c.policyVersion,
      source: c.source,
      updatedAt: c.updatedAt,
    })),
    priorRightsRequests: rights,
  };
}

/**
 * Safely auto-delete what we can: FREE subscriber with no payment IDs.
 * Paid records are queued for operator — never silently destroy accounting evidence.
 */
export async function attemptSafeAutoDelete(email: string): Promise<{
  autoDeleted: string[];
  needsOperator: string[];
}> {
  const normalized = email.toLowerCase().trim();
  const autoDeleted: string[] = [];
  const needsOperator: string[] = [];

  const subscriber = await prisma.subscriber.findUnique({ where: { email: normalized } });
  if (subscriber) {
    const hasBilling =
      Boolean(subscriber.stripeCustomerId) ||
      Boolean(subscriber.razorpayCustomerId) ||
      Boolean(subscriber.stripeSubscriptionId) ||
      Boolean(subscriber.razorpaySubscriptionId) ||
      subscriber.tier !== "FREE";

    if (!hasBilling) {
      await prisma.subscriber.delete({ where: { email: normalized } });
      autoDeleted.push("subscriber_free_waitlist");
    } else {
      needsOperator.push("subscriber_paid_or_billing_ids");
    }
  }

  const licenseCount = await prisma.licenseKey.count({ where: { email: normalized } });
  if (licenseCount > 0) {
    needsOperator.push(`license_keys:${licenseCount}`);
  }

  const consents = await prisma.consentRecord.deleteMany({ where: { email: normalized } });
  if (consents.count > 0) {
    autoDeleted.push(`consent_records:${consents.count}`);
  }

  needsOperator.push("supabase_auth_user");
  needsOperator.push("payment_processor_records");
  needsOperator.push("email_provider_logs");

  return { autoDeleted, needsOperator };
}
