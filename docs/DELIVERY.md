# Product delivery (automated)

You do **not** manually email zips or code. The site delivers.

## Foundry ($99 Solo / $249 Agency / $149 Bundle)

1. Customer pays via Xflow UPI
2. `fulfillPurchase` creates a `LicenseKey` row
3. Success page shows the key + **Download Foundry zip**
4. `POST /api/license/download` checks email+key, streams `kits/foundry` as a zip
5. Zip includes personalized `LICENSE.md` + `DELIVERY.md`
6. Customer can re-download at `/license` anytime (cap 50 downloads)

Kit source of truth: `kits/foundry/`

## Vault (Operator / Studio / included with Foundry)

1. Customer pays (or gets Vault via Foundry Solo/Agency/Bundle fulfill)
2. `Subscriber` row set to PRO or TEAM
3. They sign in at `/login` with the **same email**
4. `/research` unlocks premium teardowns
5. Operator+ can export CSV at `/api/vault/export`

## What you must do once (ops)

1. `npx prisma db push` against production DB (adds download tracking columns)
2. Optional: set `RESEND_API_KEY` so email also carries the download link
3. Nothing else — downloads are automatic

## Test without real money

Use an existing Test Mode license from a previous Foundry purchase:
open `/license`, paste email + `GITO-…` (legacy `SHIP-…` still works) key, download zip.
