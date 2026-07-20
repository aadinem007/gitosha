import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { z } from "zod";
import { fulfillFoundryPurchase, fulfillVaultSubscription } from "@/lib/fulfill";

const bodySchema = z.object({
  mode: z.enum(["payment", "subscription"]),
  planId: z.string(),
  email: z.string().email(),
  razorpay_payment_id: z.string(),
  razorpay_order_id: z.string().optional(),
  razorpay_subscription_id: z.string().optional(),
  razorpay_signature: z.string(),
});

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Razorpay secret not configured" }, { status: 500 });
  }

  const data = parsed.data;
  let expectedPayload: string;

  if (data.mode === "payment") {
    if (!data.razorpay_order_id) {
      return NextResponse.json({ error: "Missing order id" }, { status: 400 });
    }
    expectedPayload = `${data.razorpay_order_id}|${data.razorpay_payment_id}`;
  } else {
    if (!data.razorpay_subscription_id) {
      return NextResponse.json({ error: "Missing subscription id" }, { status: 400 });
    }
    expectedPayload = `${data.razorpay_payment_id}|${data.razorpay_subscription_id}`;
  }

  const expected = createHmac("sha256", secret).update(expectedPayload).digest("hex");
  if (expected !== data.razorpay_signature) {
    return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
  }

  if (data.planId.startsWith("vault-")) {
    await fulfillVaultSubscription({
      email: data.email,
      planId: data.planId,
      subscriptionId: data.razorpay_subscription_id,
    });
  } else if (data.planId.startsWith("foundry-")) {
    await fulfillFoundryPurchase({
      email: data.email,
      planId: data.planId,
      paymentId: data.razorpay_payment_id,
      orderId: data.razorpay_order_id,
    });
  }

  return NextResponse.json({ ok: true });
}
