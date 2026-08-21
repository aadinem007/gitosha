# Architecture

- **App Router** pages under `src/app`
- **API routes** under `src/app/api`
- **Lib** under `src/lib` (prisma, xflow, pricing, rate-limit, supabase)
- **Proxy** (`src/proxy.ts`) gates `/dashboard` and attaches security headers

Payment flow:

1. Client posts `{ planId, email }` → `/api/checkout` creates an Xflow TransactionIntent (amount server-side)
2. Customer completes UPI
3. Client posts intent id → `/api/checkout/verify` re-reads Xflow and unlocks Customer row
4. Webhook `transaction_intent.status.successful` is the source of truth
