import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { prisma } from "@/lib/prisma";
import { fulfillPurchase } from "@/lib/fulfill";
import { clientIp, rateLimit } from "@/lib/rate-limit";

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
  return expected === signature;
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
    return NextResponse.json({ error: "Missing webhook secret" }, { status: 400 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  if (!verifySignature(rawBody, signature, webhookSecret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody) as RazorpayWebhookBody;

  switch (event.event) {
    case "payment.captured": {
      const payment = event.payload.payment?.entity;
      if (!payment) break;
      const notes = (payment.notes ?? {}) as Record<string, string>;
      const email = notes.email;
      const planId = notes.planId;
      if (!email || !planId) break;

      await fulfillPurchase({
        email,
        planId,
        paymentId: String(payment.id),
        orderId: payment.order_id ? String(payment.order_id) : undefined,
      });
      break;
    }

    case "subscription.activated":
    case "subscription.charged": {
      const sub = event.payload.subscription?.entity;
      if (!sub) break;
      const notes = (sub.notes ?? {}) as Record<string, string>;
      const email = notes.email;
      const planId = notes.planId;
      if (!email || !planId) break;

      await fulfillPurchase({
        email,
        planId,
        subscriptionId: String(sub.id),
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
