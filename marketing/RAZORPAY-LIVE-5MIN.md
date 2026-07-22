# Razorpay Live — click-by-click (~5–15 min after KYC)

Test keys (`rzp_test_…`) do **not** put money in your bank.  
Until this file is done, do not sell. Finish this, then open `FIRST-MONEY.md`.

Verified webhook path in code (`src/app/api/razorpay/webhook/route.ts`):

```
https://gitosha.vercel.app/api/razorpay/webhook
```

---

## Step 1 — Razorpay Dashboard → Live mode

1. Open https://dashboard.razorpay.com and log in  
2. Top-left / top bar: switch **Test Mode → Live Mode**  
3. If Live is locked: complete **KYC / Activation** (Business details, bank account, documents)  
4. Wait until the dashboard says you can accept Live payments  

You cannot skip KYC. That is the human-only gate.

---

## Step 2 — Copy Live API keys

1. Stay in **Live Mode**  
2. Go to **Account & Settings** → **API Keys** (or **Developers → API Keys**)  
3. Click **Generate Live Key** if you do not have one yet  
4. Copy:

- **Key ID** → starts with `rzp_live_…`  
- **Key Secret** → show once; paste somewhere safe temporarily  

Do **not** paste `rzp_test_…` into Vercel Production.

---

## Step 3 — Create Live webhook

1. Still in **Live Mode**  
2. Go to **Account & Settings** → **Webhooks** (or **Developers → Webhooks**)  
3. Click **+ Add New Webhook**  
4. **Webhook URL** (exact):

```
https://gitosha.vercel.app/api/razorpay/webhook
```

5. **Secret**: generate / type a long random string → copy it (this is `RAZORPAY_WEBHOOK_SECRET`)  
6. Enable these events:

- `payment.captured`  
- `subscription.activated`  
- `subscription.charged`  
- `subscription.cancelled`  
- `subscription.halted`  

7. Save / Active  

---

## Step 4 — Paste into Vercel (Production)

1. Open https://vercel.com → project **gitosha** (or your Gitosha project)  
2. **Settings** → **Environment Variables**  
3. Set these for **Production** (and Preview if you want):

| Name | Value |
|---|---|
| `RAZORPAY_KEY_ID` | `rzp_live_…` |
| `RAZORPAY_KEY_SECRET` | (Live secret) |
| `RAZORPAY_WEBHOOK_SECRET` | (webhook secret from Step 3) |
| `NEXT_PUBLIC_SITE_URL` | `https://gitosha.vercel.app` |

4. Leave `RAZORPAY_PLAN_VAULT_PRO` / `RAZORPAY_PLAN_VAULT_TEAM` empty for now if you only sell Foundry today (one-time payments do not need plan IDs).  
5. Save.

---

## Step 5 — Redeploy (required)

Env vars do not apply until a new deployment.

1. Vercel → **Deployments**  
2. Latest deployment → **⋯** → **Redeploy**  
   — or push any commit to `main`  
3. Wait until status is **Ready**  
4. Open https://gitosha.vercel.app/pricing — page loads, buy buttons work  

---

## Step 6 — Optional later: Live Vault subscription plans

Only after first Foundry sale (or when you want ₹999/mo):

```bash
RAZORPAY_KEY_ID=rzp_live_xxx RAZORPAY_KEY_SECRET=xxx npm run setup-razorpay
```

That script creates Live plans at **₹999** (Operator) and **₹4,999** (Studio).  
Paste the printed `RAZORPAY_PLAN_VAULT_PRO` / `RAZORPAY_PLAN_VAULT_TEAM` into Vercel → Redeploy again.

---

## Sanity check

| Check | Pass if |
|---|---|
| Key ID prefix | `rzp_live_` not `rzp_test_` |
| Webhook URL | ends with `/api/razorpay/webhook` |
| Webhook secret | matches Vercel `RAZORPAY_WEBHOOK_SECRET` |
| Redeploy | done after env change |
| First product | Foundry Solo / Bundle on `/pricing` |

Done → go sell: `marketing/FIRST-MONEY.md`
