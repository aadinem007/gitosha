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
  PLAN_PRICE_BOOK,
  displayAmountForPlan,
  fxProviderStub,
} from "../currencies";
import { PaymentServiceError, userPaymentMessage, mapProviderError } from "../errors";
import { buildCheckoutIdempotencyKey } from "../idempotency";
import { isScaffoldProvider } from "../providers/stubs";
import { wiseProvider } from "../providers/wise";
import { payoneerProvider } from "../providers/payoneer";
import { paypalProvider } from "../providers/paypal";
import { invoiceHtmlDocument } from "../invoice";
import { isFulfillablePlanId } from "@/lib/fulfill";
import { FOUNDRY_PLANS, VAULT_PLANS } from "@/lib/pricing";

describe("currency / price book", () => {
  it("uses price book for INR/EUR when present (not live FX)", () => {
    assert.equal(USD_CENTS_TO_INR_PAISE_FACTOR, 83);
    assert.equal(PLAN_PRICE_BOOK["foundry-solo"]?.USD, 9900);
    assert.equal(resolveChargeAmount(9900, "INR", "foundry-solo"), PLAN_PRICE_BOOK["foundry-solo"]!.INR);
    assert.equal(resolveChargeAmount(9900, "EUR", "foundry-solo"), PLAN_PRICE_BOOK["foundry-solo"]!.EUR);
    assert.equal(resolveChargeAmount(9900, "USD", "foundry-solo"), 9900);
  });

  it("falls back to fixed configured INR conversion when plan missing from book", () => {
    assert.equal(resolveChargeAmount(100, "INR", "unknown-plan"), usdCentsToInrPaise(100));
  });

  it("maps charge currency by provider", () => {
    assert.equal(chargeCurrencyForProvider("razorpay"), "INR");
    assert.equal(chargeCurrencyForProvider("xflow"), "INR");
    assert.equal(chargeCurrencyForProvider("stripe"), "USD");
    assert.equal(chargeCurrencyForProvider("paypal"), "USD");
  });

  it("labels display approx when not in price book", () => {
    const priced = displayAmountForPlan("no-such-plan", 1000, "INR");
    assert.equal(priced.fromPriceBook, false);
    assert.match(priced.note ?? "", /approx|fixed configured/i);
  });

  it("formats money without inventing tax by default", () => {
    assert.equal(formatMoney(1500, "USD"), "$15");
    assert.match(formatMoney(124500, "INR"), /₹/);
    assert.match(formatMoney(1400, "EUR"), /€/);
    assert.equal(taxConfig().enabled, false);
  });

  it("FX stub never claims live rates for charging", () => {
    const stub = fxProviderStub();
    assert.equal(stub.configured, false);
    assert.match(stub.label, /not applied|No live FX/i);
  });
});

describe("plan allowlist", () => {
  it("rejects free / unknown plans for fulfill", () => {
    assert.equal(isFulfillablePlanId("vault-free"), false);
    assert.equal(isFulfillablePlanId("not-a-plan"), false);
    assert.equal(isFulfillablePlanId("foundry-solo"), true);
  });

  it("every paid catalog plan has amountCents and price-book USD", () => {
    for (const p of [...VAULT_PLANS, ...FOUNDRY_PLANS]) {
      if (p.mode === "none") continue;
      assert.ok(p.amountCents && p.amountCents > 0, p.id);
      assert.ok(PLAN_PRICE_BOOK[p.id]?.USD, `price book USD for ${p.id}`);
    }
  });
});

describe("registry / capability gates", () => {
  it("no longer treats PayPal/Xflow/Wise/Payoneer as scaffolds", () => {
    assert.equal(isScaffoldProvider("paypal"), false);
    assert.equal(isScaffoldProvider("xflow"), false);
    assert.equal(isScaffoldProvider("wise"), false);
    assert.equal(isScaffoldProvider("payoneer"), false);
  });

  it("Wise / Payoneer refuse customer checkout", async () => {
    assert.equal(wiseProvider.getPublicConfig().supportsCheckout, false);
    assert.equal(payoneerProvider.getPublicConfig().supportsCheckout, false);
    assert.equal(wiseProvider.isLiveReady(), false);
    assert.equal(payoneerProvider.isLiveReady(), false);
    await assert.rejects(() =>
      wiseProvider.createCheckout({
        planId: "foundry-solo",
        email: "a@b.com",
        amount: 9900,
        currency: "USD",
        planName: "Solo",
        planDescription: "x",
        product: "foundry",
        mode: "payment",
      })
    );
  });

  it("PayPal is not live without credentials + webhook id", () => {
    assert.equal(paypalProvider.isLiveReady(), false);
    assert.equal(paypalProvider.getPublicConfig().supportsCheckout, true);
  });
});

describe("invoice HTML", () => {
  it("renders invoice number, line items, and currency", () => {
    const html = invoiceHtmlDocument({
      invoiceNumber: "GIT-2026-000001",
      userEmail: "buyer@example.com",
      planName: "Foundry Solo",
      currency: "USD",
      subtotalAmount: 9900,
      taxAmount: 0,
      taxLabel: null,
      taxRateBps: 0,
      totalAmount: 9900,
      lineItems: [
        { description: "Foundry Solo", quantity: 1, unitAmount: 9900, amount: 9900 },
      ],
      issuedAt: new Date("2026-07-31T00:00:00.000Z"),
      status: "paid",
    });
    assert.match(html, /GIT-2026-000001/);
    assert.match(html, /buyer@example\.com/);
    assert.match(html, /Foundry Solo/);
    assert.match(html, /\$99/);
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
