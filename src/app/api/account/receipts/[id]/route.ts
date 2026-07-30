import { NextRequest, NextResponse } from "next/server";
import { getSessionEmail, requireLegalAdmin } from "@/lib/legal/admin";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { formatMoney } from "@/lib/payments";
import type { Currency } from "@/lib/payments";
import { FOUNDRY_PLANS, VAULT_PLANS } from "@/lib/pricing";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  if (!id || id.length > 64) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const limited = rateLimit({
    key: `receipt:${clientIp(req)}`,
    limit: 30,
    windowMs: 60_000,
  });
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let tx;
  try {
    tx = await prisma.paymentTransaction.findUnique({
      where: { id },
      include: { refunds: true },
    });
  } catch {
    return NextResponse.json({ error: "Receipt unavailable" }, { status: 503 });
  }
  if (!tx) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const sessionEmail = await getSessionEmail();
  const admin = await requireLegalAdmin();
  const isOwner = sessionEmail && sessionEmail === tx.userEmail.toLowerCase();
  const isAdmin = admin.ok;

  // License owners: email match on a Foundry license is enough when signed out via key query is NOT allowed —
  // require session email match or admin.
  if (!isOwner && !isAdmin) {
    // Allow lookup with matching license email if they own a license tied to this payment ref
    let licenseOk = false;
    if (sessionEmail && tx.providerRef) {
      try {
        const lic = await prisma.licenseKey.findFirst({
          where: {
            email: sessionEmail,
            OR: [
              { stripePaymentId: tx.providerRef },
              { stripeCheckoutSessionId: tx.providerRef },
              { razorpayPaymentId: tx.providerRef },
              { razorpayOrderId: tx.providerRef },
            ],
          },
        });
        licenseOk = Boolean(lic);
      } catch {
        licenseOk = false;
      }
    }
    if (!licenseOk) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const plan = [...VAULT_PLANS, ...FOUNDRY_PLANS].find((p) => p.id === tx.planId);

  return NextResponse.json({
    id: tx.id,
    planId: tx.planId,
    planName: plan?.name ?? tx.planId,
    product: plan?.product ?? "unknown",
    email: tx.userEmail,
    amount: tx.amount,
    currency: tx.currency,
    amountLabel: formatMoney(tx.amount, tx.currency as Currency),
    status: tx.status,
    provider: tx.provider,
    providerRef: tx.providerRef,
    createdAt: tx.createdAt,
    refunds: tx.refunds.map((r) => ({
      id: r.id,
      amount: r.amount,
      currency: r.currency,
      status: r.status,
      createdAt: r.createdAt,
    })),
  });
}
