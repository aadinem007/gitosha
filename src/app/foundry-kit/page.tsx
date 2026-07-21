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
  "Server-side amount locking",
  "Waitlist + honeypot pattern",
  "Rate limits + production headers",
  "Docker + CI pipeline",
  "Architecture + Getting Started docs",
];

const AGENCY_EXTRAS = [
  "Unlimited client projects under one license",
  "White-label rights (strip Shipyard marks)",
  "Client handoff checklist (in the zip)",
  "Invoice template (in the zip)",
  "Proposal template (in the zip)",
  "White-label delivery playbook (in the zip)",
  "1 year Studio Vault (5 seats research)",
  "Priority support on client deadlines",
  "Team re-download via License portal",
];

const COMPARE = [
  { label: "Production scaffold zip", solo: true, agency: true },
  { label: "Auth + Razorpay + DB wired", solo: true, agency: true },
  { label: "Server-side payment amounts", solo: true, agency: true },
  { label: "Commercial products allowed", solo: "1 product", agency: "Unlimited clients" },
  { label: "White-label", solo: false, agency: true },
  { label: "Handoff / invoice / proposal docs", solo: false, agency: true },
  { label: "Vault included", solo: "90 days Operator", agency: "1 year Studio" },
  { label: "Support", solo: "Standard", agency: "Priority" },
  { label: "License portal re-download", solo: true, agency: true },
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
          <p className="animate-rise text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brass)]">
            Production scaffold
          </p>
          <h1 className="animate-rise-delay mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Foundry
          </h1>
          <div className="animate-pulse-line rule mt-6 max-w-xs" />
          <p className="animate-rise-delay-2 mt-6 max-w-2xl text-lg leading-relaxed text-[var(--muted)]">
            Auth, database, billing, webhooks, deploy — packaged so you build the product, not the
            plumbing. Pay once. Download the zip instantly. Agency is built for studios shipping
            many client products from one license.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm">
            <Link href="/license" className="font-semibold text-[var(--brass)] hover:underline">
              Already paid? License portal →
            </Link>
            <Link href="/faq" className="text-[var(--muted)] hover:text-[var(--ink)]">
              FAQ
            </Link>
            <Link href="/whats-inside" className="text-[var(--muted)] hover:text-[var(--ink)]">
              What’s inside
            </Link>
            <a href="#compare" className="text-[var(--muted)] hover:text-[var(--ink)]">
              Solo vs Agency
            </a>
          </div>

          <div className="mt-14 grid gap-12 sm:grid-cols-2">
            <div>
              <div className="rule mb-5 max-w-[6rem]" />
              <h2 className="font-display text-sm font-semibold text-[var(--fog)]">What ships in every zip</h2>
              <ul className="mt-4 space-y-2.5 text-sm text-[var(--muted)]">
                {STACK.map((item) => (
                  <li key={item}>— {item}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="rule mb-5 max-w-[6rem]" />
              <h2 className="font-display text-sm font-semibold text-[var(--fog)]">
                Agency extras (₹29,999)
              </h2>
              <ul className="mt-4 space-y-2.5 text-sm text-[var(--muted)]">
                {AGENCY_EXTRAS.map((item) => (
                  <li key={item}>— {item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div id="compare" className="mt-20 scroll-mt-28">
            <h2 className="font-display text-2xl font-semibold">Solo vs Agency</h2>
            <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
              Same codebase. Different rights and studio tooling — so Agency feels worth ₹29,999 when
              you run client work.
            </p>
            <div className="board-shell mt-6 overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead className="border-b border-[var(--line)] text-left text-[var(--muted)]">
                  <tr>
                    <th className="px-5 py-3 font-medium">Capability</th>
                    <th className="px-5 py-3 font-medium">Solo</th>
                    <th className="px-5 py-3 font-medium text-[var(--brass)]">Agency</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARE.map((row) => (
                    <tr key={row.label} className="border-t border-[var(--line)]">
                      <td className="px-5 py-3 text-[var(--fog)]">{row.label}</td>
                      <td className="px-5 py-3 text-[var(--muted)]">
                        {typeof row.solo === "boolean" ? (row.solo ? "Yes" : "—") : row.solo}
                      </td>
                      <td className="px-5 py-3 font-medium text-[var(--ink)]">
                        {typeof row.agency === "boolean" ? (row.agency ? "Yes" : "—") : row.agency}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-16 grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[solo, agency, bundle].map((plan) => (
              <div
                key={plan.id}
                className={`plan-shell isolate overflow-hidden ${plan.id === "foundry-agency" ? "is-hot" : ""}`}
              >
                <p className="font-display font-semibold">{plan.name}</p>
                <p className="mt-2 font-display text-2xl font-bold">{plan.price}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">{plan.cadence}</p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--muted)]">
                  {plan.description}
                </p>
                <ul className="mt-4 space-y-1.5 text-xs text-[var(--fog)]">
                  {plan.features.slice(0, 8).map((f) => (
                    <li key={f}>— {f}</li>
                  ))}
                  {plan.features.length > 8 && (
                    <li className="text-[var(--brass)]">
                      +{plan.features.length - 8} more — see Pricing / What’s inside
                    </li>
                  )}
                </ul>
                <div className="relative z-10 mt-5 min-w-0">
                  <CheckoutButton
                    planId={plan.id}
                    label={plan.cta}
                    primary={plan.id === "foundry-agency" || plan.highlight}
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="mt-10 text-xs text-[var(--muted)]">
            By purchasing you agree to{" "}
            <Link href="/terms" className="text-[var(--brass)] hover:underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/refund" className="text-[var(--brass)] hover:underline">
              Refunds
            </Link>
            .
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
