import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireLegalAdmin } from "@/lib/legal/admin";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import {
  assertSameOrigin,
  readJsonLimited,
  requireJsonContentType,
  securityLog,
} from "@/lib/secure";
import { isScaffoldProvider } from "@/lib/payments/providers/stubs";
import { resolveProviderConfigs } from "@/lib/payments";
import type { ProviderId } from "@/lib/payments";

export async function GET() {
  const admin = await requireLegalAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const providers = await resolveProviderConfigs();
  let transactions: unknown[] = [];
  let webhooks: unknown[] = [];
  try {
    transactions = await prisma.paymentTransaction.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { refunds: { orderBy: { createdAt: "desc" }, take: 5 } },
    });
    webhooks = await prisma.paymentWebhookEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  } catch {
    // Tables may not exist until db:push
  }

  return NextResponse.json({
    providers,
    transactions,
    webhooks,
    envHints: {
      note: "Secrets stay in environment variables — never store secret keys in DB.",
      tax: "PAYMENTS_TAX_ENABLED / PAYMENTS_TAX_RATE_BPS / PAYMENTS_TAX_LABEL (default off)",
    },
  });
}

const patchSchema = z.object({
  providerId: z.enum(["razorpay", "stripe", "paypal", "xflow", "wise", "payoneer"]),
  enabled: z.boolean(),
  supportedCurrencies: z.array(z.enum(["USD", "INR", "EUR"])).min(1).max(4).optional(),
});

/** POST used instead of PATCH — proxy allowlists GET/POST only on /api. */
export async function POST(req: NextRequest) {
  const admin = await requireLegalAdmin();
  if (!admin.ok) {
    securityLog("payments_admin_denied", { ip: clientIp(req) });
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!requireJsonContentType(req)) {
    return NextResponse.json({ error: "Unsupported media type" }, { status: 415 });
  }

  const limited = rateLimit({
    key: `payments-admin:${admin.email}`,
    limit: 20,
    windowMs: 60_000,
  });
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await readJsonLimited(req);
  if (!body.ok) {
    return NextResponse.json({ error: body.error }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body.data);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { providerId, enabled, supportedCurrencies } = parsed.data;
  if ((providerId === "wise" || providerId === "payoneer") && enabled) {
    return NextResponse.json(
      {
        error:
          "Wise and Payoneer are payout/settlement rails — they cannot be enabled for customer checkout. See docs/PAYMENTS.md.",
      },
      { status: 400 }
    );
  }
  if (isScaffoldProvider(providerId as ProviderId) && enabled) {
    return NextResponse.json(
      {
        error:
          "Scaffold providers cannot be enabled until a live adapter and credentials exist. See docs/PAYMENTS.md.",
      },
      { status: 400 }
    );
  }

  try {
    await prisma.paymentProviderConfig.upsert({
      where: { providerId },
      create: {
        providerId,
        enabled,
        supportedCurrencies: supportedCurrencies ?? (providerId === "razorpay" ? ["INR"] : ["USD"]),
        publicConfig: {},
      },
      update: {
        enabled,
        ...(supportedCurrencies ? { supportedCurrencies } : {}),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Payment tables missing — run npm run db:push" },
      { status: 503 }
    );
  }

  securityLog("payments_admin_provider_toggle", {
    provider: providerId,
    enabled,
    actor: admin.email.slice(0, 80),
  });

  const providers = await resolveProviderConfigs();
  return NextResponse.json({ ok: true, providers });
}
