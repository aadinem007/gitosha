import type { Metadata } from "next";
import Link from "next/link";
import { AdminDenied, AdminShell } from "@/components/AdminShell";
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
    <AdminShell
      title="Legal configuration"
      description={
        <>
          Authorized operators only.{" "}
          <Link href="/legal" className="underline">
            Public legal index
          </Link>
        </>
      }
    >
      {admin.ok ? (
        <LegalAdminPanel />
      ) : (
        <AdminDenied status={admin.status} loginNext="/admin/legal" />
      )}
    </AdminShell>
  );
}
