import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { VAULT_PLANS, FOUNDRY_PLANS, CURRENCY } from "@/lib/pricing";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { assertSameOrigin, readJsonLimited, requireJsonContentType, securityLog } from "@/lib/secure";
import {
  getPaymentsProvider,
  getStripe,
  isStripeConfigured,
  stripePriceEnvForPlan,
  STRIPE_PRICE_IDS,
} from "@/lib/stripe";
import { paymentsUnavailableMessage } from "@/lib/payments";
import { razorpay, RAZORPAY_KEY_ID, PLAN_IDS } from "@/lib/razorpay";

const bodySchema = z.object({
  planId: z.string().max(64),
  email: z.string().email().max(254),
});

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

async function createStripeCheckout(planId: string, email: string) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: paymentsUnavailableMessage() }, { status: 500 });
  }

  const plan = [...VAULT_PLANS, ...FOUNDRY_PLANS].find((p) => p.id === planId);
  if (!plan || plan.mode === "none" || !plan.amountCents) {
    return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
  }

  const stripe = getStripe();
  const priceKey = stripePriceEnvForPlan(plan.id);
  const priceId = priceKey ? STRIPE_PRICE_IDS[priceKey] : "";

  const lineItems = priceId
    ? [{ price: priceId, quantity: 1 }]
    : [
        {
          quantity: 1,
          price_data: {
            currency: CURRENCY,
            unit_amount: plan.amountCents,
            product_data: {
              name: `Gitosha ${plan.name}`,
              description: plan.description.slice(0, 400),
            },
            ...(plan.mode === "subscription"
              ? { recurring: { interval: "month" as const } }
              : {}),
          },
        },
      ];

  const session = await stripe.checkout.sessions.create({
    mode: plan.mode === "subscription" ? "subscription" : "payment",
    customer_email: email,
    line_items: lineItems,
    success_url: `${siteUrl()}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl()}/pricing`,
    metadata: {
      planId: plan.id,
      product: plan.product,
      email,
    },
    ...(plan.mode === "subscription"
      ? {
          subscription_data: {
            metadata: { planId: plan.id, product: plan.product, email },
          },
        }
      : {
          payment_intent_data: {
            metadata: { planId: plan.id, product: plan.product, email },
          },
        }),
  });

  if (!session.url) {
    return NextResponse.json({ error: "Could not start checkout." }, { status: 500 });
  }

  return NextResponse.json({
    provider: "stripe",
    mode: plan.mode,
    url: session.url,
    sessionId: session.id,
    planId: plan.id,
    product: plan.product,
    email,
  });
}

async function createRazorpayCheckout(planId: string, email: string) {
  if (!RAZORPAY_KEY_ID || RAZORPAY_KEY_ID.includes("placeholder")) {
    return NextResponse.json({ error: paymentsUnavailableMessage() }, { status: 500 });
  }

  const plan = [...VAULT_PLANS, ...FOUNDRY_PLANS].find((p) => p.id === planId);
  if (!plan || plan.mode === "none" || !plan.amountCents) {
    return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
  }

  const amount = plan.amountCents;

  if (plan.mode === "payment") {
    const order = await razorpay.orders.create({
      amount,
      currency: "USD",
      receipt: `sy_${Date.now()}`.slice(0, 40),
      notes: { planId: plan.id, product: plan.product, email },
    });

    return NextResponse.json({
      provider: "razorpay",
      mode: "payment",
      keyId: RAZORPAY_KEY_ID,
      orderId: order.id,
      amount,
      currency: "USD",
      planId: plan.id,
      product: plan.product,
      email,
      name: "Gitosha",
      description: plan.name,
    });
  }

  if (plan.mode === "subscription") {
    const planIdRzp = plan.planEnvVar ? PLAN_IDS[plan.planEnvVar] : "";

    if (planIdRzp) {
      const subscription = await razorpay.subscriptions.create({
        plan_id: planIdRzp,
        total_count: 120,
        customer_notify: true,
        notes: { planId: plan.id, product: plan.product, email },
      });

      return NextResponse.json({
        provider: "razorpay",
        mode: "subscription",
        keyId: RAZORPAY_KEY_ID,
        subscriptionId: subscription.id,
        planId: plan.id,
        product: plan.product,
        email,
        name: "Gitosha",
        description: plan.name,
      });
    }

    const order = await razorpay.orders.create({
      amount,
      currency: "USD",
      receipt: `sy_${Date.now()}`.slice(0, 40),
      notes: { planId: plan.id, product: plan.product, email },
    });

    return NextResponse.json({
      provider: "razorpay",
      mode: "payment",
      keyId: RAZORPAY_KEY_ID,
      orderId: order.id,
      amount,
      currency: "USD",
      planId: plan.id,
      product: plan.product,
      email,
      name: "Gitosha",
      description: `${plan.name} (first billing period)`,
    });
  }

  return NextResponse.json({ error: "Unsupported plan" }, { status: 400 });
}

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
    return NextResponse.json({ error: "Too many checkout attempts. Wait a minute." }, { status: 429 });
  }

  const body = await readJsonLimited(req);
  if (!body.ok) {
    return NextResponse.json({ error: body.error }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body.data);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { planId, email } = parsed.data;

  try {
    if (getPaymentsProvider() === "razorpay") {
      return await createRazorpayCheckout(planId, email.toLowerCase());
    }
    return await createStripeCheckout(planId, email.toLowerCase());
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    if (message.includes("STRIPE_SECRET_KEY") || message.includes("RAZORPAY")) {
      return NextResponse.json({ error: paymentsUnavailableMessage() }, { status: 500 });
    }
    securityLog("checkout_error", { ip: clientIp(req), message: message.slice(0, 120) });
    return NextResponse.json({ error: "Could not start checkout." }, { status: 500 });
  }
}
