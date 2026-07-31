import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { BRAND } from "@/lib/brand";
import { getSessionEmail, requireLegalAdmin } from "@/lib/legal/admin";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/payments";
import type { Currency } from "@/lib/payments";
import { FOUNDRY_PLANS, VAULT_PLANS } from "@/lib/pricing";

export const metadata: Metadata = {
  title: `Receipt — ${BRAND.name}`,
  robots: { index: false, follow: false },
};

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sessionEmail = await getSessionEmail();
  const admin = await requireLegalAdmin();

  let tx: {
    id: string;
    provider: string;
    userEmail: string;
    planId: string;
    amount: number;
    currency: string;
    status: string;
    receiptNumber: string | null;
    createdAt: Date;
    refunds: { id: string }[];
    invoice: { id: string } | null;
  } | null = null;
  let invoiceId: string | null = null;
  let dbError = false;
  try {
    const row = await prisma.paymentTransaction.findUnique({
      where: { id },
      include: { refunds: true, invoice: { select: { id: true } } },
    });
    tx = row;
    invoiceId = row?.invoice?.id ?? null;
  } catch {
    dbError = true;
  }

  const isOwner = sessionEmail && tx && sessionEmail === tx.userEmail.toLowerCase();
  const allowed = Boolean(tx && (isOwner || admin.ok));

  const plan = tx
    ? [...VAULT_PLANS, ...FOUNDRY_PLANS].find((p) => p.id === tx.planId)
    : undefined;

  return (
    <>
      <Nav />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <div className="mx-auto max-w-lg px-6 pb-16 pt-28 sm:pt-32">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brass-dim)]">
            Receipt
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight">Payment receipt</h1>
          <div className="rule mt-8 max-w-[6rem]" />

          {dbError && (
            <p className="mt-8 text-sm text-[var(--muted)]">
              Receipt store unavailable. Run <code>npm run db:push</code> after deploying payment
              models.
            </p>
          )}

          {!dbError && !tx && (
            <p className="mt-8 text-sm text-[var(--muted)]">Receipt not found.</p>
          )}

          {tx && !allowed && (
            <div className="mt-8 text-sm">
              <p className="text-[var(--muted)]">
                Sign in with the email used at checkout to view this receipt.
              </p>
              <Link
                href={`/login?next=/account/receipts/${id}`}
                className="mt-4 inline-block text-[var(--brass-dim)] underline"
              >
                Sign in
              </Link>
            </div>
          )}

          {tx && allowed && (
            <div className="mt-8 space-y-3 text-sm">
              <p>
                <span className="text-[var(--muted)]">Plan</span>
                <br />
                <span className="font-semibold">{plan?.name ?? tx.planId}</span>
              </p>
              <p>
                <span className="text-[var(--muted)]">Amount charged</span>
                <br />
                <span className="font-semibold">
                  {formatMoney(tx.amount, tx.currency as Currency)} ({tx.currency})
                </span>
              </p>
              <p>
                <span className="text-[var(--muted)]">Status</span>
                <br />
                {tx.status}
              </p>
              <p>
                <span className="text-[var(--muted)]">Provider</span>
                <br />
                <span className="capitalize">{tx.provider}</span>
              </p>
              <p>
                <span className="text-[var(--muted)]">Email</span>
                <br />
                {tx.userEmail}
              </p>
              <p>
                <span className="text-[var(--muted)]">Date</span>
                <br />
                {tx.createdAt.toISOString()}
              </p>
              {tx.receiptNumber && (
                <p>
                  <span className="text-[var(--muted)]">Invoice / receipt #</span>
                  <br />
                  {tx.receiptNumber}
                </p>
              )}
              <p className="text-xs text-[var(--fog)]">
                Card data is never stored by {BRAND.name}. Checkout is hosted by the payment
                provider. See the{" "}
                <Link href="/legal/refunds" className="underline">
                  refund policy
                </Link>
                .
              </p>
              {invoiceId && (
                <p>
                  <Link
                    href={`/account/invoices/${invoiceId}`}
                    className="text-[var(--brass-dim)] underline"
                  >
                    Formal invoice
                  </Link>
                </p>
              )}
            </div>
          )}

          <div className="mt-10 flex flex-wrap gap-4 text-sm">
            <Link href="/license" className="text-[var(--muted)] hover:text-[var(--ink)]">
              License portal
            </Link>
            <Link href="/pricing" className="text-[var(--muted)] hover:text-[var(--ink)]">
              Pricing
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
