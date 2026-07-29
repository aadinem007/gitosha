# Gitosha

**Know what to build. Then ship it.**

Two products, one audience:

1. **Vault** — weekly scored software opportunity research (Operator from $15/mo launch).
2. **Foundry** — production SaaS scaffold with auth, Stripe billing, and deploy pipeline (Solo $99).

Live site: https://gitosha.vercel.app  
(Custom domain `gitosha.com` can be wired later — see Vercel project settings.)

**Auth / magic links:** set `NEXT_PUBLIC_SITE_URL` on Vercel and fix Supabase Site URL — see [`docs/AUTH.md`](docs/AUTH.md). Without that, links redirect to localhost.

## Stack

Next.js · TypeScript · Tailwind · Prisma · Supabase · Stripe · Resend · Docker · GitHub Actions.  
(Razorpay remains an optional alternate via `PAYMENTS_PROVIDER=razorpay`.)

## Setup status

Already done:
- Code on GitHub (`aadinem007/gitosha` — repo folder name kept)
- Live on Vercel
- Supabase database + seeded ideas
- USD pricing + Stripe checkout path in code

Still needed for real money:
1. Stripe Live keys + webhook (see `marketing/STRIPE-LIVE-SETUP.md`)
2. Optional: Resend for license emails (success page already shows keys)
3. Optional: set `EMAIL_FROM` to a verified Gitosha sender (e.g. `Gitosha <hello@yourdomain.com>`)

## Local commands

```bash
npm install
cp .env.example .env
npm run db:push
npm run db:seed
npm run setup-stripe
npm run generate-issue -- --input scripts/issues/your-file.json
npm run dev
```

## First customers

Ready-to-paste posts: `marketing/launch-posts.md` (use the live Vercel URL until the custom domain is live).  
First-money playbook: `marketing/FIRST-MONEY.md`.

## Money targets (USD-first)

| Milestone | Target |
|---|---|
| Startup cost | $0 (free tiers) |
| Month 6 | meaningful MRR across Vault + Foundry |
| Gross margin | 90%+ |

## Next in the portfolio

Recoverly (payment-recovery SaaS) and Bridge (niche B2B integration).
