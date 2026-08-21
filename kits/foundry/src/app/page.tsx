import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex max-w-3xl flex-1 flex-col justify-center px-6 py-24">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
        Foundry Kit
      </p>
      <h1 className="mt-4 text-4xl font-bold tracking-tight">Your SaaS starts here.</h1>
      <p className="mt-4 max-w-xl text-[var(--muted)]">
        Auth, database, Xflow UPI billing, webhooks, and security headers are already wired.
        Replace this homepage with your product story and ship.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/pricing"
          className="rounded-md bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[#04120c]"
        >
          View pricing
        </Link>
        <Link
          href="/login"
          className="rounded-md border border-[var(--line)] px-4 py-2.5 text-sm font-semibold"
        >
          Sign in
        </Link>
        <Link href="/dashboard" className="px-4 py-2.5 text-sm text-[var(--muted)] hover:text-[var(--ink)]">
          Dashboard →
        </Link>
      </div>
    </main>
  );
}
