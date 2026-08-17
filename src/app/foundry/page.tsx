import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { RevealObserver } from "@/components/RevealObserver";
import { TrackField } from "@/components/TrackField";
import { BRAND } from "@/lib/brand";
import { FOUNDRY_PLANS } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Foundry — Production SaaS foundation | Gitosha",
  description:
    "Ship on a foundation that already takes payments. Next.js, Prisma, magic-link auth, checkout, webhooks, deploy docs — Solo, Agency, or Launch Bundle.",
};

const STACK = [
  {
    title: "Next.js App Router",
    body: "TypeScript + Tailwind production foundation — rename the product, keep the bones.",
  },
  {
    title: "Postgres via Prisma",
    body: "Customers, licenses, waitlist models included so you’re not inventing schema on day one.",
  },
  {
    title: "Magic-link auth",
    body: "Supabase-wired sign-in patterns — auth-gated dashboard route included.",
  },
  {
    title: "Checkout + webhooks",
    body: "Server-side amount locking, signature verify, webhook → entitlement unlock. No client price hacks.",
  },
  {
    title: "Hardening patterns",
    body: "Rate limits, honeypot waitlist, production security headers / CSP patterns from a stack that ships.",
  },
  {
    title: "Deploy path",
    body: "Docker + CI starter, architecture map, Getting Started docs, env.example for auth, payments, database.",
  },
];

const DONT_REBUILD = [
  "Session and magic-link auth wiring",
  "Checkout amount locking on the server",
  "Webhook signature verify → unlock entitlement",
  "License portal re-download pattern",
  "Waitlist with rate limits + honeypot",
  "Auth-gated dashboard route skeleton",
  "Security headers / CSP starting point",
  "Prisma models for customers, licenses, waitlist",
  "Deploy docs so Vercel isn’t a mystery weekend",
];

const WHO = [
  {
    title: "Solo operators",
    body: "You’re shipping one product you own. Solo ($99) removes weeks of plumbing so you build the product, not the payment path.",
  },
  {
    title: "Studios & agencies",
    body: "Agency ($249) is the same zip with unlimited client projects, white-label rights, handoff/invoice/proposal docs, priority support, and a year of Studio Vault.",
  },
  {
    title: "Operators who also need research",
    body: "Launch Bundle ($149) = Foundry Solo + 12 months Operator — decide what to build and ship it without two cart decisions.",
  },
];

const COMPARE = [
  { label: "Production foundation zip", solo: "Yes", agency: "Yes", bundle: "Solo zip" },
  { label: "Auth + payments + DB wired", solo: "Yes", agency: "Yes", bundle: "Yes" },
  { label: "Commercial products", solo: "1 product", agency: "Unlimited clients", bundle: "1 product" },
  { label: "White-label rights", solo: "—", agency: "Yes", bundle: "—" },
  { label: "Handoff / invoice / proposal docs", solo: "—", agency: "In the zip", bundle: "—" },
  { label: "Vault included", solo: "90 days Operator", agency: "1 year Studio", bundle: "12 months Operator" },
  { label: "Support", solo: "Standard", agency: "Priority", bundle: "Standard" },
  { label: "License portal re-download", solo: "Yes", agency: "Yes", bundle: "Yes" },
  { label: "Price (USD, one-time)", solo: "$99", agency: "$249", bundle: "$149" },
];

const WALK = [
  { title: "Pay once", body: "USD checkout. Amounts locked server-side. Instant license key after payment." },
  { title: "Download the zip", body: "License portal — same email + key. Re-download anytime (fair-use cap)." },
  { title: "Wire env", body: "Copy env.example. Point at your database, auth, and payment project keys." },
  { title: "Ship the product", body: "Rename copy. Extend the entitlement model. Deploy. You didn’t rebuild plumbing." },
];

const OBJECTIONS = [
  {
    q: "Is this a Notion template?",
    a: "No. It’s a runnable codebase — the same production patterns Gitosha ships on. Auth, checkout, webhooks, Prisma, deploy docs in the zip.",
  },
  {
    q: "Solo vs Agency — which do I buy?",
    a: "Solo if you ship one product for yourself. Agency if you build for clients, need white-label, templates, priority support, or a year of Studio Vault. Same codebase; different rights.",
  },
  {
    q: "What’s in the Launch Bundle?",
    a: "Foundry Solo (full zip) + 12 months Operator Vault. Saves vs buying Solo + monthlies apart at launch price. Best if you want research and a ship kit in one receipt.",
  },
  {
    q: "How do I get files after paying?",
    a: "Checkout shows your license key (GITO-…). Open License, enter the same email + key, download the zip. Vault access uses the same email via magic-link sign-in.",
  },
  {
    q: "Do you build my product for me?",
    a: "No. Foundry is the foundation + rights pack. You (or your studio) build the product. Agency includes Studio research so pitches start scored — not a custom client build from us.",
  },
];

