import { CheckoutButton } from "@/components/CheckoutButton";
import { PLANS } from "@/lib/pricing";

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold">Pricing</h1>
      <p className="mt-2 text-[var(--muted)]">Edit amounts in src/lib/pricing.ts — one source of truth.</p>
      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`flex flex-col rounded-lg border p-6 ${
              "highlight" in plan && plan.highlight ? "border-[var(--accent)]" : "border-[var(--line)]"
            }`}
          >
            <p className="text-lg font-semibold">{plan.name}</p>
            <p className="mt-2 text-3xl font-bold">
              {plan.price}
              <span className="text-sm font-normal text-[var(--muted)]">{plan.cadence}</span>
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">{plan.description}</p>
            <ul className="mt-4 flex-1 space-y-1 text-sm text-[var(--muted)]">
              {plan.features.map((f) => (
                <li key={f}>— {f}</li>
              ))}
            </ul>
            <div className="mt-6">
              <CheckoutButton
                planId={plan.id}
                label={`Buy ${plan.name}`}
                primary={"highlight" in plan && !!plan.highlight}
              />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
