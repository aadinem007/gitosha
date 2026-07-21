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
        alert("Could not load checkout.");
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
        alert(data.error ?? "Checkout unavailable");
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
            alert("Payment received but verification failed.");
            setLoading(false);
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      });
      rzp.open();
    } catch {
      alert("Checkout failed to start.");
      setLoading(false);
    }
  }

  const base = "w-full rounded-md px-4 py-2.5 text-sm font-semibold disabled:opacity-60";
  const style = primary
    ? "bg-[var(--accent)] text-[#04120c]"
    : "border border-[var(--line)]";

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className={`${base} ${style}`}>
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
        className="rounded-md border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm"
      />
      <button disabled={loading} onClick={startCheckout} className={`${base} ${style}`}>
        {loading ? "Opening…" : label}
      </button>
    </div>
  );
}
