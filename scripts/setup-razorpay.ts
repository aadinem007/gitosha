/**
 * Creates Razorpay subscription plans for Vault Pro / Team.
 *
 * Usage:
 *   RAZORPAY_KEY_ID=rzp_test_xxx RAZORPAY_KEY_SECRET=xxx npx tsx scripts/setup-razorpay.ts
 */
import Razorpay from "razorpay";

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (!keyId || !keySecret) {
  console.error("Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET first.");
  process.exit(1);
}

const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

async function main() {
  console.log("Creating Razorpay plans...\n");

  const vaultPro = await razorpay.plans.create({
    period: "monthly",
    interval: 1,
    item: {
      name: "Shipyard Vault Pro",
      amount: 149900,
      currency: "INR",
      description: "Full scored opportunity database + weekly teardowns",
    },
  });

  const vaultTeam = await razorpay.plans.create({
    period: "monthly",
    interval: 1,
    item: {
      name: "Shipyard Vault Team",
      amount: 599900,
      currency: "INR",
      description: "5 seats, private idea requests, priority queue",
    },
  });

  console.log("✅ Done. Paste these into Vercel Environment Variables:\n");
  console.log(`RAZORPAY_KEY_ID=${keyId}`);
  console.log(`RAZORPAY_KEY_SECRET=${keySecret}`);
  console.log(`RAZORPAY_PLAN_VAULT_PRO=${vaultPro.id}`);
  console.log(`RAZORPAY_PLAN_VAULT_TEAM=${vaultTeam.id}`);
  console.log(`NEXT_PUBLIC_SITE_URL=https://shipyard-omega-opal.vercel.app`);
  console.log("\nThen add webhook at:");
  console.log("  https://shipyard-omega-opal.vercel.app/api/razorpay/webhook");
  console.log(
    "Events: payment.captured, subscription.activated, subscription.charged, subscription.cancelled, subscription.halted"
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
