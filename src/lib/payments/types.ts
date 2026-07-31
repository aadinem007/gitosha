/** Provider-agnostic payment types. Secrets never appear in these shapes. */

export type ProviderId =
  | "razorpay"
  | "stripe"
  | "paypal"
  | "xflow"
  | "wise"
  | "payoneer";

/** ISO-ish currency codes we actually charge or display. */
export type Currency = "USD" | "INR" | "EUR";

export type CheckoutMode = "payment" | "subscription";

export type PaymentTransactionStatus =
  | "pending"
  | "requires_action"
  | "succeeded"
  | "failed"
  | "canceled"
  | "refunded"
  | "partially_refunded";

export type WebhookProcessStatus = "received" | "processed" | "ignored" | "failed";

export type RefundStatus = "pending" | "succeeded" | "failed";

export type CreateCheckoutInput = {
  planId: string;
  email: string;
  /** Optional client-supplied key; server also derives a stable fallback. */
  idempotencyKey?: string;
  /** Preferred display currency — does not override provider charge currency. */
  displayCurrency?: Currency;
  /** Force a provider (admin/tests). Production uses registry primary + failover. */
  providerId?: ProviderId;
};

export type CheckoutSession = {
  provider: ProviderId;
  mode: CheckoutMode;
  planId: string;
  product: string;
  email: string;
  /** Minor units charged by the provider (cents/paise). */
  amount: number;
  /** Currency actually charged. */
  currency: Currency;
  /** Human label for UI. */
  chargeLabel: string;
  transactionId: string;
  idempotencyKey: string;
  /** Stripe hosted Checkout URL */
  url?: string;
  sessionId?: string;
  /** Razorpay Checkout.js fields (public key only) */
  keyId?: string;
  orderId?: string;
  subscriptionId?: string;
  name?: string;
  description?: string;
};

export type VerifyPaymentInput = {
  provider: ProviderId;
  /** Stripe Checkout session / PayPal order / Xflow intent */
  sessionId?: string;
  /** PayPal Orders v2 */
  paypalOrderId?: string;
  /** Xflow TransactionIntent */
  xflowIntentId?: string;
  /** Razorpay */
  mode?: CheckoutMode;
  planId?: string;
  email?: string;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  razorpay_subscription_id?: string;
  razorpay_signature?: string;
};

export type VerifyPaymentResult = {
  ok: true;
  product: string;
  email: string;
  licenseKey?: string;
  transactionId?: string;
  planId: string;
  amount?: number;
  currency?: Currency;
  provider: ProviderId;
};

export type PaymentEventType =
  | "payment.succeeded"
  | "payment.failed"
  | "subscription.activated"
  | "subscription.canceled"
  | "checkout.completed"
  | "unknown";

export type PaymentEvent = {
  provider: ProviderId;
  eventId: string;
  type: PaymentEventType;
  rawType: string;
  email?: string;
  planId?: string;
  paymentId?: string;
  orderId?: string;
  subscriptionId?: string;
  customerId?: string;
  amount?: number;
  currency?: Currency;
  /** Safe summary for storage — no secrets / card data */
  summary: Record<string, string | number | boolean | null>;
  /** Cancel subscription entitlements */
  cancelSubscription?: boolean;
};

export type ParseWebhookResult =
  | { ok: true; event: PaymentEvent; duplicate?: boolean }
  | { ok: false; error: string; status: 400 | 401 | 503 };

export type RefundRequest = {
  transactionId: string;
  amount?: number;
  reason?: string;
  actorEmail: string;
};

export type RefundResult = {
  ok: true;
  refundId: string;
  providerRef: string;
  amount: number;
  currency: Currency;
  status: RefundStatus;
};

export type GetTransactionResult = {
  id: string;
  provider: ProviderId;
  providerRef: string | null;
  userEmail: string;
  planId: string;
  amount: number;
  currency: Currency;
  status: PaymentTransactionStatus;
  idempotencyKey: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
};

export type ProviderCapability = "checkout" | "payout";

export type ProviderPublicConfig = {
  providerId: ProviderId;
  enabled: boolean;
  /** Live credentials present (env) — never expose secret values */
  credentialsConfigured: boolean;
  supportedCurrencies: Currency[];
  /** Human-facing note for operators */
  secretEnvVars: string[];
  /** Legacy: true only for unfinished stubs (none currently). */
  scaffoldOnly?: boolean;
  /** When false, registry will not route customer checkout here. */
  supportsCheckout?: boolean;
  capability?: ProviderCapability;
  /** Honest operator-facing constraint (shown in admin). */
  operatorNote?: string;
};

export type UserFacingPaymentErrorCode =
  | "unavailable"
  | "unknown_plan"
  | "currency_rejected"
  | "invalid_signature"
  | "not_paid"
  | "metadata_mismatch"
  | "canceled"
  | "declined"
  | "timeout"
  | "network"
  | "rate_limited"
  | "forbidden"
  | "not_found"
  | "refund_failed"
  | "generic";
