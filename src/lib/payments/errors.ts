import { redactSecrets } from "@/lib/secure";
import type { UserFacingPaymentErrorCode } from "./types";

/** Structured payments logs — never include card data or secret keys. */
export function paymentsLog(
  event: string,
  detail: Record<string, string | number | boolean | undefined> = {}
): void {
  const safe: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(detail)) {
    if (v === undefined) continue;
    safe[k] = typeof v === "string" ? redactSecrets(v).slice(0, 200) : v;
  }
  console.info(`[payments] ${event}`, safe);
}

const USER_MESSAGES: Record<UserFacingPaymentErrorCode, string> = {
  unavailable: "Payments are temporarily unavailable. Please try again later.",
  unknown_plan: "Unknown or unpaid plan.",
  currency_rejected: "That currency is not available for this checkout.",
  invalid_signature: "Payment verification failed.",
  not_paid: "Payment was not completed.",
  metadata_mismatch: "Purchase details did not match. Contact support if you were charged.",
  canceled: "Checkout was canceled. No charge was made.",
  declined: "Your payment was declined. Try another method or contact your bank.",
  timeout: "The payment provider timed out. Check your email before retrying.",
  network: "Network error talking to the payment provider. Please try again.",
  rate_limited: "Too many payment attempts. Wait a minute and try again.",
  forbidden: "Forbidden",
  not_found: "Payment not found.",
  refund_failed: "Refund could not be completed. Check provider dashboard.",
  generic: "Something went wrong with checkout. Please try again.",
};

export function userPaymentMessage(code: UserFacingPaymentErrorCode): string {
  return USER_MESSAGES[code];
}

export class PaymentServiceError extends Error {
  constructor(
    public readonly code: UserFacingPaymentErrorCode,
    public readonly httpStatus: number = 400,
    message?: string
  ) {
    super(message ?? USER_MESSAGES[code]);
    this.name = "PaymentServiceError";
  }
}

export function mapProviderError(err: unknown): PaymentServiceError {
  const message = err instanceof Error ? err.message : String(err);
  const lower = message.toLowerCase();
  if (lower.includes("timeout") || lower.includes("etimedout")) {
    return new PaymentServiceError("timeout", 504);
  }
  if (lower.includes("network") || lower.includes("fetch failed") || lower.includes("econnrefused")) {
    return new PaymentServiceError("network", 502);
  }
  if (lower.includes("declined") || lower.includes("card_declined")) {
    return new PaymentServiceError("declined", 402);
  }
  if (lower.includes("cancel")) {
    return new PaymentServiceError("canceled", 400);
  }
  if (
    message.includes("XFLOW_API_KEY") ||
    lower.includes("not configured")
  ) {
    return new PaymentServiceError("unavailable", 500);
  }
  return new PaymentServiceError("generic", 500, "Could not complete payment operation.");
}
