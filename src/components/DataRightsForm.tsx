"use client";

import { useState } from "react";
import Link from "next/link";

const TYPES = [
  { id: "ACCESS", label: "Access — what data you hold about me" },
  { id: "CORRECT", label: "Correct — fix inaccurate data" },
  { id: "DELETE", label: "Delete — request erasure workflow" },
  { id: "EXPORT", label: "Export — download JSON of app-held data" },
  { id: "WITHDRAW_CONSENT", label: "Withdraw consent — optional processing" },
  { id: "COMMUNICATION_PREFS", label: "Communication preferences" },
] as const;

export function DataRightsForm({ signedInEmail }: { signedInEmail: string | null }) {
  const [email, setEmail] = useState(signedInEmail ?? "");
  const [type, setType] = useState<(typeof TYPES)[number]["id"]>("ACCESS");
  const [details, setDetails] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");
  const [exportJson, setExportJson] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setExportJson(null);
    setMessage("");
    try {
      const res = await fetch("/api/legal/rights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, email, details: details.slice(0, 2000) }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        id?: string;
        export?: unknown;
        note?: string;
      };
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Request failed");
        return;
      }
      if (data.export) {
        setExportJson(JSON.stringify(data.export, null, 2));
      }
      setStatus("ok");
      setMessage(data.note ?? `Request received${data.id ? ` (${data.id})` : ""}.`);
    } catch {
      setStatus("error");
      setMessage("Network error");
    }
  }

  function downloadExport() {
    if (!exportJson) return;
    const blob = new Blob([exportJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gitosha-data-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <form onSubmit={submit} className="form-stack">
      <label className="form-label" htmlFor="rights-email">
        Email
      </label>
      <input
        id="rights-email"
        type="email"
        required
        className="form-input"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        readOnly={Boolean(signedInEmail)}
      />
      {!signedInEmail && (
        <p className="text-xs text-[var(--muted)]">
          For EXPORT of license keys and full profile data,{" "}
          <Link href="/login?next=/legal/rights" className="underline">
            sign in
          </Link>{" "}
          with the same email. Unauthenticated requests create a verified queue item only.
        </p>
      )}

      <label className="form-label" htmlFor="rights-type">
        Request type
      </label>
      <select
        id="rights-type"
        className="form-input"
        value={type}
        onChange={(e) => setType(e.target.value as (typeof TYPES)[number]["id"])}
      >
        {TYPES.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label}
          </option>
        ))}
      </select>

      <label className="form-label" htmlFor="rights-details">
        Details (optional)
      </label>
      <textarea
        id="rights-details"
        className="form-input min-h-[6rem]"
        maxLength={2000}
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        placeholder="Correction text, communication prefs, etc."
      />

      <button type="submit" className="btn-primary form-submit" disabled={status === "loading"}>
        {status === "loading" ? "Submitting…" : "Submit request"}
      </button>
      <p className="form-error" aria-live="polite">
        {status === "ok" || status === "error" ? message : "\u00a0"}
      </p>
      {exportJson && (
        <div className="space-y-2">
          <button type="button" className="btn-ghost" onClick={downloadExport}>
            Download JSON export
          </button>
          <pre className="max-h-64 overflow-auto rounded-sm border border-[var(--line)] bg-[var(--panel)] p-3 text-xs">
            {exportJson}
          </pre>
        </div>
      )}
    </form>
  );
}
