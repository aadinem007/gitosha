# Payments (internal)

Xflow is the **only** payment provider. Hosted UPI checkout (TransactionIntent / Subscription) — we do not claim PCI DSS certification and never store raw card data.

Official docs used for this integration:

- Collection: https://docs.xflowpay.com/imports/latest/guide
- Webhooks: https://docs.xflowpay.com/exports/latest/guide (Verify events)

## Architecture

```
API routes (thin)
  └─ PaymentService (`src/lib/payments/service.ts`)
       └─ XflowAdapter (`src/lib/payments/providers/xflow.ts`)
            └─ https://api.xflowpay.com
```

No Stripe / PayPal / Razorpay / Wise / Payoneer adapters. No provider failover.

- **Server price table** (`src/lib/pricing.ts` + `PLAN_PRICE_BOOK`) is the only source of amounts. Client amounts are ignored.
- **Charge currency:** INR only (Xflow collections are INR UPI). Catalog USD is converted via the price book — **not** live FX.
- **One-time plans** (Foundry, bundle, Operator Annual): `POST /v1/transaction_intents`
- **Monthly Vault:** `POST /v1/subscriptions` then authorize the linked TransactionIntent (imports guide §5.3)
- **Paid status:** signed webhook `transaction_intent.status.successful` after the server re-fetches the intent. Frontend confirm only re-queries Xflow; it cannot mark paid locally.
- **Idempotency:** checkout keys on `PaymentTransaction.idempotencyKey`; webhooks on `PaymentWebhookEvent (provider, eventId)` using official `Webhook-Id`.
- **Refunds:** Xflow does not document a public refund API. Do not fake refunds. Process in the Xflow dashboard.

## Honest limitations (do not invent workarounds)

- Xflow collection is **INR / UPI only**. International cards are not on this rail.
- Annual Operator is a **one-time** UPI intent (yearly `interval` is not in the documented Subscription example).
- Settlement is Xflow deposits → receivable reconcile → payout. Funds must be withdrawn on Xflow’s documented timeline.
- Testmode is Xflow dashboard test keys (`livemode: false`). Test data does not carry into live.

## Routes

| Route | Role |
|---|---|
| `POST /api/checkout` | Create Xflow intent/subscription (rate-limited, Origin fail-closed) |
| `POST /api/checkout/verify` | Server re-reads Xflow after UPI |
| `POST /api/xflow/webhook` | Official HMAC + timestamp webhooks |
| `GET /api/admin/payments` | Admin list (Xflow only) |
| `POST /api/admin/payments/refund` | Returns 501 until Xflow documents a refund API |
| `/checkout/xflow` | UPI bridge |
| `/admin/payments` | Admin UI |

## Env vars

| Variable | Purpose |
|---|---|
| `XFLOW_API_KEY` | Server secret |
| `XFLOW_ACCOUNT_ID` | Connected-user / account header |
| `XFLOW_WEBHOOK_SECRET` | Per-endpoint webhook secret |
| `XFLOW_API_BASE` | Optional override (tests) |
| `PAYMENTS_TAX_ENABLED` / `PAYMENTS_TAX_RATE_BPS` / `PAYMENTS_TAX_LABEL` | Tax on invoices (default off) |
| `LEGAL_ADMIN_EMAILS` / `ADMIN_EMAILS` | Admin allowlist |
| `RESEND_API_KEY` / `EMAIL_FROM` | Receipt + license emails |
| `DATABASE_URL` | Prisma ledger |

Never put Xflow secrets in `NEXT_PUBLIC_*`, frontend, logs, or `PaymentProviderConfig`.

## Webhook setup

1. Complete Xflow connected-user / account activation (imports guide).
2. Create a webhook endpoint for **testmode** and **livemode** separately.
3. URL: `https://<your-domain>/api/xflow/webhook`
4. Subscribe at least to `transaction_intent.status.successful` (and `subscription.status.paused` if you sell monthly Vault).
5. Store the endpoint secret as `XFLOW_WEBHOOK_SECRET`.
6. Verification uses `Webhook-Id`, `Webhook-Timestamp`, `Webhook-Signature` (HMAC-SHA256 of `id.timestamp.body`, 5-minute skew).

## Ops

```bash
npm run db:push
npx tsc --noEmit
npm run test:payments
```

See `docs/XFLOW-CREDENTIAL-REVOCATION.md` for old provider keys that must be revoked in their dashboards (removing env vars does not revoke them).
