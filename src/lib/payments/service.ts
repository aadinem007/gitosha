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
import { createInvoiceForTransaction } from "./invoice";
import { getAdapter, getPaymentsProvider, resolveCheckoutProviderOrder, resolveProviderConfigs } from "./registry";
import type {
  CheckoutSession,
  CreateCheckoutInput,
  Currency,
  PaymentEvent,
  PaymentTransactionStatus,
  ProviderId,
  RefundRequest,
  RefundResult,
  VerifyPaymentInput,
  VerifyPaymentResult,
} from "./types";
import { mapXflowIntentStatus } from "./xflow-status";

function findPlan(planId: string) {
  return [...VAULT_PLANS, ...FOUNDRY_PLANS].find((p) => p.id === planId);
}

/**
 * Canonical PaymentService — XflowAdapter only. No provider failover.
 */
export class PaymentService {
  async createCheckout(input: CreateCheckoutInput): Promise<CheckoutSession> {
    const email = input.email.toLowerCase().trim();
    const plan = findPlan(input.planId);
    if (!plan || plan.mode === "none" || !plan.amountCents) {
      throw new PaymentServiceError("unknown_plan", 400);
    }
    if (!isFulfillablePlanId(plan.id)) {
      throw new PaymentServiceError("unknown_plan", 400);
    }

    const providers = await resolveCheckoutProviderOrder();
    const provider = providers[0];
    if (!provider) {
      paymentsLog("checkout_no_provider", { planId: plan.id });
      throw new PaymentServiceError("unavailable", 500);
    }

    const currency = chargeCurrencyForProvider("xflow");
    const amount = resolveChargeAmount(plan.amountCents, currency, plan.id);
    const idempotencyKey = buildCheckoutIdempotencyKey({
      email,
      planId: plan.id,
      provider: "xflow",
      clientKey: input.idempotencyKey,
    });

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
        mode: plan.mode === "subscription" && plan.id !== "vault-pro-annual" ? "subscription" : "payment",
        planEnvVar: plan.planEnvVar,
      });

      let transactionId = `pending_${Date.now()}`;
      try {
        const tx = await prisma.paymentTransaction.upsert({
          where: { idempotencyKey },
          create: {
            provider: "xflow",
            providerRef: session.orderId ?? session.sessionId ?? session.subscriptionId ?? null,
            userEmail: email,
            planId: plan.id,
            amount,
            currency,
            status: "requires_action",
            idempotencyKey,
            metadata: {
              product: plan.product,
              mode: session.mode,
              chargeLabel: session.chargeLabel,
              xflowSubscriptionId: session.subscriptionId ?? null,
              tax: taxConfig().enabled ? taxConfig() : { enabled: false },
            },
          },
          update: {
            provider: "xflow",
            providerRef: session.orderId ?? session.sessionId ?? session.subscriptionId ?? null,
            amount,
            currency,
            status: "requires_action",
            metadata: {
              product: plan.product,
              mode: session.mode,
              chargeLabel: session.chargeLabel,
              xflowSubscriptionId: session.subscriptionId ?? null,
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
        provider: "xflow",
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
      if (err instanceof PaymentServiceError) throw err;
      paymentsLog("checkout_provider_failed", {
        provider: "xflow",
        message: err instanceof Error ? err.message.slice(0, 120) : "error",
      });
      throw mapProviderError(err);
    }
  }

  async verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResult> {
    const provider = getAdapter("xflow");
    if (!provider.isLiveReady()) {
      throw new PaymentServiceError("unavailable", 500);
    }
    try {
      const result = await provider.verifyPayment({ ...input, provider: "xflow" });
      const transactionId = await markTransactionSucceeded({
        provider: "xflow",
        email: result.email,
        planId: result.planId,
        providerRef: input.sessionId ?? input.xflowIntentId,
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

  async handleWebhook(
    rawBody: string,
    headers: Headers
  ): Promise<{ status: number; body: Record<string, unknown> }> {
    const provider = getAdapter("xflow");
    const parsed = await provider.parseWebhook(rawBody, headers);
    if (!parsed.ok) {
      return { status: parsed.status, body: { error: parsed.error } };
    }

    const { event } = parsed;
    let claim: { isNew: boolean; id: string } = { isNew: true, id: "noop" };
    try {
      claim = await claimWebhookEvent({
        provider: "xflow",
        eventId: event.eventId,
        summary: event.summary,
      });
    } catch {
      /* DB optional — fulfill still idempotent at license/subscriber */
    }

    if (!claim.isNew) {
      return { status: 200, body: { received: true, duplicate: true } };
    }

    try {
      await applyPaymentEvent(event);
      await markWebhookProcessed(claim.id, "processed");
    } catch (err) {
      paymentsLog("webhook_handler_error", {
        provider: "xflow",
        message: err instanceof Error ? err.message.slice(0, 120) : "error",
      });
      await markWebhookProcessed(claim.id, "failed");
      return { status: 500, body: { error: "Handler failed" } };
    }

    return { status: 200, body: { received: true } };
  }

  async refundPayment(req: RefundRequest): Promise<RefundResult> {
    let tx;
    try {
      tx = await prisma.paymentTransaction.findUnique({ where: { id: req.transactionId } });
    } catch {
      throw new PaymentServiceError("unavailable", 500);
    }
    if (!tx) throw new PaymentServiceError("not_found", 404);
    if (tx.provider !== "xflow") {
      throw new PaymentServiceError(
        "refund_failed",
        400,
        "Historical non-Xflow charges cannot be refunded through this app."
      );
    }
    if (tx.status !== "succeeded" && tx.status !== "partially_refunded") {
      throw new PaymentServiceError("generic", 400, "Transaction is not refundable in its current state.");
    }

    const provider = getAdapter("xflow");
    try {
      await provider.refund({
        providerRef: tx.providerRef ?? "",
        amount: req.amount ?? tx.amount,
        currency: tx.currency as Currency,
        reason: req.reason,
      });
    } catch (err) {
      if (err instanceof PaymentServiceError) throw err;
      throw new PaymentServiceError("refund_failed", 501);
    }
    throw new PaymentServiceError("refund_failed", 501);
  }
}

export const paymentService = new PaymentService();

export async function createCheckout(input: CreateCheckoutInput): Promise<CheckoutSession> {
  return paymentService.createCheckout(input);
}

export async function verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResult> {
  return paymentService.verifyPayment(input);
}

export async function handleWebhook(
  _providerId: ProviderId,
  rawBody: string,
  headers: Headers
): Promise<{ status: number; body: Record<string, unknown> }> {
  return paymentService.handleWebhook(rawBody, headers);
}

export async function refundPayment(req: RefundRequest): Promise<RefundResult> {
  return paymentService.refundPayment(req);
}

async function maybeSendReceipt(result: VerifyPaymentResult): Promise<void> {
  try {
    const plan = findPlan(result.planId);
    let amount = result.amount;
    let currency = result.currency;
    if (result.transactionId && (amount == null || !currency)) {
      try {
        const tx = await prisma.paymentTransaction.findUnique({
          where: { id: result.transactionId },
        });
        if (tx) {
          amount = amount ?? tx.amount;
          currency = currency ?? (tx.currency as Currency);
        }
      } catch {
        /* ledger optional */
      }
    }
    let invoiceId: string | undefined;
    if (result.transactionId && amount != null && currency) {
      const inv = await createInvoiceForTransaction({
        transactionId: result.transactionId,
        provider: "xflow",
        email: result.email,
        planId: result.planId,
        amount,
        currency,
      });
      invoiceId = inv?.invoiceId;
    }
    await sendReceiptEmail({
      email: result.email,
      planName: plan?.name ?? result.planId,
      product: result.product,
      amountLabel:
        amount != null && currency ? formatMoney(amount, currency) : plan?.price ?? "",
      currency: currency ?? "INR",
      provider: "xflow",
      licenseKey: result.licenseKey,
      transactionId: result.transactionId,
      invoiceId,
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
  status?: PaymentTransactionStatus;
}): Promise<string | undefined> {
  const status = opts.status ?? "succeeded";
  try {
    if (opts.providerRef) {
      const byRef = await prisma.paymentTransaction.findFirst({
        where: { provider: "xflow", providerRef: opts.providerRef },
      });
      if (byRef) {
        await prisma.paymentTransaction.update({
          where: { id: byRef.id },
          data: {
            status,
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
        provider: "xflow",
        userEmail: opts.email,
        planId: opts.planId,
        status: { in: ["created", "pending", "requires_action", "processing"] },
      },
      orderBy: { createdAt: "desc" },
    });
    if (pending) {
      await prisma.paymentTransaction.update({
        where: { id: pending.id },
        data: {
          status,
          providerRef: opts.providerRef ?? pending.providerRef,
          ...(opts.amount != null ? { amount: opts.amount } : {}),
          ...(opts.currency ? { currency: opts.currency } : {}),
        },
      });
      return pending.id;
    }
    const created = await prisma.paymentTransaction.create({
      data: {
        provider: "xflow",
        providerRef: opts.providerRef ?? null,
        userEmail: opts.email,
        planId: opts.planId,
        amount: opts.amount ?? 0,
        currency: opts.currency ?? chargeCurrencyForProvider("xflow"),
        status,
        idempotencyKey: `fulfill:xflow:${opts.providerRef ?? `${opts.email}:${opts.planId}:${Date.now()}`}`,
        metadata: {},
      },
    });
    return created.id;
  } catch {
    return undefined;
  }
}

async function applyPaymentEvent(event: PaymentEvent): Promise<void> {
  if (event.cancelSubscription && event.subscriptionId) {
    await prisma.subscriber.updateMany({
      where: { xflowSubscriptionId: event.subscriptionId },
      data: { status: "CANCELED", tier: "FREE" },
    });
    return;
  }

  if (
    event.type === "payment.succeeded" ||
    event.type === "checkout.completed" ||
    event.type === "subscription.activated"
  ) {
    if (!event.email || !event.planId || !isFulfillablePlanId(event.planId)) {
      paymentsLog("webhook_skip_fulfill", {
        provider: "xflow",
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
      provider: "xflow",
    });

    const mapped = mapXflowIntentStatus("successful");
    const txId = await markTransactionSucceeded({
      provider: "xflow",
      email: event.email,
      planId: event.planId,
      providerRef: event.paymentId ?? event.orderId ?? event.subscriptionId,
      amount: event.amount,
      currency: event.currency,
      status: mapped,
    });

    if (result.product !== "unknown") {
      void maybeSendReceipt({
        ok: true,
        product: result.product,
        email: event.email,
        licenseKey: result.licenseKey,
        planId: event.planId,
        provider: "xflow",
        amount: event.amount,
        currency: event.currency,
        transactionId: txId,
      });
    }
  }
}

export {
  getPaymentsProvider,
  resolveProviderConfigs,
  userPaymentMessage,
  PaymentServiceError,
  taxConfig,
  formatMoney,
};
