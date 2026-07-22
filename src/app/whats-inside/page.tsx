import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { FOUNDRY_PLANS, VAULT_PLANS } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "What's inside — Gitosha plans & Foundry zip",
  description: "Feature inventory for Vault plans and the Foundry Solo / Agency zip.",
};

export default function WhatsInsidePage() {
  const solo = FOUNDRY_PLANS.find((p) => p.id === "foundry-solo")!;
  const agency = FOUNDRY_PLANS.find((p) => p.id === "foundry-agency")!;
  const operator = VAULT_PLANS.find((p) => p.id === "vault-pro")!;

  return (
    <>
      <Nav />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 pb-16 pt-28 sm:pb-20 sm:pt-32">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brass)]">
            Inventory
          </p>
          <h1 className="mt-3 font-display text-5xl font-bold tracking-tight">
            What’s included — no mystery box
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-[var(--muted)]">
            Every line below matches Pricing. If it’s listed here, it’s in the product or the zip —
            scored research, kill criteria, export, Foundry kit contents, agency templates, license,
            and support scope.
          </p>
          <div className="rule mt-8 max-w-[6rem]" />

          <h2 className="mt-12 font-display text-xl font-semibold">Operator (Vault)</h2>
          <ul className="mt-4 space-y-2.5 text-base text-[var(--fog)]">
            {operator.features.map((f) => (
              <li key={f}>— {f}</li>
            ))}
          </ul>

          <h2 className="mt-12 font-display text-xl font-semibold">Foundry Solo zip</h2>
          <ul className="mt-4 space-y-2.5 text-base text-[var(--fog)]">
            {solo.features.map((f) => (
              <li key={f}>— {f}</li>
            ))}
          </ul>

          <h2 className="mt-12 font-display text-xl font-semibold text-[var(--brass)]">
            Agency adds on top of Solo
          </h2>
          <ul className="mt-4 space-y-2.5 text-base text-[var(--fog)]">
            {agency.features
              .filter((f) => !f.startsWith("Everything in Solo"))
              .map((f) => (
                <li key={f}>— {f}</li>
              ))}
          </ul>

          <div className="mt-12 flex flex-wrap gap-3">
            <Link href="/pricing" className="btn-primary px-5 py-2.5 text-sm">
              Open pricing
            </Link>
            <Link href="/foundry-kit" className="btn-ghost px-5 py-2.5 text-sm text-[var(--fog)]">
              Foundry page
            </Link>
            <Link href="/faq" className="btn-ghost px-5 py-2.5 text-sm text-[var(--fog)]">
              FAQ
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
