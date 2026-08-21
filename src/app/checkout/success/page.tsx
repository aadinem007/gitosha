import Link from "next/link";
import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CheckoutFulfillClient } from "@/components/CheckoutFulfillClient";

export const metadata: Metadata = {
  title: "Checkout — Gitosha",
  description: "Payment confirmation.",
  robots: { index: false, follow: false },
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{
    product?: string;
    receipt?: string;
  }>;
}) {
  const params = await searchParams;
  const product = params.product;
  const receipt = params.receipt;
  const isVault = product === "vault";

  return (
    <>
      <Nav />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <section className="mx-auto max-w-lg px-6 py-20">
          <h1 className="text-center font-display text-3xl font-semibold tracking-tight">
            Payment confirmed.
          </h1>
          <p className="mt-3 text-center text-xs text-[var(--fog)]">
            Status comes from Xflow (server verify or signed webhook) — not from this page.
          </p>

          {isVault ? (
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
              <CheckoutFulfillClient product={product} />
              <p className="mt-6 text-center text-sm text-[var(--muted)]">
                If your license key does not appear yet, check your email or open the{" "}
                <Link href="/license" className="underline">
                  License portal
                </Link>{" "}
                in a minute — webhook fulfillment may still be finishing.
              </p>
            </div>
          )}

          <div className="mt-10 flex justify-center gap-4 text-sm">
            {receipt && (
              <Link
                href={`/account/receipts/${receipt}`}
                className="text-[var(--muted)] hover:text-[var(--ink)]"
              >
                View receipt
              </Link>
            )}
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
