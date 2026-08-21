# Foundry Kit

Production SaaS scaffold: Next.js + TypeScript + Tailwind + Prisma + Supabase Auth + Xflow.

Licensed to you by Gitosha. Your license key is on the purchase success page and at `/license` on the Gitosha site.

## Quick start

```bash
cp env.example (or .env.example) .env
# Fill DATABASE_URL, Supabase, Xflow keys

npm install
npx prisma db push
npm run dev
```

Open http://localhost:3000

## What is included

| Area | Path |
|---|---|
| Pricing SSOT | `src/lib/pricing.ts` |
| Xflow checkout | `src/app/api/checkout/*` |
| Webhook unlock | `src/app/api/xflow/webhook/route.ts` |
| Magic-link auth | `src/app/login`, `src/lib/supabase/*` |
| Auth-gated dashboard | `src/app/dashboard`, `src/proxy.ts` |
| Rate limits + honeypot waitlist | `src/lib/rate-limit.ts`, `src/app/api/waitlist` |
| Security headers / CSP | `next.config.ts` |

## Customize

1. Rename product copy in `src/app/page.tsx` and `layout.tsx`
2. Edit plans in `src/lib/pricing.ts`
3. Point env vars at your Supabase + Xflow projects
4. Deploy to Vercel — paste the same env vars

## License tiers

- **Solo** — one commercial product
- **Agency** — unlimited client projects + white-label rights

See `LICENSE.md` inside this zip for your tier terms.
