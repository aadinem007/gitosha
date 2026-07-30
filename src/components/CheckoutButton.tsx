"use client";

import { useState } from "react";
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
  primary: _primary = false,
}: {
  planId: string;
  label: string;
  primary?: boolean;
}) {
  void _primary;
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [open, setOpen] = useState(false);

  async function startCheckout() {
    if (!email) {
      setOpen(true);
      return;
    }
    if (!accepted) {
      alert("Please accept the Terms and Privacy Policy to continue.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, email, acceptedTerms: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error ?? "Checkout unavailable.");
        setLoading(false);
        return;
      }

      if (data.url) {
        window.location.href = data.url as string;
        return;
      }

      if (data.provider === "razorpay" || data.keyId) {
        const ready = await loadRazorpayScript();
        if (!ready || !window.Razorpay) {
          alert("Could not load checkout. Check your connection and try again.");
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
              body: JSON.stringify(response),
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
                  })
                );
              } catch {
                /* private mode */
              }
              const params = new URLSearchParams({
                product: result.product ?? "foundry",
              });
              window.location.href = `/checkout/success?${params.toString()}`;
            } else {
              const err = await verifyRes.json();
              alert(err.error ?? "Payment received but verification failed.");
              setLoading(false);
            }
          },
          modal: {
            ondismiss: () => setLoading(false),
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

      alert("Checkout unavailable.");
      setLoading(false);
    } catch {
      alert("Something went wrong starting checkout.");
      setLoading(false);
    }
  }

  const style = "btn-primary w-full";

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={style} disabled={loading}>
        {label}
      </button>
    );
  }

  return (
    <div className="form-stack form-stack-tight relative isolate w-full min-w-0 overflow-visible">
      <label htmlFor={`checkout-email-${planId}`} className="form-label">
        Email for receipt
      </label>
      <input
        id={`checkout-email-${planId}`}
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
      <label className="flex items-start gap-2 text-xs leading-snug text-[var(--fog)]">
        <input
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
      <button
        type="button"
        disabled={loading || !accepted}
        onClick={startCheckout}
        className={`${style} form-submit`}
      >
        {loading ? "Opening checkout…" : label}
      </button>
    </div>
  );
}
