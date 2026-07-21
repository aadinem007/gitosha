# Getting started

## 1. Accounts (free tiers are fine)

1. Create a Supabase project → copy Project URL + anon key + Database URL
2. Create a Razorpay account → Test Mode keys
3. Create a Vercel project when ready to deploy

## 2. Local

```bash
cp env.example (or .env.example) .env
npm install
npx prisma db push
npm run dev
```

## 3. Auth redirect

In Supabase Auth → URL configuration, add:

- Site URL: `http://localhost:3000`
- Redirect: `http://localhost:3000/api/auth/callback`

For production, add your Vercel URL the same way.

## 4. Webhook

Razorpay Dashboard → Webhooks → `https://YOUR_DOMAIN/api/razorpay/webhook`  
Event: `payment.captured`  
Paste the secret into `RAZORPAY_WEBHOOK_SECRET`.

## 5. Go Live

Swap Test keys for Live keys after KYC. Never commit `.env`.
