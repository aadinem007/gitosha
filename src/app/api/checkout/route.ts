import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { razorpay, RAZORPAY_KEY_ID, PLAN_IDS } from "@/lib/razorpay";
import { VAULT_PLANS, FOUNDRY_PLANS } from "@/lib/pricing";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const bodySchema = z.object({
  planId: z.string().max(64),
  email: z.string().email().max(254),
});

export async function POST(req: NextRequest) {
  const limited = rateLimit({
    key: `checkout:${clientIp(req)}`,
    limit: 10,
    windowMs: 60_000,
  });
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many checkout attempts. Wait a minute." }, { status: 429 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!RAZORPAY_KEY_ID || RAZORPAY_KEY_ID.includes("placeholder")) {
    return NextResponse.json({ error: "Payments are temporarily unavailable." }, { status: 500 });
  }

  const { planId, email } = parsed.data;
  const plan = [...VAULT_PLANS, ...FOUNDRY_PLANS].find((p) => p.id === planId);

  if (!plan || plan.mode === "none" || !plan.amountPaise) {
    return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
  }

  if (plan.mode === "payment") {
    const order = await razorpay.orders.create({
      amount: plan.amountPaise,
      currency: "INR",
      receipt: `sy_${Date.now()}`.slice(0, 40),
      notes: { planId: plan.id, product: plan.product, email },
    });

    return NextResponse.json({
      mode: "payment",
      keyId: RAZORPAY_KEY_ID,
      orderId: order.id,
      amount: plan.amountPaise,
      currency: "INR",
      planId: plan.id,
      product: plan.product,
      email,
      name: "Shipyard",
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
        mode: "subscription",
        keyId: RAZORPAY_KEY_ID,
        subscriptionId: subscription.id,
        planId: plan.id,
        product: plan.product,
        email,
        name: "Shipyard",
        description: plan.name,
      });
    }

    const order = await razorpay.orders.create({
      amount: plan.amountPaise,
      currency: "INR",
      receipt: `sy_${Date.now()}`.slice(0, 40),
      notes: { planId: plan.id, product: plan.product, email },
    });

    return NextResponse.json({
      mode: "payment",
      keyId: RAZORPAY_KEY_ID,
      orderId: order.id,
      amount: plan.amountPaise,
      currency: "INR",
      planId: plan.id,
      product: plan.product,
      email,
      name: "Shipyard",
      description: `${plan.name} (first billing period)`,
    });
  }

  return NextResponse.json({ error: "Unsupported plan" }, { status: 400 });
}
