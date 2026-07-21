# Architecture

Read this file first — human or coding agent. It exists so a new contributor
(or an AI agent working unattended) never has to guess where something lives.

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 15, App Router | Server components by default, one deploy target (Vercel free tier) |
| Language | TypeScript | Type-checked contracts between UI, API routes, and DB |
| Styling | Tailwind CSS v4 | No CSS files to hunt for, utility classes colocated with markup |
| DB | PostgreSQL via Prisma | Supabase's free tier gives you the Postgres instance |
| Auth | Supabase Auth (magic link) | No password storage/reset flow to build or secure |
| Payments | Razorpay Checkout + webhooks | Indian UPI/cards; popup checkout — no PCI scope here |
| Email | Resend | Free tier covers early volume; swap provider by editing `src/lib/email.ts` only |

## Directory map

```
src/
  app/                 Routes (App Router). One folder per URL segment.
    api/                Route handlers (checkout, webhook, waitlist, auth callback)
    pricing/, vault/, foundry-kit/, login/, checkout/success/
  components/          Client-interactive UI (forms, buttons). Server components stay in app/.
  lib/
    prisma.ts           Singleton Prisma client
    razorpay.ts         Razorpay client + plan-ID env lookup
    pricing.ts           Single source of truth for plans (INR, used by pricing page AND checkout API)
    fulfill.ts           Shared unlock logic after a successful payment
    ideas-data.ts        Seed data for the scored-idea database
    email.ts             All outbound email in one place
    license.ts           License-key generation
    supabase/            Server + browser Supabase clients
  middleware.ts         Session refresh + /vault auth gate
prisma/
  schema.prisma          Data model
  seed.ts                 Seeds the initial 18 scored ideas
scripts/
  generate-issue.ts       The weekly research-automation pipeline (see below)
```

## The one rule for adding a feature

**New plan/price?** Edit `src/lib/pricing.ts` only — the pricing page, the
Foundry Kit page, and the checkout API all read from that one array. Never
hardcode a price or Stripe price ID anywhere else.

**New scored idea?** Either add it to `src/lib/ideas-data.ts` and re-run
`npm run db:seed`, or (for a real weekly issue) create a JSON file under
`scripts/issues/` and run `npm run generate-issue -- --input scripts/issues/your-file.json`
— it drafts the teardown with an LLM, upserts it, and emails subscribers, with
zero manual steps in between.

**New gated page?** Add the path to the `matcher` array in `src/middleware.ts`.

## Data flow for a Vault subscription

1. `CheckoutButton` posts `{ planId, email }` to `POST /api/checkout`.
2. The API creates a Razorpay Subscription against the plan ID in env vars.
3. The browser opens Razorpay Checkout with `subscription_id`.
4. On success, the client posts to `POST /api/checkout/verify` (signature check)
   which unlocks the subscriber; Razorpay also hits
   `POST /api/razorpay/webhook` as a backup.
5. `/vault` reads the signed-in user's email from Supabase, looks up their
   `Subscriber` row, and unlocks premium `Idea` rows accordingly.

## Data flow for a Foundry Kit purchase

1. Same Razorpay Order → verify/webhook → `LicenseKey` row.
2. Success page + `/license` portal call `POST /api/license/download`.
3. Server zips `kits/foundry/` (personalized LICENSE) and streams it.
4. Re-downloads allowed (tracked on `LicenseKey.downloadCount`).

See `docs/DELIVERY.md`.
