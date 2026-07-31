/**
 * Payment Service Layer — public surface.
 * Prefer importing from `@/lib/payments` (this barrel) rather than deep paths.
 */

export type {
  ProviderId,
  Currency,
  CheckoutSession,
  CreateCheckoutInput,
  VerifyPaymentInput,
  VerifyPaymentResult,
  PaymentEvent,
  RefundRequest,
  RefundResult,
  ProviderPublicConfig,
  UserFacingPaymentErrorCode,
} from "./types";

export {
  createCheckout,
  verifyPayment,
  handleWebhook,
  refundPayment,
  getPaymentsProvider,
  resolveProviderConfigs,
  PaymentServiceError,
  userPaymentMessage,
  taxConfig,
  formatMoney,
} from "./service";

export {
  chargeCurrencyForProvider,
  resolveChargeAmount,
  usdCentsToInrPaise,
  displayAmountForPlan,
  fxProviderStub,
  DISPLAY_CURRENCIES,
  PLAN_PRICE_BOOK,
  USD_CENTS_TO_INR_PAISE_FACTOR,
} from "./currencies";

export { createInvoiceForTransaction, invoiceHtmlDocument } from "./invoice";

export { paymentsLog } from "./errors";

import { getPaymentsProvider } from "./service";

/** Backward-compatible helper previously at src/lib/payments.ts */
export function paymentsUnavailableMessage(): string {
  const provider = getPaymentsProvider();
  if (provider === "stripe") {
    return "Checkout is not configured yet. Set STRIPE_SECRET_KEY to enable Stripe.";
  }
  return "Payments are temporarily unavailable. Check Razorpay keys on the server.";
}
