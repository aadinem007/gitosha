"use client";

import { useState } from "react";

export function LicensePortal({
  initialEmail = "",
  initialKey = "",
}: {
  initialEmail?: string;
  initialKey?: string;
}) {
  const [email, setEmail] = useState(initialEmail);
  const [key, setKey] = useState(initialKey);
  const [status, setStatus] = useState<"idle" | "checking" | "ready" | "downloading" | "error">(
    initialEmail && initialKey ? "idle" : "idle"
  );
  const [error, setError] = useState("");
  const [meta, setMeta] = useState<{
    tier: string;
    vaultAccess: boolean;
    downloadCount: number;
  } | null>(null);

  async function lookup() {
    setStatus("checking");
    setError("");
    setMeta(null);
    try {
      const res = await fetch("/api/license/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, key }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "License not found");
        setStatus("error");
        return;
      }
      setMeta({
        tier: data.tier,
        vaultAccess: data.vaultAccess,
        downloadCount: data.downloadCount,
      });
      setStatus("ready");
    } catch {
      setError("Network error — try again");
      setStatus("error");
    }
  }

  async function download() {
    setStatus("downloading");
    setError("");
    try {
      const res = await fetch("/api/license/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, key }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Download failed");
        setStatus("error");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        res.headers.get("X-License-Tier") === "AGENCY"
          ? "foundry-agency.zip"
          : "foundry-solo.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setStatus("ready");
      setMeta((m) => (m ? { ...m, downloadCount: m.downloadCount + 1 } : m));
    } catch {
      setError("Download failed — try again");
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
          Purchase email
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-md border border-[var(--line)] bg-[var(--panel)] px-3 py-2.5 text-sm"
          placeholder="you@company.com"
        />
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
          License key
        </label>
        <input
          type="text"
          required
          value={key}
          onChange={(e) => setKey(e.target.value.toUpperCase())}
          className="mt-1 w-full rounded-md border border-[var(--line)] bg-[var(--panel)] px-3 py-2.5 font-mono text-sm tracking-wide"
          placeholder="SHIP-XXXX-XXXX-XXXX"
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={lookup}
          disabled={status === "checking" || !email || !key}
          className="flex-1 rounded-md border border-[var(--line)] px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
        >
          {status === "checking" ? "Checking…" : "Verify license"}
        </button>
        <button
          type="button"
          onClick={download}
          disabled={status === "downloading" || status === "checking" || !email || !key}
          className="flex-1 rounded-md bg-[var(--brass)] px-4 py-2.5 text-sm font-semibold text-[var(--hull)] disabled:opacity-60"
        >
          {status === "downloading" ? "Preparing zip…" : "Download Foundry zip"}
        </button>
      </div>

      {meta && (
        <div className="rounded-lg border border-[var(--brass)]/30 bg-[var(--panel)] px-4 py-3 text-sm">
          <p>
            Tier: <span className="font-semibold text-[var(--brass)]">{meta.tier}</span>
          </p>
          <p className="mt-1 text-[var(--muted)]">Downloads so far: {meta.downloadCount}</p>
          {meta.vaultAccess ? (
            <p className="mt-2 text-[var(--signal)]">
              Vault included —{" "}
              <a href="/login" className="underline">
                sign in
              </a>{" "}
              with this email.
            </p>
          ) : (
            <p className="mt-2 text-[var(--muted)]">
              Need research too?{" "}
              <a href="/pricing" className="text-[var(--brass)] underline">
                Operator plans
              </a>
            </p>
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
