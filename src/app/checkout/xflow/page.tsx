import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { BRAND } from "@/lib/brand";
import { XflowCheckoutClient } from "@/components/XflowCheckoutClient";

export const metadata: Metadata = {
  title: `UPI checkout — ${BRAND.name}`,
  robots: { index: false, follow: false },
};

export default async function XflowCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ intent?: string }>;
}) {
  const { intent } = await searchParams;

  return (
    <>
      <Nav />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <section className="mx-auto max-w-lg px-6 py-20">
          <h1 className="font-display text-3xl font-semibold tracking-tight">UPI payment</h1>
          <p className="mt-3 text-sm text-[var(--muted)]">
            Xflow collects INR via UPI intent. Complete payment in your UPI app, then confirm below.
            Desktop browsers cannot open <code>upi://</code> links — use a phone.
          </p>
          {intent ? (
            <XflowCheckoutClient intentId={intent} />
          ) : (
            <p className="mt-8 text-sm text-[var(--signal)]">Missing payment intent.</p>
          )}
          <p className="mt-10 text-sm">
            <Link href="/pricing" className="text-[var(--muted)] underline">
              Back to pricing
            </Link>
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
