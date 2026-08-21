import { createHmac, timingSafeEqual } from "crypto";

/** Official Xflow webhook headers (docs.xflowpay.com — Verify events are sent from Xflow). */
export const XFLOW_WEBHOOK_ID_HEADER = "webhook-id";
export const XFLOW_WEBHOOK_TIMESTAMP_HEADER = "webhook-timestamp";
export const XFLOW_WEBHOOK_SIGNATURE_HEADER = "webhook-signature";

/** Reject events whose timestamp is older/newer than this (replay window). */
export const XFLOW_WEBHOOK_MAX_SKEW_SECONDS = 300;

export type XflowWebhookVerifyResult =
  | { ok: true; webhookId: string; timestamp: number }
  | { ok: false; reason: "missing_headers" | "bad_timestamp" | "bad_signature" | "no_secret" };

function header(headers: Headers, name: string): string {
  return (headers.get(name) ?? headers.get(name.replace(/-/g, "_")) ?? "").trim();
}

function parseSignatures(headerValue: string): string[] {
  // "v1,<sig> v1,<other>" — space-delimited, strip version prefix.
  return headerValue
    .split(/\s+/)
    .map((part) => part.replace(/^v\d+,/i, "").trim())
    .filter(Boolean);
}

function hmacBase64(secret: string, payload: string): string {
  return createHmac("sha256", secret).update(payload, "utf8").digest("base64");
}

function hmacHex(secret: string, payload: string): string {
  return createHmac("sha256", secret).update(payload, "utf8").digest("hex");
}

function signaturesEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

/**
 * Verify an Xflow webhook per official docs:
 * signed content = `${Webhook-Id}.${Webhook-Timestamp}.${rawBody}`
 * HMAC-SHA256 with the endpoint secret; match one of the Webhook-Signature values.
 */
export function verifyXflowWebhook(
  rawBody: string,
  headers: Headers,
  secret = process.env.XFLOW_WEBHOOK_SECRET?.trim() ?? "",
  nowSeconds = Math.floor(Date.now() / 1000)
): XflowWebhookVerifyResult {
  if (!secret) return { ok: false, reason: "no_secret" };

  const webhookId = header(headers, XFLOW_WEBHOOK_ID_HEADER);
  const timestampRaw = header(headers, XFLOW_WEBHOOK_TIMESTAMP_HEADER);
  const signatureHeader = header(headers, XFLOW_WEBHOOK_SIGNATURE_HEADER);
  if (!webhookId || !timestampRaw || !signatureHeader) {
    return { ok: false, reason: "missing_headers" };
  }

  const timestamp = Number(timestampRaw);
  if (!Number.isFinite(timestamp) || timestamp <= 0) {
    return { ok: false, reason: "bad_timestamp" };
  }
  if (Math.abs(nowSeconds - timestamp) > XFLOW_WEBHOOK_MAX_SKEW_SECONDS) {
    return { ok: false, reason: "bad_timestamp" };
  }

  const toSign = `${webhookId}.${timestampRaw}.${rawBody}`;
  const expectedB64 = hmacBase64(secret, toSign);
  const expectedHex = hmacHex(secret, toSign);
  const provided = parseSignatures(signatureHeader);

  const matched = provided.some(
    (sig) => signaturesEqual(sig, expectedB64) || signaturesEqual(sig.toLowerCase(), expectedHex)
  );
  if (!matched) return { ok: false, reason: "bad_signature" };

  return { ok: true, webhookId, timestamp };
}

export function signXflowWebhookForTest(
  rawBody: string,
  webhookId: string,
  timestamp: number,
  secret: string
): { headers: Headers; signedContent: string } {
  const signedContent = `${webhookId}.${timestamp}.${rawBody}`;
  const signature = hmacBase64(secret, signedContent);
  const headers = new Headers({
    "Webhook-Id": webhookId,
    "Webhook-Timestamp": String(timestamp),
    "Webhook-Signature": `v1,${signature}`,
  });
  return { headers, signedContent };
}
