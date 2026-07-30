import { FOUNDRY_PLANS, VAULT_PLANS } from "@/lib/pricing";
import { fulfillPurchase, isFulfillablePlanId } from "@/lib/fulfill";
import { prisma } from "@/lib/prisma";
import { sendReceiptEmail } from "@/lib/email";
import {
  chargeCurrencyForProvider,
  formatMoney,
  resolveChargeAmount,
  taxConfig,
} from "./currencies";
import { PaymentServiceError, mapProviderError, paymentsLog, userPaymentMessage } from "./errors";
import { buildCheckoutIdempotencyKey, claimWebhookEvent, markWebhookProcessed } from "./idempotency";
import {
  getAdapter,
  getEnabledProvider,
  getPaymentsProvider,
  resolveCheckoutProviderOrder,
  resolveProviderConfigs,
} from "./registry";
import type {
  CheckoutSession,
  CreateCheckoutInput,
  Currency,
  PaymentEvent,
  ProviderId,
  RefundRequest,
  RefundResult,
  VerifyPaymentInput,
  VerifyPaymentResult,
} from "./types";

function findPlan(planId: string) {
  return [...VAULT_PLANS, ...FOUNDRY_PLANS].find((p) => p.id === planId);
}

/**
 * Single entry for checkout create — server price table only; never trust client amounts.
 */
export async function createCheckout(input: CreateCheckoutInput): Promise<CheckoutSession> {
  const email = input.email.toLowerCase().trim();
  const plan = findPlan(input.planId);
  if (!plan || plan.mode === "none" || !plan.amountCents) {
    throw new PaymentServiceError("unknown_plan", 400);
  }
  if (!isFulfillablePlanId(plan.id)) {
    throw new PaymentServiceError("unknown_plan", 400);
  }

  const providers = await resolveCheckoutProviderOrder(input.providerId);
  if (providers.length === 0) {
    paymentsLog("checkout_no_provider", { planId: plan.id });
    throw new PaymentServiceError("unavailable", 500);
  }

  let lastError: unknown;
  for (const provider of providers) {
    const currency = chargeCurrencyForProvider(provider.id);
    if (input.displayCurrency && input.displayCurrency !== currency) {
      // Display preference is informational only — charge currency follows provider
      paymentsLog("checkout_display_currency_note", {
        display: input.displayCurrency,
        charge: currency,
        provider: provider.id,
      });
    }

    const amount = resolveChargeAmount(plan.amountCents, currency);
    const idempotencyKey = buildCheckoutIdempotencyKey({
      email,
      planId: plan.id,
      provider: provider.id,
      clientKey: input.idempotencyKey,
    });

    // Reuse pending transaction with same idempotency key when possible
    try {
      const existing = await prisma.paymentTransaction.findUnique({
        where: { idempotencyKey },
      });
      if (existing && existing.status === "succeeded") {
        throw new PaymentServiceError(
          "generic",
          409,
          "This checkout was already completed. Check your email for the receipt."
        );
      }
    } catch (err) {
      if (err instanceof PaymentServiceError) throw err;
      // Table missing until db:push — continue without idempotency store
    }

    try {
      const session = await provider.createCheckout({
        ...input,
        email,
        planId: plan.id,
        amount,
        currency,
        planName: plan.name,
        planDescription: plan.description,
        product: plan.product,
        mode: plan.mode === "subscription" ? "subscription" : "payment",
        planEnvVar: plan.planEnvVar,
      });

      let transactionId = `pending_${Date.now()}`;
      try {
        const tx = await prisma.paymentTransaction.upsert({
          where: { idempotencyKey },
          create: {
            provider: provider.id,
            providerRef: session.orderId ?? session.sessionId ?? session.subscriptionId ?? null,
            userEmail: email,
            planId: plan.id,
            amount,
            currency,
            status: "pending",
            idempotencyKey,
            metadata: {
              product: plan.product,
              mode: session.mode,
              chargeLabel: session.chargeLabel,
              tax: taxConfig().enabled ? taxConfig() : { enabled: false },
            },
          },
          update: {
            provider: provider.id,
            providerRef: session.orderId ?? session.sessionId ?? session.subscriptionId ?? null,
            amount,
            currency,
            status: "pending",
            metadata: {
              product: plan.product,
              mode: session.mode,
              chargeLabel: session.chargeLabel,
            },
          },
        });
        transactionId = tx.id;
      } catch (err) {
        paymentsLog("checkout_tx_persist_skipped", {
          reason: err instanceof Error ? err.message.slice(0, 80) : "db",
        });
      }

      paymentsLog("checkout_created", {
        provider: provider.id,
        planId: plan.id,
        currency,
        amount,
      });

      return {
        ...session,
        transactionId,
        idempotencyKey,
        chargeLabel: session.chargeLabel || formatMoney(amount, currency),
      };
    } catch (err) {
      lastError = err;
      paymentsLog("checkout_provider_failed", {
        provider: provider.id,
        message: err instanceof Error ? err.message.slice(0, 120) : "error",
      });
      // Failover to next enabled provider
      continue;
    }
  }

  throw mapProviderError(lastError);
}

