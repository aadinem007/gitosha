import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string; email?: string; product?: string }>;
}) {
  const { key, email, product } = await searchParams;
  const isVault = product === "vault";

  return (
    <>
      <Nav />
      <main className="flex-1">
        <section className="mx-auto max-w-lg px-6 py-24 text-center">
          <h1 className="font-display text-3xl font-bold">Payment confirmed.</h1>
          <p className="mt-3 text-[var(--muted)]">
            {isVault
              ? "Operator access is unlocked. Sign in with the same email to open the Vault."
              : "Your license is ready. Save it — this page is the receipt."}
          </p>

          {key && (
            <div className="mt-8 rounded-lg border border-[var(--brass)]/40 bg-[var(--panel)] px-4 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brass)]">
                License key
              </p>
              <p className="mt-2 font-mono text-xl font-semibold tracking-wide">{key}</p>
              {email && <p className="mt-2 text-xs text-[var(--muted)]">Issued to {email}</p>}
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {isVault ? (
              <Link
                href="/login"
                className="rounded-md bg-[var(--brass)] px-4 py-2.5 text-sm font-semibold text-[var(--hull)]"
              >
                Sign in to Vault
              </Link>
            ) : (
              <Link
                href="/foundry-kit"
                className="rounded-md bg-[var(--brass)] px-4 py-2.5 text-sm font-semibold text-[var(--hull)]"
              >
                Back to Foundry
              </Link>
            )}
            <Link
              href="/pricing"
              className="rounded-md border border-[var(--line)] px-4 py-2.5 text-sm font-semibold"
            >
              All plans
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
