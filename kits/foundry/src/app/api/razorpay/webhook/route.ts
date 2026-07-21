import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const limited = rateLimit({ key: `webhook:${clientIp(req)}`, limit: 60, windowMs: 60_000 });
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const raw = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const expected = createHmac("sha256", secret).update(raw).digest("hex");
  if (expected !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(raw) as {
    event: string;
    payload?: {
      payment?: {
        entity?: {
          id?: string;
          order_id?: string;
          email?: string;
          notes?: { planId?: string; email?: string };
        };
      };
    };
  };

  if (event.event === "payment.captured") {
    const payment = event.payload?.payment?.entity;
    const email = (payment?.notes?.email || payment?.email || "").toLowerCase();
    const planId = payment?.notes?.planId;
    if (email && payment?.id) {
      await prisma.customer.upsert({
        where: { email },
        create: {
          email,
          planId: planId ?? null,
          status: "ACTIVE",
          razorpayPaymentId: payment.id,
          razorpayOrderId: payment.order_id ?? null,
        },
        update: {
          planId: planId ?? undefined,
          status: "ACTIVE",
          razorpayPaymentId: payment.id,
          razorpayOrderId: payment.order_id ?? undefined,
        },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
