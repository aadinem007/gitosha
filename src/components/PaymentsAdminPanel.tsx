"use client";

import { useCallback, useEffect, useState } from "react";
import type { ProviderPublicConfig } from "@/lib/payments";

type Tx = {
  id: string;
  provider: string;
  providerRef: string | null;
  userEmail: string;
  planId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  settlementStatus?: string | null;
  reconciliationStatus?: string | null;
  metadata?: Record<string, unknown> | null;
  refunds?: { id: string; amount: number; status: string }[];
};

type WebhookRow = {
  id: string;
  provider: string;
  eventId: string;
  status: string;
  processedAt: string | null;
  createdAt: string;
  payloadSummary: Record<string, unknown>;
};

function money(amount: number, currency: string) {
  if (currency === "INR") return `₹${(amount / 100).toLocaleString("en-IN")}`;
  if (currency === "EUR") return `€${(amount / 100).toFixed(2)}`;
  return `$${(amount / 100).toFixed(2)}`;
}

function refundLabel(tx: Tx): string {
  if (tx.status === "refunded") return "refunded";
  if (tx.status === "partially_refunded") return "partial";
  const last = tx.refunds?.[0];
  return last?.status ?? "none";
}

export function PaymentsAdminPanel() {
  const [providers, setProviders] = useState<ProviderPublicConfig[]>([]);
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookRow[]>([]);
  const [envHints, setEnvHints] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState<"providers" | "transactions" | "webhooks">("transactions");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/payments");
    if (!res.ok) {
      setError(res.status === 401 ? "Sign in required" : "Forbidden — not an admin");
      return;
    }
    const data = (await res.json()) as {
      providers: ProviderPublicConfig[];
      transactions: Tx[];
      webhooks: WebhookRow[];
      envHints?: { note?: string };
    };
    setProviders(data.providers);
    setTransactions(data.transactions ?? []);
    setWebhooks(data.webhooks ?? []);
    setEnvHints(data.envHints?.note ?? "");
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (error) {
    return (
      <div className="rounded-sm border border-[var(--line)] bg-[var(--panel)] p-6">
        <p className="text-sm font-semibold text-[var(--ink)]">{error}</p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Set LEGAL_ADMIN_EMAILS or ADMIN_EMAILS to your Supabase session email. Deny-by-default.
        </p>
      </div>
    );
  }

  if (!providers.length && !error) {
    return <p className="text-sm text-[var(--muted)]">Loading payments admin…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-[0.12em]">
        {(
          [
            ["transactions", "Transactions"],
            ["webhooks", "Webhooks"],
            ["providers", "Xflow"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`border px-3 py-2 ${
              tab === id
                ? "border-[var(--ink)] bg-[var(--brass)] text-[var(--ink)]"
                : "border-[var(--line)] text-[var(--muted)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {message && (
        <p className="text-sm text-[var(--support)]" role="status">
          {message}
        </p>
      )}

      {tab === "providers" && (
        <div className="space-y-4">
          <p className="text-sm text-[var(--muted)]">
            {envHints || "Xflow is the only payment provider. Secrets stay in env."}
          </p>
          <ul className="space-y-3">
            {providers.map((p) => (
              <li
                key={p.providerId}
                className="rounded-sm border border-[var(--line)] bg-[var(--panel)] p-4"
              >
                <p className="font-display text-lg font-semibold capitalize">{p.providerId}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Currencies: {p.supportedCurrencies.join(", ")}
                  {p.credentialsConfigured ? " · credentials present" : " · credentials missing"}
                  {p.enabled ? " · checkout live" : " · checkout off"}
                </p>
                {p.operatorNote && (
                  <p className="mt-2 text-[11px] text-[var(--fog)]">{p.operatorNote}</p>
                )}
                <p className="mt-2 text-[11px] text-[var(--fog)]">
                  Env names: {p.secretEnvVars.join(", ")}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === "transactions" && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] text-xs uppercase tracking-wider text-[var(--muted)]">
                <th className="py-2 pr-3">When</th>
                <th className="py-2 pr-3">Customer</th>
                <th className="py-2 pr-3">Package</th>
                <th className="py-2 pr-3">Amount</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Refund</th>
                <th className="py-2 pr-3">Settlement</th>
                <th className="py-2 pr-3">Reconciliation</th>
                <th className="py-2 pr-3">Xflow ID</th>
                <th className="py-2">Internal ID</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-6 text-[var(--muted)]">
                    No transactions yet (or run <code>npm run db:push</code>).
                  </td>
                </tr>
              )}
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-[var(--line)] align-top">
                  <td className="py-3 pr-3 text-xs text-[var(--fog)]">
                    {new Date(tx.createdAt).toLocaleString()}
                    <div className="mt-1 capitalize">{tx.provider}</div>
                  </td>
                  <td className="py-3 pr-3">{tx.userEmail}</td>
                  <td className="py-3 pr-3">{tx.planId}</td>
                  <td className="py-3 pr-3">
                    {money(tx.amount, tx.currency)}
                    <div className="text-[11px] text-[var(--fog)]">{tx.currency}</div>
                  </td>
                  <td className="py-3 pr-3">{tx.status}</td>
                  <td className="py-3 pr-3">{refundLabel(tx)}</td>
                  <td className="py-3 pr-3 text-xs">{tx.settlementStatus ?? "—"}</td>
                  <td className="py-3 pr-3 text-xs">{tx.reconciliationStatus ?? "—"}</td>
                  <td className="py-3 pr-3 font-mono text-[11px]">{tx.providerRef ?? "—"}</td>
                  <td className="py-3 font-mono text-[11px]">{tx.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-[var(--fog)]">
            Xflow does not document a public refund API. Refunds are processed in the Xflow
            dashboard. Settlement/reconciliation follows Xflow deposits and payouts — not a
            second processor.
          </p>
          <button type="button" className="sr-only" onClick={() => setMessage("")}>
            clear
          </button>
        </div>
      )}

      {tab === "webhooks" && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] text-xs uppercase tracking-wider text-[var(--muted)]">
                <th className="py-2 pr-3">When</th>
                <th className="py-2 pr-3">Event ID</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2">Summary</th>
              </tr>
            </thead>
            <tbody>
              {webhooks.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-[var(--muted)]">
                    No webhook events logged yet.
                  </td>
                </tr>
              )}
              {webhooks.map((w) => (
                <tr key={w.id} className="border-b border-[var(--line)] align-top">
                  <td className="py-3 pr-3 text-xs text-[var(--fog)]">
                    {new Date(w.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 pr-3 font-mono text-xs">{w.eventId.slice(0, 48)}</td>
                  <td className="py-3 pr-3">{w.status}</td>
                  <td className="py-3 font-mono text-[11px] text-[var(--fog)]">
                    {JSON.stringify(w.payloadSummary).slice(0, 120)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
