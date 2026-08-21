import type { PaymentTransactionStatus } from "./types";

/**
 * Map documented Xflow object statuses onto the internal ledger.
 * Do not invent Xflow statuses — unknown values stay pending.
 *
 * TransactionIntent (imports guide): processing | successful | expired
 * Subscription: active | activated | paused
 * Deposit: completed
 */
export function mapXflowIntentStatus(status: string | undefined): PaymentTransactionStatus {
  const s = (status ?? "").toLowerCase();
  if (s === "successful" || s === "completed" || s === "activated") return "succeeded";
  if (s === "expired" || s === "cancelled" || s === "canceled") return "canceled";
  if (s === "failed") return "failed";
  if (s === "processing") return "processing";
  if (s === "paused" || s === "input_required") return "requires_action";
  if (s === "draft" || s === "created") return "created";
  return "pending";
}

export function xflowIntentIsPaid(status: string | undefined): boolean {
  return mapXflowIntentStatus(status) === "succeeded";
}
