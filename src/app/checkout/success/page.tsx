import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { LicensePortal } from "@/components/LicensePortal";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string; email?: string; product?: string }>;
}) {
  const { key = "", email = "", product } = await searchParams;
  const isVault = product === "vault";
  const isFoundry = product === "foundry" || product === "bundle" || Boolean(key);

  return (
    <>
      <Nav />
      <main className="flex-1">
        <section className="mx-auto max-w-lg px-6 py-20">
          <h1 className="text-center font-display text-3xl font-bold">Payment confirmed.</h1>

          {isVault && !isFoundry ? (
            <div className="mt-6 text-center">
              <p className="text-[var(--muted)]">
                Operator access is unlocked. Sign in with the same email you paid with.
              </p>
              <Link
                href="/login"
                className="mt-8 inline-block rounded-md bg-[var(--brass)] px-4 py-2.5 text-sm font-semibold text-[var(--hull)]"
              >
                Sign in to Vault
              </Link>
            </div>
          ) : (
            <div className="mt-6">
              <p className="text-center text-[var(--muted)]">
                Your Foundry kit is ready. Download the zip below — this is the product you paid for.
              </p>

              {key && (
                <div className="mt-6 rounded-lg border border-[var(--brass)]/40 bg-[var(--panel)] px-4 py-5 text-center">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brass)]">
                    License key — save this
                  </p>
                  <p className="mt-2 font-mono text-xl font-semibold tracking-wide">{key}</p>
                  {email && <p className="mt-2 text-xs text-[var(--muted)]">Issued to {email}</p>}
                </div>
              )}

              <div className="mt-8">
                <LicensePortal initialEmail={email} initialKey={key} />
              </div>

              {product === "bundle" && (
                <p className="mt-6 text-center text-sm text-[var(--signal)]">
                  Bundle bonus: Vault is unlocked too —{" "}
                  <Link href="/login" className="underline">
                    sign in
                  </Link>{" "}
                  with {email || "your purchase email"}.
                </p>
              )}
            </div>
          )}

          <div className="mt-10 flex justify-center gap-4 text-sm">
            <Link href="/license" className="text-[var(--muted)] hover:text-[var(--ink)]">
              License portal
            </Link>
            <Link href="/pricing" className="text-[var(--muted)] hover:text-[var(--ink)]">
              All plans
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
