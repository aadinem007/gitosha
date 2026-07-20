import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM = process.env.EMAIL_FROM ?? "Shipyard <hello@shipyard.build>";

export async function sendLicenseKeyEmail(email: string, key: string, tier: string) {
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping email send. License key:", key);
    return;
  }
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Your Foundry Kit license key",
    text: `Thanks for buying Foundry Kit (${tier} tier).\n\nYour license key: ${key}\n\nClone the repo and run \`npx foundry-kit init\` with this key to activate.\n\n— Shipyard`,
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
    subject: "Welcome to Shipyard Vault",
    text: `You're in on the ${tier} tier. Your first full issue lands this week — meanwhile, browse the scored database at /vault.\n\n— Shipyard`,
  });
}
