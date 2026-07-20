import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { razorpay, RAZORPAY_KEY_ID, PLAN_IDS } from "@/lib/razorpay";
import { VAULT_PLANS, FOUNDRY_PLANS } from "@/lib/pricing";

const bodySchema = z.object({
  planId: z.string(),
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!RAZORPAY_KEY_ID || RAZORPAY_KEY_ID.includes("placeholder")) {
    return NextResponse.json(
      { error: "Razorpay is not configured yet. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET." },
      { status: 500 }
    );
  }

  const { planId, email } = parsed.data;
  const plan = [...VAULT_PLANS, ...FOUNDRY_PLANS].find((p) => p.id === planId);

  if (!plan || plan.mode === "none" || !plan.amountPaise) {
    return NextResponse.json({ error: "Unknown or free plan" }, { status: 400 });
  }

  // One-time Foundry Kit purchase → Razorpay Order
  if (plan.mode === "payment") {
    const order = await razorpay.orders.create({
      amount: plan.amountPaise,
      currency: "INR",
      receipt: `foundry_${Date.now()}`.slice(0, 40),
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

  // Vault: prefer Razorpay Subscriptions when plan IDs exist; otherwise
  // fall back to a one-time Order (same unlock, no auto-renew yet).
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

    // Fallback: one-time Order for first month (works without Subscriptions product)
    const order = await razorpay.orders.create({
      amount: plan.amountPaise,
      currency: "INR",
      receipt: `vault_${Date.now()}`.slice(0, 40),
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
      description: `${plan.name} (first month)`,
    });
  }

  return NextResponse.json({ error: "Unsupported plan mode" }, { status: 400 });
}
