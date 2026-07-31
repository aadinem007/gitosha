import { PaymentServiceError, paymentsLog } from "../errors";
import type { PaymentProvider } from "../provider";
import type { ProviderPublicConfig } from "../types";

/**
 * Payoneer — **payout / mass-payout** adapter by default.
 *
 * Payoneer Checkout exists as a separate product (partnership / private docs at
 * checkoutdocs.payoneer.com). This repo does not claim Checkout readiness without
 * that partnership + createCheckout + webhook verify path.
 *
 * With client credentials we can obtain OAuth tokens and call Mass Payout status
 * endpoints when configured. Registry never routes customer checkout here.
 */

function apiBase(): string {
  return (
    process.env.PAYONEER_API_BASE?.replace(/\/$/, "") ||
    "https://api.payoneer.com"
  );
}

function credentialsOk(): boolean {
  const id = process.env.PAYONEER_CLIENT_ID?.trim() ?? "";
  const secret = process.env.PAYONEER_CLIENT_SECRET?.trim() ?? "";
  return Boolean(id && secret && !id.includes("placeholder"));
}

type TokenCache = { access_token: string; expires_at: number };
let cached: TokenCache | null = null;

export async function payoneerGetAccessToken(): Promise<string> {
  if (!credentialsOk()) throw new PaymentServiceError("unavailable", 500);
  if (cached && cached.expires_at > Date.now() + 30_000) return cached.access_token;

  const id = process.env.PAYONEER_CLIENT_ID!.trim();
  const secret = process.env.PAYONEER_CLIENT_SECRET!.trim();
  const auth = Buffer.from(`${id}:${secret}`).toString("base64");
  const programId = process.env.PAYONEER_PROGRAM_ID?.trim();

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    scope: process.env.PAYONEER_OAUTH_SCOPE?.trim() || "read write",
  });
  if (programId) body.set("program_id", programId);

  const res = await fetch(`${apiBase()}/v2/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: body.toString(),
  });
  if (!res.ok) {
    paymentsLog("payoneer_token_failed", { status: res.status });
    throw new PaymentServiceError("unavailable", 502, "Payoneer auth failed.");
  }
  const data = (await res.json()) as { access_token: string; expires_in?: number };
  cached = {
    access_token: data.access_token,
    expires_at: Date.now() + (data.expires_in ?? 3600) * 1000,
  };
  return data.access_token;
}

/** Status lookup for a mass-payout payment (program-specific paths may vary). */
export async function payoneerGetPayoutStatus(paymentId: string): Promise<{
  paymentId: string;
  status?: string;
}> {
  const token = await payoneerGetAccessToken();
  const programId = process.env.PAYONEER_PROGRAM_ID?.trim();
  if (!programId) {
    throw new PaymentServiceError(
      "unavailable",
      500,
      "PAYONEER_PROGRAM_ID required for payout status."
    );
  }
  const res = await fetch(
    `${apiBase()}/v4/programs/${encodeURIComponent(programId)}/payouts/${encodeURIComponent(paymentId)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    }
  );
  const text = await res.text();
  let body: Record<string, unknown> = {};
  try {
    body = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    body = {};
  }
  if (!res.ok) {
    paymentsLog("payoneer_api_error", { status: res.status });
    throw new PaymentServiceError("generic", 502, "Payoneer status request failed.");
  }
  return {
    paymentId,
    status: typeof body.status === "string" ? body.status : undefined,
  };
}

export const payoneerProvider: PaymentProvider = {
  id: "payoneer",

  isLiveReady() {
    return false;
  },

  getPublicConfig(): ProviderPublicConfig {
    return {
      providerId: "payoneer",
      enabled: false,
      credentialsConfigured: credentialsOk(),
      supportedCurrencies: ["USD", "EUR"],
      secretEnvVars: [
        "PAYONEER_CLIENT_ID",
        "PAYONEER_CLIENT_SECRET",
        "PAYONEER_PROGRAM_ID",
      ],
      supportsCheckout: false,
      capability: "payout",
      scaffoldOnly: false,
      operatorNote:
        "Payoneer Mass Payout / OAuth wired for settlement status. Payoneer Checkout requires a separate partnership — not enabled for customer checkout here.",
    };
  },

  async createCheckout() {
    throw new PaymentServiceError(
      "unavailable",
      503,
      "Payoneer Checkout is not enabled. Use Razorpay, Stripe, or PayPal to collect."
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
      "Payoneer payouts are not customer-charge refunds."
    );
  },
};

export function __resetPayoneerTokenCacheForTests(): void {
  cached = null;
}
