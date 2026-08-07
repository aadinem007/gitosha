import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { BRAND } from "@/lib/brand";
import { getSessionEmail, requireLegalAdmin } from "@/lib/legal/admin";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/payments";
import type { Currency } from "@/lib/payments";
import type { InvoiceLineItem } from "@/lib/payments/invoice";

export const metadata: Metadata = {
  title: `Invoice — ${BRAND.name}`,
  robots: { index: false, follow: false },
};

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sessionEmail = await getSessionEmail();
  const admin = await requireLegalAdmin();

  let invoice = null as Awaited<ReturnType<typeof prisma.invoice.findUnique>> | null;
  let dbError = false;
  try {
    invoice = await prisma.invoice.findUnique({ where: { id } });
  } catch {
    dbError = true;
  }

  const isOwner = sessionEmail && invoice && sessionEmail === invoice.userEmail.toLowerCase();
  const allowed = Boolean(invoice && (isOwner || admin.ok));
  const lineItems = (invoice?.lineItems ?? []) as InvoiceLineItem[];

  return (
    <>
      <Nav />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <div className="mx-auto max-w-lg px-6 pb-16 pt-28 sm:pt-32">
          <p className="kicker">Invoice</p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight">
            {invoice?.invoiceNumber ?? "Invoice"}
          </h1>
          <div className="rule mt-8 max-w-[6rem]" />

          {dbError && (
            <p className="mt-8 text-sm text-[var(--muted)]">
              Invoice store unavailable. Run <code>npm run db:push</code> after deploying payment
              models.
            </p>
          )}

          {!dbError && !invoice && (
            <p className="mt-8 text-sm text-[var(--muted)]">Invoice not found.</p>
          )}

          {invoice && !allowed && (
            <div className="mt-8 text-sm">
              <p className="text-[var(--muted)]">
                Sign in with the email used at checkout to view this invoice.
              </p>
              <Link
                href={`/login?next=/account/invoices/${id}`}
                className="mt-4 inline-block text-[var(--brass-dim)] underline"
              >
                Sign in
              </Link>
            </div>
          )}

          {invoice && allowed && (
            <div className="mt-8 space-y-4 text-sm">
              <p>
                <span className="text-[var(--muted)]">Bill to</span>
                <br />
                <span className="font-semibold">{invoice.userEmail}</span>
              </p>
              <p>
                <span className="text-[var(--muted)]">Issued</span>
                <br />
                {invoice.issuedAt.toISOString().slice(0, 10)} · {invoice.status}
              </p>
              <ul className="space-y-2 border-t border-[var(--line)] pt-4">
                {lineItems.map((li, i) => (
                  <li key={`${li.description}-${i}`} className="flex justify-between gap-4">
                    <span>
                      {li.description}
                      <span className="text-[var(--muted)]"> × {li.quantity}</span>
                    </span>
                    <span className="font-semibold">
                      {formatMoney(li.amount, invoice.currency as Currency)}
                    </span>
                  </li>
                ))}
              </ul>
              {invoice.taxAmount > 0 && (
                <p className="flex justify-between gap-4">
                  <span className="text-[var(--muted)]">
                    {invoice.taxLabel ?? "Tax"}
                    {invoice.taxRateBps
                      ? ` (${(invoice.taxRateBps / 100).toFixed(2)}%)`
                      : ""}
                  </span>
                  <span>{formatMoney(invoice.taxAmount, invoice.currency as Currency)}</span>
                </p>
              )}
              <p className="flex justify-between gap-4 border-t border-[var(--line)] pt-3 text-base">
                <span className="font-semibold">Total</span>
                <span className="font-semibold">
                  {formatMoney(invoice.totalAmount, invoice.currency as Currency)} (
                  {invoice.currency})
                </span>
              </p>
              <p className="text-xs text-[var(--fog)]">
                Formal invoice for your books. Card data is never stored by {BRAND.name}.
              </p>
              <p>
                <Link
                  href={`/account/invoices/${id}/print`}
                  className="text-[var(--brass-dim)] underline"
                  target="_blank"
                >
                  Printable HTML invoice
                </Link>
              </p>
              {invoice.transactionId && (
                <p>
                  <Link
                    href={`/account/receipts/${invoice.transactionId}`}
                    className="text-[var(--muted)] underline"
                  >
                    Payment receipt
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
