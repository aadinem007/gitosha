import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { LicensePortal } from "@/components/LicensePortal";
import { fulfillPurchase } from "@/lib/fulfill";
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

    if (session.payment_status !== "paid" && session.status !== "complete") {
      return {};
    }

    const email = (
      session.metadata?.email ||
      session.customer_email ||
      session.customer_details?.email ||
      ""
    ).toLowerCase();
    const planId = session.metadata?.planId;
    if (!email || !planId) return {};

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
  let key = params.key ?? "";
  let email = params.email ?? "";
  let product = params.product;

  if (params.session_id && !key) {
    const resolved = await resolveStripeSession(params.session_id);
    if (resolved.licenseKey) key = resolved.licenseKey;
    if (resolved.email) email = resolved.email;
    if (resolved.product) product = resolved.product;
  }

  const isVault = product === "vault";
  const isFoundry = product === "foundry" || product === "bundle" || Boolean(key);

  return (
    <>
      <Nav />
      <main className="flex-1">
        <section className="mx-auto max-w-lg px-6 py-20">
          <h1 className="text-center font-display text-3xl font-bold">Payment confirmed.</h1>

          {isVault && !isFoundry ? (
            <div className="mt-6 text-center">
              <p className="text-[var(--muted)]">
                Operator access is unlocked. Sign in with the same email you paid with.
              </p>
              <Link
                href="/login"
                className="btn-primary mt-8 inline-block"
              >
                Sign in to Vault
              </Link>
            </div>
          ) : (
            <div className="mt-6">
              <p className="text-center text-[var(--muted)]">
                Your Foundry kit is ready. Download the zip below — this is the product you paid for.
              </p>

              {key && (
                <div className="mt-6 rounded-lg border border-[var(--brass)]/40 bg-[var(--panel)] px-4 py-5 text-center">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brass-dim)]">
                    License key — save this
                  </p>
                  <p className="mt-2 font-mono text-xl font-semibold tracking-wide">{key}</p>
                  {email && <p className="mt-2 text-xs text-[var(--muted)]">Issued to {email}</p>}
                </div>
              )}

              <div className="mt-8">
                <LicensePortal initialEmail={email} initialKey={key} />
              </div>

              {product === "bundle" && (
                <p className="mt-6 text-center text-sm text-[var(--signal)]">
                  Bundle bonus: Vault is unlocked too —{" "}
                  <Link href="/login" className="underline">
                    sign in
                  </Link>{" "}
                  with {email || "your purchase email"}.
                </p>
              )}

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
