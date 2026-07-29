# Security (internal)

Internal notes for operators — **not** linked from the marketing site.
Absolute security does not exist; this is a strong SaaS baseline for Gitosha on Vercel.

## Threat model (summary)

| Risk | Mitigation |
|---|---|
| Payment forgery / free entitlement | Server prices only; Razorpay HMAC verify; Stripe `constructEvent` + `payment_status=paid`; fulfill only `isFulfillablePlanId` |
| Webhook spoofing | Unsigned rejected; secrets required (503 if missing) |
| CSRF / cross-site POST | Prod requires Origin or Referer matching `NEXT_PUBLIC_SITE_URL`; JSON Content-Type |
| Open redirect after auth | `safeRedirectPath` — relative same-site only |
| License download race / abuse | Atomic `updateMany` cap; rate limits; timing-safe email compare |
| Premium content leak | Idea teardowns gated; vault AuthZ in page + proxy |
| Probe / scanner noise | `src/proxy.ts` path + UA + method + body caps |
| Magic-link bombing | Per-IP + per-email rate limits; uniform success responses |
| Secret leakage | No service-role in client; redacted `securityLog`; prod errors generic |

## What is on today

### Edge layer (`src/proxy.ts`)
- Blocks common scanner/probe paths with `404`
- API method allowlist; non-allowlisted `GET` on APIs → `405` (exceptions: auth callback, vault export)
- Rejects empty / known-scanner User-Agents on mutating APIs (webhooks exempt)
- Enforces `Content-Length` body caps
- Issues `X-Request-Id`; gates `/vault` behind Supabase session

### HTTP headers (`next.config.ts` + proxy)
- HSTS (2y, includeSubDomains, preload)
- CSP for Stripe (+ optional Razorpay) + Supabase; `frame-ancestors 'none'`; `object-src 'none'`
- Frame deny, nosniff, Referrer-Policy, Permissions-Policy, COOP, CORP
- `poweredByHeader: false`; production source maps off

### API controls
- `assertSameOrigin` — **production fails closed if Origin and Referer are both missing**
- JSON Content-Type required on JSON POSTs
- Body size limits + Zod validation
- Timing-safe signature compares; Stripe via `constructEvent`
- Timing-safe email compare on license routes (`safeEqualDigest`)
- Waitlist honeypot (`company`)
- Auth callback requires `code`; `next` allowlisted
- Chat: grounded knowledge + optional LLM with 8s abort; reply length capped
- Per-IP sliding-window rate limits (in-memory per Vercel isolate) + magic-link per-email cap

| Route | Limit |
|---|---|
| checkout | 6 / min |
| checkout/verify | 10 / min |
| chat | 18 / min |
| waitlist | 4 / min |
| license download | 5 / min |
| license lookup | 8 / min |
| vault export | 8 / min |
| auth callback | 30 / min |
| magic-link | 5 / min IP + 3 / hour email |
| stripe / razorpay webhook | 120 / min |

### Money path
- Server plan table only — never trust client amounts
- Razorpay: verify HMAC + fetch order notes server-side; webhook prefers order notes
- Stripe: paid-only; unknown plans rejected
- License zip: fixed Content-Disposition filenames; 50 download hard cap (atomic)

### Public `/security`
- Redirects home on purpose (not a marketing firewall page).

## Residual risks (human ops)

1. **Cloudflare (or similar) WAF** on custom domain
2. **Distributed rate limits** (Upstash Redis) — current limits are per-isolate
3. **2FA** on Supabase dashboard + operator accounts
4. **Secret rotation** for Stripe / Razorpay / Supabase / Resend
5. **CSP nonce/hash** to drop `'unsafe-inline'` / `'unsafe-eval'` when Next allows
6. **Alerts** on `[security]` log volume
7. **npm audit**: Next bundles postcss/sharp advisories — track upstream; avoid `audit fix --force` (breaks Next)

## Quick verify after changes

```bash
npx tsc --noEmit && npm run lint
```

Then: pricing → test checkout → success → license download; magic-link → vault; confirm premium idea teardown locked when signed out.
