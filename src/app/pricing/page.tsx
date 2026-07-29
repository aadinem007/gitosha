import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CheckoutButton } from "@/components/CheckoutButton";
import { WaitlistForm } from "@/components/WaitlistForm";
import { VAULT_PLANS, FOUNDRY_PLANS } from "@/lib/pricing";

function PlanCard({
  plan,
}: {
  plan: (typeof VAULT_PLANS)[number] | (typeof FOUNDRY_PLANS)[number];
}) {
  return (
    <div className={`plan-shell isolate ${plan.highlight ? "is-hot" : ""}`}>
      <div className="flex min-w-0 items-start justify-between gap-2">
        <p className="font-display text-xl font-semibold leading-tight tracking-tight text-[var(--ink)]">
          {plan.name}
        </p>
        {plan.badge && (
          <span className="shrink-0 bg-[var(--brass)] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[var(--ink)] shadow-[3px_3px_0_rgba(10,10,10,0.85)]">
            {plan.badge}
          </span>
        )}
      </div>
      <p className="mt-3">
        <span className="font-display text-3xl font-semibold tracking-tight text-[var(--ink)]">
          {plan.price}
        </span>{" "}
        <span className="text-sm font-medium text-[var(--muted)]">{plan.cadence}</span>
      </p>
      <p className="mt-2 text-[0.95rem] leading-relaxed text-[var(--support)]">{plan.description}</p>
      <ul className="mt-4 flex-1 space-y-2.5 text-[1.05rem] leading-snug text-[var(--support)]">
        {plan.features.map((f) => (
          <li key={f} className="leading-snug">
            — {f}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--signal)]">
        {plan.features.length} inclusions
      </p>
      <div className="relative z-10 mt-6 min-w-0 overflow-visible">
        {plan.mode === "none" ? (
          <WaitlistForm cta={plan.cta} layout="stack" />
        ) : (
          <CheckoutButton planId={plan.id} label={plan.cta} primary={!!plan.highlight} />
        )}
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        {/* One continuous field — no hero canvas seam */}
        <div className="pricing-page">
          <header className="mx-auto max-w-6xl px-6 pb-2 pt-28 sm:pt-32">
            <p className="page-kicker animate-rise">
              <Link href="/" className="page-crumb">
                Home
              </Link>
              <span aria-hidden="true"> / </span>
              Pricing
            </p>
            <h1 className="animate-rise-delay mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
              Clear price.
              <span className="mt-1 block text-[var(--ink)] bg-[var(--brass)] w-fit px-2">Packed value.</span>
            </h1>
            <p className="animate-rise-delay-2 mt-6 max-w-2xl text-lg leading-relaxed text-[var(--support)]">
              Scout is free forever. Operator unlocks the full research vault. Foundry is a one-time
              production scaffold — Agency is the studio license that pays for itself on the second
              client build.
            </p>

            <div className="mt-8 flex flex-wrap gap-4 text-sm font-semibold uppercase tracking-[0.12em]">
              <Link
                href="/foundry-kit"
                className="text-[var(--ink)] underline decoration-[var(--brass)] decoration-2 underline-offset-4"
              >
                Buy Foundry →
              </Link>
              <Link href="/faq" className="text-[var(--support)] hover:text-[var(--ink)]">
                FAQ
              </Link>
              <Link href="/refund" className="text-[var(--support)] hover:text-[var(--ink)]">
                Refunds
              </Link>
              <Link href="/terms" className="text-[var(--support)] hover:text-[var(--ink)]">
                Terms
              </Link>
            </div>
          </header>

          <section className="pricing-deck mx-auto max-w-6xl px-6 pb-8">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-[var(--fog)] sm:text-3xl">
              Vault — scored research
            </h2>
            <div className="mt-5 grid items-stretch gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {VAULT_PLANS.map((plan) => (
                <PlanCard key={plan.id} plan={plan} />
              ))}
            </div>

            <h2 className="mt-20 font-display text-2xl font-semibold tracking-tight text-[var(--fog)] sm:text-3xl">
              Foundry — ship kit &amp; studio license
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-[var(--support)]">
              Agency at $249 is not “more code.” It’s unlimited client use, white-label, templates,
              priority support, and a year of Studio Vault — so your next three client SaaS builds
              don’t restart from zero.
            </p>
            <div className="mt-5 grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FOUNDRY_PLANS.map((plan) => (
                <PlanCard key={plan.id} plan={plan} />
              ))}
            </div>

            <div className="cta-band mt-16">
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

            <p className="mt-10 text-xs leading-relaxed text-[var(--support)]">
              Operator launch price ($15/mo) applies to the first 100 paying seats, then returns to
              $19/mo. Prices shown in USD. Checkout uses your configured payment provider. By
              purchasing you agree to{" "}
              <a href="/terms" className="text-[var(--brass-dim)] hover:underline">
                Terms
              </a>
              ,{" "}
              <a href="/privacy" className="text-[var(--brass-dim)] hover:underline">
                Privacy
              </a>
              , and{" "}
              <a href="/refund" className="text-[var(--brass-dim)] hover:underline">
                Refund
              </a>{" "}
              policies.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
