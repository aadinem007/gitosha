import { getPaymentsProvider } from "@/lib/stripe";

export { getPaymentsProvider };

export function paymentsUnavailableMessage(): string {
  const provider = getPaymentsProvider();
  if (provider === "razorpay") {
    return "Payments are temporarily unavailable.";
  }
  return "Checkout is not configured yet. Set STRIPE_SECRET_KEY to enable payments.";
}
