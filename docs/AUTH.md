# Auth setup (Supabase magic link)

Production site: `https://gitosha.vercel.app`

Magic links were redirecting to `http://localhost:3000` because Supabase **Site URL** was still localhost, and/or `NEXT_PUBLIC_SITE_URL` was missing on Vercel.

## 1. Vercel env

Set:

```
NEXT_PUBLIC_SITE_URL=https://gitosha.vercel.app
```

Redeploy after saving.

The app uses this for `emailRedirectTo` (`src/lib/site.ts` → `LoginForm`). In production it also falls back to `https://gitosha.vercel.app` if the env var is missing.

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

Open **Authentication → Email Templates → Magic Link**:

- **Subject:** `Sign in to Gitosha`
- **Body:** replace the default heading with Gitosha copy, e.g.

```html
<h2>Sign in to Gitosha</h2>
<p>Click the link below to sign in. It expires in about an hour.</p>
<p><a href="{{ .ConfirmationURL }}">Sign in to Gitosha</a></p>
<p>If you didn’t request this, ignore this email.</p>
<p>— Gitosha</p>
```

Optional: **Project Settings → Authentication → SMTP** (or email sender name) so the From line isn’t “Supabase Auth”.

## 4. Optional: script

With a [personal access token](https://supabase.com/dashboard/account/tokens):

```bash
SUPABASE_ACCESS_TOKEN=sbp_… \
SUPABASE_PROJECT_REF=ooaixxnaxniuscxmqnyn \
SITE_URL=https://gitosha.vercel.app \
npx tsx scripts/setup-supabase-auth.ts
```

This patches Site URL, redirect allow list, and the magic-link subject/body.
