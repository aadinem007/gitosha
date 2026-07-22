import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CheckoutButton } from "@/components/CheckoutButton";
import { WaitlistForm } from "@/components/WaitlistForm";
import { TrackField } from "@/components/TrackField";
import { VAULT_PLANS, FOUNDRY_PLANS } from "@/lib/pricing";

function PlanCard({
  plan,
}: {
  plan: (typeof VAULT_PLANS)[number] | (typeof FOUNDRY_PLANS)[number];
}) {
  return (
    <div className={`plan-shell isolate overflow-hidden ${plan.highlight ? "is-hot" : ""}`}>
      <div className="flex min-w-0 items-start justify-between gap-2">
        <p className="font-display text-xl leading-tight tracking-wide">{plan.name}</p>
        {plan.badge && (
          <span className="shrink-0 border border-[var(--brass)]/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--brass)]">
            {plan.badge}
          </span>
        )}
      </div>
      <p className="mt-3">
        <span className="font-display text-3xl tracking-wide">{plan.price}</span>{" "}
        <span className="text-sm text-[var(--support)]">{plan.cadence}</span>
      </p>
      <p className="mt-2 text-[0.95rem] leading-relaxed text-[var(--support)]">{plan.description}</p>
      <ul className="mt-4 flex-1 space-y-2.5 text-[1.05rem] leading-snug text-[var(--support)]">
        {plan.features.map((f) => (
          <li key={f} className="leading-snug">
            — {f}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[10px] uppercase tracking-[0.14em] text-[var(--support)]">
        {plan.features.length} inclusions
      </p>
      <div className="relative z-10 mt-6 min-w-0">
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
        <section className="page-hero page-hero-atmos">
          <TrackField intensity="quiet" />
          <div className="page-hero-content">
            <p className="page-kicker animate-rise">
              <Link href="/" className="page-crumb">
                Home
              </Link>
              <span aria-hidden="true"> / </span>
              Pricing
            </p>
            <h1 className="animate-rise-delay mt-3">
              Clear price.
              <span className="block text-[var(--brass)]">Packed value.</span>
            </h1>
            <div className="rule mt-6 max-w-[8rem]" />
            <p className="animate-rise-delay-2 mt-6 max-w-2xl text-lg leading-relaxed text-[var(--support)]">
              Scout is free forever. Operator unlocks the full research vault. Foundry is a one-time
              production scaffold — Agency is the studio license that pays for itself on the second
              client build.
            </p>

            <div className="mt-8 flex flex-wrap gap-4 text-sm uppercase tracking-[0.12em]">
              <Link href="/foundry-kit" className="text-[var(--brass)] hover:underline">
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
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-8">
          <h2 className="font-display text-3xl tracking-wide text-[var(--fog)]">
            Vault — scored research
          </h2>
          <div className="mt-5 grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {VAULT_PLANS.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>

          <h2 className="mt-20 font-display text-3xl tracking-wide text-[var(--fog)]">
            Foundry — ship kit &amp; studio license
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-[var(--support)]">
            Agency at ₹29,999 is not “more code.” It’s unlimited client use, white-label, templates,
            priority support, and a year of Studio Vault — so your next three client SaaS builds
            don’t restart from zero.
          </p>
          <div className="mt-5 grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FOUNDRY_PLANS.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>

          <div className="cta-band mt-16">
            <p className="font-display text-2xl tracking-wide sm:text-3xl">
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
            Operator launch price (₹999/mo) applies to the first 100 paying seats, then returns to
            ₹1,499/mo. Prices shown in ₹. Checkout accepts card and UPI. By purchasing you agree to{" "}
            <a href="/terms" className="text-[var(--brass)] hover:underline">
              Terms
            </a>
            ,{" "}
            <a href="/privacy" className="text-[var(--brass)] hover:underline">
              Privacy
            </a>
            , and{" "}
            <a href="/refund" className="text-[var(--brass)] hover:underline">
              Refund
            </a>{" "}
            policies.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
