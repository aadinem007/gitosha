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

type PaypalToken = { access_token: string; expires_at: number };
let cachedToken: PaypalToken | null = null;

function credentialsOk(): boolean {
  const id = process.env.PAYPAL_CLIENT_ID?.trim() ?? "";
  const secret = process.env.PAYPAL_CLIENT_SECRET?.trim() ?? "";
  return Boolean(id && secret && !id.includes("placeholder"));
}

function webhookConfigured(): boolean {
  return Boolean(process.env.PAYPAL_WEBHOOK_ID?.trim());
}

function apiBase(): string {
  const explicit = process.env.PAYPAL_API_BASE?.replace(/\/$/, "");
  if (explicit) return explicit;
  const mode = (process.env.PAYPAL_MODE ?? "sandbox").toLowerCase();
  return mode === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

function minorToMajor(amountMinor: number, currency: string): string {
  // PayPal expects major units as a string. Zero-decimal currencies are rare for us.
  void currency;
  return (amountMinor / 100).toFixed(2);
}

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expires_at > Date.now() + 30_000) {
    return cachedToken.access_token;
  }
  const id = process.env.PAYPAL_CLIENT_ID!;
  const secret = process.env.PAYPAL_CLIENT_SECRET!;
  const auth = Buffer.from(`${id}:${secret}`).toString("base64");
  const res = await fetch(`${apiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) {
    paymentsLog("paypal_token_failed", { status: res.status });
    throw new PaymentServiceError("unavailable", 502, "PayPal auth failed.");
  }
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    access_token: data.access_token,
    expires_at: Date.now() + (data.expires_in ?? 3600) * 1000,
  };
  return data.access_token;
}

async function paypalFetch<T>(
  path: string,
  init: RequestInit & { idempotencyKey?: string } = {}
): Promise<T> {
  const token = await getAccessToken();
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(init.headers as Record<string, string> | undefined),
  };
  if (init.idempotencyKey) {
    headers["PayPal-Request-Id"] = init.idempotencyKey.slice(0, 108);
  }
  const res = await fetch(`${apiBase()}${path}`, {
    ...init,
    headers,
  });
  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { raw: text.slice(0, 200) };
  }
  if (!res.ok) {
    paymentsLog("paypal_api_error", {
      path: path.slice(0, 80),
      status: res.status,
    });
    throw new PaymentServiceError(
      "generic",
      res.status >= 500 ? 502 : 400,
      "PayPal request failed."
    );
  }
  return body as T;
}

type PaypalOrder = {
  id: string;
  status: string;
  links?: { rel: string; href: string }[];
  purchase_units?: {
    custom_id?: string;
    amount?: { value?: string; currency_code?: string };
    payments?: {
      captures?: {
        id: string;
        status: string;
        amount?: { value?: string; currency_code?: string };
      }[];
    };
  }[];
  payer?: { email_address?: string };
};

function approveUrl(order: PaypalOrder): string | undefined {
  return order.links?.find((l) => l.rel === "approve")?.href;
}

function parseCustomId(custom?: string): { planId?: string; email?: string; product?: string } {
  if (!custom) return {};
  try {
    const parsed = JSON.parse(custom) as Record<string, unknown>;
    return {
      planId: typeof parsed.planId === "string" ? parsed.planId : undefined,
      email: typeof parsed.email === "string" ? parsed.email.toLowerCase() : undefined,
      product: typeof parsed.product === "string" ? parsed.product : undefined,
    };
  } catch {
    // custom_id may be planId alone (max 127 chars)
    return { planId: custom.slice(0, 64) };
  }
}

function majorToMinor(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const n = Number(value);
  if (!Number.isFinite(n)) return undefined;
  return Math.round(n * 100);
}

async function verifyWebhookSignature(rawBody: string, headers: Headers): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID?.trim();
  if (!webhookId) return false;

  const transmissionId = headers.get("paypal-transmission-id");
  const transmissionTime = headers.get("paypal-transmission-time");
  const certUrl = headers.get("paypal-cert-url");
  const authAlgo = headers.get("paypal-auth-algo");
  const transmissionSig = headers.get("paypal-transmission-sig");
  if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig) {
    return false;
  }

  let webhookEvent: unknown;
  try {
    webhookEvent = JSON.parse(rawBody);
  } catch {
    return false;
  }

  try {
    const result = await paypalFetch<{ verification_status?: string }>(
      "/v1/notifications/verify-webhook-signature",
      {
        method: "POST",
        body: JSON.stringify({
          auth_algo: authAlgo,
          cert_url: certUrl,
          transmission_id: transmissionId,
          transmission_sig: transmissionSig,
          transmission_time: transmissionTime,
          webhook_id: webhookId,
          webhook_event: webhookEvent,
        }),
      }
    );
    return result.verification_status === "SUCCESS";
  } catch {
    return false;
  }
}

export const paypalProvider: PaymentProvider = {
  id: "paypal",

  isLiveReady() {
    return credentialsOk() && webhookConfigured();
  },

  getPublicConfig(): ProviderPublicConfig {
    return {
      providerId: "paypal",
      enabled: process.env.PAYMENTS_PAYPAL_ENABLED === "true",
      credentialsConfigured: credentialsOk(),
      supportedCurrencies: ["USD", "EUR"],
      secretEnvVars: [
        "PAYPAL_CLIENT_ID",
        "PAYPAL_CLIENT_SECRET",
        "PAYPAL_WEBHOOK_ID",
      ],
      supportsCheckout: true,
      capability: "checkout",
      scaffoldOnly: false,
    };
  },

  async createCheckout(input) {
    if (!this.isLiveReady()) {
      throw new PaymentServiceError("unavailable", 500);
    }
    if (input.mode === "subscription") {
      // Recurring Billing Subscriptions API not wired — failover to another provider.
      throw new PaymentServiceError(
        "unavailable",
        503,
        "PayPal one-time checkout only; use Stripe/Razorpay for subscriptions."
      );
    }

    const custom = JSON.stringify({
      planId: input.planId,
      email: input.email,
      product: input.product,
    }).slice(0, 127);

    const order = await paypalFetch<PaypalOrder>("/v2/checkout/orders", {
      method: "POST",
      idempotencyKey: `order-${input.email}-${input.planId}-${Date.now()}`,
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            custom_id: custom,
            description: `Gitosha ${input.planName}`.slice(0, 127),
            amount: {
              currency_code: input.currency,
              value: minorToMajor(input.amount, input.currency),
              breakdown: {
                item_total: {
                  currency_code: input.currency,
                  value: minorToMajor(input.amount, input.currency),
                },
              },
            },
            items: [
              {
                name: input.planName.slice(0, 127),
                description: input.planDescription.slice(0, 127),
                quantity: "1",
                unit_amount: {
                  currency_code: input.currency,
                  value: minorToMajor(input.amount, input.currency),
                },
                category: "DIGITAL_GOODS",
              },
            ],
          },
        ],
        application_context: {
          brand_name: "Gitosha",
          landing_page: "NO_PREFERENCE",
          user_action: "PAY_NOW",
          return_url: `${siteUrl()}/checkout/success?provider=paypal`,
          cancel_url: `${siteUrl()}/pricing`,
        },
      }),
    });

    const url = approveUrl(order);
    if (!url) {
      throw new PaymentServiceError("generic", 500, "Could not start PayPal checkout.");
    }

    return {
      provider: "paypal",
      mode: "payment",
      planId: input.planId,
      product: input.product,
      email: input.email,
      amount: input.amount,
      currency: input.currency,
      chargeLabel: formatMoney(input.amount, input.currency),
      url,
      orderId: order.id,
      sessionId: order.id,
    };
  },

  async verifyPayment(data: VerifyPaymentInput): Promise<VerifyPaymentResult> {
    if (!this.isLiveReady()) throw new PaymentServiceError("unavailable", 500);
    const orderId = data.sessionId ?? data.paypalOrderId;
    if (!orderId) throw new PaymentServiceError("generic", 400, "Invalid request");

    let captured: PaypalOrder;
    try {
      captured = await paypalFetch<PaypalOrder>(`/v2/checkout/orders/${orderId}/capture`, {
        method: "POST",
        body: "{}",
        idempotencyKey: `capture-${orderId}`,
      });
    } catch {
      // Webhook may have captured first — load order state
      captured = await paypalFetch<PaypalOrder>(`/v2/checkout/orders/${orderId}`);
    }

    const status = captured.status;
    const capture = captured.purchase_units?.[0]?.payments?.captures?.[0];
    if (status !== "COMPLETED" && capture?.status !== "COMPLETED") {
      throw new PaymentServiceError("not_paid", 400);
    }

    const meta = parseCustomId(captured.purchase_units?.[0]?.custom_id);
    const email = (
      meta.email ||
      captured.payer?.email_address ||
      data.email ||
      ""
    ).toLowerCase();
    const planId = meta.planId ?? data.planId ?? "";
    if (!email || !planId) throw new PaymentServiceError("metadata_mismatch", 400);
    if (!isFulfillablePlanId(planId)) throw new PaymentServiceError("unknown_plan", 400);

    const paymentId = capture?.id ?? orderId;
    const amount =
      majorToMinor(capture?.amount?.value) ??
      majorToMinor(captured.purchase_units?.[0]?.amount?.value);
    const currencyRaw =
      capture?.amount?.currency_code ??
      captured.purchase_units?.[0]?.amount?.currency_code ??
      "USD";
    const currency =
      currencyRaw === "INR" || currencyRaw === "EUR" || currencyRaw === "USD"
        ? currencyRaw
        : "USD";

    const result = await fulfillPurchase({
      email,
      planId,
      paymentId,
      orderId,
      provider: "paypal",
    });
    if (result.product === "unknown") throw new PaymentServiceError("unknown_plan", 400);

    return {
      ok: true,
      product: result.product,
      email,
      licenseKey: result.licenseKey,
      planId,
      provider: "paypal",
      currency,
      amount,
    };
  },

  async parseWebhook(rawBody: string, headers: Headers): Promise<ParseWebhookResult> {
    if (!credentialsOk() || !webhookConfigured()) {
      return { ok: false, error: "Unavailable", status: 503 };
    }

    const valid = await verifyWebhookSignature(rawBody, headers);
    if (!valid) {
      paymentsLog("webhook_bad_signature", { provider: "paypal" });
      return { ok: false, error: "Invalid signature", status: 400 };
    }

    let body: {
      id?: string;
      event_type?: string;
      resource?: Record<string, unknown>;
    };
    try {
      body = JSON.parse(rawBody);
    } catch {
      return { ok: false, error: "Invalid payload", status: 400 };
    }

    const eventId = body.id ?? `paypal_${Date.now()}`;
    const eventType = body.event_type ?? "unknown";
    const resource = body.resource ?? {};

    if (
      eventType === "PAYMENT.CAPTURE.COMPLETED" ||
      eventType === "CHECKOUT.ORDER.COMPLETED"
    ) {
      const custom =
        typeof resource.custom_id === "string"
          ? resource.custom_id
          : typeof (resource as { purchase_units?: { custom_id?: string }[] }).purchase_units?.[0]
                ?.custom_id === "string"
            ? (resource as { purchase_units: { custom_id?: string }[] }).purchase_units[0]!
                .custom_id
            : undefined;
      const meta = parseCustomId(custom);
      const supplementary =
        resource.supplementary_data as
          | { related_ids?: { order_id?: string } }
          | undefined;
      const orderId =
        supplementary?.related_ids?.order_id ??
        (typeof resource.id === "string" && eventType.includes("ORDER")
          ? resource.id
          : undefined);
      const paymentId =
        typeof resource.id === "string" && eventType.includes("CAPTURE")
          ? resource.id
          : orderId;
      const amountObj = resource.amount as { value?: string; currency_code?: string } | undefined;
      const currencyRaw = amountObj?.currency_code ?? "USD";
      const currency =
        currencyRaw === "INR" || currencyRaw === "EUR" || currencyRaw === "USD"
          ? currencyRaw
          : "USD";

      // Prefer metadata from order when capture lacks custom_id
      let planId = meta.planId;
      let email = meta.email;
      if ((!planId || !email) && orderId) {
        try {
          const order = await paypalFetch<PaypalOrder>(`/v2/checkout/orders/${orderId}`);
          const fromOrder = parseCustomId(order.purchase_units?.[0]?.custom_id);
          planId = planId ?? fromOrder.planId;
          email = email ?? fromOrder.email ?? order.payer?.email_address?.toLowerCase();
        } catch {
          paymentsLog("webhook_order_fetch_failed", { provider: "paypal" });
        }
      }

      return {
        ok: true,
        event: {
          provider: "paypal",
          eventId,
          type: "payment.succeeded",
          rawType: eventType,
          email,
          planId,
          paymentId,
          orderId,
          amount: majorToMinor(amountObj?.value),
          currency,
          summary: {
            event: eventType,
            paymentId: paymentId ?? null,
            planId: planId ?? null,
          },
        },
      };
    }

    return {
      ok: true,
      event: {
        provider: "paypal",
        eventId,
        type: "unknown",
        rawType: eventType,
        summary: { event: eventType },
      },
    };
  },

  async refund(input) {
    const result = await paypalFetch<{ id: string; status?: string }>(
      `/v2/payments/captures/${input.providerRef}/refund`,
      {
        method: "POST",
        body: JSON.stringify({
          amount: {
            value: minorToMajor(input.amount, input.currency),
            currency_code: input.currency,
          },
          note_to_payer: input.reason?.slice(0, 255),
        }),
      }
    );
    return {
      providerRef: result.id,
      amount: input.amount,
      status:
        result.status === "COMPLETED" || result.status === "PENDING"
          ? result.status === "COMPLETED"
            ? ("succeeded" as const)
            : ("pending" as const)
          : ("succeeded" as const),
    };
  },
};

/** Test helper — clears OAuth cache between tests. */
export function __resetPaypalTokenCacheForTests(): void {
  cachedToken = null;
}
