import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { assertSameOrigin, readJsonLimited, requireJsonContentType, securityLog } from "@/lib/secure";
import { writeLegalAuditLog } from "@/lib/legal/audit";
import {
  createCheckout,
  PaymentServiceError,
  paymentsUnavailableMessage,
  userPaymentMessage,
} from "@/lib/payments";

const bodySchema = z.object({
  planId: z.string().max(64),
  email: z.string().email().max(254),
  acceptedTerms: z.literal(true),
  idempotencyKey: z.string().min(8).max(128).optional(),
  displayCurrency: z.enum(["USD", "INR", "EUR"]).optional(),
});

export async function POST(req: NextRequest) {
  if (!assertSameOrigin(req)) {
    securityLog("checkout_origin_blocked", { ip: clientIp(req) });
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!requireJsonContentType(req)) {
    return NextResponse.json({ error: "Unsupported media type" }, { status: 415 });
  }

  const limited = rateLimit({
    key: `checkout:${clientIp(req)}`,
    limit: 6,
    windowMs: 60_000,
  });
  if (!limited.ok) {
    securityLog("checkout_rate_limited", { ip: clientIp(req) });
    return NextResponse.json({ error: userPaymentMessage("rate_limited") }, { status: 429 });
  }

  const body = await readJsonLimited(req);
  if (!body.ok) {
    return NextResponse.json({ error: body.error }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body.data);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request — accept Terms and Privacy to continue." },
      { status: 400 }
    );
  }

  const { planId, email, idempotencyKey, displayCurrency } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  await writeLegalAuditLog({
    action: "policy_acceptance_checkout",
    subjectEmail: normalizedEmail,
    detail: { planId, acceptedTerms: true },
    ip: clientIp(req),
  });

  try {
    const session = await createCheckout({
      planId,
      email: normalizedEmail,
      idempotencyKey,
      displayCurrency,
    });

    return NextResponse.json({
      provider: session.provider,
      mode: session.mode,
      url: session.url,
      sessionId: session.sessionId,
      orderId: session.orderId,
      subscriptionId: session.subscriptionId,
      upiIntentUrl: session.upiIntentUrl,
      amount: session.amount,
      currency: session.currency,
      chargeLabel: session.chargeLabel,
      planId: session.planId,
      product: session.product,
      email: session.email,
      name: session.name,
      description: session.description,
      transactionId: session.transactionId,
      idempotencyKey: session.idempotencyKey,
    });
  } catch (err) {
    if (err instanceof PaymentServiceError) {
      const message =
        err.code === "unavailable" ? paymentsUnavailableMessage() : err.message;
      securityLog("checkout_error", { ip: clientIp(req), code: err.code });
      return NextResponse.json({ error: message }, { status: err.httpStatus });
    }
    const message = err instanceof Error ? err.message : "Checkout failed";
    securityLog("checkout_error", { ip: clientIp(req), message: message.slice(0, 120) });
    return NextResponse.json({ error: "Could not start checkout." }, { status: 500 });
  }
}
