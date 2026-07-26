import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { fulfillPurchase } from "@/lib/fulfill";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { securityLog } from "@/lib/secure";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

async function fulfillFromSession(session: Stripe.Checkout.Session) {
  const email = (
    session.metadata?.email ||
    session.customer_email ||
    session.customer_details?.email ||
    ""
  ).toLowerCase();
  const planId = session.metadata?.planId;
  if (!email || !planId) return;

  const paymentIntent =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;
  const customerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id;

  await fulfillPurchase({
    email,
    planId,
    paymentId: paymentIntent ?? session.id,
    orderId: session.id,
    subscriptionId,
    customerId,
    provider: "stripe",
  });
}

export async function POST(req: NextRequest) {
  const limited = rateLimit({
    key: `stripe-webhook:${clientIp(req)}`,
    limit: 120,
    windowMs: 60_000,
  });
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Unavailable" }, { status: 400 });
  }

  const rawBody = await req.text();
  if (rawBody.length > 256_000) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    securityLog("stripe_webhook_missing_signature", { ip: clientIp(req) });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    securityLog("stripe_webhook_bad_signature", { ip: clientIp(req) });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.payment_status === "paid" || session.status === "complete") {
          await fulfillFromSession(session);
        }
        break;
      }
      case "customer.subscription.deleted":
      case "customer.subscription.paused": {
        const sub = event.data.object as Stripe.Subscription;
        await prisma.subscriber.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: { status: "CANCELED", tier: "FREE" },
        });
        break;
      }
      default:
        break;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "webhook handler failed";
    securityLog("stripe_webhook_handler_error", { message: message.slice(0, 120) });
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
