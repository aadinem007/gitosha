# Payments (internal)

Provider-agnostic **Payment Service Layer** for Gitosha. Hosted checkout only (Razorpay Checkout.js / Stripe Checkout / PayPal Orders approve URL / optional Xflow UPI bridge) — **we do not claim PCI DSS certification** and never store raw card data.

## Architecture

```
API routes (thin)
  └─ src/lib/payments/service.ts   ← createCheckout / verifyPayment / handleWebhook / refundPayment
       ├─ registry.ts              ← enable flags (env + PaymentProviderConfig), failover order
       ├─ providers/razorpay.ts    ← live checkout
       ├─ providers/stripe.ts      ← live checkout
       ├─ providers/paypal.ts      ← live checkout (Orders v2) when credentials + webhook id set
       ├─ providers/xflow.ts       ← optional INR UPI TransactionIntent (opt-in)
       ├─ providers/wise.ts        ← payout/settlement only (supportsCheckout: false)
       ├─ providers/payoneer.ts    ← payout/status only (supportsCheckout: false)
       ├─ currencies.ts            ← PLAN_PRICE_BOOK + fixed conversion fallbacks (not live FX)
       └─ invoice.ts               ← formal Invoice + receiptNumber on fulfill
```

- **Server price table** (`src/lib/pricing.ts` + `PLAN_PRICE_BOOK`) is the only source of amounts. Client amounts are ignored.
- **Plan allowlist** via `isFulfillablePlanId` before entitlement.
- **Idempotency**: checkout keys on `PaymentTransaction.idempotencyKey`; webhooks on `PaymentWebhookEvent (provider, eventId)`.
- **Charge currency**: provider settlement currency + price book (Razorpay/Xflow → INR; Stripe → USD; PayPal → USD or `PAYPAL_CHARGE_CURRENCY=EUR`). Display preference does **not** change charge currency.
- **Tax**: off by default (`PAYMENTS_TAX_ENABLED`). Do not invent tax.
- **Invoices**: on successful fulfill, `Invoice` row + `PaymentTransaction.receiptNumber`; printable HTML at `/account/invoices/[id]/print`.

Stable client URLs:

| Route | Role |
|---|---|
| `POST /api/checkout` | Create checkout (rate-limited, Origin fail-closed) |
| `POST /api/checkout/verify` | Browser verify after hosted checkout |
| `POST /api/stripe/webhook` | Stripe signed webhooks |
| `POST /api/razorpay/webhook` | Razorpay signed webhooks |
| `POST /api/paypal/webhook` | PayPal signature-verified webhooks |
| `POST /api/xflow/webhook` | Xflow HMAC webhooks (when enabled) |
| `GET/POST /api/admin/payments` | Admin list + provider toggles |
| `POST /api/admin/payments/refund` | Admin refund |
| `GET /api/account/receipts/[id]` | Receipt JSON (owner or admin) |
| `/admin/payments` | Admin UI |
| `/account/receipts/[id]` | Receipt page |
| `/account/invoices/[id]` | Formal invoice |
| `/checkout/xflow` | UPI bridge (Xflow only) |

## Provider readiness

| Provider | Customer checkout | Live when | Notes |
|---|---|---|---|
| Razorpay | Yes | `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` | Default primary |
| Stripe | Yes | `STRIPE_SECRET_KEY` (+ webhook secret for webhooks) | USD |
| **PayPal** | Yes | `PAYPAL_CLIENT_ID` + `PAYPAL_CLIENT_SECRET` + `PAYPAL_WEBHOOK_ID` | Orders v2 create + capture + refund; one-time only (subscriptions failover) |
| Xflow | Optional | Keys + `XFLOW_ACCOUNT_ID` + webhook secret + `PAYMENTS_XFLOW_ENABLED=true` | Real India UPI TransactionIntent API; needs connected-account onboarding; mobile-oriented |
| Wise | **No** | N/A for checkout | Payout quotes/transfers helpers only |
| Payoneer | **No** | N/A for checkout | OAuth + mass-payout status helpers; Checkout product needs separate partnership |

## How to add a provider

1. Create `src/lib/payments/providers/<id>.ts` implementing `PaymentProvider`.
2. Register in `registry.ts` `ADAPTERS`.
3. Add `ProviderId` union member in `types.ts`.
4. Document secret env var names in `getPublicConfig().secretEnvVars`.
5. Set `supportsCheckout: false` for payout-only rails.
6. Add tests with a mocked adapter (no live charges in CI).

## Env vars

