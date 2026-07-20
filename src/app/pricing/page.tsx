import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CheckoutButton } from "@/components/CheckoutButton";
import { WaitlistForm } from "@/components/WaitlistForm";
import { VAULT_PLANS, FOUNDRY_PLANS } from "@/lib/pricing";

export default function PricingPage() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-6 py-16">
          <h1 className="text-3xl font-semibold tracking-tight">Pricing</h1>
          <p className="mt-2 max-w-2xl text-neutral-400">
            Two products, one account. Vault subscribers get 10% off Foundry Kit automatically.
          </p>

          <h2 className="mt-12 text-lg font-semibold text-neutral-300">Build-Intel Vault</h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-3">
            {VAULT_PLANS.map((plan) => (
              <div key={plan.id} className="flex flex-col rounded-xl border border-neutral-800 p-6">
                <p className="font-medium">{plan.name}</p>
                <p className="mt-2">
                  <span className="text-3xl font-semibold">{plan.price}</span>{" "}
                  <span className="text-sm text-neutral-500">{plan.cadence}</span>
                </p>
                <p className="mt-2 text-sm text-neutral-400">{plan.description}</p>
                <ul className="mt-4 flex-1 space-y-2 text-sm text-neutral-400">
                  {plan.features.map((f) => (
                    <li key={f}>• {f}</li>
                  ))}
                </ul>
                <div className="mt-6">
                  {plan.mode === "none" ? (
                    <WaitlistForm cta={plan.cta} />
                  ) : (
                    <CheckoutButton planId={plan.id} label={plan.cta} primary={plan.id === "vault-pro"} />
                  )}
                </div>
              </div>
            ))}
          </div>

          <h2 className="mt-16 text-lg font-semibold text-neutral-300">Foundry Kit</h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            {FOUNDRY_PLANS.map((plan) => (
              <div key={plan.id} className="flex flex-col rounded-xl border border-neutral-800 p-6">
                <p className="font-medium">{plan.name}</p>
                <p className="mt-2">
                  <span className="text-3xl font-semibold">{plan.price}</span>{" "}
                  <span className="text-sm text-neutral-500">{plan.cadence}</span>
                </p>
                <p className="mt-2 text-sm text-neutral-400">{plan.description}</p>
                <ul className="mt-4 flex-1 space-y-2 text-sm text-neutral-400">
                  {plan.features.map((f) => (
                    <li key={f}>• {f}</li>
                  ))}
                </ul>
                <div className="mt-6">
                  <CheckoutButton planId={plan.id} label={plan.cta} primary={plan.id === "foundry-solo"} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
