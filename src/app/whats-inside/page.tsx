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
  const studio = VAULT_PLANS.find((p) => p.id === "vault-team")!;
  const bundle = FOUNDRY_PLANS.find((p) => p.id === "bundle-launch")!;

  return (
    <>
      <Nav />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <section className="mx-auto max-w-3xl px-6 pb-16 pt-28 sm:pb-20 sm:pt-32">
          <p className="kicker">Inventory</p>
          <h1 className="mt-3 font-display text-5xl font-bold tracking-tight">
            What’s included — no mystery box
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-[var(--support)]">
            Every line below matches Pricing. If it’s listed here, it’s in the product or the zip —
            scored research, kill criteria, export, Foundry kit contents, agency templates, license,
            and support scope.
          </p>
          <div className="rule mt-7 max-w-[6rem]" />

          <h2 className="mt-10 font-display text-xl font-semibold">Operator (Vault)</h2>
          <ul className="mt-3 space-y-2 text-[1.05rem] leading-snug text-[var(--support)]">
            {operator.features.map((f) => (
              <li key={f}>— {f}</li>
            ))}
          </ul>

          <h2 className="mt-10 font-display text-xl font-semibold">Studio (Vault)</h2>
          <ul className="mt-3 space-y-2 text-[1.05rem] leading-snug text-[var(--support)]">
            {studio.features.map((f) => (
              <li key={f}>— {f}</li>
            ))}
          </ul>

          <h2 className="mt-10 font-display text-xl font-semibold">Foundry Solo zip</h2>
          <ul className="mt-3 space-y-2 text-[1.05rem] leading-snug text-[var(--support)]">
            {solo.features.map((f) => (
              <li key={f}>— {f}</li>
            ))}
          </ul>

          <h2 className="mt-10 font-display text-xl font-semibold">Agency adds on top of Solo</h2>
          <ul className="mt-3 space-y-2 text-[1.05rem] leading-snug text-[var(--support)]">
            {agency.features
              .filter((f) => !f.startsWith("Everything in Solo"))
              .map((f) => (
                <li key={f}>— {f}</li>
              ))}
          </ul>

          <h2 className="mt-10 font-display text-xl font-semibold">Launch Bundle</h2>
          <ul className="mt-3 space-y-2 text-[1.05rem] leading-snug text-[var(--support)]">
            {bundle.features.map((f) => (
              <li key={f}>— {f}</li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/pricing" className="btn-primary">
              Open pricing
            </Link>
            <Link href="/foundry" className="btn-ghost">
              Foundry story
            </Link>
            <Link href="/foundry-kit" className="btn-ghost">
              Buy Foundry
            </Link>
            <Link href="/faq" className="btn-ghost">
              FAQ
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
