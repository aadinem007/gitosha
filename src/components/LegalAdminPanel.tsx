"use client";

import { useEffect, useState } from "react";
import type { LegalConfig, JurisdictionId } from "@/lib/legal/types";

export function LegalAdminPanel() {
  const [config, setConfig] = useState<LegalConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [changeSummary, setChangeSummary] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [entityName, setEntityName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [privacyEmail, setPrivacyEmail] = useState("");
  const [address, setAddress] = useState("");
  const [regionIds, setRegionIds] = useState<JurisdictionId[]>([]);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "err">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/legal/admin/publish");
      if (!res.ok) {
        setError(res.status === 401 ? "Sign in required" : "Forbidden — not a legal admin");
        return;
      }
      const data = (await res.json()) as { config: LegalConfig };
      setConfig(data.config);
      setEntityName(data.config.business.entityName);
      setContactEmail(data.config.business.contactEmail);
      setPrivacyEmail(data.config.business.privacyEmail);
      setAddress(data.config.business.address);
      setEffectiveDate(data.config.effectiveDate);
      setRegionIds(data.config.regions.filter((r) => r.enabled).map((r) => r.id));
    })();
  }, []);

  async function publish() {
    if (changeSummary.trim().length < 8) {
      setStatus("err");
      setMessage("Change summary must be at least 8 characters.");
      return;
    }
    setStatus("saving");
    try {
      const res = await fetch("/api/legal/admin/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          changeSummary,
          effectiveDate: effectiveDate || undefined,
          business: {
            entityName,
            contactEmail,
            privacyEmail,
            address,
          },
          regionIds,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; version?: string; error?: string };
      if (!res.ok) {
        setStatus("err");
        setMessage(data.error ?? "Publish failed");
        return;
      }
      setStatus("saved");
      setMessage(`Published version ${data.version}`);
      setChangeSummary("");
    } catch {
      setStatus("err");
      setMessage("Network error");
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

  if (!config) {
    return <p className="text-sm text-[var(--muted)]">Loading legal configuration…</p>;
  }

  return (
    <div className="space-y-8">
      <div className="rounded-sm border border-[var(--line)] bg-[var(--panel)] p-4 text-sm text-[var(--muted)]">
        <p>
          Active version <strong className="text-[var(--ink)]">{config.version}</strong> · effective{" "}
          {config.effectiveDate}
        </p>
        <p className="mt-2">
          Processors and cookie categories are always recomputed from live env at render time so
          published JSON cannot claim inactive analytics or invent shipping.
        </p>
        <p className="mt-2 text-xs">
          Not legal advice. Human legal review required before relying on this as a compliance
          program. Do not claim GDPR/CPRA certification from this panel.
        </p>
      </div>

      <section className="form-stack">
        <h2 className="font-display text-2xl tracking-wide">Business contacts</h2>
        <label className="form-label" htmlFor="entity">
          Legal entity name
        </label>
        <input
          id="entity"
          className="form-input"
          value={entityName}
          onChange={(e) => setEntityName(e.target.value)}
        />
        <label className="form-label" htmlFor="contact">
          Contact email
        </label>
        <input
          id="contact"
          type="email"
          className="form-input"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
        />
        <label className="form-label" htmlFor="privacy">
          Privacy email
        </label>
        <input
          id="privacy"
          type="email"
          className="form-input"
          value={privacyEmail}
          onChange={(e) => setPrivacyEmail(e.target.value)}
        />
        <label className="form-label" htmlFor="address">
          Address (do not invent)
        </label>
        <textarea
          id="address"
          className="form-input min-h-[5rem]"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </section>

      <section className="form-stack">
        <h2 className="font-display text-2xl tracking-wide">Regional notice modules</h2>
        <p className="text-sm text-[var(--muted)]">
          Informational only — enabling a module does not certify compliance.
        </p>
        {config.regions.map((r) => (
          <label key={r.id} className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={regionIds.includes(r.id)}
              onChange={(e) => {
                setRegionIds((ids) =>
                  e.target.checked ? [...ids, r.id] : ids.filter((id) => id !== r.id)
                );
              }}
            />
            <span>
              <strong>{r.title}</strong>
            </span>
          </label>
        ))}
      </section>

      <section className="form-stack">
        <h2 className="font-display text-2xl tracking-wide">Refund / retention (read-only snapshot)</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--fog)]">
          {config.refunds.map((r) => (
            <li key={r.product}>
              {r.title}: {r.windowDays ?? "n/a"}-day window notes
            </li>
          ))}
        </ul>
        <p className="text-xs text-[var(--muted)]">
          Edit refund copy via code/config defaults aligned to pricing.ts — publish stores the blob
          with versioning.
        </p>
      </section>

      <section className="form-stack">
        <h2 className="font-display text-2xl tracking-wide">Publish new version</h2>
        <label className="form-label" htmlFor="effective">
          Effective date
        </label>
        <input
          id="effective"
          type="date"
          className="form-input"
          value={effectiveDate}
          onChange={(e) => setEffectiveDate(e.target.value)}
        />
        <label className="form-label" htmlFor="summary">
          Change summary (required)
        </label>
        <textarea
          id="summary"
          className="form-input min-h-[5rem]"
          value={changeSummary}
          onChange={(e) => setChangeSummary(e.target.value)}
          placeholder="Describe material changes for the audit log…"
        />
        <button
          type="button"
          className="btn-primary form-submit"
          disabled={status === "saving"}
          onClick={() => void publish()}
        >
          {status === "saving" ? "Publishing…" : "Publish new version"}
        </button>
        <p className="form-error" aria-live="polite">
          {status === "saved" || status === "err" ? message : "\u00a0"}
        </p>
      </section>
    </div>
  );
}