export async function verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResult> {
  const provider = getAdapter(input.provider);
  if (!provider.isLiveReady()) {
    throw new PaymentServiceError("unavailable", 500);
  }
  try {
    const result = await provider.verifyPayment(input);
    const transactionId = await markTransactionSucceeded({
      provider: result.provider,
      email: result.email,
      planId: result.planId,
      providerRef:
        input.sessionId ??
        input.razorpay_payment_id ??
        input.razorpay_order_id ??
        input.razorpay_subscription_id,
      amount: result.amount,
      currency: result.currency,
    });
    const withTx = { ...result, transactionId: transactionId ?? result.transactionId };
    void maybeSendReceipt(withTx);
    return withTx;
  } catch (err) {
    if (err instanceof PaymentServiceError) throw err;
    throw mapProviderError(err);
  }
}

async function maybeSendReceipt(result: VerifyPaymentResult): Promise<void> {
  try {
    const plan = findPlan(result.planId);
    await sendReceiptEmail({
      email: result.email,
      planName: plan?.name ?? result.planId,
      product: result.product,
      amountLabel: result.amount && result.currency
        ? formatMoney(result.amount, result.currency)
        : plan?.price ?? "",
      currency: result.currency ?? "USD",
      provider: result.provider,
      licenseKey: result.licenseKey,
      transactionId: result.transactionId,
    });
  } catch (err) {
    paymentsLog("receipt_email_failed", {
      message: err instanceof Error ? err.message.slice(0, 80) : "error",
    });
  }
}

async function markTransactionSucceeded(opts: {
  provider: ProviderId;
  email: string;
  planId: string;
  providerRef?: string;
  amount?: number;
  currency?: Currency;
}): Promise<string | undefined> {
  try {
    if (opts.providerRef) {
      const byRef = await prisma.paymentTransaction.findFirst({
        where: { provider: opts.provider, providerRef: opts.providerRef },
      });
      if (byRef) {
        await prisma.paymentTransaction.update({
          where: { id: byRef.id },
          data: {
            status: "succeeded",
            userEmail: opts.email,
            planId: opts.planId,
            ...(opts.amount != null ? { amount: opts.amount } : {}),
            ...(opts.currency ? { currency: opts.currency } : {}),
          },
        });
        return byRef.id;
      }
    }
    const pending = await prisma.paymentTransaction.findFirst({
      where: {
        provider: opts.provider,
        userEmail: opts.email,
        planId: opts.planId,
        status: "pending",
      },
      orderBy: { createdAt: "desc" },
    });
    if (pending) {
      await prisma.paymentTransaction.update({
        where: { id: pending.id },
        data: {
          status: "succeeded",
          providerRef: opts.providerRef ?? pending.providerRef,
          ...(opts.amount != null ? { amount: opts.amount } : {}),
          ...(opts.currency ? { currency: opts.currency } : {}),
        },
      });
      return pending.id;
    }
    const created = await prisma.paymentTransaction.create({
      data: {
        provider: opts.provider,
        providerRef: opts.providerRef ?? null,
        userEmail: opts.email,
        planId: opts.planId,
        amount: opts.amount ?? 0,
        currency: opts.currency ?? chargeCurrencyForProvider(opts.provider),
        status: "succeeded",
        idempotencyKey: `fulfill:${opts.provider}:${opts.providerRef ?? `${opts.email}:${opts.planId}:${Date.now()}`}`,
        metadata: {},
      },
    });
    return created.id;
  } catch {
    return undefined;
  }
}

/**
 * Handle signed webhook payload via adapter; idempotent on eventId.
 */
export async function handleWebhook(
  providerId: ProviderId,
  rawBody: string,
  headers: Headers
): Promise<{ status: number; body: Record<string, unknown> }> {
  const provider = getAdapter(providerId);
  const parsed = await provider.parseWebhook(rawBody, headers);
  if (!parsed.ok) {
    return { status: parsed.status, body: { error: parsed.error } };
  }

  const { event } = parsed;
  let claim: { isNew: boolean; id: string } = { isNew: true, id: "noop" };
  try {
    claim = await claimWebhookEvent({
      provider: providerId,
      eventId: event.eventId,
      summary: event.summary,
    });
  } catch {
    // DB unavailable — still attempt fulfill (existing license/subscriber idempotency)
  }

  if (!claim.isNew) {
    return { status: 200, body: { received: true, duplicate: true } };
  }

  try {
    await applyPaymentEvent(event);
    await markWebhookProcessed(claim.id, "processed");
  } catch (err) {
    paymentsLog("webhook_handler_error", {
      provider: providerId,
      message: err instanceof Error ? err.message.slice(0, 120) : "error",
    });
    await markWebhookProcessed(claim.id, "failed");
    return { status: 500, body: { error: "Handler failed" } };
  }

  return { status: 200, body: { received: true } };
}

