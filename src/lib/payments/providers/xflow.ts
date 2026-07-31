import { createHmac } from "crypto";
import { fulfillPurchase, isFulfillablePlanId } from "@/lib/fulfill";
import { safeEqual } from "@/lib/secure";
import { PaymentServiceError, paymentsLog } from "../errors";
import type { PaymentProvider } from "../provider";
import type {
  ParseWebhookResult,
  ProviderPublicConfig,
  VerifyPaymentInput,
  VerifyPaymentResult,
} from "../types";
import { formatMoney, siteUrl } from "../currencies";

/**
 * Xflow (xflowpay.com) — real cross-border / India collection API.
 *
 * Buyer checkout path used here: UPI TransactionIntent (INR only).
 * Requires platform/connected-user onboarding (`XFLOW_ACCOUNT_ID`).
 * UPI intent URLs are mobile-oriented; web desktop UX is limited vs Razorpay/Stripe.
 *
 * Live checkout is opt-in: credentials + PAYMENTS_XFLOW_ENABLED=true.
 * Do not enable for production traffic until webhooks fulfill licenses in your env.
 */

const API_BASE = "https://api.xflowpay.com";

function credentialsOk(): boolean {
  const key = process.env.XFLOW_API_KEY?.trim() ?? "";
  const account = process.env.XFLOW_ACCOUNT_ID?.trim() ?? "";
  return Boolean(key && account && !key.includes("placeholder"));
}

function webhookConfigured(): boolean {
  return Boolean(process.env.XFLOW_WEBHOOK_SECRET?.trim());
}

function authHeaders(): Record<string, string> {
  const key = process.env.XFLOW_API_KEY!.trim();
  const account = process.env.XFLOW_ACCOUNT_ID!.trim();
  return {
    Authorization: `Bearer ${key}`,
    "Xflow-Account": account,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

/** Minor units (paise) → major INR string for Xflow. */
function paiseToMajor(paise: number): string {
  return (paise / 100).toFixed(2);
}

function majorToPaise(value: string | number | undefined): number | undefined {
  if (value == null) return undefined;
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return undefined;
  return Math.round(n * 100);
}

type XflowIntent = {
  id: string;
  status?: string;
  amount?: string;
  currency?: string;
  metadata?: Record<string, string> | null;
  payment_method_details?: {
    upi?: { intent_url?: string; flow?: string };
  };
};

async function xflowFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { ...authHeaders(), ...(init.headers as Record<string, string> | undefined) },
  });
  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = null;
  }
  if (!res.ok) {
    paymentsLog("xflow_api_error", { path: path.slice(0, 80), status: res.status });
    throw new PaymentServiceError(
      "generic",
      res.status >= 500 ? 502 : 400,
      "Xflow request failed."
    );
  }
  return body as T;
}

