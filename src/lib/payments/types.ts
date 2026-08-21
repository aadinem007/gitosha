/** Provider-agnostic payment types. Secrets never appear in these shapes. */

/** Sole live checkout provider. Historical ledger rows may still say stripe/razorpay/paypal. */
export type ProviderId = "xflow";

export type LedgerProviderId = ProviderId | "stripe" | "razorpay" | "paypal";

/** ISO-ish currency codes we actually charge or display. */
export type Currency = "USD" | "INR" | "EUR";

export type CheckoutMode = "payment" | "subscription";

export type PaymentTransactionStatus =
  | "created"
  | "pending"
  | "requires_action"
  | "processing"
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
  /** Preferred display currency — charge currency is always INR for Xflow. */
  displayCurrency?: Currency;
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
  /** Hosted Gitosha/Xflow checkout bridge URL */
  url?: string;
  sessionId?: string;
  orderId?: string;
  subscriptionId?: string;
  /** UPI intent URL from Xflow (not a secret). */
  upiIntentUrl?: string;
  name?: string;
  description?: string;
};

export type VerifyPaymentInput = {
  provider: ProviderId;
  sessionId?: string;
  xflowIntentId?: string;
  planId?: string;
  email?: string;
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
  provider: string;
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