| Variable | Purpose |
|---|---|
| `PAYMENTS_PROVIDER` | Primary: `razorpay` (default) \| `stripe` \| `paypal` \| `xflow` \| `auto` |
| `PAYMENTS_RAZORPAY_ENABLED` | `false` to force-disable Razorpay |
| `PAYMENTS_STRIPE_ENABLED` | `false` to force-disable Stripe |
| `PAYMENTS_PAYPAL_ENABLED` | `false` to force-disable PayPal (default on when live-ready) |
| `PAYMENTS_XFLOW_ENABLED` | Must be `true` to allow Xflow checkout |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / `RAZORPAY_WEBHOOK_SECRET` | Razorpay live |
| `RAZORPAY_PLAN_VAULT_PRO` / `RAZORPAY_PLAN_VAULT_TEAM` | Optional subscription plan ids |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe live |
| `STRIPE_PRICE_*` | Optional Stripe Price IDs |
| `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` / `PAYPAL_WEBHOOK_ID` | PayPal live |
| `PAYPAL_MODE` | `sandbox` (default) \| `live` |
| `PAYPAL_API_BASE` | Optional override |
| `PAYPAL_CHARGE_CURRENCY` | `USD` (default) \| `EUR` — must match price book |
| `XFLOW_API_KEY` / `XFLOW_ACCOUNT_ID` / `XFLOW_WEBHOOK_SECRET` | Xflow (opt-in) |
| `WISE_API_TOKEN` / `WISE_PROFILE_ID` | Wise payout helpers (not checkout) |
| `PAYONEER_CLIENT_ID` / `PAYONEER_CLIENT_SECRET` / `PAYONEER_PROGRAM_ID` | Payoneer payout helpers |
| `PAYMENTS_TAX_ENABLED` / `PAYMENTS_TAX_RATE_BPS` / `PAYMENTS_TAX_LABEL` | Tax on invoices (default off) |
| `PAYMENTS_FX_PROVIDER` | Stub label only — never used for charges |
| `LEGAL_ADMIN_EMAILS` / `ADMIN_EMAILS` | Admin allowlist for `/admin/payments` |
| `RESEND_API_KEY` / `EMAIL_FROM` | Receipt + license emails |
| `DATABASE_URL` | Prisma ledger tables |

**Never** put secret keys in `PaymentProviderConfig` / `NEXT_PUBLIC_*` (except Stripe publishable).

## Multi-currency (honest)

- `PLAN_PRICE_BOOK` in `src/lib/payments/currencies.ts` holds explicit USD / INR / EUR minor-unit prices per plan.
- Charge uses the book for the provider’s settlement currency.
- Display uses the book when present; otherwise labels **approx** from a fixed configured conversion (INR ×83, EUR ×0.92) — **not** live FX.
- `PAYMENTS_FX_PROVIDER` is a labeled stub only.

## Admin usage

1. Sign in with an allowlisted email → `/admin/payments`.
2. Toggle checkout providers (DB flag ∩ env ∩ credentials ∩ `supportsCheckout`).
3. Review transactions; refund calls provider API + records `PaymentRefund`.
4. Webhook tab shows `PaymentWebhookEvent` summaries (no secrets).

Refund eligibility follows the public **Refund Policy** (`/legal/refunds`). Operator refunds are discretionary tooling — not a guarantee beyond that policy / law.

## Ops after deploy

```bash
npm run db:push   # PaymentTransaction, Invoice, PaymentWebhookEvent, PaymentRefund, PaymentProviderConfig, LicenseKey paypal/xflow fields
npx tsc --noEmit
npm run test:payments
```

### PayPal webhook setup

1. Create REST app → copy Client ID / Secret.
2. Set `PAYPAL_MODE=live` (or sandbox) and env secrets.
3. In PayPal Developer → Webhooks → URL `https://<your-domain>/api/paypal/webhook`.
4. Subscribe at least to `PAYMENT.CAPTURE.COMPLETED` (and optionally `CHECKOUT.ORDER.COMPLETED`).
5. Copy the **Webhook ID** into `PAYPAL_WEBHOOK_ID`.
6. Smoke a sandbox one-time Foundry purchase → confirm license + invoice.

### Xflow (optional)

1. Complete Xflow connected-user / account activation (see [Xflow docs](https://docs.xflowpay.com)).
2. Set `XFLOW_API_KEY`, `XFLOW_ACCOUNT_ID`, `XFLOW_WEBHOOK_SECRET`.
3. Set `PAYMENTS_XFLOW_ENABLED=true` only after webhook fulfill works in your env.
4. Point webhook to `https://<your-domain>/api/xflow/webhook` (HMAC `x-xflow-signature`).

## What we do NOT claim

- PCI DSS certification / SAQ expansion beyond hosted fields
- Live FX / mid-market rates as charge authority
- Wise or Payoneer as customer checkout
- Payoneer Checkout without a separate merchant partnership
- Tax calculation unless explicitly configured

See also: `docs/SECURITY.md`, `marketing/RAZORPAY-LIVE-5MIN.md`, `marketing/STRIPE-LIVE-SETUP.md`.
