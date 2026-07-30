import { createHmac } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fulfillPurchase, isFulfillablePlanId } from "@/lib/fulfill";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { getRazorpay } from "@/lib/razorpay";
import { readJsonLimited, safeEqual, assertSameOrigin, requireJsonContentType, securityLog } from "@/lib/secure";
import { getPaymentsProvider, getStripe, isStripeConfigured } from "@/lib/stripe";

export const maxDuration = 20;

const razorpaySchema = z.object({
  provider: z.literal("razorpay").optional(),
  mode: z.enum(["payment", "subscription"]),
  planId: z.string().max(64),
  email: z.string().email().max(254),
  razorpay_payment_id: z.string().max(128),
  razorpay_order_id: z.string().max(128).optional(),
  razorpay_subscription_id: z.string().max(128).optional(),
  razorpay_signature: z.string().max(256),
});

const stripeSchema = z.object({
  provider: z.literal("stripe").optional(),
  sessionId: z.string().max(200),
});

function notesRecord(notes: unknown): Record<string, string> {
  if (!notes || typeof notes !== "object") return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(notes as Record<string, unknown>)) {
    if (typeof v === "string") out[k] = v;
    else if (typeof v === "number" || typeof v === "boolean") out[k] = String(v);
  }
  return out;
}

async function verifyStripe(sessionId: string) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Payment verification unavailable" }, { status: 500 });
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  // Never treat status===complete alone as paid (async methods can be unpaid)
  if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
    return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
  }

  const email = (
    session.metadata?.email ||
    session.customer_email ||
    session.customer_details?.email ||
    ""
  ).toLowerCase();
  const planId = session.metadata?.planId;
  if (!email || !planId) {
    return NextResponse.json({ error: "Missing purchase metadata" }, { status: 400 });
  }

  const paymentIntent =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;
  const customerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id;

  if (!isFulfillablePlanId(planId)) {
    securityLog("verify_stripe_unknown_plan", { planId: planId.slice(0, 64) });
    return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
  }

  const result = await fulfillPurchase({
    email,
    planId,
    paymentId: paymentIntent ?? session.id,
    orderId: session.id,
    subscriptionId,
    customerId,
    provider: "stripe",
  });

  if (result.product === "unknown") {
    return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    product: result.product,
    email,
    licenseKey: result.licenseKey,
  });
}

async function verifyRazorpay(data: z.infer<typeof razorpaySchema>) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Payment verification unavailable" }, { status: 500 });
  }

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
    securityLog("verify_bad_signature", { mode: data.mode });
    return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
  }

  // Server-sourced plan/email only — never trust client body for entitlement
  const rz = getRazorpay();
  let planId = "";
  let email = "";

  try {
    if (data.mode === "payment" && data.razorpay_order_id) {
      const order = await rz.orders.fetch(data.razorpay_order_id);
      const notes = notesRecord(order.notes);
      planId = notes.planId ?? "";
      email = (notes.email ?? "").toLowerCase();
    } else if (data.razorpay_subscription_id) {
      const sub = await rz.subscriptions.fetch(data.razorpay_subscription_id);
      const notes = notesRecord(sub.notes);
      planId = notes.planId ?? "";
      email = (notes.email ?? "").toLowerCase();
    }
  } catch {
    securityLog("verify_razorpay_fetch_failed", { mode: data.mode });
    return NextResponse.json({ error: "Could not verify order" }, { status: 400 });
  }

  if (!planId || !email) {
    return NextResponse.json({ error: "Missing purchase metadata" }, { status: 400 });
  }

  if (!isFulfillablePlanId(planId)) {
    securityLog("verify_razorpay_unknown_plan", { planId: planId.slice(0, 64) });
    return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
  }

  // Consistency check — mismatch means tampering; server notes still win for fulfill
  if (data.planId !== planId || data.email.toLowerCase() !== email) {
    securityLog("verify_client_metadata_mismatch", {
      mode: data.mode,
      clientPlan: data.planId,
      serverPlan: planId,
    });
    return NextResponse.json({ error: "Purchase metadata mismatch" }, { status: 400 });
  }

  const result = await fulfillPurchase({
    email,
    planId,
    paymentId: data.razorpay_payment_id,
    orderId: data.razorpay_order_id,
    subscriptionId: data.razorpay_subscription_id,
    provider: "razorpay",
  });

  if (result.product === "unknown") {
    return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    product: result.product,
    email,
    licenseKey: result.licenseKey,
  });
}

export async function POST(req: NextRequest) {
  if (!assertSameOrigin(req)) {
    securityLog("verify_origin_blocked", { ip: clientIp(req) });
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!requireJsonContentType(req)) {
    return NextResponse.json({ error: "Unsupported media type" }, { status: 415 });
  }

  const limited = rateLimit({
    key: `verify:${clientIp(req)}`,
    limit: 10,
    windowMs: 60_000,
  });
  if (!limited.ok) {
    securityLog("verify_rate_limited", { ip: clientIp(req) });
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await readJsonLimited(req);
  if (!body.ok) {
    return NextResponse.json({ error: body.error }, { status: 400 });
  }

  const data = body.data as Record<string, unknown>;
  const providerHint = typeof data.provider === "string" ? data.provider : "";
  const provider =
    providerHint === "razorpay" || providerHint === "stripe"
      ? providerHint
      : typeof data.sessionId === "string"
        ? "stripe"
        : getPaymentsProvider();

  try {
    if (provider === "stripe") {
      const parsed = stripeSchema.safeParse(data);
      if (!parsed.success) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
      }
      return await verifyStripe(parsed.data.sessionId);
    }

    const parsed = razorpaySchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    return await verifyRazorpay(parsed.data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "verify failed";
    securityLog("verify_error", { ip: clientIp(req), message: message.slice(0, 120) });
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 });
  }
}
