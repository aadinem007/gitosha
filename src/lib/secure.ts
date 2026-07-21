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
 * Allows missing Origin on some native clients but blocks clear cross-site Origin.
 */
export function assertSameOrigin(req: Request): boolean {
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  if (!site) return true;

  let allowed: URL;
  try {
    allowed = new URL(site);
  } catch {
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

  // No Origin/Referer (curl, server-to-server) — allow; Razorpay webhooks have no browser Origin
  return true;
}

export function stripControlChars(input: string): string {
  return input.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();
}
