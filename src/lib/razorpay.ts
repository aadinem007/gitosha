import Razorpay from "razorpay";

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if ((!keyId || !keySecret) && process.env.NODE_ENV === "production") {
  throw new Error("RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set");
}

export const razorpay = new Razorpay({
  key_id: keyId ?? "rzp_test_placeholder",
  key_secret: keySecret ?? "placeholder",
});

export const RAZORPAY_KEY_ID = keyId ?? "";

/** Plan IDs created once in Razorpay (or via npm run setup-razorpay). */
export const PLAN_IDS = {
  vaultPro: process.env.RAZORPAY_PLAN_VAULT_PRO ?? "",
  vaultTeam: process.env.RAZORPAY_PLAN_VAULT_TEAM ?? "",
} as const;
