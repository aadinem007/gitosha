# Shipyard

Two products, one audience, ₹0 required to launch:

1. **Build-Intel Vault** — weekly scored micro-SaaS opportunity research (₹1,499/mo Pro).
2. **Foundry Kit** — AI-agent-native SaaS starter kit (₹11,999 one-time Solo).

Live site: https://shipyard-omega-opal.vercel.app

## Stack

Next.js · TypeScript · Tailwind · Prisma · Supabase · **Razorpay** · Resend · Docker · GitHub Actions.

## Setup status

Already done:
- Code on GitHub (`aadinem007/shipyard`)
- Live on Vercel
- Supabase database + 18 seeded ideas

Still needed (you + me):
1. **Razorpay** test keys → see `docs/FINISH-RAZORPAY.md`
2. Paste keys into Vercel, run `npm run setup-razorpay` (or let me run it), redeploy
3. Optional later: Resend for fancy emails (Supabase already handles login magic links)

## Local commands

```bash
npm install
npm run db:push
npm run db:seed
npm run setup-razorpay   # needs RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET
npm run generate-issue -- --input scripts/issues/your-file.json
npm run dev
```

## First customers

Ready-to-paste posts: `marketing/launch-posts.md` (use the live Vercel URL).

## Money targets (INR-first)

| Milestone | Target |
|---|---|
| Startup cost | ₹0 (free tiers) |
| Month 6 | ~₹2.5–5L MRR equivalent across Vault + Foundry |
| Gross margin | 90%+ |

## Next in the portfolio

Recoverly (payment-recovery SaaS) and Bridge (niche B2B integration).
