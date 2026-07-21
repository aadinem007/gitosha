import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string; email?: string; product?: string }>;
}) {
  const { key, email, product } = await searchParams;
  const isFoundry = product !== "vault";

  return (
    <>
      <Nav />
      <main className="flex-1">
        <section className="mx-auto max-w-lg px-6 py-24 text-center">
          <h1 className="text-2xl font-semibold">Payment successful.</h1>
          <p className="mt-3 text-neutral-400">
            {isFoundry
              ? "Your Foundry Kit license is ready. Save it somewhere safe."
              : "Your Vault access is unlocked. Sign in with the same email to open the full database."}
          </p>

          {key && (
            <div className="mt-8 rounded-xl border border-emerald-800 bg-emerald-950/40 px-4 py-5">
              <p className="text-xs uppercase tracking-widest text-emerald-400">License key</p>
              <p className="mt-2 font-mono text-xl font-semibold tracking-wide text-white">{key}</p>
              {email && <p className="mt-2 text-xs text-neutral-500">Issued to {email}</p>}
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {isFoundry ? (
              <Link
                href="/foundry-kit"
                className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-neutral-950"
              >
                View Foundry Kit details
              </Link>
            ) : (
              <Link
                href="/login"
                className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-neutral-950"
              >
                Sign in to Vault
              </Link>
            )}
            <Link
              href="/pricing"
              className="rounded-lg border border-neutral-700 px-4 py-2.5 text-sm font-semibold text-white"
            >
              See all plans
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
