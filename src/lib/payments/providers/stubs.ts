import { PaymentServiceError } from "../errors";
import type { PaymentProvider } from "../provider";
import type { ProviderId, ProviderPublicConfig } from "../types";

/**
 * Scaffold-only providers — registered but disabled until credentials exist.
 * Calling createCheckout / verify / refund throws unavailable.
 * Do NOT enable live without real adapter implementation + env secrets.
 */
function scaffoldProvider(
  id: ProviderId,
  secretEnvVars: string[],
  currencies: ProviderPublicConfig["supportedCurrencies"]
): PaymentProvider {
  return {
    id,
    isLiveReady() {
      return false;
    },
    getPublicConfig(): ProviderPublicConfig {
      return {
        providerId: id,
        enabled: false,
        credentialsConfigured: false,
        supportedCurrencies: currencies,
        secretEnvVars,
        scaffoldOnly: true,
      };
    },
    async createCheckout() {
      throw new PaymentServiceError(
        "unavailable",
        503,
        `${id} is scaffold-only and not enabled for live charges.`
      );
    },
    async verifyPayment() {
      throw new PaymentServiceError("unavailable", 503);
    },
    async parseWebhook() {
      return { ok: false as const, error: "Unavailable", status: 503 as const };
    },
    async refund() {
      throw new PaymentServiceError("unavailable", 503);
    },
  };
}

export const paypalProvider = scaffoldProvider(
  "paypal",
  ["PAYPAL_CLIENT_ID", "PAYPAL_CLIENT_SECRET", "PAYPAL_WEBHOOK_ID"],
  ["USD"]
);

export const xflowProvider = scaffoldProvider(
  "xflow",
  ["XFLOW_API_KEY", "XFLOW_WEBHOOK_SECRET"],
  ["USD", "INR"]
);

export const wiseProvider = scaffoldProvider(
  "wise",
  ["WISE_API_TOKEN", "WISE_PROFILE_ID"],
  ["USD", "INR"]
);

export const payoneerProvider = scaffoldProvider(
  "payoneer",
  ["PAYONEER_CLIENT_ID", "PAYONEER_CLIENT_SECRET"],
  ["USD"]
);

/** Force-disabled regardless of env — scaffold must stay off. */
export function isScaffoldProvider(id: ProviderId): boolean {
  return id === "paypal" || id === "xflow" || id === "wise" || id === "payoneer";
}
