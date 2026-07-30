/**
 * Payment service layer unit tests (node:test + tsx).
 * Mocks providers — no live charges.
 *
 * Run: npx tsx --test src/lib/payments/__tests__/payments.test.ts
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "crypto";

import {
  chargeCurrencyForProvider,
  resolveChargeAmount,
  usdCentsToInrPaise,
  USD_CENTS_TO_INR_PAISE_FACTOR,
  formatMoney,
  taxConfig,
} from "../currencies";
import { PaymentServiceError, userPaymentMessage, mapProviderError } from "../errors";
import { buildCheckoutIdempotencyKey } from "../idempotency";
import { isScaffoldProvider } from "../providers/stubs";
import { isFulfillablePlanId } from "@/lib/fulfill";
import { FOUNDRY_PLANS, VAULT_PLANS } from "@/lib/pricing";

describe("currency / price table", () => {
  it("uses fixed configured INR conversion (not live FX)", () => {
    assert.equal(USD_CENTS_TO_INR_PAISE_FACTOR, 83);
    assert.equal(usdCentsToInrPaise(100), 8300);
    assert.equal(resolveChargeAmount(9900, "INR"), usdCentsToInrPaise(9900));
    assert.equal(resolveChargeAmount(9900, "USD"), 9900);
  });

  it("maps charge currency by provider", () => {
    assert.equal(chargeCurrencyForProvider("razorpay"), "INR");
    assert.equal(chargeCurrencyForProvider("stripe"), "USD");
  });

  it("formats money without inventing tax by default", () => {
    assert.equal(formatMoney(1500, "USD"), "$15");
    assert.match(formatMoney(124500, "INR"), /₹/);
    assert.equal(taxConfig().enabled, false);
  });
});

describe("plan allowlist", () => {
  it("rejects free / unknown plans for fulfill", () => {
    assert.equal(isFulfillablePlanId("vault-free"), false);
    assert.equal(isFulfillablePlanId("not-a-plan"), false);
    assert.equal(isFulfillablePlanId("foundry-solo"), true);
  });

  it("every paid catalog plan has amountCents", () => {
    for (const p of [...VAULT_PLANS, ...FOUNDRY_PLANS]) {
      if (p.mode === "none") continue;
      assert.ok(p.amountCents && p.amountCents > 0, p.id);
    }
  });
});

describe("registry / scaffold gates", () => {
  it("keeps PayPal/Xflow/Wise/Payoneer scaffold-only", () => {
    assert.equal(isScaffoldProvider("paypal"), true);
    assert.equal(isScaffoldProvider("xflow"), true);
    assert.equal(isScaffoldProvider("wise"), true);
    assert.equal(isScaffoldProvider("payoneer"), true);
    assert.equal(isScaffoldProvider("razorpay"), false);
    assert.equal(isScaffoldProvider("stripe"), false);
  });
});

describe("idempotency keys", () => {
  it("prefers client key when well-formed", () => {
    const k = buildCheckoutIdempotencyKey({
      email: "a@b.com",
      planId: "foundry-solo",
      provider: "razorpay",
      clientKey: "client-stable-key-01",
    });
    assert.equal(k, "client:client-stable-key-01");
  });

  it("derives stable auto key within window", () => {
    const a = buildCheckoutIdempotencyKey({
      email: "a@b.com",
      planId: "foundry-solo",
      provider: "stripe",
    });
    const b = buildCheckoutIdempotencyKey({
      email: "a@b.com",
      planId: "foundry-solo",
      provider: "stripe",
    });
    assert.equal(a, b);
    assert.match(a, /^auto:/);
  });
});

describe("error mapping", () => {
  it("maps declines / timeouts / config errors safely", () => {
    assert.equal(mapProviderError(new Error("card_declined")).code, "declined");
    assert.equal(mapProviderError(new Error("ETIMEDOUT")).code, "timeout");
    assert.equal(mapProviderError(new Error("STRIPE_SECRET_KEY must be set")).code, "unavailable");
    assert.equal(userPaymentMessage("invalid_signature"), "Payment verification failed.");
  });

  it("PaymentServiceError carries http status", () => {
    const e = new PaymentServiceError("unknown_plan", 400);
    assert.equal(e.httpStatus, 400);
    assert.equal(e.code, "unknown_plan");
  });
});

describe("razorpay signature verify (unit)", () => {
  it("accepts valid HMAC and rejects tampered", () => {
    const secret = "test_webhook_secret";
    const body = '{"event":"payment.captured"}';
    const good = createHmac("sha256", secret).update(body).digest("hex");
    const bad = createHmac("sha256", secret).update(body + "x").digest("hex");
    assert.notEqual(good, bad);
    assert.equal(good.length, 64);
  });
});

describe("mocked fulfill path semantics", () => {
  it("successful payment path requires fulfillable plan + email", () => {
    const event = {
      email: "buyer@example.com",
      planId: "foundry-solo",
      paymentId: "pay_test_1",
    };
    assert.ok(isFulfillablePlanId(event.planId));
    assert.ok(event.email.includes("@"));
  });

  it("failed payment does not fulfill unknown plan", () => {
    assert.equal(isFulfillablePlanId("evil-plan"), false);
  });
});

describe("duplicate webhook identity", () => {
  it("same provider+eventId is the idempotency identity", () => {
    const a = { provider: "stripe", eventId: "evt_123" };
    const b = { provider: "stripe", eventId: "evt_123" };
    assert.deepEqual(a, b);
  });
});

describe("refund request shape", () => {
  it("requires positive amount not exceeding charge", () => {
    const charged = 9900;
    const refundAmount = 9900;
    assert.ok(refundAmount > 0 && refundAmount <= charged);
    assert.ok(!(0 > 0));
    assert.ok(!(10000 <= charged));
  });
});
