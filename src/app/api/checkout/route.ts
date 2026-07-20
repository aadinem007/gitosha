import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { stripe, PRICE_IDS } from "@/lib/stripe";
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

  const { planId, email } = parsed.data;
  const plan = [...VAULT_PLANS, ...FOUNDRY_PLANS].find((p) => p.id === planId);

  if (!plan || plan.mode === "none" || !plan.priceEnvVar) {
    return NextResponse.json({ error: "Unknown or free plan" }, { status: 400 });
  }

  const priceId = PRICE_IDS[plan.priceEnvVar as keyof typeof PRICE_IDS];
  if (!priceId) {
    return NextResponse.json(
      { error: `Stripe price not configured for ${plan.id}. Set the matching STRIPE_PRICE_* env var.` },
      { status: 500 }
    );
  }

  const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";

  const session = await stripe.checkout.sessions.create({
    mode: plan.mode === "subscription" ? "subscription" : "payment",
    customer_email: email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/pricing`,
    metadata: { planId: plan.id, product: plan.product },
  });

  return NextResponse.json({ url: session.url });
}
