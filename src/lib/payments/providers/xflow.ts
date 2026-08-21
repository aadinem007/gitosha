import { createHmac } from "crypto";
import { fulfillPurchase, isFulfillablePlanId } from "@/lib/fulfill";
import { PaymentServiceError, paymentsLog } from "../errors";
import type { PaymentProvider } from "../provider";
import type {
  ParseWebhookResult,
  ProviderPublicConfig,
  VerifyPaymentInput,
  VerifyPaymentResult,
} from "../types";
import { formatMoney, siteUrl } from "../currencies";
import { verifyXflowWebhook } from "../xflow-webhook";
import { mapXflowIntentStatus, xflowIntentIsPaid } from "../xflow-status";

/**
 * Xflow adapter — official collection APIs only.
 *
 * Checkout: INR UPI TransactionIntent (one-time) or Subscription (monthly Vault).
 * Docs: https://docs.xflowpay.com/imports/latest/guide
 * Webhooks: https://docs.xflowpay.com/exports/latest/guide (Verify events)
 *
 * Xflow does not document a public refund API — refund() fails closed.
 */

const DEFAULT_API_BASE = "https://api.xflowpay.com";

function apiBase(): string {
  return (process.env.XFLOW_API_BASE ?? DEFAULT_API_BASE).replace(/\/$/, "");
}

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
export function paiseToMajor(paise: number): string {
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
  type?: string;
  amount?: string | number;
  currency?: string;
  livemode?: boolean;
  subscription_id?: string;
  metadata?: Record<string, string> | null;
  payment_method_details?: {
    upi?: { intent_url?: string; flow?: string };
  };
};

type XflowSubscription = {
  id: string;
  status?: string;
  amount?: string | number;
  currency?: string;
  metadata?: Record<string, string> | null;
};

function asList<T>(body: unknown): T[] {
  if (Array.isArray(body)) return body as T[];
  if (body && typeof body === "object" && Array.isArray((body as { data?: T[] }).data)) {
    return (body as { data: T[] }).data;
  }
  return [];
}

async function xflowFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);
  try {
    const res = await fetch(`${apiBase()}${path}`, {
      ...init,
      signal: controller.signal,
      headers: { ...authHeaders(), ...(init.headers as Record<string, string> | undefined) },
    });
    const text = await res.text();
    let parsed: unknown = null;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = null;
    }
    if (!res.ok) {
      paymentsLog("xflow_api_error", { path: path.slice(0, 80), status: res.status });
      throw new PaymentServiceError(
        "generic",
        res.status >= 500 ? 502 : 400,
        "Xflow request failed."
      );
    }
    return parsed as T;
  } catch (err) {
    if (err instanceof PaymentServiceError) throw err;
    if (err instanceof Error && err.name === "AbortError") {
      throw new PaymentServiceError("timeout", 504);
    }
    throw new PaymentServiceError("network", 502);
  } finally {
    clearTimeout(timer);
  }
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function monthlyAnchor(): number {
  return Math.min(28, Math.max(1, new Date().getUTCDate()));
}

