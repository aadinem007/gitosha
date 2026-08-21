# Getting started

## 1. Accounts (free tiers are fine)

1. Create a Supabase project → copy Project URL + anon key + Database URL
2. Create an Xflow account → testmode API key, account id, webhook secret
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

Xflow Dashboard → Webhook endpoints → `https://YOUR_DOMAIN/api/xflow/webhook`  
Event: `transaction_intent.status.successful`  
Paste the endpoint secret into `XFLOW_WEBHOOK_SECRET`.

## 5. Go Live

Use livemode keys after Xflow activation. Never commit `.env`.
