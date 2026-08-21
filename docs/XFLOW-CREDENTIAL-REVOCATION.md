# Old payment credential revocation

This list is **names and locations only**. Never paste secret values.

Removing a variable from this repo or from Vercel **does not revoke** the credential at the provider. Do that in the provider dashboard, then delete the env var.

| Old provider | Status in this application | Where the credential was referenced | Action required at the provider |
|---|---|---|---|
| Razorpay | Removed from application **and removed from Vercel** | Was on Vercel Production/Preview as `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` (deleted 2026-08-21 after Xflow code went live). Historical `LicenseKey` / `Subscriber` columns kept | Still revoke/rotate keys in Razorpay Dashboard → Settings → API Keys. Disable any Razorpay webhook still pointing at `/api/razorpay/webhook`. |
| Stripe | Removed from application | `.env.example` (removed); optional Vercel `STRIPE_*` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`; `npm run setup-stripe` deleted | Roll/delete keys in Stripe Dashboard → Developers → API keys. Remove webhook endpoints pointing at `/api/stripe/webhook`. |
| PayPal | Removed from application | `.env.example` comments (removed); optional `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` / `PAYPAL_WEBHOOK_ID` | Disable the REST app and webhook in PayPal Developer. |
| Wise | Removed from application | Optional `WISE_API_TOKEN` / `WISE_PROFILE_ID` | Revoke API token in Wise if one was created. |
| Payoneer | Removed from application | Optional `PAYONEER_CLIENT_ID` / `PAYONEER_CLIENT_SECRET` / `PAYONEER_PROGRAM_ID` | Revoke OAuth credentials in Payoneer if created. |
| Xflow | **Active in code; credentials not on Vercel yet** | Need `XFLOW_API_KEY`, `XFLOW_ACCOUNT_ID`, `XFLOW_WEBHOOK_SECRET` (server only) | Create keys in Xflow dashboard (testmode then live). Then `vercel env add`. Register webhook: `npx tsx scripts/register-xflow-webhook.ts` |

Git history was **not** rewritten. If a secret was ever committed, rotate it even if it is gone from `HEAD`.

`.gitignore` already ignores `.env*`. Do not commit `.env`, `.env.local`, or provider JSON dumps.
