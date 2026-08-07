"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CONSENT_EVENT,
  readLocalConsent,
  writeLocalConsent,
} from "@/lib/legal/consent-client";
import type { ConsentPreferences, CookieCategory } from "@/lib/legal/types";

type Props = {
  policyVersion: string;
  categories: CookieCategory[];
};

function emptyPrefs(version: string, categories: CookieCategory[]): ConsentPreferences {
  const enabled = new Set(categories.filter((c) => c.enabled).map((c) => c.id));
  return {
    necessary: true,
    analytics: false,
    marketing: false,
    personalization: false,
    ai_processing: enabled.has("ai_processing") ? false : false,
    version,
    updatedAt: new Date().toISOString(),
  };
}

export function ConsentBanner({ policyVersion, categories }: Props) {
  const enabled = categories.filter((c) => c.enabled);
  const optional = enabled.filter((c) => !c.required);
  const [visible, setVisible] = useState(false);
  const [prefs, setPrefs] = useState<ConsentPreferences>(() => emptyPrefs(policyVersion, categories));
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const existing = readLocalConsent();
    if (existing) {
      setPrefs(existing);
      setVisible(false);
      return;
    }
    setVisible(true);
  }, []);

  useEffect(() => {
    if (visible) {
      document.documentElement.setAttribute("data-consent-open", "");
    } else {
      document.documentElement.removeAttribute("data-consent-open");
    }
    return () => document.documentElement.removeAttribute("data-consent-open");
  }, [visible]);

  useEffect(() => {
    function onChange() {
      const c = readLocalConsent();
      if (c) setPrefs(c);
    }
    window.addEventListener(CONSENT_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_EVENT, onChange);
  }, []);

  async function persist(next: ConsentPreferences) {
    setSaving(true);
    const stamped = { ...next, necessary: true as const, version: policyVersion, updatedAt: new Date().toISOString() };
    writeLocalConsent(stamped);
    setPrefs(stamped);
    setVisible(false);
    try {
      await fetch("/api/legal/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: stamped, source: "banner" }),
      });
    } catch {
      /* localStorage still holds consent */
    } finally {
      setSaving(false);
    }
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="consent-title"
      aria-describedby="consent-desc"
      data-consent-banner=""
      className="fixed inset-x-0 bottom-0 z-[90] border-t-2 border-[var(--ink)] bg-[var(--panel)] p-4 shadow-[0_-8px_32px_rgba(0,0,0,0.12)] sm:p-5"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-3">
        <h2 id="consent-title" className="font-display text-xl tracking-wide text-[var(--ink)]">
          Privacy preferences
        </h2>
        <p id="consent-desc" className="text-sm leading-relaxed text-[var(--fog)]">
          Necessary cookies keep sign-in secure. Optional categories below only appear when this
          deployment actually uses them.{" "}
          <Link href="/legal/cookies" className="underline">
            Cookie policy
          </Link>
          {" · "}
          <Link href="/legal/preferences" className="underline">
            Preference center
          </Link>
        </p>

        {expanded && optional.length > 0 && (
          <ul className="space-y-2 text-sm">
            {optional.map((c) => (
              <li key={c.id} className="flex items-start gap-3">
                <input
                  id={`consent-${c.id}`}
                  type="checkbox"
                  className="mt-1"
                  checked={Boolean(prefs[c.id as keyof ConsentPreferences])}
                  onChange={(e) =>
                    setPrefs((p) => ({
                      ...p,
                      [c.id]: e.target.checked,
                    }))
                  }
                />
                <label htmlFor={`consent-${c.id}`} className="text-[var(--fog)]">
                  <strong className="text-[var(--ink)]">{c.name}</strong> — {c.description}
                </label>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-primary"
            disabled={saving}
            onClick={() => {
              const acceptAll = { ...prefs, necessary: true as const };
              for (const c of optional) {
                (acceptAll as Record<string, unknown>)[c.id] = true;
              }
              void persist(acceptAll as ConsentPreferences);
            }}
          >
            Accept{optional.length ? " all" : ""}
          </button>
          <button
            type="button"
            className="btn-ghost"
            disabled={saving}
            onClick={() => void persist(emptyPrefs(policyVersion, categories))}
          >
            Necessary only
          </button>
          {optional.length > 0 && (
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? "Hide options" : "Customize"}
            </button>
          )}
          {expanded && (
            <button
              type="button"
              className="btn-ghost"
              disabled={saving}
              onClick={() => void persist(prefs)}
            >
              Save choices
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
