import Razorpay from "razorpay";

function requireKeys() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error("RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set");
  }
  return { keyId, keySecret };
}

let client: Razorpay | null = null;

export function getRazorpay() {
  if (!client) {
    const { keyId, keySecret } = requireKeys();
    client = new Razorpay({ key_id: keyId, key_secret: keySecret });
  }
  return client;
}

/** @deprecated Prefer getRazorpay() — kept for call-site compatibility */
export const razorpay = new Proxy({} as Razorpay, {
  get(_target, prop, receiver) {
    return Reflect.get(getRazorpay() as object, prop, receiver);
  },
});

export function getRazorpayKeyId() {
  return process.env.RAZORPAY_KEY_ID ?? "";
}

export const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID ?? "";

/** Plan IDs created once in Razorpay (or via npm run setup-razorpay). */
export const PLAN_IDS = {
  vaultPro: process.env.RAZORPAY_PLAN_VAULT_PRO ?? "",
  vaultTeam: process.env.RAZORPAY_PLAN_VAULT_TEAM ?? "",
} as const;
