import type { Currency, ProviderId } from "./types";

/**
 * Fixed configured price lists — NOT live FX.
 * USD amounts come from plan.amountCents / price book.
 * Do not present conversion fallbacks as live mid-market rates.
 */
export const CHARGE_CURRENCIES: Currency[] = ["USD", "INR", "EUR"];

export const DISPLAY_CURRENCIES: Currency[] = ["USD", "INR", "EUR"];

/** Fixed INR paise per USD cent — configured conversion fallback, not a live FX feed. */
export const USD_CENTS_TO_INR_PAISE_FACTOR = 83;

/** Fixed EUR cents per USD cent fallback when a plan has no EUR price-book entry. */
export const USD_CENTS_TO_EUR_CENTS_FACTOR = 0.92;

/**
 * Explicit list prices (minor units) per plan + currency.
 * Prefer these for charge + display. Missing entries fall back to documented
 * configured conversion (labeled "approx"), never invented "live" FX.
 */
export const PLAN_PRICE_BOOK: Record<string, Partial<Record<Currency, number>>> = {
  "vault-pro": { USD: 1500, INR: 124500, EUR: 1400 },
  "vault-pro-annual": { USD: 14900, INR: 1236700, EUR: 13700 },
  "vault-team": { USD: 4900, INR: 406700, EUR: 4500 },
  "foundry-solo": { USD: 9900, INR: 821700, EUR: 9100 },
  "foundry-agency": { USD: 24900, INR: 2066700, EUR: 22900 },
  "bundle-launch": { USD: 14900, INR: 1236700, EUR: 13700 },
};

export function usdCentsToInrPaise(amountCents: number): number {
  return Math.round(amountCents * USD_CENTS_TO_INR_PAISE_FACTOR);
}

export function usdCentsToEurCents(amountCents: number): number {
  return Math.round(amountCents * USD_CENTS_TO_EUR_CENTS_FACTOR);
}

export function formatMoney(amountMinor: number, currency: Currency): string {
  if (currency === "INR") {
    return `₹${(amountMinor / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  }
  if (currency === "EUR") {
    return `€${(amountMinor / 100).toLocaleString("en-IE", {
      minimumFractionDigits: amountMinor % 100 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    })}`;
  }
  return `$${(amountMinor / 100).toLocaleString("en-US", {
    minimumFractionDigits: amountMinor % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Charge currency is determined by the live provider, not display preference.
 */
export function chargeCurrencyForProvider(_providerId: ProviderId = "xflow"): Currency {
  void _providerId;
  return "INR";
}

/**
 * Resolve charge amount from the price book first; fall back to configured conversion.
 */
export function resolveChargeAmount(
  amountCentsUsd: number,
  currency: Currency,
  planId?: string
): number {
  if (planId) {
    const booked = PLAN_PRICE_BOOK[planId]?.[currency];
    if (typeof booked === "number" && booked > 0) return booked;
  }
  if (currency === "INR") return usdCentsToInrPaise(amountCentsUsd);
  if (currency === "EUR") return usdCentsToEurCents(amountCentsUsd);
  return amountCentsUsd;
}

export type DisplayPrice = {
  label: string;
  /** True when amount came from PLAN_PRICE_BOOK for that currency. */
  fromPriceBook: boolean;
  /** Present when amount is a configured conversion fallback — not live FX. */
  note?: string;
};

/**
 * Display helper for UI preference. Prefer price book; otherwise label "approx".
 */
export function displayAmountForPlan(
  planId: string,
  amountCentsUsd: number,
  currency: Currency
): DisplayPrice {
  const booked = PLAN_PRICE_BOOK[planId]?.[currency];
  if (typeof booked === "number" && booked > 0) {
    return { label: formatMoney(booked, currency), fromPriceBook: true };
  }
  if (currency === "USD") {
    return { label: formatMoney(amountCentsUsd, "USD"), fromPriceBook: false };
  }
  const approx =
    currency === "INR"
      ? usdCentsToInrPaise(amountCentsUsd)
      : usdCentsToEurCents(amountCentsUsd);
  return {
    label: formatMoney(approx, currency),
    fromPriceBook: false,
    note: `Approx. ${currency} from fixed configured conversion — not a live FX rate. Charge currency follows the payment provider.`,
  };
}

/**
 * Optional FX provider stub — never used for charging.
 * Clear labeling only; no invented live mid-market quotes.
 */
export function fxProviderStub(): {
  configured: boolean;
  label: string;
} {
  const provider = process.env.PAYMENTS_FX_PROVIDER?.trim();
  if (!provider || provider === "none") {
    return {
      configured: false,
      label:
        "No live FX provider configured. Charges use PLAN_PRICE_BOOK or fixed configured conversion.",
    };
  }
  return {
    configured: false,
    label: `FX provider "${provider}" is stubbed — live rates are not applied to charges.`,
  };
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
