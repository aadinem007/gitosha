# Stripe Live in ~5 minutes

Gitosha checkout defaults to **Stripe + USD**. Tip: set the Stripe business display name to **Gitosha**.

## A. Get test keys first

1. Open [dashboard.stripe.com](https://dashboard.stripe.com) → toggle **Test mode** ON  
2. **Developers → API keys** → copy:
   - Secret key → `STRIPE_SECRET_KEY` (`sk_test_…`)
   - Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (`pk_test_…`)
3. Locally:

```bash
cp .env.example .env
# paste keys, keep PAYMENTS_PROVIDER=stripe
npm run setup-stripe
```

Paste the printed `STRIPE_PRICE_*` lines into `.env`.

## B. Webhook (local)

```bash
# Stripe CLI: https://stripe.com/docs/stripe-cli
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the `whsec_…` into `STRIPE_WEBHOOK_SECRET`.

Events to enable (CLI listens to all; production webhook must include):

- `checkout.session.completed`
- `customer.subscription.deleted`
- `customer.subscription.paused`

## C. Smoke a test payment

1. `npm run dev` → open `/pricing`
2. Buy Foundry Solo with a [Stripe test card](https://docs.stripe.com/testing) (`4242…`)
3. Confirm `/checkout/success` shows a license key and `/license` downloads the zip

## D. Go Live (real money)

1. Complete Stripe account activation / payouts  
2. Toggle **Test mode** OFF → copy **Live** secret + publishable keys  
3. Vercel → Project → Settings → Environment Variables:

| Variable | Value |
|---|---|
| `PAYMENTS_PROVIDER` | `stripe` |
| `STRIPE_SECRET_KEY` | `sk_live_…` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_…` |
| `STRIPE_WEBHOOK_SECRET` | from Live webhook endpoint |
| `STRIPE_PRICE_*` | from `STRIPE_SECRET_KEY=sk_live_… npm run setup-stripe` |
| `NEXT_PUBLIC_SITE_URL` | `https://gitosha.vercel.app` |

4. Stripe Dashboard → **Developers → Webhooks → Add endpoint**

```
https://gitosha.vercel.app/api/stripe/webhook
```

Select the three events above → copy signing secret → `STRIPE_WEBHOOK_SECRET`.

5. Redeploy Vercel. Self-buy once (or ask a warm contact), confirm fulfillment, refund if needed.

## Optional: Razorpay

Set `PAYMENTS_PROVIDER=razorpay` and see `docs/FINISH-RAZORPAY.md` / `marketing/RAZORPAY-LIVE-5MIN.md`.
USD site pricing stays in `src/lib/pricing.ts`; Razorpay plan IDs are only for subscription mode.
