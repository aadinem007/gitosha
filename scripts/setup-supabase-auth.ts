/**
 * Configure Supabase Auth for production:
 * - Site URL → Vercel
 * - Redirect allow list
 * - Magic-link email subject/body branded as Gitosha (not "Supabase Auth")
 *
 * Requires a personal access token from https://supabase.com/dashboard/account/tokens
 *
 *   SUPABASE_ACCESS_TOKEN=sbp_… \
 *   SUPABASE_PROJECT_REF=ooaixxnaxniuscxmqnyn \
 *   SITE_URL=https://gitosha.vercel.app \
 *   npx tsx scripts/setup-supabase-auth.ts
 */
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN ?? "";
const REF = process.env.SUPABASE_PROJECT_REF ?? "ooaixxnaxniuscxmqnyn";
const SITE = (process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://gitosha.vercel.app").replace(
  /\/$/,
  ""
);

const MAGIC_SUBJECT = "Sign in to Gitosha";
const MAGIC_CONTENT = `<h2>Sign in to Gitosha</h2>

<p>Click the link below to sign in. It expires in about an hour.</p>

<p><a href="{{ .ConfirmationURL }}">Sign in to Gitosha</a></p>

<p>If you didn’t request this, you can ignore this email.</p>

<p>— Gitosha</p>`;

async function main() {
  if (!TOKEN) {
    console.error(`
Missing SUPABASE_ACCESS_TOKEN.

1. Open https://supabase.com/dashboard/account/tokens
2. Generate a token
3. Run:

  SUPABASE_ACCESS_TOKEN=sbp_… npx tsx scripts/setup-supabase-auth.ts

Also set in Supabase Dashboard → Authentication → URL Configuration (if the script can’t):
  Site URL: ${SITE}
  Redirect URLs:
    ${SITE}/**
    ${SITE}/api/auth/callback
    http://localhost:3000/**
`);
    process.exit(1);
  }

  const url = `https://api.supabase.com/v1/projects/${REF}/config/auth`;
  const body = {
    site_url: SITE,
    uri_allow_list: [
      SITE,
      `${SITE}/**`,
      `${SITE}/api/auth/callback`,
      `${SITE}/api/auth/callback/**`,
      "http://localhost:3000",
      "http://localhost:3000/**",
      "http://localhost:3000/api/auth/callback",
    ].join(","),
    mailer_subjects_magic_link: MAGIC_SUBJECT,
    mailer_templates_magic_link_content: MAGIC_CONTENT,
  };

  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  if (!res.ok) {
    console.error("Failed to update Auth config:", res.status, text);
    process.exit(1);
  }

  console.log("Supabase Auth updated:");
  console.log(`  site_url: ${SITE}`);
  console.log(`  magic link subject: ${MAGIC_SUBJECT}`);
  console.log(`  redirect allow list includes ${SITE} and localhost`);
  console.log("\nAlso set Vercel env NEXT_PUBLIC_SITE_URL=" + SITE);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
