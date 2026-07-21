import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { razorpay, RAZORPAY_KEY_ID } from "@/lib/razorpay";
import { PLANS } from "@/lib/pricing";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const bodySchema = z.object({
  planId: z.string().max(64),
  email: z.string().email().max(254),
});

export async function POST(req: NextRequest) {
  const limited = rateLimit({ key: `checkout:${clientIp(req)}`, limit: 10, windowMs: 60_000 });
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many checkout attempts" }, { status: 429 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const plan = PLANS.find((p) => p.id === parsed.data.planId);
  if (!plan) {
    return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
  }

  const order = await razorpay.orders.create({
    amount: plan.amountPaise,
    currency: "INR",
    receipt: `ord_${Date.now()}`.slice(0, 40),
    notes: { planId: plan.id, email: parsed.data.email },
  });

  return NextResponse.json({
    keyId: RAZORPAY_KEY_ID,
    orderId: order.id,
    amount: plan.amountPaise,
    currency: "INR",
    planId: plan.id,
    email: parsed.data.email,
    name: "Your Product",
    description: plan.name,
  });
}
