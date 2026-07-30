# Payments (internal)

Provider-agnostic **Payment Service Layer** for Gitosha. Hosted checkout only (Razorpay Checkout.js / Stripe Checkout) — **we do not claim PCI DSS certification** and never store raw card data.

## Architecture

```
API routes (thin)
  └─ src/lib/payments/service.ts   ← createCheckout / verifyPayment / handleWebhook / refundPayment
       ├─ registry.ts              ← enable flags (env + PaymentProviderConfig), failover order
       ├─ providers/razorpay.ts    ← live adapter
       ├─ providers/stripe.ts      ← live adapter
       └─ providers/stubs.ts       ← PayPal / Xflow / Wise / Payoneer (enabled: false)
```

- **Server price table** (`src/lib/pricing.ts`) is the only source of amounts. Client amounts are ignored.
- **Plan allowlist** via `isFulfillablePlanId` before entitlement.
- **Idempotency**: checkout keys on `PaymentTransaction.idempotencyKey`; webhooks on `PaymentWebhookEvent (provider, eventId)`.
- **Charge currency**: Razorpay → INR (fixed configured conversion from USD catalog cents); Stripe → USD. Display preference (cookie/localStorage) does **not** change charge currency.
- **Tax**: off by default (`PAYMENTS_TAX_ENABLED`). Do not invent tax.

Stable client URLs:

| Route | Role |
|---|---|
| `POST /api/checkout` | Create checkout (rate-limited, Origin fail-closed) |
| `POST /api/checkout/verify` | Browser verify after hosted checkout |
| `POST /api/stripe/webhook` | Stripe signed webhooks |
| `POST /api/razorpay/webhook` | Razorpay signed webhooks |
| `GET/POST /api/admin/payments` | Admin list + provider toggles |
| `POST /api/admin/payments/refund` | Admin refund |
| `GET /api/account/receipts/[id]` | Receipt JSON (owner or admin) |
| `/admin/payments` | Admin UI |
| `/account/receipts/[id]` | Receipt page |

## How to add a provider

1. Create `src/lib/payments/providers/<id>.ts` implementing `PaymentProvider`.
2. Register in `registry.ts` `ADAPTERS`.
3. Add `ProviderId` union member in `types.ts`.
4. Document secret env var names in `getPublicConfig().secretEnvVars`.
5. Keep scaffold providers disabled until credentials + real adapter exist (`isScaffoldProvider`).
6. Add tests with a mocked adapter (no live charges in CI).

## Env vars

| Variable | Purpose |
|---|---|
| `PAYMENTS_PROVIDER` | Primary: `razorpay` (default) \| `stripe` \| `auto` |
| `PAYMENTS_RAZORPAY_ENABLED` | `false` to force-disable Razorpay |
| `PAYMENTS_STRIPE_ENABLED` | `false` to force-disable Stripe |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / `RAZORPAY_WEBHOOK_SECRET` | Razorpay live |
| `RAZORPAY_PLAN_VAULT_PRO` / `RAZORPAY_PLAN_VAULT_TEAM` | Optional subscription plan ids |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe live |
| `STRIPE_PRICE_*` | Optional Stripe Price IDs |
| `PAYMENTS_TAX_ENABLED` / `PAYMENTS_TAX_RATE_BPS` / `PAYMENTS_TAX_LABEL` | Tax display (default off) |
| `LEGAL_ADMIN_EMAILS` / `ADMIN_EMAILS` | Admin allowlist for `/admin/payments` |
| `RESEND_API_KEY` / `EMAIL_FROM` | Receipt + license emails |
| `DATABASE_URL` | Prisma ledger tables |

Scaffold (documented only — not live):

- PayPal: `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID`
- Xflow: `XFLOW_API_KEY`, `XFLOW_WEBHOOK_SECRET`
- Wise: `WISE_API_TOKEN`, `WISE_PROFILE_ID`
- Payoneer: `PAYONEER_CLIENT_ID`, `PAYONEER_CLIENT_SECRET`

**Never** put secret keys in `PaymentProviderConfig` / `NEXT_PUBLIC_*` (except Stripe publishable).

## Admin usage

1. Sign in with an allowlisted email → `/admin/payments`.
2. Toggle providers (DB flag ∩ env ∩ credentials). Scaffold cannot be enabled.
3. Review transactions; refund calls provider API + records `PaymentRefund`.
4. Webhook tab shows `PaymentWebhookEvent` summaries (no secrets).

Refund eligibility follows the public **Refund Policy** (`/legal/refunds`). Operator refunds are discretionary tooling — not a guarantee beyond that policy / law.

## Ops after deploy

```bash
npm run db:push   # PaymentTransaction, PaymentWebhookEvent, PaymentRefund, PaymentProviderConfig
npx tsc --noEmit
npm run test:payments
```

## What we do NOT claim

- PCI DSS certification / SAQ expansion beyond hosted fields
- Live FX / mid-market rates (INR uses a **fixed configured** factor)
- Live PayPal / Xflow / Wise / Payoneer until adapters + credentials ship
- Tax calculation unless explicitly configured

See also: `docs/SECURITY.md`, `marketing/RAZORPAY-LIVE-5MIN.md`, `marketing/STRIPE-LIVE-SETUP.md`.
