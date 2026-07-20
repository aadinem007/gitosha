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
      const ready = await loadRazorpayScript();
      if (!ready || !window.Razorpay) {
        alert("Could not load Razorpay checkout. Check your internet and try again.");
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
        alert(data.error ?? "Checkout is not configured yet.");
        setLoading(false);
        return;
      }

      const options: Record<string, unknown> = {
        key: data.keyId,
        name: data.name,
        description: data.description,
        prefill: { email: data.email },
        theme: { color: "#171717" },
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
              mode: data.mode,
              planId: data.planId,
              email: data.email,
              ...response,
            }),
          });
          if (verifyRes.ok) {
            window.location.href = "/checkout/success";
          } else {
            const err = await verifyRes.json();
            alert(err.error ?? "Payment received but verification failed. Contact support.");
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

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      alert("Something went wrong starting checkout.");
      setLoading(false);
    }
  }

  const baseClasses =
    "w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:opacity-60";
  const styleClasses = primary
    ? "bg-white text-neutral-950 hover:bg-neutral-200"
    : "border border-neutral-700 text-white hover:border-neutral-500";

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className={`${baseClasses} ${styleClasses}`}>
        {label}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        type="email"
        required
        placeholder="you@company.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-neutral-500 focus:outline-none"
      />
      <button disabled={loading} onClick={startCheckout} className={`${baseClasses} ${styleClasses}`}>
        {loading ? "Opening Razorpay…" : label}
      </button>
    </div>
  );
}
