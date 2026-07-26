/**
 * Creates Stripe Products + Prices for Gitosha USD plans.
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_test_xxx npm run setup-stripe
 *
 * Paste the printed STRIPE_PRICE_* vars into .env / Vercel.
 */
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key || key.includes("placeholder")) {
  console.error("Set STRIPE_SECRET_KEY first (sk_test_… or sk_live_…).");
  process.exit(1);
}
const secretKey: string = key;

const stripe = new Stripe(secretKey);

type Spec = {
  envKey: string;
  productName: string;
  description: string;
  unitAmount: number;
  recurring?: { interval: "month" | "year" };
};

const SPECS: Spec[] = [
  {
    envKey: "STRIPE_PRICE_VAULT_PRO",
    productName: "Gitosha Vault Operator",
    description: "Full scored opportunity vault — launch price $15/mo (first 100)",
    unitAmount: 1500,
    recurring: { interval: "month" },
  },
  {
    envKey: "STRIPE_PRICE_VAULT_TEAM",
    productName: "Gitosha Vault Studio",
    description: "Studio research — 5 seats, $49/mo",
    unitAmount: 4900,
    recurring: { interval: "month" },
  },
  {
    envKey: "STRIPE_PRICE_VAULT_PRO_ANNUAL",
    productName: "Gitosha Vault Operator Annual",
    description: "Operator access for 12 months — $149 one-time",
    unitAmount: 14900,
  },
  {
    envKey: "STRIPE_PRICE_FOUNDRY_SOLO",
    productName: "Gitosha Foundry Solo",
    description: "Production SaaS kit — $99 one-time",
    unitAmount: 9900,
  },
  {
    envKey: "STRIPE_PRICE_FOUNDRY_AGENCY",
    productName: "Gitosha Foundry Agency",
    description: "Agency license + templates + Studio year — $249 one-time",
    unitAmount: 24900,
  },
  {
    envKey: "STRIPE_PRICE_BUNDLE_LAUNCH",
    productName: "Gitosha Launch Bundle",
    description: "Foundry Solo + 12 months Operator — $149 one-time",
    unitAmount: 14900,
  },
];

async function createPrice(spec: Spec): Promise<string> {
  const product = await stripe.products.create({
    name: spec.productName,
    description: spec.description,
    metadata: { gitosha_env: spec.envKey },
  });

  const price = await stripe.prices.create({
    product: product.id,
    currency: "usd",
    unit_amount: spec.unitAmount,
    ...(spec.recurring ? { recurring: spec.recurring } : {}),
    metadata: { gitosha_env: spec.envKey },
  });

  return price.id;
}

async function main() {
  console.log("Creating Stripe products & prices (USD)...\n");

  const lines: string[] = [];
  for (const spec of SPECS) {
    const priceId = await createPrice(spec);
    const dollars = (spec.unitAmount / 100).toFixed(0);
    const cadence = spec.recurring ? `/${spec.recurring.interval}` : " one-time";
    console.log(`✓ ${spec.productName} — $${dollars}${cadence} → ${priceId}`);
    lines.push(`${spec.envKey}=${priceId}`);
  }

  console.log("\n✅ Done. Paste these into Vercel Environment Variables:\n");
  console.log("PAYMENTS_PROVIDER=stripe");
  console.log(
    `STRIPE_SECRET_KEY=${secretKey.startsWith("sk_live") ? "sk_live_…" : secretKey}`
  );
  console.log("STRIPE_WEBHOOK_SECRET=whsec_…   # from Stripe Dashboard → Webhooks");
  console.log("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_…");
  for (const line of lines) console.log(line);
  console.log("NEXT_PUBLIC_SITE_URL=https://gitosha.vercel.app");
  console.log("\nWebhook endpoint:");
  console.log("  https://gitosha.vercel.app/api/stripe/webhook");
  console.log("Events: checkout.session.completed, customer.subscription.deleted");
  console.log("\nSee marketing/STRIPE-LIVE-SETUP.md for the full click-by-click.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
