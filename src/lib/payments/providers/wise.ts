import { PaymentServiceError, paymentsLog } from "../errors";
import type { PaymentProvider } from "../provider";
import type { ProviderPublicConfig } from "../types";

/**
 * Wise (TransferWise) — **payout / settlement** adapter, not buyer checkout.
 *
 * Public Wise Platform APIs cover quotes → recipients → transfers → fund.
 * They do not provide hosted card/UPI checkout for digital-goods merchants.
 * Customer checkout must use Razorpay / Stripe / PayPal (or Xflow UPI).
 *
 * When credentials exist, admin tooling can call createPayout / getTransferStatus.
 * Registry never routes createCheckout here (`supportsCheckout: false`).
 */

const API_BASE =
  process.env.WISE_API_BASE?.replace(/\/$/, "") || "https://api.wise.com";

function credentialsOk(): boolean {
  const token = process.env.WISE_API_TOKEN?.trim() ?? "";
  const profile = process.env.WISE_PROFILE_ID?.trim() ?? "";
  return Boolean(token && profile && !token.includes("placeholder"));
}

async function wiseFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = process.env.WISE_API_TOKEN!.trim();
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init.headers as Record<string, string> | undefined),
    },
  });
  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = null;
  }
  if (!res.ok) {
    paymentsLog("wise_api_error", { path: path.slice(0, 80), status: res.status });
    throw new PaymentServiceError("generic", 502, "Wise request failed.");
  }
  return body as T;
}

/** Create a quote (source → target). Amount is in major units for the source currency. */
export async function wiseCreateQuote(opts: {
  sourceCurrency: string;
  targetCurrency: string;
  sourceAmount: number;
}): Promise<{ id: string; rate?: number }> {
  if (!credentialsOk()) throw new PaymentServiceError("unavailable", 500);
  const profileId = process.env.WISE_PROFILE_ID!.trim();
  return wiseFetch(`/v3/profiles/${profileId}/quotes`, {
    method: "POST",
    body: JSON.stringify({
      sourceCurrency: opts.sourceCurrency,
      targetCurrency: opts.targetCurrency,
      sourceAmount: opts.sourceAmount,
    }),
  });
}

/** Fetch transfer status by id. */
export async function wiseGetTransferStatus(
  transferId: string
): Promise<{ id: number | string; status: string }> {
  if (!credentialsOk()) throw new PaymentServiceError("unavailable", 500);
  return wiseFetch(`/v1/transfers/${transferId}`);
}

/**
 * Create (draft) transfer — funding step is separate and often SCA-gated.
 * Operators should confirm fund path in Wise before relying on automation.
 */
export async function wiseCreateTransfer(opts: {
  quoteUuid: string;
  targetAccount: number;
  customerTransactionId: string;
  reference?: string;
}): Promise<{ id: number }> {
  if (!credentialsOk()) throw new PaymentServiceError("unavailable", 500);
  return wiseFetch(`/v1/transfers`, {
    method: "POST",
    body: JSON.stringify({
      targetAccount: opts.targetAccount,
      quoteUuid: opts.quoteUuid,
      customerTransactionId: opts.customerTransactionId,
      details: { reference: opts.reference?.slice(0, 10) ?? "Gitosha" },
    }),
  });
}

export const wiseProvider: PaymentProvider = {
  id: "wise",

  /** Payout-ready when credentials present — never means checkout-ready. */
  isLiveReady() {
    return false;
  },

  getPublicConfig(): ProviderPublicConfig {
    return {
      providerId: "wise",
      enabled: false,
      credentialsConfigured: credentialsOk(),
      supportedCurrencies: ["USD", "INR", "EUR"],
      secretEnvVars: ["WISE_API_TOKEN", "WISE_PROFILE_ID"],
      supportsCheckout: false,
      capability: "payout",
      scaffoldOnly: false,
      operatorNote:
        "Wise is a payout/settlement rail (quotes + transfers). Not customer checkout. Use Razorpay/Stripe/PayPal to collect.",
    };
  },

  async createCheckout() {
    throw new PaymentServiceError(
      "unavailable",
      503,
      "Wise does not support buyer checkout. Use Razorpay, Stripe, or PayPal."
    );
  },

  async verifyPayment() {
    throw new PaymentServiceError("unavailable", 503);
  },

  async parseWebhook() {
    return { ok: false as const, error: "Unavailable", status: 503 as const };
  },

  async refund() {
    throw new PaymentServiceError(
      "refund_failed",
      501,
      "Wise payouts are not customer-charge refunds. Reverse via Wise transfer tooling."
    );
  },
};
