/**
 * Payment service layer unit tests (node:test + tsx).
 * No live charges.
 *
 * Run: npx tsx --test src/lib/payments/__tests__/payments.test.ts
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

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
import { invoiceHtmlDocument } from "../invoice";
import { isFulfillablePlanId } from "@/lib/fulfill";
import { FOUNDRY_PLANS, VAULT_PLANS } from "@/lib/pricing";
import { getPaymentsProvider } from "../registry";
import { mapXflowIntentStatus, xflowIntentIsPaid } from "../xflow-status";
import { paiseToMajor, xflowProvider } from "../providers/xflow";

describe("currency / price book", () => {
  it("uses price book for INR when present (not live FX)", () => {
    assert.equal(USD_CENTS_TO_INR_PAISE_FACTOR, 83);
    assert.equal(PLAN_PRICE_BOOK["foundry-solo"]?.USD, 9900);
    assert.equal(resolveChargeAmount(9900, "INR", "foundry-solo"), PLAN_PRICE_BOOK["foundry-solo"]!.INR);
    assert.equal(resolveChargeAmount(9900, "USD", "foundry-solo"), 9900);
  });

  it("falls back to fixed configured INR conversion when plan missing from book", () => {
    assert.equal(resolveChargeAmount(100, "INR", "unknown-plan"), usdCentsToInrPaise(100));
  });

  it("charges INR for Xflow only", () => {
    assert.equal(chargeCurrencyForProvider("xflow"), "INR");
    assert.equal(getPaymentsProvider(), "xflow");
  });

  it("labels display approx when not in price book", () => {
    const priced = displayAmountForPlan("no-such-plan", 1000, "INR");
    assert.equal(priced.fromPriceBook, false);
    assert.match(priced.note ?? "", /approx|fixed configured/i);
  });

  it("formats money without inventing tax by default", () => {
    assert.equal(formatMoney(1500, "USD"), "$15");
    assert.match(formatMoney(124500, "INR"), /₹/);
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

  it("every paid catalog plan has amountCents and price-book USD + INR", () => {
    for (const p of [...VAULT_PLANS, ...FOUNDRY_PLANS]) {
      if (p.mode === "none") continue;
      assert.ok(p.amountCents && p.amountCents > 0, p.id);
      assert.ok(PLAN_PRICE_BOOK[p.id]?.USD, `price book USD for ${p.id}`);
      assert.ok(PLAN_PRICE_BOOK[p.id]?.INR, `price book INR for ${p.id}`);
    }
  });
});

describe("Xflow status mapping", () => {
  it("maps documented intent statuses only", () => {
    assert.equal(mapXflowIntentStatus("successful"), "succeeded");
    assert.equal(mapXflowIntentStatus("completed"), "succeeded");
    assert.equal(mapXflowIntentStatus("processing"), "processing");
    assert.equal(mapXflowIntentStatus("expired"), "canceled");
    assert.equal(mapXflowIntentStatus("failed"), "failed");
    assert.equal(mapXflowIntentStatus("mystery"), "pending");
    assert.equal(xflowIntentIsPaid("successful"), true);
    assert.equal(xflowIntentIsPaid("processing"), false);
  });

  it("formats paise as Xflow major INR", () => {
    assert.equal(paiseToMajor(821700), "8217.00");
  });
});

describe("invoice HTML", () => {
  it("renders invoice number, line items, and currency", () => {
    const html = invoiceHtmlDocument({
      invoiceNumber: "GIT-2026-000001",
      userEmail: "buyer@example.com",
      planName: "Foundry Solo",
      currency: "INR",
      subtotalAmount: 821700,
      taxAmount: 0,
      taxLabel: null,
      taxRateBps: 0,
      totalAmount: 821700,
      lineItems: [
        { description: "Foundry Solo", quantity: 1, unitAmount: 821700, amount: 821700 },
      ],
      issuedAt: new Date("2026-07-31T00:00:00.000Z"),
      status: "paid",
    });
    assert.match(html, /GIT-2026-000001/);
    assert.match(html, /buyer@example\.com/);
    assert.match(html, /Foundry Solo/);
  });
});

describe("idempotency keys", () => {
  it("prefers client key when well-formed", () => {
    const k = buildCheckoutIdempotencyKey({
      email: "a@b.com",
      planId: "foundry-solo",
      provider: "xflow",
      clientKey: "client-stable-key-01",
    });
    assert.equal(k, "client:client-stable-key-01");
  });

  it("derives stable auto key within window", () => {
    const a = buildCheckoutIdempotencyKey({
      email: "a@b.com",
      planId: "foundry-solo",
      provider: "xflow",
    });
    const b = buildCheckoutIdempotencyKey({
      email: "a@b.com",
      planId: "foundry-solo",
      provider: "xflow",
    });
    assert.equal(a, b);
    assert.match(a, /^auto:/);
  });
});

describe("error mapping", () => {
  it("maps declines / timeouts / config errors safely", () => {
    assert.equal(mapProviderError(new Error("card_declined")).code, "declined");
    assert.equal(mapProviderError(new Error("ETIMEDOUT")).code, "timeout");
    assert.equal(mapProviderError(new Error("XFLOW_API_KEY must be set")).code, "unavailable");
    assert.equal(userPaymentMessage("invalid_signature"), "Payment verification failed.");
  });

  it("PaymentServiceError carries http status", () => {
    const e = new PaymentServiceError("unknown_plan", 400);
    assert.equal(e.httpStatus, 400);
    assert.equal(e.code, "unknown_plan");
  });
});

describe("Xflow-only adapter gates", () => {
  it("is not live without server credentials", () => {
    assert.equal(xflowProvider.isLiveReady(), false);
    assert.equal(xflowProvider.id, "xflow");
    assert.deepEqual(xflowProvider.getPublicConfig().supportedCurrencies, ["INR"]);
  });

  it("does not fake refunds", async () => {
    await assert.rejects(
      () =>
        xflowProvider.refund({
          providerRef: "transaction_intent_test",
          amount: 100,
          currency: "INR",
        }),
      (err: unknown) =>
        err instanceof PaymentServiceError && err.code === "refund_failed" && err.httpStatus === 501
    );
  });

  it("every paid plan is fulfillable and has an INR book price for Xflow", () => {
    for (const p of [...VAULT_PLANS, ...FOUNDRY_PLANS]) {
      if (p.mode === "none") continue;
      assert.equal(isFulfillablePlanId(p.id), true, p.id);
      assert.ok((PLAN_PRICE_BOOK[p.id]?.INR ?? 0) > 0, p.id);
    }
  });
});
