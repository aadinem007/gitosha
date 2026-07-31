import { Resend } from "resend";
import { BRAND, siteUrl } from "@/lib/brand";
import { redactSecrets } from "@/lib/secure";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM = process.env.EMAIL_FROM ?? BRAND.emailFrom;
const SITE = siteUrl();

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

/** Branded magic-link email — never uses Supabase’s “Supabase Auth” template. */
export async function sendMagicLinkEmail(email: string, actionLink: string): Promise<boolean> {
  if (!resend) {
    console.warn("RESEND_API_KEY not set — cannot send branded magic link");
    return false;
  }

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Sign in to ${BRAND.name}`,
    text: `Sign in to ${BRAND.name}

Open this link to finish signing in (expires in about an hour):
${actionLink}

If you didn’t request this, ignore this email.

— ${BRAND.name}
${SITE}`,
    html: `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f3f3ee;font-family:DM Sans,Helvetica,Arial,sans-serif;color:#0a0a0a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f3ee;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:480px;background:#ffffff;border:2px solid #0a0a0a;box-shadow:6px 6px 0 #0a0a0a;">
          <tr>
            <td style="background:#c8ff00;padding:18px 24px;border-bottom:2px solid #0a0a0a;">
              <p style="margin:0;font-size:22px;font-weight:800;letter-spacing:0.04em;text-transform:uppercase;">${BRAND.name}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 24px 12px;">
              <h1 style="margin:0 0 12px;font-size:26px;line-height:1.2;">Sign in to ${BRAND.name}</h1>
              <p style="margin:0 0 20px;font-size:15px;line-height:1.55;color:#1f1f1c;">
                Click below to finish signing in. This link expires in about an hour.
              </p>
              <a href="${actionLink}" style="display:inline-block;background:#c8ff00;color:#0a0a0a;font-weight:800;font-size:14px;letter-spacing:0.08em;text-transform:uppercase;text-decoration:none;padding:14px 22px;border:2px solid #0a0a0a;box-shadow:4px 4px 0 #0a0a0a;">
                Sign in to ${BRAND.name}
              </a>
              <p style="margin:22px 0 0;font-size:12px;line-height:1.5;color:#5a5a52;">
                If you didn’t request this, ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 24px 24px;font-size:12px;color:#5a5a52;">— ${BRAND.name}</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  });

  return true;
}

export async function sendLicenseKeyEmail(email: string, key: string, tier: string) {
  const downloadUrl = `${SITE}/license?email=${encodeURIComponent(email)}&key=${encodeURIComponent(key)}`;

  if (!resend) {
    console.warn(
      "RESEND_API_KEY not set — skipping email send.",
      redactSecrets(`License key: ${key} URL: ${downloadUrl}`)
    );
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
Then open the Vault: ${SITE}/research

Export the scoreboard anytime (Operator+): ${SITE}/api/vault/export

— ${BRAND.name}`,
  });
}

/** Receipt email — never includes card numbers or payment secrets. */
export async function sendReceiptEmail(opts: {
  email: string;
  planName: string;
  product: string;
  amountLabel: string;
  currency: string;
  provider: string;
  licenseKey?: string;
  transactionId?: string;
  invoiceId?: string;
}): Promise<boolean> {
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping receipt email for", opts.email);
    return false;
  }

  const receiptUrl = opts.transactionId
    ? `${SITE}/account/receipts/${opts.transactionId}`
    : `${SITE}/license`;
  const invoiceUrl = opts.invoiceId
    ? `${SITE}/account/invoices/${opts.invoiceId}`
    : "";

  await resend.emails.send({
    from: FROM,
    to: opts.email,
    subject: `Receipt — ${opts.planName} · ${BRAND.name}`,
    text: `Payment receipt from ${BRAND.name}

Plan: ${opts.planName}
Product: ${opts.product}
Amount: ${opts.amountLabel} (${opts.currency})
Provider: ${opts.provider}
${opts.licenseKey ? `License key: ${opts.licenseKey}\n` : ""}
View / download receipt: ${receiptUrl}
${invoiceUrl ? `Formal invoice: ${invoiceUrl}\n` : ""}License portal: ${SITE}/license
Refund policy: ${SITE}/legal/refunds

No card details are stored by ${BRAND.name} — checkout is hosted by the payment provider.

— ${BRAND.name}
${SITE}`,
  });
  return true;
}
