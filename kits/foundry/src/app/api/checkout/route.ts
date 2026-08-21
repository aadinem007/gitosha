import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { PLANS } from "@/lib/pricing";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { xflowFetch, xflowReady, type KitIntent } from "@/lib/xflow";

const bodySchema = z.object({
  planId: z.string().max(64),
  email: z.string().email().max(254),
});

export async function POST(req: NextRequest) {
  const limited = rateLimit({ key: `checkout:${clientIp(req)}`, limit: 10, windowMs: 60_000 });
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many checkout attempts" }, { status: 429 });
  }
  if (!xflowReady()) {
    return NextResponse.json({ error: "Checkout is not configured." }, { status: 500 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const plan = PLANS.find((p) => p.id === parsed.data.planId);
  if (!plan) {
    return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
  }

  const accountId = process.env.XFLOW_ACCOUNT_ID!.trim();
  const intent = await xflowFetch<KitIntent>("/v1/transaction_intents", {
    method: "POST",
    body: JSON.stringify({
      amount: (plan.amountPaise / 100).toFixed(2),
      currency: "INR",
      payment_method: "upi",
      payment_method_details: { upi: { flow: "intent" } },
      to: { account_id: accountId },
      type: "payment",
      metadata: { planId: plan.id, email: parsed.data.email.toLowerCase() },
    }),
  });

  return NextResponse.json({
    provider: "xflow",
    orderId: intent.id,
    sessionId: intent.id,
    upiIntentUrl: intent.payment_method_details?.upi?.intent_url,
    amount: plan.amountPaise,
    currency: "INR",
    planId: plan.id,
    email: parsed.data.email,
    name: plan.name,
  });
}