async function applyPaymentEvent(event: PaymentEvent): Promise<void> {
  if (event.cancelSubscription && event.subscriptionId) {
    if (event.provider === "stripe") {
      await prisma.subscriber.updateMany({
        where: { stripeSubscriptionId: event.subscriptionId },
        data: { status: "CANCELED", tier: "FREE" },
      });
    } else if (event.provider === "razorpay") {
      await prisma.subscriber.updateMany({
        where: { razorpaySubscriptionId: event.subscriptionId },
        data: { status: "CANCELED", tier: "FREE" },
      });
    }
    return;
  }

  if (
    event.type === "payment.succeeded" ||
    event.type === "checkout.completed" ||
    event.type === "subscription.activated"
  ) {
    if (!event.email || !event.planId || !isFulfillablePlanId(event.planId)) {
      paymentsLog("webhook_skip_fulfill", {
        provider: event.provider,
        reason: !event.email || !event.planId ? "missing_notes" : "unknown_plan",
        planId: (event.planId ?? "").slice(0, 64),
      });
      return;
    }

    const result = await fulfillPurchase({
      email: event.email,
      planId: event.planId,
      paymentId: event.paymentId,
      orderId: event.orderId,
      subscriptionId: event.subscriptionId,
      customerId: event.customerId,
      provider: event.provider === "stripe" || event.provider === "razorpay" ? event.provider : "stripe",
    });

    const txId = await markTransactionSucceeded({
      provider: event.provider,
      email: event.email,
      planId: event.planId,
      providerRef: event.paymentId ?? event.orderId ?? event.subscriptionId,
      amount: event.amount,
      currency: event.currency,
    });

    if (result.product !== "unknown") {
      void maybeSendReceipt({
        ok: true,
        product: result.product,
        email: event.email,
        licenseKey: result.licenseKey,
        planId: event.planId,
        provider: event.provider,
        amount: event.amount,
        currency: event.currency,
        transactionId: txId,
      });
    }
  }
}

export async function refundPayment(req: RefundRequest): Promise<RefundResult> {
  let tx;
  try {
    tx = await prisma.paymentTransaction.findUnique({ where: { id: req.transactionId } });
  } catch {
    throw new PaymentServiceError("unavailable", 500);
  }
  if (!tx) throw new PaymentServiceError("not_found", 404);
  if (tx.status !== "succeeded" && tx.status !== "partially_refunded") {
    throw new PaymentServiceError("generic", 400, "Transaction is not refundable in its current state.");
  }
  if (!tx.providerRef) {
    throw new PaymentServiceError("generic", 400, "Missing provider payment reference.");
  }

  const amount = req.amount ?? tx.amount;
  if (amount <= 0 || amount > tx.amount) {
    throw new PaymentServiceError("generic", 400, "Invalid refund amount.");
  }

  const provider = await getEnabledProvider(tx.provider as ProviderId);
  if (!provider) throw new PaymentServiceError("unavailable", 500);

  let providerResult;
  try {
    providerResult = await provider.refund({
      providerRef: tx.providerRef,
      amount,
      currency: tx.currency as Currency,
      reason: req.reason,
    });
  } catch (err) {
    paymentsLog("refund_failed", {
      transactionId: tx.id,
      message: err instanceof Error ? err.message.slice(0, 120) : "error",
    });
    throw new PaymentServiceError("refund_failed", 502);
  }

  const refundRow = await prisma.paymentRefund.create({
    data: {
      transactionId: tx.id,
      amount,
      currency: tx.currency,
      status: providerResult.status === "succeeded" ? "succeeded" : providerResult.status,
      providerRef: providerResult.providerRef,
      reason: req.reason?.slice(0, 500),
      actorEmail: req.actorEmail,
    },
  });

  const newStatus = amount >= tx.amount ? "refunded" : "partially_refunded";
  await prisma.paymentTransaction.update({
    where: { id: tx.id },
    data: { status: newStatus },
  });

  paymentsLog("refund_created", {
    transactionId: tx.id,
    amount,
    actor: req.actorEmail.slice(0, 80),
  });

  return {
    ok: true,
    refundId: refundRow.id,
    providerRef: providerResult.providerRef,
    amount,
    currency: tx.currency as Currency,
    status: refundRow.status as RefundResult["status"],
  };
}

export {
  getPaymentsProvider,
  resolveProviderConfigs,
  userPaymentMessage,
  PaymentServiceError,
  taxConfig,
  formatMoney,
};
