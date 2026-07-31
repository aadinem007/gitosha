import { createHmac } from "crypto";
import { FOUNDRY_PLANS, VAULT_PLANS } from "@/lib/pricing";
import { getRazorpay, getRazorpayKeyId, PLAN_IDS } from "@/lib/razorpay";
import { fulfillPurchase, isFulfillablePlanId } from "@/lib/fulfill";
import { safeEqual } from "@/lib/secure";
import { PaymentServiceError, paymentsLog } from "../errors";
import type { PaymentProvider } from "../provider";
import type {
  CreateCheckoutInput,
  Currency,
  ParseWebhookResult,
  ProviderPublicConfig,
  VerifyPaymentInput,
  VerifyPaymentResult,
} from "../types";
import { formatMoney, siteUrl } from "../currencies";

void siteUrl;

function notesRecord(notes: unknown): Record<string, string> {
  if (!notes || typeof notes !== "object") return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(notes as Record<string, unknown>)) {
    if (typeof v === "string") out[k] = v;
    else if (typeof v === "number" || typeof v === "boolean") out[k] = String(v);
  }
  return out;
}

function credentialsOk(): boolean {
  const id = process.env.RAZORPAY_KEY_ID ?? "";
  const secret = process.env.RAZORPAY_KEY_SECRET ?? "";
  return Boolean(id && secret && !id.includes("placeholder"));
}

