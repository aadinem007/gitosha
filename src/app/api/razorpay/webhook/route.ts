import { createHmac } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fulfillPurchase, isFulfillablePlanId } from "@/lib/fulfill";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { getRazorpay } from "@/lib/razorpay";
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

function notesRecord(notes: unknown): Record<string, string> {
  if (!notes || typeof notes !== "object") return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(notes as Record<string, unknown>)) {
    if (typeof v === "string") out[k] = v;
    else if (typeof v === "number" || typeof v === "boolean") out[k] = String(v);
  }
  return out;
}

/** Prefer order notes (set by our checkout API) over payment notes. */
async function resolveOrderNotes(payment: Record<string, unknown>): Promise<Record<string, string>> {
  const orderId = payment.order_id ? String(payment.order_id) : "";
  if (orderId) {
    try {
      const order = await getRazorpay().orders.fetch(orderId);
      const fromOrder = notesRecord(order.notes);
      if (fromOrder.planId && fromOrder.email) return fromOrder;
    } catch {
      securityLog("webhook_razorpay_order_fetch_failed", { orderId: orderId.slice(0, 40) });
    }
  }
  return notesRecord(payment.notes);
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
    return NextResponse.json({ error: "Unavailable" }, { status: 503 });
  }

  const rawBody = await req.text();
  if (rawBody.length > 256_000) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  const signature = req.headers.get("x-razorpay-signature");
  if (!signature || !verifySignature(rawBody, signature, webhookSecret)) {
    securityLog("webhook_bad_signature", { ip: clientIp(req) });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: RazorpayWebhookBody;
  try {
    event = JSON.parse(rawBody) as RazorpayWebhookBody;
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    switch (event.event) {
      case "payment.captured": {
        const payment = event.payload.payment?.entity;
        if (!payment) break;
        const notes = await resolveOrderNotes(payment);
        const email = notes.email?.toLowerCase();
        const planId = notes.planId;
        if (!email || !planId || !isFulfillablePlanId(planId)) {
          securityLog("webhook_razorpay_skip_fulfill", {
            reason: !email || !planId ? "missing_notes" : "unknown_plan",
            planId: (planId ?? "").slice(0, 64),
          });
          break;
        }

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
        const notes = notesRecord(sub.notes);
        const email = notes.email?.toLowerCase();
        const planId = notes.planId;
        if (!email || !planId || !isFulfillablePlanId(planId)) break;

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
  } catch (err) {
    const message = err instanceof Error ? err.message : "webhook handler failed";
    securityLog("razorpay_webhook_handler_error", { message: message.slice(0, 120) });
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
