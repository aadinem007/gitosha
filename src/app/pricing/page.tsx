import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { PlanCard } from "@/components/PlanCard";
import { VAULT_PLANS, FOUNDRY_PLANS } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Pricing — Vault & Foundry | Gitosha",
  description:
    "Scout free forever. Operator unlocks the research vault. Foundry Solo and Agency ship production foundations — clear USD pricing.",
};

export default function PricingPage() {
  return (
    <>
      <Nav />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <div className="pricing-page">
          <header className="mx-auto max-w-6xl px-4 pb-2 pt-28 sm:px-6 sm:pt-32">
            <p className="kicker animate-rise">
              <Link href="/" className="page-crumb">
                Home
              </Link>
              <span aria-hidden="true"> / </span>
              Pricing
            </p>
            <h1 className="animate-rise-delay mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
              Clear price.
              <span className="mt-1 block w-fit bg-[var(--brass)] px-2 text-[var(--ink)]">
                Packed value.
              </span>
            </h1>
            <p className="animate-rise-delay-2 mt-5 max-w-2xl text-lg leading-relaxed text-[var(--support)]">
              Scout is free forever. Operator unlocks the full research vault. Foundry is a one-time
              production-ready foundation — Agency is the studio license that pays for itself on the
              second client build.
            </p>

            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2">
              <Link href="/foundry" className="text-link">
                Foundry story →
              </Link>
              <Link href="/foundry-kit" className="text-link">
                Buy Foundry →
              </Link>
              <Link href="/faq" className="text-link">
                FAQ
              </Link>
              <Link href="/refund" className="text-link">
                Refunds
              </Link>
            </div>
          </header>

          <section className="pricing-deck mx-auto max-w-6xl px-4 pb-8 sm:px-6">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-[var(--fog)] sm:text-3xl">
              Vault — scored research
            </h2>
            <div className="pricing-plan-grid pricing-plan-grid--vault mt-5">
              {VAULT_PLANS.map((plan) => (
                <PlanCard key={plan.id} plan={plan} />
              ))}
            </div>

            <h2 className="mt-16 font-display text-2xl font-semibold tracking-tight text-[var(--fog)] sm:text-3xl">
              Foundry — ship kit &amp; studio license
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-[var(--support)]">
              Agency at $249 is not “more code.” It’s unlimited client use, white-label, templates,
              priority support, and a year of Studio Vault — so your next three client SaaS builds
              don’t restart from zero.
            </p>
            <div className="pricing-plan-grid pricing-plan-grid--foundry mt-5">
              {FOUNDRY_PLANS.map((plan) => (
                <PlanCard key={plan.id} plan={plan} />
              ))}
            </div>

            <div className="cta-band mt-14">
              <p className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                Know what to build. Then ship it.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/foundry-kit" className="btn-primary">
                  Open Foundry
                </Link>
                <Link href="/" className="btn-ghost">
                  Home
                </Link>
                <Link href="/refund" className="btn-ghost">
                  Refunds
                </Link>
              </div>
            </div>

            <p className="mt-8 text-xs leading-relaxed text-[var(--support)]">
              Operator launch price ($15/mo) applies to the first 100 paying seats, then returns to
              $19/mo. Prices shown in USD. Checkout uses your configured payment provider. By
              purchasing you agree to{" "}
              <Link href="/terms" className="underline underline-offset-2 hover:text-[var(--ink)]">
                Terms
              </Link>
              ,{" "}
              <Link href="/privacy" className="underline underline-offset-2 hover:text-[var(--ink)]">
                Privacy
              </Link>
              , and{" "}
              <Link href="/refund" className="underline underline-offset-2 hover:text-[var(--ink)]">
                Refund
              </Link>{" "}
              policies.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
