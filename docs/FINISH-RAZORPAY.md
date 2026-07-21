# Finish Razorpay in 5 minutes (zero coding)

Your Gitosha site is already live. This turns on the pay buttons with Indian payments
(UPI, cards, netbanking).

Tip: in the Razorpay dashboard, set the business / checkout display name to **Gitosha**.

## A. Get your Razorpay test keys

1. Go to [dashboard.razorpay.com](https://dashboard.razorpay.com)
2. Make sure **Test Mode** is ON (toggle usually top-left / top-right)
3. Click **Account & Settings** (or gear) → **API Keys**
   (sometimes under **Developers** → **API Keys**)
4. Click **Generate Test Key** if you don't have one yet
5. Copy **Key Id** (`rzp_test_...`) and **Key Secret**

Paste both in chat. I will create the subscription plans and tell you exactly
what to put in Vercel.

## B. What goes into Vercel

```
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_PLAN_VAULT_PRO=plan_...
RAZORPAY_PLAN_VAULT_TEAM=plan_...
NEXT_PUBLIC_SITE_URL=https://gitosha.vercel.app
```

Also **delete** the old `STRIPE_SECRET_KEY` row if it's still there.

## C. Webhook

1. Razorpay Dashboard → **Account & Settings** → **Webhooks** → **Add New Webhook**
2. URL:
   `https://gitosha.vercel.app/api/razorpay/webhook`
3. Active events:
   - `payment.captured`
   - `subscription.activated`
   - `subscription.charged`
   - `subscription.cancelled`
   - `subscription.halted`
4. Set a **Secret** (any random long string you invent) — copy it
5. Add to Vercel: `RAZORPAY_WEBHOOK_SECRET` = that secret

## D. Redeploy

Vercel → Deployments → ⋯ → Redeploy

## E. Test payment (fake money)

1. Open https://gitosha.vercel.app/pricing
2. Click **Start Pro** or **Buy Solo**
3. Razorpay popup opens — use Razorpay test cards / UPI test flow
4. Success → "You're in" page

Common test card (Test Mode): `4111 1111 1111 1111`, any future expiry, any CVV.

## Live money (later)

Turn Test Mode OFF, generate Live API keys, create live plans the same way,
add bank/KYC details in Razorpay so settlements go to your Indian bank account.
