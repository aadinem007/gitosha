import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey && process.env.NODE_ENV === "production") {
  // Fail loudly in production rather than silently accepting payments with no key.
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(secretKey ?? "sk_test_placeholder", {
  apiVersion: "2026-06-24.dahlia",
});

// Price IDs are created once in the Stripe dashboard (free to do) and referenced
// by env var so the code never hardcodes environment-specific IDs.
export const PRICE_IDS = {
  vaultPro: process.env.STRIPE_PRICE_VAULT_PRO ?? "",
  vaultTeam: process.env.STRIPE_PRICE_VAULT_TEAM ?? "",
  foundrySolo: process.env.STRIPE_PRICE_FOUNDRY_SOLO ?? "",
  foundryProUpdates: process.env.STRIPE_PRICE_FOUNDRY_PRO_UPDATES ?? "",
  foundryAgency: process.env.STRIPE_PRICE_FOUNDRY_AGENCY ?? "",
} as const;
