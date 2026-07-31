import type Stripe from "stripe";
import { fulfillPurchase, isFulfillablePlanId } from "@/lib/fulfill";
import {
  getStripe,
  isStripeConfigured,
  stripePriceEnvForPlan,
  STRIPE_PRICE_IDS,
} from "@/lib/stripe";
import { PaymentServiceError, paymentsLog } from "../errors";
import type { PaymentProvider } from "../provider";
import type {
  ParseWebhookResult,
  ProviderPublicConfig,
  VerifyPaymentInput,
  VerifyPaymentResult,
} from "../types";
import { formatMoney, siteUrl } from "../currencies";

function credentialsOk(): boolean {
  return isStripeConfigured();
}

export const stripeProvider: PaymentProvider = {
  id: "stripe",

  isLiveReady() {
    return credentialsOk();
  },

  getPublicConfig(): ProviderPublicConfig {
    return {
      providerId: "stripe",
      enabled: process.env.PAYMENTS_STRIPE_ENABLED !== "false",
      credentialsConfigured: credentialsOk(),
      supportedCurrencies: ["USD", "EUR"],
      secretEnvVars: [
        "STRIPE_SECRET_KEY",
        "STRIPE_WEBHOOK_SECRET",
        "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
      ],
      supportsCheckout: true,
      capability: "checkout",
    };
  },

  async createCheckout(input) {
    if (!this.isLiveReady()) {
      throw new PaymentServiceError("unavailable", 500);
    }
    const stripe = getStripe();
    const priceKey = stripePriceEnvForPlan(input.planId);
    const priceId = priceKey ? STRIPE_PRICE_IDS[priceKey] : "";
    const currency = input.currency.toLowerCase();

    const lineItems = priceId
      ? [{ price: priceId, quantity: 1 }]
      : [
          {
            quantity: 1,
            price_data: {
              currency,
              unit_amount: input.amount,
              product_data: {
                name: `Gitosha ${input.planName}`,
                description: input.planDescription.slice(0, 400),
              },
              ...(input.mode === "subscription"
                ? { recurring: { interval: "month" as const } }
                : {}),
            },
          },
        ];

    const session = await stripe.checkout.sessions.create({
      mode: input.mode === "subscription" ? "subscription" : "payment",
      customer_email: input.email,
      line_items: lineItems,
      success_url: `${siteUrl()}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl()}/pricing`,
      metadata: {
        planId: input.planId,
        product: input.product,
        email: input.email,
      },
      ...(input.mode === "subscription"
        ? {
            subscription_data: {
              metadata: { planId: input.planId, product: input.product, email: input.email },
            },
          }
        : {
            payment_intent_data: {
              metadata: { planId: input.planId, product: input.product, email: input.email },
            },
          }),
    });

    if (!session.url) {
      throw new PaymentServiceError("generic", 500, "Could not start checkout.");
    }

    return {
      provider: "stripe",
      mode: input.mode,
      planId: input.planId,
      product: input.product,
      email: input.email,
      amount: input.amount,
      currency: input.currency,
      chargeLabel: formatMoney(input.amount, input.currency),
      url: session.url,
      sessionId: session.id,
    };
  },

  async verifyPayment(data: VerifyPaymentInput): Promise<VerifyPaymentResult> {
    if (!this.isLiveReady()) throw new PaymentServiceError("unavailable", 500);
    if (!data.sessionId) throw new PaymentServiceError("generic", 400, "Invalid request");

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(data.sessionId);

    if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
      throw new PaymentServiceError("not_paid", 400);
    }

    const email = (
      session.metadata?.email ||
      session.customer_email ||
      session.customer_details?.email ||
      ""
    ).toLowerCase();
    const planId = session.metadata?.planId;
    if (!email || !planId) throw new PaymentServiceError("metadata_mismatch", 400);
    if (!isFulfillablePlanId(planId)) {
      paymentsLog("verify_unknown_plan", { provider: "stripe", planId: planId.slice(0, 64) });
      throw new PaymentServiceError("unknown_plan", 400);
    }

    const paymentIntent =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;
    const subscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id;
    const customerId =
      typeof session.customer === "string" ? session.customer : session.customer?.id;

    const result = await fulfillPurchase({
      email,
      planId,
      paymentId: paymentIntent ?? session.id,
      orderId: session.id,
      subscriptionId,
      customerId,
      provider: "stripe",
    });
    if (result.product === "unknown") throw new PaymentServiceError("unknown_plan", 400);

    return {
      ok: true,
      product: result.product,
      email,
      licenseKey: result.licenseKey,
      planId,
      provider: "stripe",
      currency: "USD",
      amount: session.amount_total ?? undefined,
    };
  },

  async parseWebhook(rawBody: string, headers: Headers): Promise<ParseWebhookResult> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return { ok: false, error: "Unavailable", status: 503 };
    }
    const signature = headers.get("stripe-signature");
    if (!signature) {
      paymentsLog("webhook_missing_signature", { provider: "stripe" });
      return { ok: false, error: "Invalid signature", status: 400 };
    }

    let event: Stripe.Event;
    try {
      event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch {
      paymentsLog("webhook_bad_signature", { provider: "stripe" });
      return { ok: false, error: "Invalid signature", status: 400 };
    }

    const eventId = event.id;

    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const session = event.data.object as Stripe.Checkout.Session;
      if (
        session.payment_status !== "paid" &&
        session.payment_status !== "no_payment_required"
      ) {
        return {
          ok: true,
          event: {
            provider: "stripe",
            eventId,
            type: "payment.failed",
            rawType: event.type,
            summary: { event: event.type, sessionId: session.id, paid: false },
          },
        };
      }
      const email = (
        session.metadata?.email ||
        session.customer_email ||
        session.customer_details?.email ||
        ""
      ).toLowerCase();
      const planId = session.metadata?.planId;
      const paymentIntent =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id;
      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id;
      const customerId =
        typeof session.customer === "string" ? session.customer : session.customer?.id;

      return {
        ok: true,
        event: {
          provider: "stripe",
          eventId,
          type: "checkout.completed",
          rawType: event.type,
          email: email || undefined,
          planId,
          paymentId: paymentIntent ?? session.id,
          orderId: session.id,
          subscriptionId,
          customerId,
          amount: session.amount_total ?? undefined,
          currency: "USD",
          summary: {
            event: event.type,
            sessionId: session.id,
            planId: planId ?? null,
          },
        },
      };
    }

    if (event.type === "checkout.session.async_payment_failed") {
      const session = event.data.object as Stripe.Checkout.Session;
      return {
        ok: true,
        event: {
          provider: "stripe",
          eventId,
          type: "payment.failed",
          rawType: event.type,
          orderId: session.id,
          summary: { event: event.type, sessionId: session.id },
        },
      };
    }

    if (
      event.type === "customer.subscription.deleted" ||
      event.type === "customer.subscription.paused"
    ) {
      const sub = event.data.object as Stripe.Subscription;
      return {
        ok: true,
        event: {
          provider: "stripe",
          eventId,
          type: "subscription.canceled",
          rawType: event.type,
          subscriptionId: sub.id,
          cancelSubscription: true,
          summary: { event: event.type, subscriptionId: sub.id },
        },
      };
    }

    return {
      ok: true,
      event: {
        provider: "stripe",
        eventId,
        type: "unknown",
        rawType: event.type,
        summary: { event: event.type },
      },
    };
  },

  async refund(input) {
    const stripe = getStripe();
    const refund = await stripe.refunds.create({
      payment_intent: input.providerRef,
      amount: input.amount,
      reason: "requested_by_customer",
      metadata: input.reason ? { note: input.reason.slice(0, 200) } : undefined,
    });
    return {
      providerRef: refund.id,
      amount: refund.amount,
      status: refund.status === "succeeded" ? ("succeeded" as const) : ("pending" as const),
    };
  },
};
