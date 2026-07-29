import { createHmac } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fulfillPurchase } from "@/lib/fulfill";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { safeEqual, securityLog } from "@/lib/secure";

type RazorpayWebhookBody = {
  event: string;
  payload: {
    payment?: { entity: Record<string, unknown> };
    subscription?: { entity: Record<string, unknown> };
  };
};

function verifySignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  return safeEqual(expected, signature);
}

export async function POST(req: NextRequest) {
  const limited = rateLimit({
    key: `webhook:${clientIp(req)}`,
    limit: 120,
    windowMs: 60_000,
  });
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Unavailable" }, { status: 400 });
  }

  const rawBody = await req.text();
  if (rawBody.length > 256_000) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  const signature = req.headers.get("x-razorpay-signature");
  if (!verifySignature(rawBody, signature, webhookSecret)) {
    securityLog("webhook_bad_signature", { ip: clientIp(req) });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: RazorpayWebhookBody;
  try {
    event = JSON.parse(rawBody) as RazorpayWebhookBody;
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  switch (event.event) {
    case "payment.captured": {
      const payment = event.payload.payment?.entity;
      if (!payment) break;
      const notes = (payment.notes ?? {}) as Record<string, string>;
      const email = notes.email?.toLowerCase();
      const planId = notes.planId;
      if (!email || !planId) break;

      await fulfillPurchase({
        email,
        planId,
        paymentId: String(payment.id),
        orderId: payment.order_id ? String(payment.order_id) : undefined,
        provider: "razorpay",
      });
      break;
    }

    case "subscription.activated":
    case "subscription.charged": {
      const sub = event.payload.subscription?.entity;
      if (!sub) break;
      const notes = (sub.notes ?? {}) as Record<string, string>;
      const email = notes.email?.toLowerCase();
      const planId = notes.planId;
      if (!email || !planId) break;

      await fulfillPurchase({
        email,
        planId,
        subscriptionId: String(sub.id),
        paymentId: String(sub.id),
        provider: "razorpay",
      });
      break;
    }

    case "subscription.cancelled":
    case "subscription.halted":
    case "subscription.completed": {
      const sub = event.payload.subscription?.entity;
      if (!sub) break;
      await prisma.subscriber.updateMany({
        where: { razorpaySubscriptionId: String(sub.id) },
        data: { status: "CANCELED", tier: "FREE" },
      });
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
