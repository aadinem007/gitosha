import { createHmac } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fulfillPurchase } from "@/lib/fulfill";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { readJsonLimited, safeEqual } from "@/lib/secure";

const bodySchema = z.object({
  mode: z.enum(["payment", "subscription"]),
  planId: z.string().max(64),
  email: z.string().email().max(254),
  razorpay_payment_id: z.string().max(128),
  razorpay_order_id: z.string().max(128).optional(),
  razorpay_subscription_id: z.string().max(128).optional(),
  razorpay_signature: z.string().max(256),
});

export async function POST(req: NextRequest) {
  const limited = rateLimit({
    key: `verify:${clientIp(req)}`,
    limit: 20,
    windowMs: 60_000,
  });
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await readJsonLimited(req);
  if (!body.ok) {
    return NextResponse.json({ error: body.error }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body.data);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Payment verification unavailable" }, { status: 500 });
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
  if (!safeEqual(expected, data.razorpay_signature)) {
    return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
  }

  const result = await fulfillPurchase({
    email: data.email.toLowerCase(),
    planId: data.planId,
    paymentId: data.razorpay_payment_id,
    orderId: data.razorpay_order_id,
    subscriptionId: data.razorpay_subscription_id,
  });

  return NextResponse.json({
    ok: true,
    product: result.product,
    email: data.email.toLowerCase(),
    licenseKey: result.licenseKey,
  });
}