export const razorpayProvider: PaymentProvider = {
  id: "razorpay",

  isLiveReady() {
    return credentialsOk();
  },

  getPublicConfig(): ProviderPublicConfig {
    return {
      providerId: "razorpay",
      enabled: process.env.PAYMENTS_RAZORPAY_ENABLED !== "false",
      credentialsConfigured: credentialsOk(),
      supportedCurrencies: ["INR"],
      secretEnvVars: ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET", "RAZORPAY_WEBHOOK_SECRET"],
      supportsCheckout: true,
      capability: "checkout",
    };
  },

  async createCheckout(input) {
    if (!this.isLiveReady()) {
      throw new PaymentServiceError("unavailable", 500);
    }
    const keyId = getRazorpayKeyId();
    const rz = getRazorpay();
    const amount = input.amount;
    const currency = input.currency;

    if (input.mode === "payment") {
      const order = await rz.orders.create({
        amount,
        currency,
        receipt: `sy_${Date.now()}`.slice(0, 40),
        notes: {
          planId: input.planId,
          product: input.product,
          email: input.email,
          usdCents: String(
            [...VAULT_PLANS, ...FOUNDRY_PLANS].find((p) => p.id === input.planId)?.amountCents ?? ""
          ),
        },
      });
      return {
        provider: "razorpay",
        mode: "payment",
        planId: input.planId,
        product: input.product,
        email: input.email,
        amount,
        currency,
        chargeLabel: formatMoney(amount, currency),
        keyId,
        orderId: order.id,
        name: "Gitosha",
        description: input.planName,
      };
    }

    const planIdRzp = input.planEnvVar
      ? PLAN_IDS[input.planEnvVar as keyof typeof PLAN_IDS]
      : "";

    if (planIdRzp) {
      const subscription = await rz.subscriptions.create({
        plan_id: planIdRzp,
        total_count: 120,
        customer_notify: true,
        notes: { planId: input.planId, product: input.product, email: input.email },
      });
      return {
        provider: "razorpay",
        mode: "subscription",
        planId: input.planId,
        product: input.product,
        email: input.email,
        amount,
        currency,
        chargeLabel: formatMoney(amount, currency),
        keyId,
        subscriptionId: subscription.id,
        name: "Gitosha",
        description: input.planName,
      };
    }

    // Fallback: first period as order when subscription plan id missing
    const order = await rz.orders.create({
      amount,
      currency,
      receipt: `sy_${Date.now()}`.slice(0, 40),
      notes: {
        planId: input.planId,
        product: input.product,
        email: input.email,
        usdCents: String(
          [...VAULT_PLANS, ...FOUNDRY_PLANS].find((p) => p.id === input.planId)?.amountCents ?? ""
        ),
      },
    });
    return {
      provider: "razorpay",
      mode: "payment",
      planId: input.planId,
      product: input.product,
      email: input.email,
      amount,
      currency,
      chargeLabel: formatMoney(amount, currency),
      keyId,
      orderId: order.id,
      name: "Gitosha",
      description: `${input.planName} (first billing period)`,
    };
  },

  async verifyPayment(data: VerifyPaymentInput): Promise<VerifyPaymentResult> {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) throw new PaymentServiceError("unavailable", 500);
    if (!data.mode || !data.razorpay_payment_id || !data.razorpay_signature) {
      throw new PaymentServiceError("generic", 400, "Invalid request");
    }

    let expectedPayload: string;
    if (data.mode === "payment") {
      if (!data.razorpay_order_id) throw new PaymentServiceError("generic", 400, "Missing order id");
      expectedPayload = `${data.razorpay_order_id}|${data.razorpay_payment_id}`;
    } else {
      if (!data.razorpay_subscription_id) {
        throw new PaymentServiceError("generic", 400, "Missing subscription id");
      }
      expectedPayload = `${data.razorpay_payment_id}|${data.razorpay_subscription_id}`;
    }

    const expected = createHmac("sha256", secret).update(expectedPayload).digest("hex");
    if (!safeEqual(expected, data.razorpay_signature)) {
      paymentsLog("verify_bad_signature", { provider: "razorpay", mode: data.mode });
      throw new PaymentServiceError("invalid_signature", 400);
    }

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
      paymentsLog("verify_fetch_failed", { provider: "razorpay" });
      throw new PaymentServiceError("generic", 400, "Could not verify order");
    }

    if (!planId || !email) throw new PaymentServiceError("metadata_mismatch", 400);
    if (!isFulfillablePlanId(planId)) throw new PaymentServiceError("unknown_plan", 400);

    if (
      (data.planId && data.planId !== planId) ||
      (data.email && data.email.toLowerCase() !== email)
    ) {
      paymentsLog("verify_client_metadata_mismatch", {
        provider: "razorpay",
        clientPlan: data.planId ?? "",
        serverPlan: planId,
      });
      throw new PaymentServiceError("metadata_mismatch", 400);
    }

    const result = await fulfillPurchase({
      email,
      planId,
      paymentId: data.razorpay_payment_id,
      orderId: data.razorpay_order_id,
      subscriptionId: data.razorpay_subscription_id,
      provider: "razorpay",
    });
    if (result.product === "unknown") throw new PaymentServiceError("unknown_plan", 400);

    return {
      ok: true,
      product: result.product,
      email,
      licenseKey: result.licenseKey,
      planId,
      provider: "razorpay",
      currency: "INR",
    };
  },

  async parseWebhook(rawBody: string, headers: Headers): Promise<ParseWebhookResult> {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return { ok: false, error: "Unavailable", status: 503 };
    }
    const signature = headers.get("x-razorpay-signature");
    if (!signature) {
      paymentsLog("webhook_missing_signature", { provider: "razorpay" });
      return { ok: false, error: "Invalid signature", status: 400 };
    }
    const expected = createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
    if (!safeEqual(expected, signature)) {
      paymentsLog("webhook_bad_signature", { provider: "razorpay" });
      return { ok: false, error: "Invalid signature", status: 400 };
    }

    let body: {
      event: string;
      payload: {
        payment?: { entity: Record<string, unknown> };
        subscription?: { entity: Record<string, unknown> };
      };
    };
    try {
      body = JSON.parse(rawBody);
    } catch {
      return { ok: false, error: "Invalid payload", status: 400 };
    }

    const eventId =
      (body.payload.payment?.entity?.id
        ? `rzp_${body.event}_${String(body.payload.payment.entity.id)}`
        : body.payload.subscription?.entity?.id
          ? `rzp_${body.event}_${String(body.payload.subscription.entity.id)}`
          : "") || `rzp_${body.event}_${createHmac("sha256", "id").update(rawBody).digest("hex").slice(0, 24)}`;

    if (body.event === "payment.captured") {
      const payment = body.payload.payment?.entity;
      if (!payment) {
        return {
          ok: true,
          event: {
            provider: "razorpay",
            eventId,
            type: "unknown",
            rawType: body.event,
            summary: { event: body.event },
          },
        };
      }
      let notes = notesRecord(payment.notes);
      const orderId = payment.order_id ? String(payment.order_id) : "";
      if (orderId) {
        try {
          const order = await getRazorpay().orders.fetch(orderId);
          const fromOrder = notesRecord(order.notes);
          if (fromOrder.planId && fromOrder.email) notes = fromOrder;
        } catch {
          paymentsLog("webhook_order_fetch_failed", { provider: "razorpay" });
        }
      }
      return {
        ok: true,
        event: {
          provider: "razorpay",
          eventId,
          type: "payment.succeeded",
          rawType: body.event,
          email: notes.email?.toLowerCase(),
          planId: notes.planId,
          paymentId: String(payment.id),
          orderId: orderId || undefined,
          amount: typeof payment.amount === "number" ? payment.amount : undefined,
          currency: "INR",
          summary: {
            event: body.event,
            paymentId: String(payment.id),
            planId: notes.planId ?? null,
          },
        },
      };
    }

    if (body.event === "subscription.activated" || body.event === "subscription.charged") {
      const sub = body.payload.subscription?.entity;
      if (!sub) {
        return {
          ok: true,
          event: {
            provider: "razorpay",
            eventId,
            type: "unknown",
            rawType: body.event,
            summary: { event: body.event },
          },
        };
      }
      const notes = notesRecord(sub.notes);
      return {
        ok: true,
        event: {
          provider: "razorpay",
          eventId,
          type: "subscription.activated",
          rawType: body.event,
          email: notes.email?.toLowerCase(),
          planId: notes.planId,
          subscriptionId: String(sub.id),
          paymentId: String(sub.id),
          currency: "INR",
          summary: { event: body.event, subscriptionId: String(sub.id), planId: notes.planId ?? null },
        },
      };
    }

    if (
      body.event === "subscription.cancelled" ||
      body.event === "subscription.halted" ||
      body.event === "subscription.completed"
    ) {
      const sub = body.payload.subscription?.entity;
      return {
        ok: true,
        event: {
          provider: "razorpay",
          eventId,
          type: "subscription.canceled",
          rawType: body.event,
          subscriptionId: sub ? String(sub.id) : undefined,
          cancelSubscription: true,
          summary: { event: body.event, subscriptionId: sub ? String(sub.id) : null },
        },
      };
    }

    return {
      ok: true,
      event: {
        provider: "razorpay",
        eventId,
        type: "unknown",
        rawType: body.event,
        summary: { event: body.event },
      },
    };
  },

  async refund(input) {
    const rz = getRazorpay();
    const refund = await rz.payments.refund(input.providerRef, {
      amount: input.amount,
      notes: input.reason ? { reason: input.reason.slice(0, 200) } : undefined,
    });
    return {
      providerRef: String(refund.id),
      amount: typeof refund.amount === "number" ? refund.amount : input.amount,
      status: "succeeded" as const,
    };
  },
};

/** Type-only helper so CreateCheckoutInput stays imported for adapters that need it. */
export type RazorpayCheckoutExtras = CreateCheckoutInput & { currency: Currency };
