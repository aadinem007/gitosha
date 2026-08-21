import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  signXflowWebhookForTest,
  verifyXflowWebhook,
  XFLOW_WEBHOOK_MAX_SKEW_SECONDS,
} from "../xflow-webhook";

const SECRET = "webhook_secret_test_unit_only";

describe("Xflow webhook signatures (official docs)", () => {
  it("accepts a valid v1 HMAC-SHA256 signature", () => {
    const body = JSON.stringify({
      id: "evt_test_1",
      type: "transaction_intent.status.successful",
      linked_id: "transaction_intent_test",
    });
    const now = Math.floor(Date.now() / 1000);
    const { headers } = signXflowWebhookForTest(body, "msg_1", now, SECRET);
    const result = verifyXflowWebhook(body, headers, SECRET, now);
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.webhookId, "msg_1");
  });

  it("rejects a tampered body", () => {
    const body = '{"type":"transaction_intent.status.successful"}';
    const now = Math.floor(Date.now() / 1000);
    const { headers } = signXflowWebhookForTest(body, "msg_2", now, SECRET);
    const result = verifyXflowWebhook(body + " ", headers, SECRET, now);
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.reason, "bad_signature");
  });

  it("rejects missing headers", () => {
    const result = verifyXflowWebhook("{}", new Headers(), SECRET);
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.reason, "missing_headers");
  });

  it("rejects replay outside timestamp tolerance", () => {
    const body = "{}";
    const now = Math.floor(Date.now() / 1000);
    const stale = now - (XFLOW_WEBHOOK_MAX_SKEW_SECONDS + 30);
    const { headers } = signXflowWebhookForTest(body, "msg_replay", stale, SECRET);
    const result = verifyXflowWebhook(body, headers, SECRET, now);
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.reason, "bad_timestamp");
  });

  it("rejects wrong secret", () => {
    const body = "{}";
    const now = Math.floor(Date.now() / 1000);
    const { headers } = signXflowWebhookForTest(body, "msg_3", now, SECRET);
    const result = verifyXflowWebhook(body, headers, "other_secret", now);
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.reason, "bad_signature");
  });

  it("same Webhook-Id verifies twice (idempotency is recorded after verify)", () => {
    const body = '{"type":"transaction_intent.status.successful"}';
    const now = Math.floor(Date.now() / 1000);
    const { headers } = signXflowWebhookForTest(body, "msg_dup", now, SECRET);
    const first = verifyXflowWebhook(body, headers, SECRET, now);
    const second = verifyXflowWebhook(body, headers, SECRET, now);
    assert.equal(first.ok, true);
    assert.equal(second.ok, true);
    if (first.ok && second.ok) assert.equal(first.webhookId, second.webhookId);
  });
});
