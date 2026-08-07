"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPlanPrice, type PricingCurrency } from "@/lib/pricing";

const STORAGE_KEY = "gitosha_display_currency";
const COOKIE_KEY = "gitosha_display_currency";

function readPreference(): PricingCurrency {
  if (typeof window === "undefined") return "USD";
  try {
    const fromLs = localStorage.getItem(STORAGE_KEY);
    if (fromLs === "USD" || fromLs === "INR" || fromLs === "EUR") return fromLs;
  } catch {
    /* private mode */
  }
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_KEY}=([^;]*)`));
  const fromCookie = match?.[1];
  if (fromCookie === "USD" || fromCookie === "INR" || fromCookie === "EUR") {
    return fromCookie;
  }
  return "USD";
}

function writePreference(c: PricingCurrency) {
  try {
    localStorage.setItem(STORAGE_KEY, c);
  } catch {
    /* ignore */
  }
  document.cookie = `${COOKIE_KEY}=${c};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
}

export function CurrencyPreference({
  amountCents,
  planId,
  className = "",
}: {
  amountCents?: number;
  planId?: string;
  className?: string;
}) {
  // Default USD on first paint so the panel keeps height (avoids CLS from null mount).
  const [currency, setCurrency] = useState<PricingCurrency>("USD");

  useEffect(() => {
    setCurrency(readPreference());
  }, []);

  function onChange(next: PricingCurrency) {
    setCurrency(next);
    writePreference(next);
  }

  const priced =
    typeof amountCents === "number"
      ? formatPlanPrice(amountCents, currency, planId)
      : null;

  return (
    <div className={`currency-pref ${className}`.trim()}>
      <div
        className="flex flex-wrap items-center gap-2 text-xs"
        role="group"
        aria-label="Display currency"
      >
        <span className="text-[var(--muted)]">Display</span>
        {(["USD", "INR", "EUR"] as const).map((c) => {
          const selected = currency === c;
          return (
            <button
              key={c}
              type="button"
              onClick={() => onChange(c)}
              aria-pressed={selected}
              className={`border px-2 py-1 font-semibold ${
                selected
                  ? "border-[var(--ink)] bg-[var(--brass)] text-[var(--ink)]"
                  : "border-[var(--line)] text-[var(--muted)]"
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>
      {priced && (
        <p className="mt-2 text-sm text-[var(--support)]">
          {priced.label}
          {priced.note && (
            <span className="mt-1 block text-[11px] text-[var(--fog)]">{priced.note}</span>
          )}
        </p>
      )}
      <p className="mt-1 text-[11px] text-[var(--fog)]">
        Charge currency follows the payment provider and the fixed price book (not this display
        toggle; not live FX).{" "}
        <Link href="/legal/refunds" className="underline">
          Refunds
        </Link>
      </p>
    </div>
  );
}

export function useDisplayCurrency(): PricingCurrency {
  const [currency, setCurrency] = useState<PricingCurrency>("USD");
  useEffect(() => {
    setCurrency(readPreference());
  }, []);
  return currency;
}
