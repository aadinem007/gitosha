import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { LegalAdminPanel } from "@/components/LegalAdminPanel";
import { BRAND } from "@/lib/brand";
import { requireLegalAdmin } from "@/lib/legal/admin";

export const metadata: Metadata = {
  title: `Legal admin — ${BRAND.name}`,
  robots: { index: false, follow: false },
};

export default async function AdminLegalPage() {
  const admin = await requireLegalAdmin();

  return (
    <>
      <Nav />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <div className="mx-auto max-w-3xl px-6 pb-16 pt-28 sm:pb-20 sm:pt-32">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brass-dim)]">
            Admin
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight">Legal configuration</h1>
          <p className="mt-3 text-sm text-[var(--muted)]">
            Authorized operators only.{" "}
            <Link href="/legal" className="underline">
              Public legal index
            </Link>
          </p>
          <div className="rule mt-8 max-w-[6rem]" />
          <div className="mt-10">
            {admin.ok ? (
              <LegalAdminPanel />
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
                  <Link href="/login?next=/admin/legal" className="text-[var(--brass-dim)] underline">
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
