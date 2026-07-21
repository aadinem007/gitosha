# Architecture

- **App Router** pages under `src/app`
- **API routes** under `src/app/api`
- **Lib** under `src/lib` (prisma, razorpay, pricing, rate-limit, supabase)
- **Proxy** (`src/proxy.ts`) gates `/dashboard` and attaches security headers

Payment flow:

1. Client posts `{ planId, email }` → `/api/checkout` creates Razorpay Order (amount server-side)
2. Razorpay Checkout popup
3. Client posts signature → `/api/checkout/verify` unlocks Customer row
4. Webhook `payment.captured` is the backup unlock path
