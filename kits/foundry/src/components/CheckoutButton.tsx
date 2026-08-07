"use client";

import { useId, useState } from "react";
import Link from "next/link";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

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

export function CheckoutButton({
  planId,
  label,
  primary = false,
}: {
  planId: string;
  label: string;
  primary?: boolean;
}) {
  const formId = useId();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailFieldId = `checkout-email-${planId}-${formId}`;
  const termsId = `checkout-terms-${planId}-${formId}`;

  const base = "w-full rounded-md px-4 py-2.5 text-sm font-semibold disabled:opacity-60";
  const style = primary
    ? "bg-[var(--accent)] text-[#04120c]"
    : "border border-[var(--line)]";

  function openPanel() {
    setOpen(true);
    setError(null);
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
    try {
      const ready = await loadRazorpayScript();
      if (!ready || !window.Razorpay) {
        setError("Could not load checkout. Check your connection and try again.");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Checkout unavailable.");
        setLoading(false);
        return;
      }

      const rzp = new window.Razorpay({
        key: data.keyId,
        order_id: data.orderId,
        amount: data.amount,
        currency: data.currency,
        name: data.name,
        description: data.description,
        prefill: { email: data.email },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          const verifyRes = await fetch("/api/checkout/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              planId: data.planId,
              email: data.email,
              ...response,
            }),
          });
          if (verifyRes.ok) {
            window.location.href = `/dashboard?paid=1`;
          } else {
            setError(
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
      });
      rzp.open();
    } catch {
      setError("Network error starting checkout. Please try again.");
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button type="button" onClick={openPanel} className={`${base} ${style}`} disabled={loading}>
        {label}
      </button>
    );
  }

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        void startCheckout();
      }}
    >
      <label htmlFor={emailFieldId} className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
        Email for receipt
      </label>
      <input
        id={emailFieldId}
        type="email"
        name="email"
        required
        autoComplete="email"
        inputMode="email"
        placeholder="you@company.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="rounded-md border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm"
      />
      <label htmlFor={termsId} className="flex items-start gap-2 text-xs leading-snug text-[var(--muted)]">
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
          .
        </span>
      </label>
      {error ? (
        <p className="text-xs font-semibold text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      <button type="submit" disabled={loading || !accepted} className={`${base} ${style}`}>
        {loading ? "Opening…" : label}
      </button>
    </form>
  );
}
