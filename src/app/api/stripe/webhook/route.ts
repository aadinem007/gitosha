import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { generateLicenseKey } from "@/lib/license";
import { sendLicenseKeyEmail, sendWelcomeEmail } from "@/lib/email";

// Stripe requires the raw request body to verify the webhook signature.
export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const email = session.customer_details?.email ?? session.customer_email;
      const product = session.metadata?.product;
      const planId = session.metadata?.planId ?? "";

      if (!email) break;

      if (product === "vault") {
        const tier = planId.includes("team") ? "TEAM" : "PRO";
        await prisma.subscriber.upsert({
          where: { email },
          create: {
            email,
            tier,
            status: "ACTIVE",
            stripeCustomerId: typeof session.customer === "string" ? session.customer : undefined,
            stripeSubscriptionId: typeof session.subscription === "string" ? session.subscription : undefined,
          },
          update: {
            tier,
            status: "ACTIVE",
            stripeCustomerId: typeof session.customer === "string" ? session.customer : undefined,
            stripeSubscriptionId: typeof session.subscription === "string" ? session.subscription : undefined,
          },
        });
        await sendWelcomeEmail(email, tier);
      }

      if (product === "foundry") {
        const tier = planId.includes("agency") ? "AGENCY" : "SOLO";
        const key = generateLicenseKey();
        await prisma.licenseKey.create({
          data: {
            key,
            email,
            tier,
            stripePaymentId: typeof session.payment_intent === "string" ? session.payment_intent : undefined,
          },
        });
        await sendLicenseKeyEmail(email, key, tier);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await prisma.subscriber.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: { status: "CANCELED", tier: "FREE" },
      });
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId =
        typeof invoice.parent?.subscription_details?.subscription === "string"
          ? invoice.parent.subscription_details.subscription
          : undefined;
      if (subscriptionId) {
        await prisma.subscriber.updateMany({
          where: { stripeSubscriptionId: subscriptionId },
          data: { status: "PAST_DUE" },
        });
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
