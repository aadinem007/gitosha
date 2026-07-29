import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CheckoutFulfillClient } from "@/components/CheckoutFulfillClient";
import { fulfillPurchase, isFulfillablePlanId } from "@/lib/fulfill";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

async function resolveStripeSession(sessionId: string): Promise<{
  product?: string;
  email?: string;
  licenseKey?: string;
}> {
  if (!isStripeConfigured()) return {};

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
      return {};
    }

    const email = (
      session.metadata?.email ||
      session.customer_email ||
      session.customer_details?.email ||
      ""
    ).toLowerCase();
    const planId = session.metadata?.planId;
    if (!email || !planId || !isFulfillablePlanId(planId)) return {};

    const paymentIntent =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;
    const subscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id;
    const customerId =
      typeof session.customer === "string" ? session.customer : session.customer?.id;

    const result = await fulfillPurchase({
      email,
      planId,
      paymentId: paymentIntent ?? session.id,
      orderId: session.id,
      subscriptionId,
      customerId,
      provider: "stripe",
    });

    if (result.product === "unknown") return {};

    return {
      product: result.product,
      email,
      licenseKey: result.licenseKey,
    };
  } catch {
    return {};
  }
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{
    key?: string;
    email?: string;
    product?: string;
    session_id?: string;
  }>;
}) {
  const params = await searchParams;
  // Ignore legacy ?key= in URL — do not honor query-string license keys
  let email = "";
  let key = "";
  let product = params.product;

  if (params.session_id) {
    const resolved = await resolveStripeSession(params.session_id);
    if (resolved.licenseKey) key = resolved.licenseKey;
    if (resolved.email) email = resolved.email;
    if (resolved.product) product = resolved.product;
  }

  const isVault = product === "vault";
  const isFoundry = product === "foundry" || product === "bundle" || Boolean(key) || !product;

  return (
    <>
      <Nav />
      <main className="flex-1">
        <section className="mx-auto max-w-lg px-6 py-20">
          <h1 className="text-center font-display text-3xl font-semibold tracking-tight">
            Payment confirmed.
          </h1>

          {isVault && product === "vault" ? (
            <div className="mt-6 text-center">
              <p className="text-[var(--muted)]">
                Operator access is unlocked. Sign in with the same email you paid with.
              </p>
              <Link href="/login" className="btn-primary mt-8 inline-block">
                Sign in to Vault
              </Link>
            </div>
          ) : (
            <div className="mt-6">
              <p className="text-center text-[var(--muted)]">
                Your Foundry kit is ready. Download the zip below — this is the product you paid for.
              </p>

              <CheckoutFulfillClient
                initialEmail={email}
                initialKey={key}
                product={product}
              />

              {params.session_id && !key && !isVault && (
                <p className="mt-6 text-center text-sm text-[var(--muted)]">
                  If your license key does not appear yet, check your email or open the{" "}
                  <Link href="/license" className="underline">
                    License portal
                  </Link>{" "}
                  in a minute — webhook fulfillment may still be finishing.
                </p>
              )}
            </div>
          )}

          <div className="mt-10 flex justify-center gap-4 text-sm">
            <Link href="/license" className="text-[var(--muted)] hover:text-[var(--ink)]">
              License portal
            </Link>
            <Link href="/pricing" className="text-[var(--muted)] hover:text-[var(--ink)]">
              All plans
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
