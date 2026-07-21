import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const bodySchema = z.object({
  planId: z.string().max(64),
  email: z.string().email().max(254),
  razorpay_payment_id: z.string().max(128),
  razorpay_order_id: z.string().max(128),
  razorpay_signature: z.string().max(256),
});

export async function POST(req: NextRequest) {
  const limited = rateLimit({ key: `verify:${clientIp(req)}`, limit: 20, windowMs: 60_000 });
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Verification unavailable" }, { status: 500 });
  }

  const data = parsed.data;
  const expected = createHmac("sha256", secret)
    .update(`${data.razorpay_order_id}|${data.razorpay_payment_id}`)
    .digest("hex");

  if (expected !== data.razorpay_signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  await prisma.customer.upsert({
    where: { email: data.email.toLowerCase() },
    create: {
      email: data.email.toLowerCase(),
      planId: data.planId,
      status: "ACTIVE",
      razorpayPaymentId: data.razorpay_payment_id,
      razorpayOrderId: data.razorpay_order_id,
    },
    update: {
      planId: data.planId,
      status: "ACTIVE",
      razorpayPaymentId: data.razorpay_payment_id,
      razorpayOrderId: data.razorpay_order_id,
    },
  });

  return NextResponse.json({ ok: true, email: data.email, planId: data.planId });
}
