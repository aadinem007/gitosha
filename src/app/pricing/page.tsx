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
    <div className={`plan-shell isolate overflow-hidden ${plan.highlight ? "is-hot" : ""}`}>
      <div className="flex min-w-0 items-start justify-between gap-2">
        <p className="font-display text-lg font-semibold leading-tight">{plan.name}</p>
        {plan.badge && (
          <span className="shrink-0 rounded bg-[var(--brass)]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--brass)]">
            {plan.badge}
          </span>
        )}
      </div>
      <p className="mt-3">
        <span className="font-display text-3xl font-bold">{plan.price}</span>{" "}
        <span className="text-sm text-[var(--muted)]">{plan.cadence}</span>
      </p>
      <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{plan.description}</p>
      <ul className="mt-4 flex-1 space-y-2 text-sm text-[var(--fog)]">
        {plan.features.map((f) => (
          <li key={f} className="leading-snug">
            — {f}
          </li>
        ))}
      </ul>
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
        <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brass)]">
            Plans
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">Pricing</h1>
          <p className="mt-4 max-w-2xl text-[var(--muted)] leading-relaxed">
            Launch pricing for early operators. Research and scaffolds under one roof. Pay in INR
            via UPI, cards, or netbanking.
          </p>

          <h2 className="mt-16 font-display text-lg font-semibold text-[var(--fog)]">The Vault</h2>
          <div className="mt-5 grid items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {VAULT_PLANS.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>

          <h2 className="mt-20 font-display text-lg font-semibold text-[var(--fog)]">
            Foundry &amp; bundles
          </h2>
          <div className="mt-5 grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FOUNDRY_PLANS.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>

          <p className="mt-12 text-xs leading-relaxed text-[var(--muted)]">
            Operator launch price (₹999/mo) applies to the first 100 paying operators, then returns
            to ₹1,499/mo. All prices in INR.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
