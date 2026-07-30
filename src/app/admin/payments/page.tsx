import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { PaymentsAdminPanel } from "@/components/PaymentsAdminPanel";
import { BRAND } from "@/lib/brand";
import { requireLegalAdmin } from "@/lib/legal/admin";

export const metadata: Metadata = {
  title: `Payments admin — ${BRAND.name}`,
  robots: { index: false, follow: false },
};

export default async function AdminPaymentsPage() {
  const admin = await requireLegalAdmin();

  return (
    <>
      <Nav />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <div className="mx-auto max-w-5xl px-4 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-32">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brass-dim)]">
            Admin
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight">Payments</h1>
          <p className="mt-3 text-sm text-[var(--muted)]">
            Provider toggles, transaction history, refunds, webhook log.{" "}
            <Link href="/admin/legal" className="underline">
              Legal admin
            </Link>{" "}
            ·{" "}
            <Link href="/legal/refunds" className="underline">
              Refund policy
            </Link>
          </p>
          <div className="rule mt-8 max-w-[6rem]" />
          <div className="mt-10">
            {admin.ok ? (
              <PaymentsAdminPanel />
            ) : (
              <div className="rounded-sm border border-[var(--line)] bg-[var(--panel)] p-6 text-sm">
                <p className="font-semibold text-[var(--ink)]">
                  {admin.status === 401 ? "Sign in required" : "Forbidden"}
                </p>
                <p className="mt-2 text-[var(--muted)]">
                  Access is deny-by-default. Your session email must be listed in{" "}
                  <code>LEGAL_ADMIN_EMAILS</code> or <code>ADMIN_EMAILS</code>.
                </p>
                <p className="mt-4">
                  <Link
                    href="/login?next=/admin/payments"
                    className="text-[var(--brass-dim)] underline"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
