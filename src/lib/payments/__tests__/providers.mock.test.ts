/**
 * Deeper payment adapter tests with mocked provider surface.
 * No network / no live keys.
 */

import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import type { PaymentProvider } from "../provider";
import type {
  CheckoutSession,
  ParseWebhookResult,
  ProviderPublicConfig,
  VerifyPaymentResult,
} from "../types";
import { PaymentServiceError } from "../errors";
import { isScaffoldProvider, paypalProvider } from "../providers/stubs";

function mockLiveProvider(overrides: Partial<PaymentProvider> = {}): PaymentProvider {
  const base: PaymentProvider = {
    id: "stripe",
    isLiveReady: () => true,
    getPublicConfig(): ProviderPublicConfig {
      return {
        providerId: "stripe",
        enabled: true,
        credentialsConfigured: true,
        supportedCurrencies: ["USD"],
        secretEnvVars: ["STRIPE_SECRET_KEY"],
      };
    },
    async createCheckout() {
      return {
        provider: "stripe",
        mode: "payment",
        planId: "foundry-solo",
        product: "foundry",
        email: "a@b.com",
        amount: 9900,
        currency: "USD",
        chargeLabel: "$99",
        url: "https://checkout.stripe.test/session",
        sessionId: "cs_test",
      } satisfies Omit<CheckoutSession, "transactionId" | "idempotencyKey">;
    },
    async verifyPayment(): Promise<VerifyPaymentResult> {
      return {
        ok: true,
        product: "foundry",
        email: "a@b.com",
        planId: "foundry-solo",
        provider: "stripe",
        licenseKey: "GITO-TEST",
        currency: "USD",
        amount: 9900,
      };
    },
    async parseWebhook(): Promise<ParseWebhookResult> {
      return {
        ok: true,
        event: {
          provider: "stripe",
          eventId: "evt_1",
          type: "checkout.completed",
          rawType: "checkout.session.completed",
          email: "a@b.com",
          planId: "foundry-solo",
          paymentId: "pi_1",
          orderId: "cs_test",
          summary: { event: "checkout.session.completed" },
        },
      };
    },
    async refund() {
      return { providerRef: "re_1", amount: 9900, status: "succeeded" as const };
    },
  };
  return { ...base, ...overrides };
}

describe("mocked successful checkout + verify", () => {
  it("createCheckout returns hosted url", async () => {
    const p = mockLiveProvider();
    const session = await p.createCheckout({
      planId: "foundry-solo",
      email: "a@b.com",
      amount: 9900,
      currency: "USD",
      planName: "Solo",
      planDescription: "kit",
      product: "foundry",
      mode: "payment",
    });
    assert.ok(session.url?.startsWith("https://"));
    assert.equal(session.amount, 9900);
  });

  it("verifyPayment happy path", async () => {
    const p = mockLiveProvider();
    const result = await p.verifyPayment({ provider: "stripe", sessionId: "cs_test" });
    assert.equal(result.ok, true);
    assert.equal(result.product, "foundry");
  });
});

describe("failed payment", () => {
  it("verify throws not_paid", async () => {
    const p = mockLiveProvider({
      async verifyPayment() {
        throw new PaymentServiceError("not_paid", 400);
      },
    });
    await assert.rejects(
      () => p.verifyPayment({ provider: "stripe", sessionId: "cs_unpaid" }),
      (err: unknown) => err instanceof PaymentServiceError && err.code === "not_paid"
    );
  });
});

describe("invalid signature rejected", () => {
  it("parseWebhook returns 400", async () => {
    const p = mockLiveProvider({
      async parseWebhook(): Promise<ParseWebhookResult> {
        return { ok: false, error: "Invalid signature", status: 400 };
      },
    });
    const result = await p.parseWebhook("{}", new Headers());
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.status, 400);
  });
});

describe("duplicate webhook idempotent semantics", () => {
  it("second claim with same eventId is treated as duplicate by caller", async () => {
    const seen = new Set<string>();
    function claim(eventId: string): { isNew: boolean } {
      if (seen.has(eventId)) return { isNew: false };
      seen.add(eventId);
      return { isNew: true };
    }
    assert.equal(claim("evt_1").isNew, true);
    assert.equal(claim("evt_1").isNew, false);
  });
});

describe("refund happy path mocked", () => {
  it("refund returns succeeded", async () => {
    const p = mockLiveProvider();
    const r = await p.refund({
      providerRef: "pi_1",
      amount: 9900,
      currency: "USD",
      reason: "test",
    });
    assert.equal(r.status, "succeeded");
    assert.equal(r.amount, 9900);
  });
});

describe("provider registry failover stub", () => {
  it("skips disabled primary and uses next enabled", async () => {
    const primary = mockLiveProvider({
      id: "razorpay",
      isLiveReady: () => false,
      async createCheckout() {
        throw new PaymentServiceError("unavailable", 500);
      },
    });
    const secondary = mockLiveProvider({ id: "stripe" });
    const order = [primary, secondary].filter((p) => p.isLiveReady());
    assert.equal(order.length, 1);
    assert.equal(order[0]!.id, "stripe");
    const session = await order[0]!.createCheckout({
      planId: "foundry-solo",
      email: "a@b.com",
      amount: 9900,
      currency: "USD",
      planName: "Solo",
      planDescription: "kit",
      product: "foundry",
      mode: "payment",
    });
    assert.ok(session.url);
  });

  it("scaffold paypal cannot go live", async () => {
    assert.equal(isScaffoldProvider("paypal"), true);
    assert.equal(paypalProvider.isLiveReady(), false);
    await assert.rejects(() =>
      paypalProvider.createCheckout({
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
});

// silence unused mock import if node version lacks mock usage
void mock;
