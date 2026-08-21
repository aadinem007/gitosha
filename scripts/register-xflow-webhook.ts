/**
 * Register https://gitosha.vercel.app/api/xflow/webhook with Xflow.
 * Requires XFLOW_API_KEY + XFLOW_ACCOUNT_ID in the environment.
 * Never prints secret values.
 *
 *   npx tsx scripts/register-xflow-webhook.ts
 */
const API = "https://api.xflowpay.com";
const WEBHOOK_URL = "https://gitosha.vercel.app/api/xflow/webhook";

async function registerWebhook() {
  const key = process.env.XFLOW_API_KEY?.trim() ?? "";
  const account = process.env.XFLOW_ACCOUNT_ID?.trim() ?? "";
  if (!key || !account) {
    console.error(
      "Missing XFLOW_API_KEY or XFLOW_ACCOUNT_ID. Add them in the Xflow dashboard, then Vercel env, then re-run."
    );
    process.exit(1);
  }

  const res = await fetch(`${API}/v1/webhook_endpoints`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Xflow-Account": account,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      description: "Gitosha production payments",
      enabled_events: ["transaction_intent.status.successful", "subscription.status.paused"],
      url: WEBHOOK_URL,
    }),
  });

  if (!res.ok) {
    console.error("Xflow webhook create failed.", res.status);
    process.exit(1);
  }

  const body = (await res.json()) as { id?: string; secret?: string };
  if (body.secret) {
    console.log(
      "Webhook created. Copy the endpoint secret into Vercel as XFLOW_WEBHOOK_SECRET (not printed here)."
    );
  } else {
    console.log("Webhook created. id present:", Boolean(body.id), "Use the dashboard secret as XFLOW_WEBHOOK_SECRET.");
  }
  console.log("URL:", WEBHOOK_URL);
}

registerWebhook().catch(() => {
  console.error("Webhook registration failed.");
  process.exit(1);
});
