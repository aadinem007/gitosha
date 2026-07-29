import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CheckoutButton } from "@/components/CheckoutButton";
import { TrackField } from "@/components/TrackField";
import Link from "next/link";
import { FOUNDRY_PLANS } from "@/lib/pricing";

const STACK = [
  "Next.js App Router + TypeScript + Tailwind",
  "Postgres via Prisma (customers, licenses, waitlist)",
  "Magic-link authentication (Supabase)",
  "Checkout + signature verify + webhook unlock",
  "Server-side amount locking (no client price hacks)",
  "Rate limits + honeypot waitlist",
  "Production security headers / CSP patterns",
  "Auth-gated dashboard route pattern",
  "Docker + CI deploy pipeline starter",
  "Architecture map + Getting Started docs",
  "env.example for auth, payments, database",
  "License portal re-download (fair-use)",
  "Instant zip after payment",
  "90 days Operator Vault included (Solo)",
  "Outcome: first paid checkout without weeks of plumbing",
  "Same production patterns Gitosha ships on",
];

const AGENCY_EXTRAS = [
  "Unlimited client projects under one license",
  "White-label rights (strip Gitosha marks)",
  "Client handoff checklist (in the zip)",
  "Invoice template (in the zip)",
  "Proposal template (in the zip)",
  "White-label delivery playbook (in the zip)",
  "1 year Studio Vault (5 seats research)",
  "Priority support on client deadlines",
  "Team re-download via License portal",
  "Studio research so pitches start scored",
  "Commercial rights for agency resale of your builds",
  "Outcome: second client build shouldn’t restart from blank",
  "Studio seats keep research language consistent across staff",
];

const COMPARE = [
  { label: "Production scaffold zip", solo: true, agency: true },
  { label: "Auth + payments + DB wired", solo: true, agency: true },
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
        <section className="page-hero page-hero-atmos">
          <TrackField intensity="quiet" />
          <div className="page-hero-content">
            <p className="page-kicker animate-rise">Production scaffold · USD</p>
            <h1 className="animate-rise-delay mt-3">Foundry</h1>
            <div className="rule mt-6 max-w-xs" />
            <p className="animate-rise-delay-2 mt-6 max-w-2xl text-lg leading-relaxed text-[var(--support)]">
              Auth, database, checkout, webhooks, security headers, deploy docs — packaged so you build
              the product, not the plumbing. Pay once. Download the zip the same minute. Agency is built
              for studios shipping many client products from one license.
            </p>
            <div className="mt-6 flex flex-wrap gap-4 text-sm uppercase tracking-[0.12em]">
              <Link href="/license" className="font-semibold text-[var(--brass-dim)] hover:underline">
                Already paid? License portal →
              </Link>
              <Link href="/faq" className="text-[var(--support)] hover:text-[var(--ink)]">
                FAQ
              </Link>
              <Link href="/whats-inside" className="text-[var(--support)] hover:text-[var(--ink)]">
                What’s inside
              </Link>
              <a href="#compare" className="text-[var(--support)] hover:text-[var(--ink)]">
                Solo vs Agency
              </a>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 pb-20">
          <div className="mt-6 grid gap-12 border-t border-[var(--line)] pt-12 sm:grid-cols-2">
            <div>
              <div className="rule mb-5 max-w-[6rem]" />
              <h2 className="font-display text-lg tracking-wide text-[var(--fog)]">
                What ships in every zip
              </h2>
              <ul className="mt-4 space-y-2.5 text-[1.02rem] text-[var(--support)]">
                {STACK.map((item) => (
                  <li key={item}>— {item}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="rule mb-5 max-w-[6rem]" />
              <h2 className="font-display text-lg tracking-wide text-[var(--fog)]">
                Agency extras ($249)
              </h2>
              <ul className="mt-4 space-y-2.5 text-[1.02rem] text-[var(--support)]">
                {AGENCY_EXTRAS.map((item) => (
                  <li key={item}>— {item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div id="compare" className="mt-20 scroll-mt-28">
            <h2 className="font-display text-3xl tracking-wide">Solo vs Agency</h2>
            <p className="mt-2 max-w-2xl text-sm text-[var(--support)]">
              Same codebase. Different rights and studio tooling — so Agency feels worth $249 when
              you run client work.
            </p>
            <div className="board-shell mt-6 overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead className="border-b border-[var(--line)] text-left text-[var(--support)]">
                  <tr>
                    <th className="px-5 py-3 font-medium">Capability</th>
                    <th className="px-5 py-3 font-medium">Solo</th>
                    <th className="px-5 py-3 font-medium text-[var(--brass-dim)]">Agency</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARE.map((row) => (
                    <tr key={row.label} className="border-t border-[var(--line)]">
                      <td className="px-5 py-3 text-[var(--fog)]">{row.label}</td>
                      <td className="px-5 py-3 text-[var(--support)]">
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

          <div className="mt-16 grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[solo, agency, bundle].map((plan) => (
              <div
                key={plan.id}
                className={`plan-shell isolate overflow-hidden ${plan.id === "foundry-agency" ? "is-hot" : ""}`}
              >
                <p className="font-display text-xl tracking-wide">{plan.name}</p>
                <p className="mt-2 font-display text-3xl tracking-wide">{plan.price}</p>
                <p className="mt-1 text-xs text-[var(--support)]">{plan.cadence}</p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--support)]">
                  {plan.description}
                </p>
                <ul className="mt-4 space-y-2 text-[1.02rem] text-[var(--support)]">
                  {plan.features.slice(0, 14).map((f) => (
                    <li key={f}>— {f}</li>
                  ))}
                  {plan.features.length > 14 && (
                    <li className="text-[var(--brass-dim)]">
                      +{plan.features.length - 14} more — see Pricing / What’s inside
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

          <p className="mt-10 text-xs text-[var(--support)]">
            By purchasing you agree to{" "}
            <Link href="/terms" className="text-[var(--brass-dim)] hover:underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/refund" className="text-[var(--brass-dim)] hover:underline">
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
