import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email?.toLowerCase();
  const customer = email ? await prisma.customer.findUnique({ where: { email } }) : null;

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">Signed in as {email ?? "unknown"}</p>
      <div className="mt-8 rounded-lg border border-[var(--line)] bg-[var(--panel)] p-5">
        <p className="text-sm font-semibold">Billing status</p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {customer
            ? `Active · plan ${customer.planId ?? "unknown"} · ${customer.status}`
            : "No paid plan yet."}
        </p>
        {!customer && (
          <Link href="/pricing" className="mt-4 inline-block text-sm font-semibold text-[var(--accent)]">
            Go to pricing →
          </Link>
        )}
      </div>
    </main>
  );
}
