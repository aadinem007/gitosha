"use client";

import { useEffect, useState } from "react";
import {
  readLocalConsent,
  writeLocalConsent,
} from "@/lib/legal/consent-client";
import type { ConsentPreferences, CookieCategory } from "@/lib/legal/types";

export function ConsentPreferencesForm({
  policyVersion,
  categories,
}: {
  policyVersion: string;
  categories: CookieCategory[];
}) {
  const enabled = categories.filter((c) => c.enabled);
  const [prefs, setPrefs] = useState<ConsentPreferences | null>(null);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");

  useEffect(() => {
    const existing = readLocalConsent();
    setPrefs(
      existing ?? {
        necessary: true,
        analytics: false,
        marketing: false,
        personalization: false,
        ai_processing: false,
        version: policyVersion,
        updatedAt: new Date().toISOString(),
      }
    );
  }, [policyVersion]);

  if (!prefs) return <p className="text-sm text-[var(--muted)]">Loading preferences…</p>;

  async function save() {
    if (!prefs) return;
    const stamped = {
      ...prefs,
      necessary: true as const,
      version: policyVersion,
      updatedAt: new Date().toISOString(),
    };
    writeLocalConsent(stamped);
    setPrefs(stamped);
    try {
      const res = await fetch("/api/legal/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: stamped, source: "preferences" }),
      });
      setStatus(res.ok ? "saved" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="form-stack">
      {enabled.map((c) => (
        <label key={c.id} className="flex items-start gap-3 text-sm text-[var(--fog)]">
          <input
            type="checkbox"
            className="mt-1"
            checked={c.required ? true : Boolean(prefs[c.id as keyof ConsentPreferences])}
            disabled={c.required}
            onChange={(e) => {
              if (c.required) return;
              setPrefs((p) => (p ? { ...p, [c.id]: e.target.checked } : p));
            }}
          />
          <span>
            <strong className="text-[var(--ink)]">{c.name}</strong>
            {c.required ? " (always on)" : ""} — {c.description}
          </span>
        </label>
      ))}
      <button type="button" className="btn-primary form-submit" onClick={() => void save()}>
        Save preferences
      </button>
      <p className="form-error" aria-live="polite">
        {status === "saved" ? "Saved." : status === "error" ? "Saved locally; server sync failed." : "\u00a0"}
      </p>
    </div>
  );
}
