import { Resend } from "resend";
import { BRAND, siteUrl } from "@/lib/brand";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM = process.env.EMAIL_FROM ?? BRAND.emailFrom;
const SITE = siteUrl();

export async function sendLicenseKeyEmail(email: string, key: string, tier: string) {
  const downloadUrl = `${SITE}/license?email=${encodeURIComponent(email)}&key=${encodeURIComponent(key)}`;

  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping email send. License key:", key, "URL:", downloadUrl);
    return;
  }

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Your Foundry ${tier} kit is ready to download`,
    text: `Thanks for buying Foundry (${tier}).

License key: ${key}

Download your zip (automatic, no waiting on us):
${downloadUrl}

Or open ${SITE}/license and paste your email + key.

Inside the zip:
1. Open the foundry-kit folder
2. Copy env.example (or .env.example) → .env
3. npm install && npx prisma db push && npm run dev

— ${BRAND.name}`,
  });
}

export async function sendWelcomeEmail(email: string, tier: string) {
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping welcome email for", email);
    return;
  }
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Welcome to ${BRAND.name} Vault`,
    text: `You're in on the ${tier} tier.

Sign in with this same email: ${SITE}/login
Then open the Vault: ${SITE}/vault

Export the scoreboard anytime (Operator+): ${SITE}/api/vault/export

— ${BRAND.name}`,
  });
}
