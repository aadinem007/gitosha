# Security (internal)

Internal notes for operators — **not** linked from the marketing site.
Absolute security does not exist; this is a strong SaaS baseline for Gitosha on Vercel (Next.js 16.2.12 App Router).

## Production checklist (prompt + OWASP)

| Area | Status | Notes |
|---|---|---|
| CSP | Done | Stripe + Razorpay + Supabase; `frame-ancestors 'none'`; `object-src 'none'`. Residual: `'unsafe-inline'` / `'unsafe-eval'` for Next — tighten with nonces later |
| HSTS | Done | 2y, includeSubDomains, preload |
| X-Content-Type-Options | Done | `nosniff` |
| Referrer-Policy | Done | `strict-origin-when-cross-origin` |
| Permissions-Policy | Done | camera/mic/geo/usb off; payment=(self) |
| Frame denial | Done | XFO DENY + CSP `frame-ancestors 'none'` |
| Password hashing (Argon2/bcrypt) | N/A | Magic-link only via Supabase — no password forms or local credential store |
| Session cookies Secure/HttpOnly/SameSite | Done | `@supabase/ssr` + proxy/server force `httpOnly`, `SameSite=Lax`, `Secure` in prod |
| Login throttling | Done | Magic-link 5/min IP + 3/hour email; callback 30/min; uniform success body (no enum) |
| MFA | N/A (scaffolding) | App has no TOTP UI. Enable MFA in Supabase Auth dashboard when product needs it; operators should use 2FA on Supabase/Stripe/Vercel |
| Suspicious login logging | Done | `[security]` on missing code, exchange fail, rate limits, origin blocks |
| Session revocation | Done | Vault **Sign out** → `POST /api/auth/sign-out` clears HttpOnly cookies via `supabase.auth.signOut()` |
| AuthZ deny-by-default | Done | `/vault` gated in proxy + page; export requires ACTIVE PRO/TEAM; premium teardowns gated server-side |
| No client plan/role trust | Done | Fulfill from server notes/metadata + `isFulfillablePlanId` only |
| API zod + authn/authz + rate limit + body cap | Done | All mutating `/api/*` routes; webhooks signature-only (no Origin) |
| Safe errors | Done | Generic client messages; details only in redacted `securityLog` |
| Security audit log | Done | Auth fail / 403 / 429 / webhook reject — no tokens/keys/cards |
| Hostile input / length / no mass assignment | Done | Zod schemas; privileged fields never taken from client |
| File upload | N/A | No user file upload endpoints; Foundry zip is server-generated from `kits/foundry` |
| Prisma SQL injection | Done | Prisma client only; no `$queryRaw` / string-concat SQL in app |
| Secrets not in NEXT_PUBLIC_ / client | Done | Service role, webhook secrets, Stripe/Razorpay secrets server-only; public = anon + publishable + site URL |
| Rate limits documented | Done | Per-isolate in-memory — see table below; ops: Upstash + WAF |
| Dependencies (npm audit) | Done | Overrides pin `brace-expansion@5.0.8`, `postcss@8.5.18`, `sharp@0.35.3` without downgrading Next 16.2.12. Re-check on Next upgrades |
| CSRF (Origin fail-closed) | Done | Prod requires Origin or Referer matching `NEXT_PUBLIC_SITE_URL` |
| Open redirect on callback | Done | `safeRedirectPath` — relative same-site only |
| Webhook unsigned rejected | Done | Stripe `constructEvent`; Razorpay HMAC; 503 if secret missing |
| Plan forgery | Done | Server prices + fulfill allowlist |
| License download race | Done | Atomic `updateMany` download cap (50) |
| Path traversal on download | Done | Fixed Content-Disposition filenames only |
| Performance / mobile 3D | Done | Security changes do not touch 3D/hero paths |

## Threat model (summary)

| Risk | Mitigation |
|---|---|
| Payment forgery / free entitlement | Server prices only; Razorpay HMAC verify; Stripe `constructEvent` + `payment_status=paid`; fulfill only `isFulfillablePlanId` |
| Webhook spoofing | Unsigned rejected; secrets required (503 if missing) |
| CSRF / cross-site POST | Prod requires Origin or Referer matching `NEXT_PUBLIC_SITE_URL`; JSON Content-Type |
| Open redirect after auth | `safeRedirectPath` — relative same-site only |
| License download race / abuse | Atomic `updateMany` cap; rate limits; timing-safe email compare |
| Premium content leak | Idea teardowns gated; vault AuthZ in page + proxy; export AuthZ |
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
- Route `maxDuration` on chat / verify / webhooks / license download
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
| auth sign-out | 20 / min |
| legal consent | 20 / min |
| legal rights | 6 / min IP + 8 / hour email |
| legal admin publish | 10 / min (allowlisted email) |
| admin payments | 20 / min toggle · 10 / min refund (allowlisted email) |
| account receipts | 30 / min |
| stripe / razorpay webhook | 120 / min |

### Money path
- Server plan table only — never trust client amounts
- Provider-agnostic service layer (`src/lib/payments/`) — Razorpay + Stripe adapters; scaffolds disabled
- Razorpay: verify HMAC + fetch order notes server-side; webhook prefers order notes
- Stripe: paid-only; unknown plans rejected
- Webhook + checkout idempotency via Prisma payment ledger (after `db:push`)
- License zip: fixed Content-Disposition filenames; 50 download hard cap (atomic)
- Details: `docs/PAYMENTS.md`

### Public `/security`
- Redirects home on purpose (not a marketing firewall page).

## Residual risks (human ops)

1. **Cloudflare (or similar) WAF** on custom domain
2. **Distributed rate limits** (Upstash Redis) — current limits are per-isolate
3. **2FA** on Supabase dashboard + operator accounts (and product MFA when needed)
4. **Secret rotation** for Stripe / Razorpay / Supabase / Resend
5. **CSP nonce/hash** to drop `'unsafe-inline'` / `'unsafe-eval'` when Next allows
6. **Alerts** on `[security]` log volume (Vercel log drains)
7. **npm audit**: overrides currently clear known highs for brace-expansion/postcss/sharp — re-run after Next upgrades; never `audit fix --force`
8. Confirm Supabase **Site URL** + redirect allowlist match production (see `docs/AUTH.md`)

## Quick verify after changes

```bash
npx tsc --noEmit && npm run lint
```

Then: pricing → test checkout → success → license download; magic-link → vault → sign out; confirm premium idea teardown locked when signed out.
