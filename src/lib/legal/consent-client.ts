/** Client-side consent storage keys and helpers (no PII logged). */

import type { ConsentPreferences } from "@/lib/legal/types";

export const CONSENT_STORAGE_KEY = "gitosha_consent_v1";
export const CONSENT_EVENT = "gitosha:consent-changed";

export function readLocalConsent(): ConsentPreferences | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentPreferences;
    if (!parsed || parsed.necessary !== true) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeLocalConsent(prefs: ConsentPreferences): void {
  localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(prefs));
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: prefs }));
}

export function hasAiProcessingConsent(): boolean {
  const c = readLocalConsent();
  if (!c) return false;
  return c.ai_processing === true;
}

/** Gate non-essential scripts — none are loaded unless category consented. */
export function canLoadCategory(
  category: keyof Omit<ConsentPreferences, "necessary" | "version" | "updatedAt">
): boolean {
  const c = readLocalConsent();
  if (!c) return false;
  return Boolean(c[category]);
}
