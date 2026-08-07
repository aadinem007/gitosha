import type { Metadata } from "next";
import Link from "next/link";
import { AdminDenied, AdminShell } from "@/components/AdminShell";
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
    <AdminShell
      title="Payments"
      wide
      description={
        <>
          Provider toggles, transaction history, refunds, webhook log.{" "}
          <Link href="/admin/legal" className="underline">
            Legal admin
          </Link>{" "}
          ·{" "}
          <Link href="/legal/refunds" className="underline">
            Refund policy
          </Link>
        </>
      }
    >
      {admin.ok ? (
        <PaymentsAdminPanel />
      ) : (
        <AdminDenied status={admin.status} loginNext="/admin/payments" />
      )}
    </AdminShell>
  );
}
