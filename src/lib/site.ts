/**
 * Canonical public site origin for auth redirects & absolute URLs.
 * Prefer NEXT_PUBLIC_SITE_URL so magic links never fall back to localhost
 * when the dashboard Site URL is misconfigured.
 */
export function publicSiteOrigin(): string {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim().replace(/\/$/, "");
  if (raw) return raw;

  // Production fallback — never ship magic links to localhost
  if (process.env.NODE_ENV === "production") {
    return "https://gitosha.vercel.app";
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin.replace(/\/$/, "");
  }

  return "http://localhost:3000";
}

/** Magic-link / OAuth callback URL (must be allowlisted in Supabase Auth). */
export function authCallbackUrl(next = "/research"): string {
  const origin = publicSiteOrigin();
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/research";
  return `${origin}/api/auth/callback?next=${encodeURIComponent(safeNext)}`;
}
