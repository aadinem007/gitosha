import { getPaymentsProvider } from "@/lib/stripe";

export { getPaymentsProvider };

export function paymentsUnavailableMessage(): string {
  const provider = getPaymentsProvider();
  if (provider === "stripe") {
    return "Checkout is not configured yet. Set STRIPE_SECRET_KEY to enable Stripe.";
  }
  return "Payments are temporarily unavailable. Check Razorpay keys on the server.";
}
