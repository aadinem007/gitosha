import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CheckoutButton } from "@/components/CheckoutButton";
import Link from "next/link";
import { FOUNDRY_PLANS } from "@/lib/pricing";

const STACK = [
  "Next.js App Router + TypeScript",
  "Tailwind design tokens",
  "Postgres via Prisma",
  "Magic-link authentication",
  "Razorpay checkout + signed webhooks",
  "Waitlist + server-side amount locking",
  "Docker + CI pipeline",
  "Architecture docs + module map",
];

const WHY = [
  "Module layout you can extend without guessing",
  "Billing path already proven on this site",
  "Instant zip delivery after payment",
  "Solo or Agency licensing — pick your lane",
];

export default function FoundryKitPage() {
  const solo = FOUNDRY_PLANS.find((p) => p.id === "foundry-solo")!;
  const agency = FOUNDRY_PLANS.find((p) => p.id === "foundry-agency")!;
  const bundle = FOUNDRY_PLANS.find((p) => p.id === "bundle-launch")!;

  return (
    <>
      <Nav />
      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brass)]">
            Production scaffold
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">Foundry</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[var(--muted)]">
            Auth, database, billing, webhooks, deploy — packaged so you build the product, not the
            plumbing. Pay once. Download the zip instantly from your license portal.
          </p>
          <p className="mt-4 text-sm text-[var(--muted)]">
            Already paid?{" "}
            <Link href="/license" className="font-semibold text-[var(--brass)] underline-offset-4 hover:underline">
              Open license portal →
            </Link>
          </p>

          <div className="mt-14 grid gap-12 sm:grid-cols-2">
            <div>
              <div className="rule mb-5 max-w-[6rem]" />
              <h2 className="font-display text-sm font-semibold text-[var(--fog)]">What ships</h2>
              <ul className="mt-4 space-y-2.5 text-sm text-[var(--muted)]">
                {STACK.map((item) => (
                  <li key={item}>— {item}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="rule mb-5 max-w-[6rem]" />
              <h2 className="font-display text-sm font-semibold text-[var(--fog)]">Why it holds up</h2>
              <ul className="mt-4 space-y-2.5 text-sm text-[var(--muted)]">
                {WHY.map((item) => (
                  <li key={item}>— {item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-16 grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[solo, agency, bundle].map((plan) => (
              <div key={plan.id} className={`plan-shell isolate overflow-hidden ${plan.highlight ? "is-hot" : ""}`}>
                <p className="font-display font-semibold">{plan.name}</p>
                <p className="mt-2 font-display text-2xl font-bold">{plan.price}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">{plan.cadence}</p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--muted)]">{plan.description}</p>
                <div className="relative z-10 mt-5 min-w-0">
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
