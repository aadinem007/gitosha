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
        <span className="font-display text-3xl font-bold tracking-tight">{plan.price}</span>{" "}
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
          <p className="animate-rise text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brass)]">
            Pricing that respects your time
          </p>
          <h1 className="animate-rise-delay mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Pay once you believe.
            <span className="block text-[var(--brass)]">Not before.</span>
          </h1>
          <div className="rule animate-pulse-line mt-6 max-w-[8rem]" />
          <p className="animate-rise-delay-2 mt-6 max-w-2xl text-lg leading-relaxed text-[var(--muted)]">
            Scout is free. Operator is ₹999/mo while the first 100 seats last. Foundry is a one-time
            download — Agency is the studio license that pays for itself on the second client build.
          </p>

          <div className="mt-10 flex flex-wrap gap-3 text-sm">
            <Link href="/faq" className="text-[var(--brass)] hover:underline">
              FAQ →
            </Link>
            <Link href="/refund" className="text-[var(--muted)] hover:text-[var(--ink)]">
              Refunds
            </Link>
            <Link href="/terms" className="text-[var(--muted)] hover:text-[var(--ink)]">
              Terms
            </Link>
          </div>

          <h2 className="mt-16 font-display text-lg font-semibold text-[var(--fog)]">
            The Vault — research
          </h2>
          <div className="mt-5 grid items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {VAULT_PLANS.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>

          <h2 className="mt-20 font-display text-lg font-semibold text-[var(--fog)]">
            Foundry — scaffold &amp; studio license
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
            Agency at ₹29,999 is not “more code.” It’s unlimited client use, white-label, templates,
            priority support, and a year of Studio Vault — so your next three client SaaS builds
            don’t restart from zero.
          </p>
          <div className="mt-5 grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FOUNDRY_PLANS.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>

          <div className="cta-band mt-16">
            <p className="font-display text-xl font-semibold sm:text-2xl">
              Still deciding? Tap ASK bottom-right — or start free as Scout.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/" className="btn-ghost px-5 py-2.5 text-sm text-[var(--fog)]">
                Back home
              </Link>
              <Link href="/foundry-kit#compare" className="btn-primary px-5 py-2.5 text-sm">
                Compare Solo vs Agency
              </Link>
            </div>
          </div>

          <p className="mt-10 text-xs leading-relaxed text-[var(--muted)]">
            Operator launch price (₹999/mo) applies to the first 100 paying operators, then returns
            to ₹1,499/mo. All prices in INR via Razorpay. By purchasing you agree to{" "}
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
