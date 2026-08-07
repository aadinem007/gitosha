"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { CurrencyPreference } from "@/components/CurrencyPreference";
import { VAULT_PLANS, FOUNDRY_PLANS } from "@/lib/pricing";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const CHECKOUT_OPEN_EVENT = "gitosha:checkout-open";

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function idempotencyKeyFor(planId: string, email: string): string {
  try {
    const key = `ck_${planId}_${email}_${Math.floor(Date.now() / 60_000)}`;
    return key.slice(0, 120);
  } catch {
    return `ck_${Date.now()}`;
  }
}

export function CheckoutButton({
  planId,
  label,
  primary: _primary = false,
}: {
  planId: string;
  label: string;
  primary?: boolean;
}) {
  void _primary;
  const formId = useId();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chargeHint, setChargeHint] = useState<string | null>(null);

  const plan = [...VAULT_PLANS, ...FOUNDRY_PLANS].find((p) => p.id === planId);
  const emailFieldId = `checkout-email-${planId}-${formId}`;
  const termsId = `checkout-terms-${planId}-${formId}`;

  useEffect(() => {
    function onPeerOpen(e: Event) {
      const detail = (e as CustomEvent<{ planId: string }>).detail;
      if (detail?.planId && detail.planId !== planId) {
        setOpen(false);
        setError(null);
        setChargeHint(null);
        setLoading(false);
      }
    }
    window.addEventListener(CHECKOUT_OPEN_EVENT, onPeerOpen);
    return () => window.removeEventListener(CHECKOUT_OPEN_EVENT, onPeerOpen);
  }, [planId]);

  function openPanel() {
    setOpen(true);
    setError(null);
    window.dispatchEvent(
      new CustomEvent(CHECKOUT_OPEN_EVENT, { detail: { planId } })
    );
  }

  function closePanel() {
    if (loading) return;
    setOpen(false);
    setError(null);
    setChargeHint(null);
  }

  async function startCheckout() {
    if (!email) {
      openPanel();
      return;
    }
    if (!accepted) {
      setError("Please accept the Terms and Privacy Policy to continue.");
      return;
    }
    setLoading(true);
    setError(null);
    setChargeHint(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          email,
          acceptedTerms: true,
          idempotencyKey: idempotencyKeyFor(planId, email),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Checkout unavailable.");
        setLoading(false);
        return;
      }

      if (data.chargeLabel && data.currency) {
        setChargeHint(`You will be charged ${data.chargeLabel} (${data.currency}).`);
      }

      if (data.url) {
        window.location.href = data.url as string;
        return;
      }

      if (data.provider === "razorpay" || data.keyId) {
        const ready = await loadRazorpayScript();
        if (!ready || !window.Razorpay) {
          setError("Could not load checkout. Check your connection and try again.");
          setLoading(false);
          return;
        }

        const options: Record<string, unknown> = {
          key: data.keyId,
          name: data.name,
          description: data.description,
          prefill: { email: data.email },
          theme: { color: "#c8ff00" },
          handler: async (response: {
            razorpay_payment_id: string;
            razorpay_order_id?: string;
            razorpay_subscription_id?: string;
            razorpay_signature: string;
          }) => {
            const verifyRes = await fetch("/api/checkout/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                provider: "razorpay",
                mode: data.mode,
                planId: data.planId,
                email: data.email,
                ...response,
              }),
            });
            if (verifyRes.ok) {
              const result = await verifyRes.json();
              try {
                sessionStorage.setItem(
                  "gitosha_checkout",
                  JSON.stringify({
                    product: result.product ?? "foundry",
                    email: result.email ?? data.email,
                    licenseKey: result.licenseKey ?? "",
                    transactionId: result.transactionId ?? data.transactionId ?? "",
                    chargeLabel: data.chargeLabel ?? "",
                    currency: data.currency ?? "",
                  })
                );
              } catch {
                /* private mode */
              }
              const params = new URLSearchParams({
                product: result.product ?? "foundry",
              });
              if (result.transactionId) params.set("receipt", result.transactionId);
              window.location.href = `/checkout/success?${params.toString()}`;
            } else {
              const err = await verifyRes.json();
              setError(
                err.error ??
                  "Payment received but verification failed. Check your email before retrying."
              );
              setLoading(false);
            }
          },
          modal: {
            ondismiss: () => {
              setLoading(false);
              setError("Checkout canceled. No charge was made.");
            },
          },
        };

        if (data.mode === "payment") {
          options.order_id = data.orderId;
          options.amount = data.amount;
          options.currency = data.currency;
        } else {
          options.subscription_id = data.subscriptionId;
        }

        new window.Razorpay(options).open();
        return;
      }

      setError("Checkout unavailable.");
      setLoading(false);
    } catch {
      setError("Network error starting checkout. Please try again.");
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button type="button" onClick={openPanel} className="btn-primary w-full" disabled={loading}>
        {label}
      </button>
    );
  }

  return (
    <form
      className="checkout-panel form-stack form-stack-tight relative isolate w-full min-w-0 overflow-visible"
      onSubmit={(e) => {
        e.preventDefault();
        void startCheckout();
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
          Order summary
        </p>
        <button
          type="button"
          className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--support)] underline-offset-4 hover:text-[var(--ink)] hover:underline"
          onClick={closePanel}
          disabled={loading}
        >
          Cancel
        </button>
      </div>
      <p className="text-sm text-[var(--ink)]">
        {plan?.name ?? planId}
        {plan?.price ? (
          <span className="text-[var(--muted)]"> · catalog {plan.price}</span>
        ) : null}
      </p>
      {plan?.amountCents != null && (
        <CurrencyPreference
          amountCents={plan.amountCents}
          planId={plan.id}
          className="mt-1"
        />
      )}
      <label htmlFor={emailFieldId} className="form-label">
        Email for receipt
      </label>
      <input
        id={emailFieldId}
        type="email"
        name="email"
        required
        autoComplete="email"
        inputMode="email"
        enterKeyHint="go"
        placeholder="you@company.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="form-input"
      />
      <label htmlFor={termsId} className="flex items-start gap-2 text-xs leading-snug text-[var(--fog)]">
        <input
          id={termsId}
          type="checkbox"
          className="mt-0.5"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          required
        />
        <span>
          I agree to the{" "}
          <Link href="/terms" className="underline" target="_blank">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline" target="_blank">
            Privacy Policy
          </Link>
          . Digital goods — see{" "}
          <Link href="/legal/refunds" className="underline" target="_blank">
            refunds
          </Link>
          .
        </span>
      </label>
      {chargeHint && (
        <p className="text-xs font-semibold text-[var(--ink)]" role="status">
          {chargeHint}
        </p>
      )}
      {error && (
        <p className="text-xs text-[var(--ink)]" role="alert">
          {error}
        </p>
      )}
      <button type="submit" disabled={loading || !accepted} className="btn-primary form-submit w-full">
        {loading ? "Opening checkout…" : label}
      </button>
    </form>
  );
}
