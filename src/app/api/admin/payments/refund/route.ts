import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireLegalAdmin } from "@/lib/legal/admin";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import {
  assertSameOrigin,
  readJsonLimited,
  requireJsonContentType,
  securityLog,
} from "@/lib/secure";
import { PaymentServiceError, refundPayment } from "@/lib/payments";

const schema = z.object({
  transactionId: z.string().min(1).max(64),
  amount: z.number().int().positive().optional(),
  reason: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  const admin = await requireLegalAdmin();
  if (!admin.ok) {
    securityLog("payments_refund_denied", { ip: clientIp(req) });
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!requireJsonContentType(req)) {
    return NextResponse.json({ error: "Unsupported media type" }, { status: 415 });
  }

  const limited = rateLimit({
    key: `payments-refund:${admin.email}`,
    limit: 10,
    windowMs: 60_000,
  });
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await readJsonLimited(req);
  if (!body.ok) {
    return NextResponse.json({ error: body.error }, { status: 400 });
  }

  const parsed = schema.safeParse(body.data);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid refund payload" }, { status: 400 });
  }

  try {
    const result = await refundPayment({
      ...parsed.data,
      actorEmail: admin.email,
    });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof PaymentServiceError) {
      return NextResponse.json({ error: err.message }, { status: err.httpStatus });
    }
    securityLog("payments_refund_error", { ip: clientIp(req) });
    return NextResponse.json({ error: "Refund failed" }, { status: 500 });
  }
}