export const xflowProvider: PaymentProvider = {
  id: "xflow",

  isLiveReady() {
    return credentialsOk() && webhookConfigured();
  },

  getPublicConfig(): ProviderPublicConfig {
    return {
      providerId: "xflow",
      enabled: this.isLiveReady(),
      credentialsConfigured: credentialsOk(),
      supportedCurrencies: ["INR"],
      secretEnvVars: ["XFLOW_API_KEY", "XFLOW_ACCOUNT_ID", "XFLOW_WEBHOOK_SECRET"],
      supportsCheckout: true,
      capability: "checkout",
      scaffoldOnly: false,
      operatorNote:
        "Xflow is the only checkout. INR UPI only (India). Monthly Vault uses Xflow Subscription; one-time plans use TransactionIntent. Public refund API is not documented — refunds stay in the Xflow dashboard.",
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
        "Xflow collects INR via UPI only."
      );
    }

    const accountId = process.env.XFLOW_ACCOUNT_ID!.trim();
    const metadata = {
      planId: input.planId,
      email: input.email,
      product: input.product,
    };

    let intent: XflowIntent;
    let subscriptionId: string | undefined;

    if (input.mode === "subscription" && input.planId !== "vault-pro-annual") {
      // Official monthly Subscription (imports guide §5.3). Annual is one-time — interval yearly is not documented.
      const start = new Date();
      const end = new Date();
      end.setUTCFullYear(end.getUTCFullYear() + 10);
      const subscription = await xflowFetch<XflowSubscription>("/v1/subscriptions", {
        method: "POST",
        body: JSON.stringify({
          amount: Number(paiseToMajor(input.amount)),
          currency: "INR",
          execution_anchor: monthlyAnchor(),
          interval: "monthly",
          payment_method: "upi",
          payment_method_details: { upi: { flow: "intent" } },
          to: { account_id: accountId },
          validity_start_date: isoDate(start),
          validity_end_date: isoDate(end),
          metadata,
        }),
      });
      subscriptionId = subscription.id;
      const listed = await xflowFetch<unknown>(
        `/v1/transaction_intents?subscription_id=${encodeURIComponent(subscription.id)}`
      );
      const intents = asList<XflowIntent>(listed);
      const authorize =
        intents.find((row) => row.type === "authorize_subscription") ?? intents[0];
      if (!authorize?.id) {
        throw new PaymentServiceError("generic", 502, "Xflow did not return a UPI authorization intent.");
      }
      intent = authorize;
    } else {
      intent = await xflowFetch<XflowIntent>("/v1/transaction_intents", {
        method: "POST",
        body: JSON.stringify({
          amount: paiseToMajor(input.amount),
          currency: "INR",
          payment_method: "upi",
          payment_method_details: { upi: { flow: "intent" } },
          to: { account_id: accountId },
          type: "payment",
          metadata,
        }),
      });
    }

    const intentUrl = intent.payment_method_details?.upi?.intent_url;
    const bridgeUrl = `${siteUrl()}/checkout/xflow?intent=${encodeURIComponent(intent.id)}`;

    return {
      provider: "xflow",
      mode: input.mode,
      planId: input.planId,
      product: input.product,
      email: input.email,
      amount: input.amount,
      currency: "INR",
      chargeLabel: formatMoney(input.amount, "INR"),
      url: bridgeUrl,
      orderId: intent.id,
      sessionId: intent.id,
      subscriptionId,
      upiIntentUrl: intentUrl,
      name: input.planName,
      description: input.planName,
    };
  },

  async verifyPayment(data: VerifyPaymentInput): Promise<VerifyPaymentResult> {
    if (!this.isLiveReady()) throw new PaymentServiceError("unavailable", 500);
    const intentId = data.sessionId ?? data.xflowIntentId;
    if (!intentId) throw new PaymentServiceError("generic", 400, "Invalid request");

    const intent = await xflowFetch<XflowIntent>(`/v1/transaction_intents/${intentId}`);
    if (!xflowIntentIsPaid(intent.status)) {
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
      subscriptionId: intent.subscription_id,
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
    const verified = verifyXflowWebhook(rawBody, headers);
    if (!verified.ok) {
      paymentsLog("webhook_bad_signature", { provider: "xflow", reason: verified.reason });
      return { ok: false, error: "Invalid signature", status: 400 };
    }

    let body: {
      id?: string;
      type?: string;
      event?: string;
      linked_id?: string;
      linked_object?: string;
      data?: { object?: Record<string, unknown> };
      object?: Record<string, unknown>;
    };
    try {
      body = JSON.parse(rawBody);
    } catch {
      return { ok: false, error: "Invalid payload", status: 400 };
    }

    const eventType = body.type || body.event || "unknown";
    const eventId = verified.webhookId || body.id || `xflow_${createHmac("sha256", "id").update(rawBody).digest("hex").slice(0, 24)}`;

    if (eventType === "transaction_intent.status.successful") {
      const linkedId =
        body.linked_id ||
        (typeof body.data?.object?.id === "string" ? body.data.object.id : undefined) ||
        (typeof body.object?.id === "string" ? body.object.id : undefined);
      if (!linkedId) {
        return {
          ok: true,
          event: {
            provider: "xflow",
            eventId,
            type: "unknown",
            rawType: eventType,
            summary: { event: eventType, reason: "missing_linked_id" },
          },
        };
      }

      try {
        const intent = await xflowFetch<XflowIntent>(`/v1/transaction_intents/${linkedId}`);
        if (!xflowIntentIsPaid(intent.status)) {
          return {
            ok: true,
            event: {
              provider: "xflow",
              eventId,
              type: "unknown",
              rawType: eventType,
              summary: {
                event: eventType,
                intentId: intent.id,
                mapped: mapXflowIntentStatus(intent.status),
              },
            },
          };
        }
        const email = intent.metadata?.email?.toLowerCase();
        const planId = intent.metadata?.planId;
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
            subscriptionId: intent.subscription_id,
            amount: majorToPaise(intent.amount),
            currency: "INR",
            summary: {
              event: eventType,
              intentId: intent.id,
              planId: planId ?? null,
              mapped: mapXflowIntentStatus(intent.status),
            },
          },
        };
      } catch {
        paymentsLog("webhook_intent_fetch_failed", { provider: "xflow" });
        return { ok: false, error: "Handler failed", status: 503 };
      }
    }

    if (eventType === "subscription.status.paused") {
      const linkedId = body.linked_id;
      return {
        ok: true,
        event: {
          provider: "xflow",
          eventId,
          type: "subscription.canceled",
          rawType: eventType,
          subscriptionId: linkedId,
          cancelSubscription: true,
          summary: { event: eventType, subscriptionId: linkedId ?? null },
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
    throw new PaymentServiceError(
      "refund_failed",
      501,
      "Xflow does not document a public refund API. Process refunds in the Xflow dashboard, then they will not auto-mark here."
    );
  },

  async getTransaction(providerRef: string) {
    const snap = await getXflowSettlementSnapshot(providerRef);
    if (!snap) return null;
    return {
      provider: "xflow",
      providerRef: snap.xflowIntentId,
      status: snap.mappedStatus,
      metadata: {
        xflowStatus: snap.xflowStatus,
        settlementStatus: snap.settlementStatus,
        reconciliationStatus: snap.reconciliationStatus,
      },
    };
  },
};

export type XflowSettlementSnapshot = {
  xflowIntentId: string;
  xflowStatus: string;
  mappedStatus: ReturnType<typeof mapXflowIntentStatus>;
  settlementStatus: string;
  reconciliationStatus: string;
  livemode: boolean | null;
};

/** Safe snapshot for admin — never includes secrets. */
export async function getXflowSettlementSnapshot(
  intentId: string
): Promise<XflowSettlementSnapshot | null> {
  if (!credentialsOk() || !intentId.startsWith("transaction_intent")) return null;
  try {
    const intent = await xflowFetch<XflowIntent>(`/v1/transaction_intents/${intentId}`);
    const mapped = mapXflowIntentStatus(intent.status);
    const paid = xflowIntentIsPaid(intent.status);
    return {
      xflowIntentId: intent.id,
      xflowStatus: intent.status ?? "unknown",
      mappedStatus: mapped,
      settlementStatus: paid ? "collected_inr" : mapped,
      reconciliationStatus: paid ? "awaiting_xflow_payout" : "not_settled",
      livemode: typeof intent.livemode === "boolean" ? intent.livemode : null,
    };
  } catch {
    return null;
  }
}
