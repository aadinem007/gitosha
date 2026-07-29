import { timingSafeEqual, createHash } from "crypto";

/** Constant-time string compare for signatures / secrets. */
export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/** Compare secrets of unequal length without leaking via early return timing on content. */
export function safeEqualDigest(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

/** Reject oversized JSON bodies early. */
export async function readJsonLimited(
  req: Request,
  maxBytes = 32_768
): Promise<{ ok: true; data: unknown } | { ok: false; error: string }> {
  const raw = await req.text();
  if (raw.length > maxBytes) {
    return { ok: false, error: "Payload too large" };
  }
  try {
    return { ok: true, data: JSON.parse(raw) as unknown };
  } catch {
    return { ok: false, error: "Invalid JSON" };
  }
}

/**
 * Same-site guard for browser-originated mutating requests.
 * Fail closed in production when NEXT_PUBLIC_SITE_URL is missing/invalid.
 */
export function assertSameOrigin(req: Request): boolean {
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  const isProd = process.env.NODE_ENV === "production";

  if (!site) {
    if (isProd) {
      securityLog("origin_check_misconfigured", { reason: "missing_site_url" });
      return false;
    }
    return true;
  }

  let allowed: URL;
  try {
    allowed = new URL(site);
  } catch {
    if (isProd) {
      securityLog("origin_check_misconfigured", { reason: "invalid_site_url" });
      return false;
    }
    return true;
  }

  const origin = req.headers.get("origin");
  if (origin) {
    try {
      const o = new URL(origin);
      return o.host === allowed.host;
    } catch {
      return false;
    }
  }

  const referer = req.headers.get("referer");
  if (referer) {
    try {
      const r = new URL(referer);
      return r.host === allowed.host;
    } catch {
      return false;
    }
  }

  // No Origin/Referer — allow only outside production (local curl / tooling).
  // Production browser POSTs must send Origin or Referer (webhooks use dedicated routes).
  if (isProd) {
    securityLog("origin_missing", { path: new URL(req.url).pathname });
    return false;
  }
  return true;
}

/**
 * Alias for browser JSON APIs — same rules as assertSameOrigin (prod requires Origin/Referer).
 * Webhooks must NOT call this; they verify signatures instead.
 */
export function requireBrowserOrigin(req: Request): boolean {
  return assertSameOrigin(req);
}

/** Require JSON Content-Type on browser JSON APIs (allows charset suffix). */
export function requireJsonContentType(req: Request): boolean {
  const ct = req.headers.get("content-type");
  if (!ct) return false;
  return ct.toLowerCase().includes("application/json");
}

/**
 * Allow only same-origin relative paths for post-auth redirects.
 * Blocks open redirects (//evil, https://evil, /\evil, etc.).
 */
export function safeRedirectPath(next: string | null | undefined, fallback = "/vault"): string {
  if (!next) return fallback;
  const trimmed = next.trim();
  if (!trimmed.startsWith("/")) return fallback;
  if (trimmed.startsWith("//")) return fallback;
  if (trimmed.includes("://")) return fallback;
  if (trimmed.includes("\\")) return fallback;
  if (/[\u0000-\u001F\u007F]/.test(trimmed)) return fallback;
  // Keep it on-site and short
  if (trimmed.length > 200) return fallback;
  return trimmed;
}

export function stripControlChars(input: string): string {
  return input.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();
}

/** Redact common secret-looking substrings before logging. */
export function redactSecrets(value: string): string {
  return value
    .replace(/(Bearer\s+)[A-Za-z0-9._\-+=/]+/gi, "$1[REDACTED]")
    .replace(
      /(razorpay[_-]?(key|secret|webhook)|supabase[_-]?(service|anon)|api[_-]?key|password|authorization)["'\s:=]+[^\s"',}]+/gi,
      "$1=[REDACTED]"
    )
    .replace(/\bGITO-[A-Z0-9-]{8,}\b/g, "GITO-[REDACTED]")
    .replace(/\bSHIP-[A-Z0-9-]{8,}\b/g, "SHIP-[REDACTED]");
}

/** Server-console-only security events (no public page / no PII dumps). */
export function securityLog(
  event: string,
  detail: Record<string, string | number | boolean | undefined> = {}
): void {
  const safe: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(detail)) {
    if (v === undefined) continue;
    safe[k] = typeof v === "string" ? redactSecrets(v).slice(0, 200) : v;
  }
  console.info(`[security] ${event}`, safe);
}
