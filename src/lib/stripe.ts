import Stripe from "stripe";

function requireSecretKey() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key.includes("placeholder")) {
    throw new Error("STRIPE_SECRET_KEY must be set");
  }
  return key;
}

let client: Stripe | null = null;

export function getStripe(): Stripe {
  if (!client) {
    // apiVersion omitted — SDK default keeps builds stable across stripe package bumps
    client = new Stripe(requireSecretKey());
  }
  return client;
}

export function isStripeConfigured(): boolean {
  const key = process.env.STRIPE_SECRET_KEY;
  return Boolean(key && !key.includes("placeholder"));
}

export function getStripePublishableKey(): string {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
}

/** Optional Price IDs from Stripe Dashboard / npm run setup-stripe */
export const STRIPE_PRICE_IDS = {
  vaultPro: process.env.STRIPE_PRICE_VAULT_PRO ?? "",
  vaultTeam: process.env.STRIPE_PRICE_VAULT_TEAM ?? "",
  vaultProAnnual: process.env.STRIPE_PRICE_VAULT_PRO_ANNUAL ?? "",
  foundrySolo: process.env.STRIPE_PRICE_FOUNDRY_SOLO ?? "",
  foundryAgency: process.env.STRIPE_PRICE_FOUNDRY_AGENCY ?? "",
  bundleLaunch: process.env.STRIPE_PRICE_BUNDLE_LAUNCH ?? "",
} as const;

export function stripePriceEnvForPlan(
  planId: string
): keyof typeof STRIPE_PRICE_IDS | null {
  switch (planId) {
    case "vault-pro":
      return "vaultPro";
    case "vault-team":
      return "vaultTeam";
    case "vault-pro-annual":
      return "vaultProAnnual";
    case "foundry-solo":
      return "foundrySolo";
    case "foundry-agency":
      return "foundryAgency";
    case "bundle-launch":
      return "bundleLaunch";
    default:
      return null;
  }
}

/**
 * Default: Razorpay (existing Vercel keys keep working).
 * Set PAYMENTS_PROVIDER=stripe only when Stripe keys are configured.
 */
export function getPaymentsProvider(): "stripe" | "razorpay" {
  const raw = (process.env.PAYMENTS_PROVIDER ?? "razorpay").toLowerCase().trim();
  if (raw === "stripe") return "stripe";
  if (raw === "razorpay") return "razorpay";
  // auto / anything else: use Stripe only if keys exist, else Razorpay
  return isStripeConfigured() ? "stripe" : "razorpay";
}
