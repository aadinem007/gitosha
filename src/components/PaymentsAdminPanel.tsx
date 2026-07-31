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

export function PaymentsAdminPanel() {
  const [providers, setProviders] = useState<ProviderPublicConfig[]>([]);
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookRow[]>([]);
  const [envHints, setEnvHints] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<"providers" | "transactions" | "webhooks">("providers");

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

  async function toggleProvider(p: ProviderPublicConfig, enabled: boolean) {
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId: p.providerId,
          enabled,
          supportedCurrencies: p.supportedCurrencies,
        }),
      });
      const data = (await res.json()) as { error?: string; providers?: ProviderPublicConfig[] };
      if (!res.ok) {
        setMessage(data.error ?? "Update failed");
        return;
      }
      if (data.providers) setProviders(data.providers);
      setMessage(`Updated ${p.providerId}`);
      await load();
    } catch {
      setMessage("Network error");
    } finally {
      setBusy(false);
    }
  }

  async function refund(tx: Tx) {
    if (!confirm(`Refund ${money(tx.amount, tx.currency)} for ${tx.userEmail}?`)) return;
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/payments/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId: tx.id, reason: "Admin refund" }),
      });
      const data = (await res.json()) as { error?: string; ok?: boolean };
      if (!res.ok) {
        setMessage(data.error ?? "Refund failed");
        return;
      }
      setMessage("Refund submitted");
      await load();
    } catch {
      setMessage("Network error");
    } finally {
      setBusy(false);
    }
  }

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
            ["providers", "Providers"],
            ["transactions", "Transactions"],
            ["webhooks", "Webhooks"],
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
            {envHints || "Secrets stay in env — toggles only enable/disable."} Wise / Payoneer are
            payout rails (no customer checkout). PayPal goes live when client + webhook id are set;
            Xflow is opt-in (INR UPI).
          </p>
          <ul className="space-y-3">
            {providers.map((p) => (
              <li
                key={p.providerId}
                className="rounded-sm border border-[var(--line)] bg-[var(--panel)] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-lg font-semibold capitalize">{p.providerId}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      Currencies: {p.supportedCurrencies.join(", ")}
                      {p.supportsCheckout === false || p.capability === "payout"
                        ? " · payout only"
                        : ""}
                      {p.scaffoldOnly ? " · scaffold only" : ""}
                      {p.credentialsConfigured ? " · credentials OK" : " · credentials missing"}
                      {p.enabled ? " · checkout live" : " · checkout off"}
                    </p>
                    {p.operatorNote && (
                      <p className="mt-2 text-[11px] text-[var(--fog)]">{p.operatorNote}</p>
                    )}
                    <p className="mt-2 text-[11px] text-[var(--fog)]">
                      Env: {p.secretEnvVars.join(", ")}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={
                      busy ||
                      Boolean(p.scaffoldOnly) ||
                      p.supportsCheckout === false ||
                      p.capability === "payout"
                    }
                    onClick={() => void toggleProvider(p, !p.enabled)}
                    className="btn-ghost text-xs"
                  >
                    {p.supportsCheckout === false || p.capability === "payout"
                      ? "Payout"
                      : p.scaffoldOnly
                        ? "Scaffold"
                        : p.enabled
                          ? "Disable"
                          : "Enable"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === "transactions" && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] text-xs uppercase tracking-wider text-[var(--muted)]">
                <th className="py-2 pr-3">When</th>
                <th className="py-2 pr-3">Email</th>
                <th className="py-2 pr-3">Plan</th>
                <th className="py-2 pr-3">Amount</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-[var(--muted)]">
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
                  <td className="py-3 pr-3">{money(tx.amount, tx.currency)}</td>
                  <td className="py-3 pr-3">{tx.status}</td>
                  <td className="py-3">
                    {tx.status === "succeeded" && (
                      <button
                        type="button"
                        disabled={busy}
                        className="text-xs underline"
                        onClick={() => void refund(tx)}
                      >
                        Refund
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "webhooks" && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] text-xs uppercase tracking-wider text-[var(--muted)]">
                <th className="py-2 pr-3">When</th>
                <th className="py-2 pr-3">Provider</th>
                <th className="py-2 pr-3">Event</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2">Summary</th>
              </tr>
            </thead>
            <tbody>
              {webhooks.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-[var(--muted)]">
                    No webhook events logged yet.
                  </td>
                </tr>
              )}
              {webhooks.map((w) => (
                <tr key={w.id} className="border-b border-[var(--line)] align-top">
                  <td className="py-3 pr-3 text-xs text-[var(--fog)]">
                    {new Date(w.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 pr-3 capitalize">{w.provider}</td>
                  <td className="py-3 pr-3 font-mono text-xs">{w.eventId.slice(0, 40)}</td>
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
