# Gitosha

**Know what to build. Then ship it.**

Two products, one audience:

1. **Vault** — weekly scored software opportunity research (Operator from ₹999/mo launch).
2. **Foundry** — production SaaS scaffold with auth, Razorpay billing, and deploy pipeline (Solo ₹9,999).

Live site: https://gitosha.vercel.app  
(Custom domain `gitosha.com` can be wired later — see Vercel project settings.)

## Stack

Next.js · TypeScript · Tailwind · Prisma · Supabase · Razorpay · Resend · Docker · GitHub Actions.

## Setup status

Already done:
- Code on GitHub (`aadinem007/gitosha` — repo folder name kept)
- Live on Vercel
- Supabase database + seeded ideas
- Razorpay Test Mode payments verified

Still needed for real money:
1. Razorpay Live keys + KYC (see `docs/FINISH-RAZORPAY.md`)
2. Optional: Resend for license emails (success page already shows keys)
3. Optional: set `EMAIL_FROM` to a verified Gitosha sender (e.g. `Gitosha <hello@yourdomain.com>`)

## Local commands

```bash
npm install
npm run db:push
npm run db:seed
npm run setup-razorpay
npm run generate-issue -- --input scripts/issues/your-file.json
npm run dev
```

## First customers

Ready-to-paste posts: `marketing/launch-posts.md` (use the live Vercel URL until the custom domain is live).

## Money targets (INR-first)

| Milestone | Target |
|---|---|
| Startup cost | ₹0 (free tiers) |
| Month 6 | ~₹2.5–5L MRR equivalent across Vault + Foundry |
| Gross margin | 90%+ |

## Next in the portfolio

Recoverly (payment-recovery SaaS) and Bridge (niche B2B integration).
