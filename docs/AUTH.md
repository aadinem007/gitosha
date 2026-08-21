# Auth setup (Supabase magic link)

Production site: `https://gitosha.vercel.app`

Magic links were redirecting to `http://localhost:3000` because Supabase **Site URL** was still localhost, and/or `NEXT_PUBLIC_SITE_URL` was missing on Vercel.

## Security posture (app)

- **No passwords** — magic-link only; no Argon2/bcrypt in this app (Supabase owns the OTP link).
- Branded magic links use **server-only** `SUPABASE_SERVICE_ROLE_KEY` via `src/lib/supabase/admin.ts` — never `NEXT_PUBLIC_*`.
- `/api/auth/magic-link` is rate-limited per IP (5/min) and per email (3/hour); responses do not reveal whether an account exists.
- `/api/auth/callback` requires a `code`; `next` is restricted to same-site relative paths (`safeRedirectPath`). Failed exchanges log `[security] auth_callback_exchange_failed`.
- Session cookies: `HttpOnly`, `SameSite=Lax`, `Secure` in production (forced in `src/lib/supabase/server.ts` + `src/proxy.ts`).
- **Sign out / session revocation:** Vault UI → `POST /api/auth/sign-out` → `supabase.auth.signOut()` clears HttpOnly cookies (browser JS cannot delete them).
- **MFA:** not productized. Scaffolding = Supabase Auth MFA when you enable it in the dashboard; no app TOTP UI yet. Operators should use 2FA on Supabase/Xflow/Vercel.
- `/research` is gated in `src/proxy.ts` **and** redirects unauthenticated users in the page itself (defense-in-depth against proxy bypass CVEs).
- `/vault` is the public Vault product marketing page.

## 1. Vercel env

Set:

```
NEXT_PUBLIC_SITE_URL=https://gitosha.vercel.app
```

Redeploy after saving.

The app uses this for `emailRedirectTo` (`src/lib/site.ts` → `LoginForm`). In production it also falls back to `https://gitosha.vercel.app` if the env var is missing. Production same-origin checks **fail closed** if this URL is missing/invalid.

## 2. Supabase Dashboard (required)

Open **Authentication → URL Configuration**:

| Field | Value |
|-------|--------|
| **Site URL** | `https://gitosha.vercel.app` |
| **Redirect URLs** | `https://gitosha.vercel.app/**` |
| | `https://gitosha.vercel.app/api/auth/callback` |
| | `http://localhost:3000/**` |
| | `http://localhost:3000/api/auth/callback` |

Save.

## 3. Email branding (kill “Supabase Auth”)

### Preferred: branded Resend path (app code)

If Vercel has **both**:
- `SUPABASE_SERVICE_ROLE_KEY` (server-only — never expose to the browser)
- `RESEND_API_KEY`
- `EMAIL_FROM=Gitosha <your-verified-domain@…>`

…then `/login` uses `POST /api/auth/magic-link`, which generates the link with Supabase Admin and sends a **Gitosha-branded** HTML email via Resend. No “Supabase Auth” heading.

### Fallback: Supabase template (if Resend/admin missing)

Open **Authentication → Email Templates → Magic Link**:

- **Subject:** `Sign in to Gitosha`
- **Body:**

```html
<h2>Sign in to Gitosha</h2>
<p>Click the link below to sign in. It expires in about an hour.</p>
<p><a href="{{ .ConfirmationURL }}">Sign in to Gitosha</a></p>
<p>If you didn’t request this, ignore this email.</p>
<p>— Gitosha</p>
```

Also set sender name under **Project Settings → Authentication** (or custom SMTP) so From isn’t “Supabase Auth”.

## 4. Optional: script

With a [personal access token](https://supabase.com/dashboard/account/tokens):

```bash
SUPABASE_ACCESS_TOKEN=sbp_… \
SUPABASE_PROJECT_REF=ooaixxnaxniuscxmqnyn \
SITE_URL=https://gitosha.vercel.app \
npx tsx scripts/setup-supabase-auth.ts
```

This patches Site URL, redirect allow list, and the magic-link subject/body.
