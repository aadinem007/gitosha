import type { Currency, ProviderId } from "./types";

/**
 * Fixed configured price lists — NOT live FX.
 * USD amounts come from plan.amountCents.
 * INR amounts use a documented fixed conversion for Razorpay India settlement
 * (same factor historically used by checkout). Do not present as live rates.
 */
export const CHARGE_CURRENCIES: Currency[] = ["USD", "INR"];

export const DISPLAY_CURRENCIES: Currency[] = ["USD", "INR"];

/** Fixed INR paise per USD cent — configured conversion, not a live FX feed. */
export const USD_CENTS_TO_INR_PAISE_FACTOR = 83;

export function usdCentsToInrPaise(amountCents: number): number {
  return Math.round(amountCents * USD_CENTS_TO_INR_PAISE_FACTOR);
}

export function formatMoney(amountMinor: number, currency: Currency): string {
  if (currency === "INR") {
    return `₹${(amountMinor / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  }
  return `$${(amountMinor / 100).toLocaleString("en-US", {
    minimumFractionDigits: amountMinor % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Charge currency is determined by the live provider, not display preference.
 * Razorpay India → INR; Stripe → USD.
 */
export function chargeCurrencyForProvider(providerId: ProviderId): Currency {
  if (providerId === "razorpay") return "INR";
  return "USD";
}

export function resolveChargeAmount(
  amountCentsUsd: number,
  currency: Currency
): number {
  if (currency === "INR") return usdCentsToInrPaise(amountCentsUsd);
  return amountCentsUsd;
}

/** Tax display is off unless PAYMENTS_TAX_ENABLED=true and rate configured. */
export function taxConfig(): {
  enabled: boolean;
  label: string;
  rateBps: number;
} {
  const enabled = process.env.PAYMENTS_TAX_ENABLED === "true";
  const rateBps = Number(process.env.PAYMENTS_TAX_RATE_BPS ?? "0");
  return {
    enabled: enabled && Number.isFinite(rateBps) && rateBps > 0,
    label: process.env.PAYMENTS_TAX_LABEL?.trim() || "Tax",
    rateBps: Number.isFinite(rateBps) ? rateBps : 0,
  };
}

export function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    (process.env.NODE_ENV === "production"
      ? "https://gitosha.vercel.app"
      : "http://localhost:3000")
  );
}
