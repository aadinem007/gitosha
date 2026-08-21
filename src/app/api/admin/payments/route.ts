import { NextRequest, NextResponse } from "next/server";
import { requireLegalAdmin } from "@/lib/legal/admin";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { securityLog } from "@/lib/secure";
import { resolveProviderConfigs } from "@/lib/payments";
import { getXflowSettlementSnapshot } from "@/lib/payments/providers/xflow";

export async function GET() {
  const admin = await requireLegalAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const providers = await resolveProviderConfigs();
  let transactions: unknown[] = [];
  let webhooks: unknown[] = [];
  try {
    const rows = await prisma.paymentTransaction.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { refunds: { orderBy: { createdAt: "desc" }, take: 5 } },
    });
    const snapshots = await Promise.all(
      rows.slice(0, 25).map(async (tx) => {
        if (tx.provider !== "xflow" || !tx.providerRef) return null;
        return getXflowSettlementSnapshot(tx.providerRef);
      })
    );
    transactions = rows.map((tx, i) => {
      const snap = i < snapshots.length ? snapshots[i] : null;
      return {
        ...tx,
        settlementStatus:
          snap?.settlementStatus ??
          (tx.provider === "xflow"
            ? tx.status === "succeeded"
              ? "collected_inr"
              : tx.status
            : "historical"),
        reconciliationStatus:
          snap?.reconciliationStatus ??
          (tx.provider === "xflow"
            ? tx.status === "succeeded"
              ? "awaiting_xflow_payout"
              : "not_settled"
            : "n/a"),
        xflowLivemode: snap?.livemode ?? null,
      };
    });
    webhooks = await prisma.paymentWebhookEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  } catch {
    /* tables may not exist until db:push */
  }

  return NextResponse.json({
    providers,
    transactions,
    webhooks,
    envHints: {
      note: "Xflow is the only checkout. Secrets stay in environment variables.",
    },
  });
}

export async function POST(req: NextRequest) {
  const admin = await requireLegalAdmin();
  if (!admin.ok) {
    securityLog("payments_admin_denied", { ip: clientIp(req) });
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }
  const limited = rateLimit({
    key: `payments-admin:${admin.email}`,
    limit: 20,
    windowMs: 60_000,
  });
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  void req;
  return NextResponse.json(
    { error: "Provider toggles are disabled. Xflow is the only payment provider." },
    { status: 400 }
  );
}
