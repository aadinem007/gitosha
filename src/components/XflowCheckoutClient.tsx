"use client";

import { useEffect, useState } from "react";

export function XflowCheckoutClient({ intentId }: { intentId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upiUrl, setUpiUrl] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(`gitosha_xflow_upi_${intentId}`);
      if (stored) setUpiUrl(stored);
    } catch {
      /* private mode */
    }
  }, [intentId]);

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
        setError(
          data.error ?? "Payment not confirmed yet. Wait a moment after UPI success and try again."
        );
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
      <p className="text-xs text-[var(--fog)]">Xflow intent {intentId}</p>
      {upiUrl ? (
        <a href={upiUrl} className="btn-primary inline-flex">
          Open UPI app
        </a>
      ) : (
        <p className="text-sm text-[var(--ink)]">
          Open the UPI link from the device that started checkout, or complete payment in your UPI
          app if it already opened.
        </p>
      )}
      <p className="text-sm text-[var(--ink)]">
        This page never marks an order paid by itself. Confirm asks the server to re-read Xflow.
        The signed webhook is the source of truth.
      </p>
      {error && (
        <p className="text-xs text-[var(--ink)]" role="alert">
          {error}
        </p>
      )}
      <button type="button" className="btn-ghost" disabled={loading} onClick={() => void confirmPaid()}>
        {loading ? "Checking Xflow…" : "I’ve paid — check status"}
      </button>
    </div>
  );
}
