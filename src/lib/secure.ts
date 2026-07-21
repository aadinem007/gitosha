import { timingSafeEqual } from "crypto";

/** Constant-time string compare for signatures / secrets. */
export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
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
