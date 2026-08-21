import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { readJsonLimited, assertSameOrigin, requireJsonContentType, securityLog } from "@/lib/secure";
import { PaymentServiceError, userPaymentMessage, verifyPayment } from "@/lib/payments";

export const maxDuration = 20;

const schema = z.object({
  provider: z.literal("xflow").optional(),
  sessionId: z.string().max(200).optional(),
  xflowIntentId: z.string().max(200).optional(),
  email: z.string().email().max(254).optional(),
  planId: z.string().max(64).optional(),
});

export async function POST(req: NextRequest) {
  if (!assertSameOrigin(req)) {
    securityLog("verify_origin_blocked", { ip: clientIp(req) });
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!requireJsonContentType(req)) {
    return NextResponse.json({ error: "Unsupported media type" }, { status: 415 });
  }

  const limited = rateLimit({
    key: `verify:${clientIp(req)}`,
    limit: 10,
    windowMs: 60_000,
  });
  if (!limited.ok) {
    securityLog("verify_rate_limited", { ip: clientIp(req) });
    return NextResponse.json({ error: userPaymentMessage("rate_limited") }, { status: 429 });
  }

  const body = await readJsonLimited(req);
  if (!body.ok) {
    return NextResponse.json({ error: body.error }, { status: 400 });
  }

  const parsed = schema.safeParse(body.data);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const intentId = parsed.data.xflowIntentId ?? parsed.data.sessionId;
  if (!intentId) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const result = await verifyPayment({
      provider: "xflow",
      sessionId: intentId,
      xflowIntentId: intentId,
      email: parsed.data.email,
      planId: parsed.data.planId,
    });
    return NextResponse.json({
      ok: true,
      product: result.product,
      email: result.email,
      licenseKey: result.licenseKey,
      transactionId: result.transactionId,
      currency: result.currency,
    });
  } catch (err) {
    if (err instanceof PaymentServiceError) {
      securityLog("verify_error", { ip: clientIp(req), code: err.code });
      return NextResponse.json({ error: err.message }, { status: err.httpStatus });
    }
    const message = err instanceof Error ? err.message : "verify failed";
    securityLog("verify_error", { ip: clientIp(req), message: message.slice(0, 120) });
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 });
  }
}
