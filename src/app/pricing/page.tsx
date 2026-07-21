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
    <div
      className={`flex flex-col rounded-lg border p-6 ${
        plan.highlight
          ? "border-[var(--brass)] bg-[var(--panel)]"
          : "border-[var(--line)] bg-[var(--panel)]/50"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="font-display text-lg font-semibold">{plan.name}</p>
        {plan.badge && (
          <span className="rounded bg-[var(--brass)]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--brass)]">
            {plan.badge}
          </span>
        )}
      </div>
      <p className="mt-3">
        <span className="font-display text-3xl font-bold">{plan.price}</span>{" "}
        <span className="text-sm text-[var(--muted)]">{plan.cadence}</span>
      </p>
      <p className="mt-2 text-sm text-[var(--muted)]">{plan.description}</p>
      <ul className="mt-4 flex-1 space-y-2 text-sm text-[var(--fog)]">
        {plan.features.map((f) => (
          <li key={f}>— {f}</li>
        ))}
      </ul>
      <div className="mt-6">
        {plan.mode === "none" ? (
          <WaitlistForm cta={plan.cta} />
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
        <section className="mx-auto max-w-6xl px-6 py-16">
          <h1 className="font-display text-4xl font-bold tracking-tight">Pricing</h1>
          <p className="mt-3 max-w-2xl text-[var(--muted)]">
            Launch pricing is capped for early operators. One account covers research and scaffolds.
            Indian payments via Razorpay (UPI, cards, netbanking).
          </p>

          <h2 className="mt-14 font-display text-lg font-semibold text-[var(--fog)]">The Vault</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VAULT_PLANS.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>

          <h2 className="mt-16 font-display text-lg font-semibold text-[var(--fog)]">
            Foundry &amp; bundles
          </h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-3">
            {FOUNDRY_PLANS.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>

          <p className="mt-10 text-xs text-[var(--muted)]">
            Operator launch price (₹999/mo) applies to the first 100 paying operators, then returns
            to ₹1,499/mo. All prices in INR. Test Mode uses fake money until Live keys are enabled.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
