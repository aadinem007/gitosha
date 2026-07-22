# Security (internal)

Internal notes for operators — **not** linked from the marketing site.
Absolute security does not exist; this is a strong SaaS baseline for Gitosha on Vercel.

## What is on today

### Edge layer (`src/proxy.ts`)
- Blocks common scanner/probe paths (WordPress, `.env`, `.git`, phpunit, php shells, path traversal, etc.) with `404`
- API method allowlist: only `GET`/`POST`/`HEAD`/`OPTIONS`; non-allowlisted `GET` on APIs → `405` (exceptions: auth callback, vault export)
- Rejects empty / known-scanner User-Agents on mutating API routes (Razorpay webhook exempt)
- Enforces `Content-Length` body caps before handlers run
- Issues `X-Request-Id` and logs blocked probes to the server console as `[security] …`
- Gates `/vault` behind Supabase session

### HTTP headers (`next.config.ts` + proxy)
- HSTS (2 years, includeSubDomains, preload)
- CSP allowing Razorpay checkout scripts/frames + Supabase; `frame-ancestors 'none'`; `object-src 'none'`
- `X-Frame-Options: DENY`, nosniff, Referrer-Policy, Permissions-Policy, COOP (popup-friendly for Razorpay), CORP
- `poweredByHeader: false`; production source maps off

### API controls
- Same-origin checks on browser mutating routes (`assertSameOrigin`)
- JSON `Content-Type` required on JSON POSTs
- Body size limits + Zod validation
- Timing-safe signature compares for Razorpay verify + webhook (`safeEqual` / HMAC)
- Timing-safe email compare on license lookup/download (`safeEqualDigest`)
- Waitlist honeypot (`company` field)
- Auth callback `next` param allowlisted to relative same-site paths only (open-redirect fix)
- Per-IP sliding-window rate limits (in-memory per Vercel isolate):

| Route | Limit / minute |
|---|---|
| checkout | 6 |
| checkout/verify | 10 |
| chat | 18 |
| waitlist | 4 |
| license download | 5 |
| license lookup | 8 |
| vault export | 8 |
| auth callback | 30 |
| razorpay webhook | 120 |

### Money path (do not “tighten” casually)
- Checkout → Razorpay popup → `/api/checkout/verify` (HMAC) **and** `/api/razorpay/webhook` (HMAC)
- License download streams zip after email+key check; hard cap 50 downloads/key
- CSP must keep `checkout.razorpay.com` / `api.razorpay.com` / lumberjack connect

### Public `/security`
- Redirects home on purpose. Do not turn it into a marketing “firewall” page.

## What still needs a human

1. **Cloudflare (or similar) WAF** in front of a custom domain — app-level controls ≠ network WAF
2. **Distributed rate limits** (e.g. Upstash Redis) — current limits are per-instance
3. **2FA / stronger account controls** on Supabase dashboard + operator accounts
4. **Secret rotation** cadence for Razorpay / Supabase / Resend
5. **CSP nonce/hash migration** to drop `'unsafe-inline'` / `'unsafe-eval'` when Next + Razorpay allow it cleanly
6. **Monitoring alerts** on `[security]` log volume (Vercel logs → pager)

## Quick verify after changes

```bash
npm run lint && npm run smoke && npm run build
```

Then manually: open pricing → pay (test mode) → success page → license download; magic-link login → vault.
