"use client";

import { useState } from "react";

export function XflowCheckoutClient({ intentId }: { intentId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirmPaid() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "xflow",
          sessionId: intentId,
          xflowIntentId: intentId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Payment not confirmed yet. Wait a moment and try again.");
        setLoading(false);
        return;
      }
      const params = new URLSearchParams({ product: data.product ?? "foundry" });
      if (data.transactionId) params.set("receipt", data.transactionId);
      window.location.href = `/checkout/success?${params.toString()}`;
    } catch {
      setError("Network error. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="mt-8 space-y-4">
      <p className="text-xs text-[var(--fog)]">Intent: {intentId}</p>
      <p className="text-sm text-[var(--ink)]">
        After you authorize the UPI payment on your phone, tap confirm. Fulfillment also runs from
        the signed Xflow webhook when configured.
      </p>
      {error && (
        <p className="text-xs text-[var(--ink)]" role="alert">
          {error}
        </p>
      )}
      <button
        type="button"
        className="btn-primary"
        disabled={loading}
        onClick={() => void confirmPaid()}
      >
        {loading ? "Checking…" : "I’ve paid — confirm"}
      </button>
    </div>
  );
}