const solo = FOUNDRY_PLANS.find((p) => p.id === "foundry-solo")!;
const agency = FOUNDRY_PLANS.find((p) => p.id === "foundry-agency")!;
const bundle = FOUNDRY_PLANS.find((p) => p.id === "bundle-launch")!;

export default function FoundryProductPage() {
  return (
    <>
      <RevealObserver />
      <Nav />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <section className="page-hero">
          <p className="page-kicker animate-rise">
            <Link href="/" className="page-crumb">
              Home
            </Link>
            <span aria-hidden="true"> / </span>
            {BRAND.products.foundry}
          </p>
          <h1 className="animate-rise-delay mt-3">{BRAND.products.foundry}</h1>
          <div className="rule mt-6 max-w-xs" />
          <p className="animate-rise-delay-2 mt-6 max-w-2xl text-lg leading-relaxed text-[var(--support)]">
            {BRAND.foundryBody}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/foundry-kit" className="btn-primary">
              Buy Foundry →
            </Link>
            <Link href="/whats-inside" className="btn-ghost">
              What’s inside →
            </Link>
            <Link href="/license" className="btn-ghost">
              License portal →
            </Link>
          </div>
        </section>

        <section className="mega-split mega-split-alt" data-reveal>
          <div className="mega-split-visual" aria-hidden="true">
            <TrackField intensity="stage" motif="foundry" />
          </div>
          <div className="mega-split-inner">
            <h2 className="mega-split-title" aria-label="Then ship">
              <span className="mega-split-word">Then</span>
              <span className="mega-split-word mega-split-word-accent">ship</span>
            </h2>
            <p className="mega-split-copy">
              Auth, checkout, webhooks, deploy docs. Pay once in USD. Download the same minute.
            </p>
          </div>
        </section>

        <section className="story-plane" data-reveal>
          <div className="story-inner">
            <p className="story-kicker">What it is</p>
            <h2 className="story-title">A production zip — not a toy demo.</h2>
            <p className="story-lede">
              Foundry is the delivery plane: auth, database, checkout, webhooks, security headers, and
              deploy docs packaged so you build the product, not the plumbing. Pay once in USD. Download
              the same minute from the License portal.
            </p>
            <div className="who-grid mt-10">
              {WHO.map((w) => (
                <div key={w.title} className="who-cell">
                  <p className="who-title">{w.title}</p>
                  <p className="who-body">{w.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="chapter chapter-foundry" data-reveal>
          <div className="chapter-inner chapter-inner-foundry copy-scrim-soft">
            <p className="chapter-index">02</p>
            <p className="chapter-eyebrow">Delivery plane</p>
            <h2 className="chapter-title chapter-title-section">What ships in every zip</h2>
            <p className="chapter-copy">
              Next.js App Router + TypeScript + Tailwind. Postgres via Prisma. Magic-link auth.
              Checkout with server-side amount locking. Webhook unlock. Docker + CI starter. Architecture
              map and Getting Started docs. Instant download after payment.
            </p>
            <Link href="/foundry-kit" className="chapter-link">
              Open checkout &amp; full inventory →
            </Link>
          </div>
          <div className="chapter-visual chapter-visual-end">
            <TrackField intensity="stage" motif="foundry" />
            <div className="chapter-visual-frame" aria-label="Foundry delivery checklist">
              <p className="chapter-visual-label">02 · In the zip</p>
              <ul className="chapter-kit-list">
                <li>Auth wired</li>
                <li>Checkout ready</li>
                <li>Webhook unlock</li>
                <li>Prisma models</li>
                <li>Deploy docs</li>
                <li>License re-download</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="story-plane story-plane-alt" data-reveal>
          <div className="story-inner">
            <p className="story-kicker">Stack detail</p>
            <h2 className="story-title">Accurate to the kit — not vapor.</h2>
            <p className="story-lede">
              Every line below matches what lives in <code className="text-[var(--ink)]">kits/foundry</code>{" "}
              and the feature lists on Pricing. Payment wiring in the zip follows the kit’s checkout +
              webhook patterns — configure your own provider keys via env.
            </p>
            <div className="walk-grid">
              {STACK.map((item) => (
                <div key={item.title} className="walk-cell">
                  <p className="walk-title">{item.title}</p>
                  <p className="walk-body">{item.body}</p>
                </div>
              ))}
            </div>
            <Link href="/whats-inside" className="story-link">
              Line-by-line inventory →
            </Link>
          </div>
        </section>

        <section className="story-plane" data-reveal>
          <div className="story-inner">
            <p className="story-kicker">What you don’t rebuild</p>
            <h2 className="story-title">Skip the plumbing weeks.</h2>
            <p className="story-lede">
              Foundry’s job is to remove the work that doesn’t differentiate your product. You still own
              positioning, niche, and the features customers pay for.
            </p>
            <ul className="mt-8 max-w-2xl space-y-2.5 text-[1.05rem] text-[var(--support)]">
              {DONT_REBUILD.map((item) => (
                <li key={item}>— {item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="proof-plane" id="compare" data-reveal>
          <div className="proof-inner">
            <p className="proof-kicker">Solo · Agency · Bundle</p>
            <h2 className="proof-title">Same zip. Different rights.</h2>
            <p className="proof-lede">
              Agency is not “more code.” It’s unlimited client use, white-label, templates, priority
              support, and a year of Studio Vault — so the second client build doesn’t restart from blank.
            </p>

            <div className="proof-table-wrap mt-8">
              <table className="proof-table">
                <thead>
                  <tr>
                    <th>Capability</th>
                    <th>Solo</th>
                    <th>Agency</th>
                    <th>Launch Bundle</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARE.map((row) => (
                    <tr key={row.label}>
                      <td>{row.label}</td>
                      <td>{row.solo}</td>
                      <td>{row.agency}</td>
                      <td>{row.bundle}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="proof-grid mt-12">
              {[solo, agency, bundle].map((plan) => (
                <div
                  key={plan.id}
                  className={`proof-col${plan.highlight || plan.id === "bundle-launch" ? " proof-col-hot" : ""}`}
                >
                  <div className="proof-col-head">
                    <p className="proof-col-name">
                      {plan.name} · {plan.price}
                    </p>
                    <p className="proof-col-sub">{plan.description}</p>
                  </div>
                  <ul className="proof-list">
                    {plan.features.slice(0, 7).map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                  <Link href="/foundry-kit" className="btn-primary">
                    {plan.cta} →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="story-plane story-plane-alt" data-reveal>
          <div className="story-inner">
            <p className="story-kicker">After you buy</p>
            <h2 className="story-title">Pay → download → ship.</h2>
            <p className="story-lede">
              Instant zip via License portal. Vault entitlements unlock on the same email when the plan
              includes research access.
            </p>
            <div className="walk-grid">
              {WALK.map((item) => (
                <div key={item.title} className="walk-cell">
                  <p className="walk-title">{item.title}</p>
                  <p className="walk-body">{item.body}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/license" className="story-link">
                License portal →
              </Link>
              <Link href="/faq" className="story-link story-link-dim">
                Delivery FAQ →
              </Link>
            </div>
          </div>
        </section>

        <section className="story-plane" data-reveal>
          <div className="story-inner">
            <p className="story-kicker">Objections</p>
            <h2 className="story-title">Before you checkout.</h2>
            <div className="mt-10 space-y-0">
              {OBJECTIONS.map((item) => (
                <div key={item.q} className="border-t border-[var(--line)] py-6">
                  <h3 className="font-display text-lg font-semibold text-[var(--ink)]">{item.q}</h3>
                  <p className="mt-3 max-w-3xl text-base leading-relaxed text-[var(--support)]">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/vault" className="story-link">
                Need research first? → Vault
              </Link>
              <Link href="/refund" className="story-link story-link-dim">
                Refunds →
              </Link>
            </div>
          </div>
        </section>

        <section className="cta-band mx-auto max-w-6xl px-4 sm:px-6" data-reveal>
          <h2 className="font-display text-3xl tracking-wide sm:text-4xl">
            Stop rebuilding auth and billing.
          </h2>
          <p className="mt-3 max-w-xl text-[var(--support)]">
            Solo for your product. Agency for every client after. Bundle when you want Vault for a year
            with the zip.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/foundry-kit" className="btn-primary">
              Buy Foundry →
            </Link>
            <Link href="/pricing" className="btn-ghost">
              Full pricing
            </Link>
            <Link href="/vault" className="btn-ghost">
              Explore Vault
            </Link>
          </div>
        </section>

        <section className="closing" data-reveal>
          <div className="closing-inner">
            <h2 className="closing-title">
              Pay once. Download the same minute. Ship the product.
            </h2>
            <div className="closing-cta">
              <Link href="/foundry-kit" className="btn-primary">
                Open Foundry checkout →
              </Link>
              <Link href="/license" className="btn-ghost">
                Already paid?
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