function verifyXflowSignature(rawBody: string, headers: Headers): boolean {
  const secret = process.env.XFLOW_WEBHOOK_SECRET?.trim();
  if (!secret) return false;
  const signature =
    headers.get("x-xflow-signature") ||
    headers.get("xflow-signature") ||
    headers.get("x-signature");
  if (!signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  // Accept hex or sha256=<hex>
  const provided = signature.replace(/^sha256=/i, "").trim();
  return safeEqual(expected, provided);
}

export const xflowProvider: PaymentProvider = {
  id: "xflow",

  isLiveReady() {
    return (
      credentialsOk() &&
      webhookConfigured() &&
      process.env.PAYMENTS_XFLOW_ENABLED === "true"
    );
  },

  getPublicConfig(): ProviderPublicConfig {
    return {
      providerId: "xflow",
      enabled: process.env.PAYMENTS_XFLOW_ENABLED === "true",
      credentialsConfigured: credentialsOk(),
      supportedCurrencies: ["INR"],
      secretEnvVars: ["XFLOW_API_KEY", "XFLOW_ACCOUNT_ID", "XFLOW_WEBHOOK_SECRET"],
      supportsCheckout: true,
      capability: "checkout",
      scaffoldOnly: false,
      operatorNote:
        "Xflow UPI TransactionIntent (INR). Needs connected account onboarding. Prefer Razorpay for India card/UPI SaaS checkout unless you already run Xflow.",
    };
  },

  async createCheckout(input) {
    if (!this.isLiveReady()) {
      throw new PaymentServiceError("unavailable", 500);
    }
    if (input.currency !== "INR") {
      throw new PaymentServiceError(
        "currency_rejected",
        400,
        "Xflow checkout currently supports INR only."
      );
    }
    if (input.mode === "subscription") {
      throw new PaymentServiceError(
        "unavailable",
        503,
        "Xflow adapter supports one-time UPI intents only."
      );
    }

    const accountId = process.env.XFLOW_ACCOUNT_ID!.trim();
    const intent = await xflowFetch<XflowIntent>("/v1/transaction_intents", {
      method: "POST",
      body: JSON.stringify({
        amount: paiseToMajor(input.amount),
        currency: "INR",
        payment_method: "upi",
        payment_method_details: { upi: { flow: "intent" } },
        to: { account_id: accountId },
        type: "payment",
        metadata: {
          planId: input.planId,
          email: input.email,
          product: input.product,
        },
      }),
    });

    const intentUrl = intent.payment_method_details?.upi?.intent_url;
    // Hosted bridge page shows UPI deep-link / instructions (desktop-safe).
    const bridgeUrl = `${siteUrl()}/checkout/xflow?intent=${encodeURIComponent(intent.id)}`;

    return {
      provider: "xflow",
      mode: "payment",
      planId: input.planId,
      product: input.product,
      email: input.email,
      amount: input.amount,
      currency: "INR",
      chargeLabel: formatMoney(input.amount, "INR"),
      url: bridgeUrl,
      orderId: intent.id,
      sessionId: intent.id,
      // Surface raw UPI URL for clients that can open it
      description: intentUrl
        ? `UPI intent ready. Open on a UPI app or use the checkout bridge.`
        : input.planName,
    };
  },

  async verifyPayment(data: VerifyPaymentInput): Promise<VerifyPaymentResult> {
    if (!this.isLiveReady()) throw new PaymentServiceError("unavailable", 500);
    const intentId = data.sessionId ?? data.xflowIntentId;
    if (!intentId) throw new PaymentServiceError("generic", 400, "Invalid request");

    const intent = await xflowFetch<XflowIntent>(`/v1/transaction_intents/${intentId}`);
    if (intent.status !== "successful" && intent.status !== "completed") {
      throw new PaymentServiceError("not_paid", 400);
    }

    const meta = intent.metadata ?? {};
    const email = (meta.email || data.email || "").toLowerCase();
    const planId = meta.planId || data.planId || "";
    if (!email || !planId) throw new PaymentServiceError("metadata_mismatch", 400);
    if (!isFulfillablePlanId(planId)) throw new PaymentServiceError("unknown_plan", 400);

    const result = await fulfillPurchase({
      email,
      planId,
      paymentId: intent.id,
      orderId: intent.id,
      provider: "xflow",
    });
    if (result.product === "unknown") throw new PaymentServiceError("unknown_plan", 400);

    return {
      ok: true,
      product: result.product,
      email,
      licenseKey: result.licenseKey,
      planId,
      provider: "xflow",
      currency: "INR",
      amount: majorToPaise(intent.amount),
    };
  },

  async parseWebhook(rawBody: string, headers: Headers): Promise<ParseWebhookResult> {
    if (!credentialsOk() || !webhookConfigured()) {
      return { ok: false, error: "Unavailable", status: 503 };
    }
    if (!verifyXflowSignature(rawBody, headers)) {
      paymentsLog("webhook_bad_signature", { provider: "xflow" });
      return { ok: false, error: "Invalid signature", status: 400 };
    }

    let body: {
      id?: string;
      type?: string;
      event?: string;
      linked_id?: string;
      data?: { object?: Record<string, unknown> };
      object?: Record<string, unknown>;
    };
    try {
      body = JSON.parse(rawBody);
    } catch {
      return { ok: false, error: "Invalid payload", status: 400 };
    }

    const eventType = body.type || body.event || "unknown";
    const eventId = body.id || `xflow_${createHmac("sha256", "id").update(rawBody).digest("hex").slice(0, 24)}`;

    if (
      eventType === "transaction_intent.status.successful" ||
      eventType === "deposit.status.completed"
    ) {
      const linkedId =
        body.linked_id ||
        (typeof body.data?.object?.id === "string" ? body.data.object.id : undefined) ||
        (typeof body.object?.id === "string" ? body.object.id : undefined);

      let email: string | undefined;
      let planId: string | undefined;
      let amount: number | undefined;

      if (linkedId?.startsWith("transaction_intent") || eventType.includes("transaction_intent")) {
        const id = linkedId!;
        try {
          const intent = await xflowFetch<XflowIntent>(`/v1/transaction_intents/${id}`);
          email = intent.metadata?.email?.toLowerCase();
          planId = intent.metadata?.planId;
          amount = majorToPaise(intent.amount);
          if (intent.status === "successful" || intent.status === "completed") {
            return {
              ok: true,
              event: {
                provider: "xflow",
                eventId,
                type: "payment.succeeded",
                rawType: eventType,
                email,
                planId,
                paymentId: intent.id,
                orderId: intent.id,
                amount,
                currency: "INR",
                summary: {
                  event: eventType,
                  intentId: intent.id,
                  planId: planId ?? null,
                },
              },
            };
          }
        } catch {
          paymentsLog("webhook_intent_fetch_failed", { provider: "xflow" });
        }
      }

      return {
        ok: true,
        event: {
          provider: "xflow",
          eventId,
          type: "payment.succeeded",
          rawType: eventType,
          email,
          planId,
          paymentId: linkedId,
          orderId: linkedId,
          amount,
          currency: "INR",
          summary: { event: eventType, linkedId: linkedId ?? null },
        },
      };
    }

    return {
      ok: true,
      event: {
        provider: "xflow",
        eventId,
        type: "unknown",
        rawType: eventType,
        summary: { event: eventType },
      },
    };
  },

  async refund() {
    // Xflow UPI collections do not expose a simple card-style refund in public docs.
    throw new PaymentServiceError(
      "refund_failed",
      501,
      "Xflow refunds must be processed in the Xflow dashboard / support — API refund not wired."
    );
  },
};
