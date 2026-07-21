import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CheckoutButton } from "@/components/CheckoutButton";
import { FOUNDRY_PLANS } from "@/lib/pricing";

const STACK = [
  "Next.js App Router + TypeScript",
  "Tailwind CSS design tokens",
  "Postgres via Prisma (subscribers, licenses, ideas)",
  "Magic-link authentication",
  "Razorpay checkout + signed webhooks",
  "Rate-limited APIs + CSP / HSTS headers",
  "Honeypot waitlist + server-side amount locking",
  "Docker + CI pipeline",
];

const WHY = [
  "Module layout you can extend without guessing",
  "Architecture docs that map every concern",
  "Billing and unlock logic already proven on this site",
  "You inherit the same payment path customers just used",
  "Security defaults included — not bolted on later",
];

export default function FoundryKitPage() {
  const solo = FOUNDRY_PLANS.find((p) => p.id === "foundry-solo")!;
  const agency = FOUNDRY_PLANS.find((p) => p.id === "foundry-agency")!;
  const bundle = FOUNDRY_PLANS.find((p) => p.id === "bundle-launch")!;

  return (
    <>
      <Nav />
      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-6 py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brass)]">
            Production scaffold
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight">Foundry</h1>
          <p className="mt-4 max-w-2xl text-[var(--muted)]">
            The undifferentiated work behind every SaaS — auth, database, billing, webhooks, deploy —
            packaged so you spend weeks on the product, not the plumbing. This is the same foundation
            Shipyard itself runs on.
          </p>

          <div className="mt-12 grid gap-10 sm:grid-cols-2">
            <div>
              <h2 className="font-display text-sm font-semibold text-[var(--fog)]">What ships</h2>
              <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
                {STACK.map((item) => (
                  <li key={item}>— {item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="font-display text-sm font-semibold text-[var(--fog)]">Why it holds up</h2>
              <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
                {WHY.map((item) => (
                  <li key={item}>— {item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-3">
            {[solo, agency, bundle].map((plan) => (
              <div
                key={plan.id}
                className={`flex flex-col rounded-lg border p-5 ${
                  plan.highlight ? "border-[var(--brass)]" : "border-[var(--line)]"
                }`}
              >
                <p className="font-display font-semibold">{plan.name}</p>
                <p className="mt-2 font-display text-2xl font-bold">{plan.price}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">{plan.cadence}</p>
                <p className="mt-3 flex-1 text-sm text-[var(--muted)]">{plan.description}</p>
                <div className="mt-5">
                  <CheckoutButton planId={plan.id} label={plan.cta} primary={!!plan.highlight} />
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
