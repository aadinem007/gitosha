/**
 * Lightweight sliding-window rate limiter.
 * Works per-instance on Vercel (blocks burst abuse on a single isolate).
 * For distributed limiting later: swap to Upstash Redis without changing callers.
 *
 * Limits (documented): see docs/SECURITY.md — not a substitute for edge WAF.
 */
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;
let lastSweepAt = 0;

function sweepExpired(now: number) {
  // Cap memory under key-flood: drop expired, then oldest if still over cap
  if (now - lastSweepAt < 30_000 && buckets.size < MAX_BUCKETS) return;
  lastSweepAt = now;
  for (const [key, bucket] of buckets) {
    if (now > bucket.resetAt) buckets.delete(key);
  }
  if (buckets.size <= MAX_BUCKETS) return;
  const overflow = buckets.size - MAX_BUCKETS;
  let removed = 0;
  for (const key of buckets.keys()) {
    buckets.delete(key);
    removed += 1;
    if (removed >= overflow) break;
  }
}

export function rateLimit(opts: {
  key: string;
  limit: number;
  windowMs: number;
}): { ok: boolean; remaining: number; retryAfterSec: number } {
  const now = Date.now();
  sweepExpired(now);
  const existing = buckets.get(opts.key);

  if (!existing || now > existing.resetAt) {
    buckets.set(opts.key, { count: 1, resetAt: now + opts.windowMs });
    return { ok: true, remaining: opts.limit - 1, retryAfterSec: 0 };
  }

  if (existing.count >= opts.limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSec: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  existing.count += 1;
  return { ok: true, remaining: opts.limit - existing.count, retryAfterSec: 0 };
}

/** Client IP behind Vercel/Cloudflare — leftmost X-Forwarded-For hop. */
export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim() || "";
    // Reject obviously spoofed / oversized values used as rate-limit keys
    if (first && first.length <= 64 && !/[\s<>]/.test(first)) return first;
  }
  const real = req.headers.get("x-real-ip")?.trim();
  if (real && real.length <= 64) return real;
  return "unknown";
}
