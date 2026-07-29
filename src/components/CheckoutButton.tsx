"use client";

import { useState } from "react";

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
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [open, setOpen] = useState(false);

  async function startCheckout() {
    if (!email) {
      setOpen(true);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error ?? "Checkout unavailable.");
        setLoading(false);
        return;
      }

      // Stripe Checkout (default): redirect to hosted page
      if (data.url) {
        window.location.href = data.url as string;
        return;
      }

      // Optional Razorpay path (PAYMENTS_PROVIDER=razorpay)
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
          theme: { color: "#ff5a1f" },
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
              const params = new URLSearchParams({ product: result.product ?? "foundry" });
              if (result.licenseKey) params.set("key", result.licenseKey);
              if (result.email) params.set("email", result.email);
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

  const base =
    "w-full rounded-md px-4 py-2.5 text-sm font-semibold transition disabled:opacity-60";
  const style = primary
    ? "bg-[var(--brass)] text-[var(--hull)] hover:brightness-110"
    : "border border-[var(--line)] text-[var(--ink)] hover:border-[var(--brass)]";

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={`${base} ${style}`}>
        {label}
      </button>
    );
  }

  return (
    <div className="relative isolate flex w-full min-w-0 flex-col gap-2 overflow-hidden">
      <input
        type="email"
        required
        placeholder="you@company.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full min-w-0 rounded-md border border-[var(--line)] bg-[var(--hull)] px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--muted)] focus:border-[var(--brass)] focus:outline-none"
      />
      <button type="button" disabled={loading} onClick={startCheckout} className={`${base} ${style}`}>
        {loading ? "Opening checkout…" : label}
      </button>
    </div>
  );
}
