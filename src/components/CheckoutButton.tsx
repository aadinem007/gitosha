"use client";

import { useState } from "react";

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
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error ?? "Checkout is not configured yet.");
        setLoading(false);
      }
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
        {loading ? "Redirecting…" : label}
      </button>
    </div>
  );
}
