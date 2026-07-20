# Shipyard

Two products, one audience, $0 required to launch:

1. **Build-Intel Vault** — a weekly, AI-automated research subscription that
   scores 15-20 real business ideas against live market signals on a public
   10-dimension rubric (Demand, Competition, Scalability, Automation, Profit
   Margin, MRR Potential, Barrier to Entry, AI Leverage, Global Reach, Time
   to Launch).
2. **Foundry Kit** — the AI-agent-native SaaS starter kit this venture itself
   is built on (this repo). Sold as a one-time license with an optional
   recurring updates/support tier.

Full opportunity scoring, competitor analysis, SWOT, and financial
projections for both products live in the portfolio canvas referenced in
chat. This README covers what's actually running.

## Why these two, together

They share one audience (people building software for a living) and one
distribution channel (dev/indie-hacker communities), so launching them
together means paying for customer acquisition once instead of twice. The
Vault's free content drives top-of-funnel traffic; Foundry Kit converts that
traffic into a second, complementary revenue line.

## Stack (see `docs/ARCHITECTURE.md` for the full breakdown)

Next.js 15 · TypeScript · Tailwind CSS · Prisma · Supabase (Postgres + Auth)
· Stripe (Checkout + webhooks) · Resend (email) · Docker · GitHub Actions.

Every piece has a free tier sufficient for launch. This project has been
built with **$0 spent** — the only unavoidable future cost is a custom
domain (~$10-15/year) once there's revenue to justify it; until then it runs
on the free `*.vercel.app` subdomain you get automatically.

## Setup — everything I can do is done. Five things only you can do.

I can't create accounts on your behalf (they require your email/identity),
but every one of these is free and takes under 5 minutes:

1. **Supabase** — create a free project at supabase.com. Copy the Postgres
   connection string into `DATABASE_URL`, and the project URL/anon key into
   `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
2. **Stripe** — create a free account at stripe.com (test mode needs no bank
   details; you only add payout details once you want real money to land in
   your account). Create the 5 Prices described in `.env.example`, copy the
   Price IDs in, and copy your secret key into `STRIPE_SECRET_KEY`.
3. **Stripe webhook** — after deploying, add a webhook endpoint pointing at
   `https://<your-domain>/api/stripe/webhook` listening for
   `checkout.session.completed`, `customer.subscription.deleted`, and
   `invoice.payment_failed`. Copy the signing secret into
   `STRIPE_WEBHOOK_SECRET`.
4. **Resend** — create a free account at resend.com (100 emails/day free),
   copy the API key into `RESEND_API_KEY`.
5. **Vercel** — connect this GitHub repo at vercel.com (free tier), paste in
   the same env vars, deploy. You get a live `shipyard.vercel.app` URL
   immediately with zero cost.

Once those five are done:

```bash
npm install
npm run db:push      # creates tables in your Supabase Postgres
npm run db:seed      # seeds the initial 18 scored ideas
npm run dev           # http://localhost:3000
```

## Running the weekly research pipeline

```bash
cp scripts/issues/template.json scripts/issues/2026-XX-XX.json
# edit the JSON with the week's candidate ideas and scores
npm run generate-issue -- --input scripts/issues/2026-XX-XX.json
```

This drafts a teardown for each idea with an LLM (set `OPENAI_API_KEY`),
writes everything to the database, and emails the digest to every active
subscriber — the whole weekly content cycle in one command.

## Getting the first customers

I wrote real, ready-to-post launch content for Indie Hackers, r/SaaS,
r/EntrepreneurRideAlong, X, and LinkedIn — see `marketing/launch-posts.md`.
I can't post to your personal accounts (needs your login), but the copy is
written and ordered by day; you just need to paste and hit publish. Once
each post is up, drop the actual link in and reply to comments — that's the
one part of distribution that's genuinely more effective coming from a real
person than automated.

## Financial targets (from the scoring canvas)

| Milestone | Target |
|---|---|
| Startup cost | $0-400 (domain optional at launch) |
| Month 6 MRR | $3,000-6,000 (Vault) + $1,500-3,500 (Foundry updates tier) |
| Month 18 MRR | $15,000-30,000 combined |
| Gross margin | 90%+ |

These are evidence-based estimates from comparable products (see the
scoring canvas for sourcing), not guarantees — the honest next step is
tracking real numbers against them weekly.

## Portfolio KPIs to track from week one

Revenue, MRR, ARR, free→paid conversion rate, CAC (should be ~$0 given
organic-only distribution), churn, and automation % (target: everything
above zero-touch except writing the weekly idea list and replying to
community comments).

## What's next in the portfolio

Per the scoring canvas, Recoverly (Stripe payment-recovery SaaS) and Bridge
(niche B2B integration) are next in the build queue once this venture has
its first paying cohort.
