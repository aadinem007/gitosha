# Legal & privacy architecture (operators)

Internal notes for operators — **not** a claim of legal certification.
Public policies are generated from real app configuration (`src/lib/legal/config.ts` + optional published DB blob).

## What this system is / is not

| Claim | Status |
|---|---|
| Policies track real integrations (Supabase, payments, Resend, optional OpenAI) | Yes |
| GDPR / CPRA / DPDP **certified** or “compliant” | **No — never claim this from software alone** |
| Invented company address / tax ID | **Forbidden** — use env or “configuration pending” |
| Physical shipping policy | **N/A** — digital delivery only |
| Legal advice | **No** — every page carries a human-review disclaimer |

## Architecture

```
src/lib/legal/config.ts     File/env defaults reflecting real product
src/lib/legal/resolve.ts    Active config = published LegalConfig JSON || defaults
/privacy /terms /legal/*    Config-driven App Router pages
/admin/legal                Deny-by-default admin publish UI
ConsentBanner               Necessary + only enabled optional categories
/api/legal/consent|rights   Rate-limited, origin-checked, Zod-validated
Prisma                      LegalConfig, LegalDocumentVersion, ConsentRecord,
                            DataRightsRequest, LegalAuditLog, ThirdPartyProcessor
```

## Operator setup (env)

| Variable | Purpose |
|---|---|
| `LEGAL_ENTITY_NAME` | Registered entity — leave unset until known |
| `LEGAL_CONTACT_EMAIL` | Public contact |
| `LEGAL_PRIVACY_EMAIL` | Privacy requests (falls back to contact) |
| `LEGAL_DPO_EMAIL` | Optional DPO |
| `LEGAL_DMCA_EMAIL` | Required before treating `/legal/dmca` as a formal agent channel |
| `LEGAL_ADDRESS` | Real registered address only |
| `LEGAL_GOVERNING_LAW` | Default India |
| `LEGAL_ENABLED_REGIONS` | Comma list e.g. `IN_DPDP,GDPR,CPRA` — informational modules |
| `LEGAL_POLICY_VERSION` / `LEGAL_EFFECTIVE_DATE` / `LEGAL_LAST_UPDATED` | Baseline versioning |
| `LEGAL_ADMIN_EMAILS` or `ADMIN_EMAILS` | Comma-list of Supabase emails for `/admin/legal` |

Also ensure payment/email/AI keys match what you want disclosed (processors list is live from env).

## Admin publish

1. Add your email to `LEGAL_ADMIN_EMAILS`
2. Sign in via magic link
3. Open `/admin/legal`
4. Edit contacts / region modules
5. **Publish new version** with change summary + effective date → writes `LegalConfig`, `LegalDocumentVersion` rows, `LegalAuditLog`

Processors, cookies, and AI activity always recompute from live env at render time so a published blob cannot invent analytics or physical shipping.

## Consent

- Necessary: Supabase session cookies
- Optional AI processing: only when `OPENAI_API_KEY` is set; chat LLM gated on consent
- Analytics / marketing / personalization: **disabled** in config until actually integrated
- localStorage + optional `ConsentRecord` when signed in

## Data rights

`/legal/rights` + `POST /api/legal/rights`:

- Export/Access with license keys only for **authenticated owner**
- Delete: auto-removes FREE waitlist Subscriber (no billing IDs) + consents; queues paid/auth/processor erasure for operators
- Does **not** claim full erasure across Supabase Auth, Razorpay/Stripe, Resend, OpenAI, Vercel logs

## Database

Project pattern: `npm run db:push` (Prisma schema in `prisma/schema.prisma`).

```bash
npx prisma generate
npm run db:push
```

## Template: Legal & Privacy Impact (future features)

Copy into feature PRs:

```md
### Legal & Privacy Impact
- New personal data collected? (fields, purpose, legal basis note for counsel)
- New processor / SDK / cookie category?
- Retention change?
- Consent category needed before load?
- Cross-border transfer?
- Children’s / AI disclosure update?
- Admin publish / policy version bump required?
- Human legal review required? (yes/no + why)
```

## Human legal review flags

1. Entity name, address, tax IDs, DPO designation
2. Governing law / venue for your actual incorporation
3. Refund windows vs consumer law in target markets
4. DMCA agent registration (US) if relying on safe harbor
5. Whether IN DPDP / GDPR / CPRA modules should be enabled and how they map to your processing
6. Cross-border transfer mechanisms for Supabase/Vercel/OpenAI/payments
7. Accessibility WCAG claims (we explicitly do **not** certify)
