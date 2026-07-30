import type {
  CheckoutSession,
  CreateCheckoutInput,
  Currency,
  GetTransactionResult,
  ParseWebhookResult,
  PaymentEvent,
  ProviderId,
  ProviderPublicConfig,
  RefundRequest,
  RefundResult,
  VerifyPaymentInput,
  VerifyPaymentResult,
} from "./types";

/**
 * Payment provider adapter contract.
 * Implementations must never return secret keys; public publishable/key_id only.
 */
export interface PaymentProvider {
  readonly id: ProviderId;

  /** Whether this adapter may process live charges (credentials + not scaffold-only). */
  isLiveReady(): boolean;

  getPublicConfig(): ProviderPublicConfig;

  createCheckout(input: CreateCheckoutInput & {
    amount: number;
    currency: Currency;
    planName: string;
    planDescription: string;
    product: string;
    mode: "payment" | "subscription";
    planEnvVar?: string;
  }): Promise<Omit<CheckoutSession, "transactionId" | "idempotencyKey">>;

  verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResult>;

  parseWebhook(rawBody: string, headers: Headers): Promise<ParseWebhookResult>;

  refund(input: {
    providerRef: string;
    amount: number;
    currency: Currency;
    reason?: string;
  }): Promise<{ providerRef: string; amount: number; status: "succeeded" | "pending" | "failed" }>;

  getTransaction?(providerRef: string): Promise<Partial<GetTransactionResult> | null>;
}

export type FulfillFromEvent = (event: PaymentEvent) => Promise<void>;
