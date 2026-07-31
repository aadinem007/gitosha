import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { TrackField } from "@/components/TrackField";
import { WaitlistForm } from "@/components/WaitlistForm";
import { RevealObserver } from "@/components/RevealObserver";
import { BRAND } from "@/lib/brand";
import { FOUNDRY_PLANS, VAULT_PLANS } from "@/lib/pricing";
import { SEED_IDEAS, totalScore } from "@/lib/ideas-data";

const OPERATOR = VAULT_PLANS.find((p) => p.id === "vault-pro")!;
const SOLO = FOUNDRY_PLANS.find((p) => p.id === "foundry-solo")!;

const SCOREBOARD = SEED_IDEAS.slice(0, 4).map((idea) => ({
  name: idea.name,
  score: totalScore(idea.scores),
  category: idea.category,
  slug: idea.slug,
}));

const SAMPLE = SEED_IDEAS.find((i) => i.slug === "recoverly") ?? SEED_IDEAS[2];
const SAMPLE_SCORE = totalScore(SAMPLE.scores);

const DECISION_LINES = [
  "Pass if demand < 6 with no paid evidence",
  "Pass if competition ≥ 8 and no wedge",
  "Defer if time-to-launch < 5 for solo founders",
];

const METHOD_DIMS = [
  { n: "01", name: "Demand", detail: "People already search for / pay for this." },
  { n: "02", name: "Competition", detail: "Higher = clearer gap, less crowded." },
  { n: "03", name: "Margin", detail: "Gross margin after infra and support." },
  { n: "04", name: "MRR", detail: "Realistic recurring ceiling for a lean team." },
  { n: "05", name: "Time to launch", detail: "Higher = faster path to first paid user." },
  { n: "06", name: "AI leverage", detail: "Where models create durable speed advantage." },
];

const FOUNDRY_WALK = [
  { title: "Auth wired", body: "Magic-link sign-in ready — no weekend rebuilding sessions." },
  { title: "Checkout live", body: "Amounts locked server-side. Webhooks unlock entitlements." },
  { title: "Database models", body: "Customers, licenses, waitlist — Prisma schema included." },
  { title: "Deploy path", body: "Docker + CI starter + Getting Started docs in the zip." },
];

const WHO_FOR = [
  {
    title: "Indie operators",
    body: "You pick one niche and ship. Operator filters weak ideas; Foundry removes plumbing weeks.",
  },
  {
    title: "Studios & agencies",
    body: "Agency license + Studio Vault so client pitches start scored — not blank Notion boards.",
  },
  {
    title: "Founders who hate vanity lists",
    body: "We publish low scores. If an idea fails go/no-go criteria, you see why — before you spend a quarter.",
  },
];

const PROOF_COMPARE = [
  {
    label: "Decide what to ship",
    scout: "Public scores + method",
    operator: "Full teardowns + go/no-go criteria",
  },
  {
    label: "Ship the product",
    scout: "—",
    operator: "15% off Foundry forever",
  },
  {
    label: "Export & share",
    scout: "Browse scoreboard",
    operator: "CSV export + private Vault",
  },
  {
    label: "Support",
    scout: "Gita on-site",
    operator: "Gita + email for access & billing",
  },
];

export default function Home() {
  return (
    <>
      <RevealObserver />
      <Nav />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <section className="hero-cinematic hero-cinematic-3d">
          <TrackField />
          <div className="hero-stage">
            <h1 className="brand-mark animate-draft">{BRAND.nameUpper}</h1>
            <p className="hero-line animate-rise">{BRAND.tagline}</p>
            <p className="hero-support" data-reveal>
              {BRAND.heroSupport}
            </p>
            <div className="hero-cta animate-rise-delay">
              <Link href="/pricing" className="btn-primary">
                View pricing
              </Link>
              <Link href="/foundry" className="btn-ghost">
                Open Foundry
              </Link>
            </div>
            <p className="hero-orbit-hint animate-rise-delay-2" aria-hidden="true">
              Drag to orbit
            </p>
          </div>
        </section>

        {/* Editorial split chapters */}
        <section className="mega-split" id="know" data-reveal>
          <div className="mega-split-visual" aria-hidden="true">
            <TrackField intensity="stage" />
          </div>
          <div className="mega-split-inner">
            <h2 className="mega-split-title" aria-label="Know what">
              <span className="mega-split-word">Know</span>
              <span className="mega-split-word mega-split-word-accent">what</span>
            </h2>
            <p className="mega-split-copy">
              Ten scored dimensions. Explicit go/no-go frameworks. Public rejects. Research built for
              operators who decide in one sitting — not another scroll of vanity idea lists.
            </p>
            <Link href="/vault" className="mega-split-link">
              Read the full Vault →
            </Link>
          </div>
        </section>

        {/* 01 Vault */}
        <section className="chapter chapter-vault" id="vault" data-reveal>
          <div className="chapter-visual">
            <TrackField intensity="stage" />
            <div className="chapter-visual-frame" aria-label="Live scoreboard sample">
              <p className="chapter-visual-label">01 · Research plane</p>
              <ul className="hud-scoreboard">
                {SCOREBOARD.map((row) => (
                  <li key={row.slug} className="hud-score-row">
                    <span className="hud-score-name">{row.name}</span>
                    <span className="hud-score-meta">{row.category}</span>
                    <span className="hud-score-val">{row.score}</span>
                  </li>
                ))}
              </ul>
              <ul className="hud-kill-list">
                {DECISION_LINES.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="chapter-inner chapter-inner-vault copy-scrim-soft">
            <p className="chapter-index">01</p>
            <p className="chapter-eyebrow">{BRAND.products.vault}</p>
            <h2 className="chapter-title chapter-title-section">{BRAND.vaultHeadline}</h2>
            <p className="chapter-copy">{BRAND.vaultBody}</p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
              <Link href="/vault" className="chapter-link">
                Read the full Vault →
              </Link>
              <Link href="/pricing" className="chapter-link">
                See plans →
              </Link>
            </div>
          </div>
        </section>

        <section className="mega-split mega-split-alt" id="ship" data-reveal>
          <div className="mega-split-visual" aria-hidden="true">
            <TrackField intensity="stage" />
          </div>
          <div className="mega-split-inner">
            <h2 className="mega-split-title" aria-label="Then ship">
              <span className="mega-split-word">Then</span>
              <span className="mega-split-word mega-split-word-accent">ship</span>
            </h2>
            <p className="mega-split-copy">
              Foundry is the production zip — auth, checkout, webhooks, and deploy docs included. Pay
              once in USD. Download the same minute. Start from a stack that already takes payments.
            </p>
            <Link href="/foundry" className="mega-split-link">
              Read the full Foundry →
            </Link>
          </div>
        </section>

        {/* 02 Foundry */}
        <section className="chapter chapter-foundry" id="foundry" data-reveal>
          <div className="chapter-inner chapter-inner-foundry copy-scrim-soft">
            <p className="chapter-index">02</p>
            <p className="chapter-eyebrow">{BRAND.products.foundry}</p>
            <h2 className="chapter-title chapter-title-section">{BRAND.foundryHeadline}</h2>
            <p className="chapter-copy">{BRAND.foundryBody}</p>
            <Link href="/foundry" className="chapter-link">
              Open {BRAND.products.foundry} →
            </Link>
          </div>
          <div className="chapter-visual chapter-visual-end">
            <div className="chapter-visual-frame" aria-label="Foundry delivery checklist">
              <p className="chapter-visual-label">02 · Delivery plane</p>
              <ul className="chapter-kit-list">
                <li>Auth wired</li>
                <li>Checkout ready</li>
                <li>Webhook unlock</li>
                <li>Deploy docs</li>
                <li>Instant zip</li>
                <li>90 days Operator</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 03 Method */}
        <section className="story-plane" id="method" data-reveal>
          <span className="float-accent float-accent-a" aria-hidden="true" />
          <span className="float-accent float-accent-c" aria-hidden="true" />
          <div className="story-inner">
            <p className="story-kicker">03 · Method</p>
            <h2 className="story-title">How scoring actually works.</h2>
            <p className="story-lede">
              Same rubric every week. Ten dimensions, one hundred points. We publish the rejects —
              judgment you can trust, not a highlight reel.
            </p>
            <div className="method-grid">
              {METHOD_DIMS.map((d) => (
                <div key={d.n} className="method-cell">
                  <p className="method-n">{d.n}</p>
                  <p className="method-name">{d.name}</p>
                  <p className="method-detail">{d.detail}</p>
                </div>
              ))}
            </div>
            <Link href="/method" className="story-link">
              Read the full rubric →
            </Link>
          </div>
        </section>

        {/* 04 Foundry walkthrough */}
        <section className="story-plane story-plane-alt" id="inside" data-reveal>
          <span className="float-accent float-accent-b" aria-hidden="true" />
          <div className="story-inner">
            <p className="story-kicker">04 · Inside Foundry</p>
            <h2 className="story-title">What’s in the zip.</h2>
            <p className="story-lede">
              Not a Notion template. A production-ready foundation that already takes payments — the
              same patterns Gitosha runs on.
            </p>
            <div className="walk-grid">
              {FOUNDRY_WALK.map((item) => (
                <div key={item.title} className="walk-cell">
                  <p className="walk-title">{item.title}</p>
                  <p className="walk-body">{item.body}</p>
                </div>
              ))}
            </div>
            <Link href="/foundry" className="story-link">
              Inspect Foundry →
            </Link>
          </div>
        </section>

        {/* 05 Who */}
        <section className="story-plane" id="for" data-reveal>
          <div className="story-inner">
            <p className="story-kicker">05 · Who it’s for</p>
            <h2 className="story-title">Outcomes, not vibes.</h2>
            <p className="story-lede">
              Built for international operators who ship products — and hate spending a quarter on
              the wrong one.
            </p>
            <div className="who-grid">
              {WHO_FOR.map((w) => (
                <div key={w.title} className="who-cell">
                  <p className="who-title">{w.title}</p>
                  <p className="who-body">{w.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 06 Sample */}
        <section className="story-plane story-plane-alt" id="sample" data-reveal>
          <div className="story-inner">
            <p className="story-kicker">06 · Sample score</p>
            <h2 className="story-title">A real scored idea.</h2>
            <p className="story-lede">
              Public preview. Operator unlocks the full teardown, go/no-go criteria, and launch
              checklist.
            </p>
            <div className="sample-card copy-scrim">
              <div className="sample-head">
                <div>
                  <p className="sample-cat-badge">{SAMPLE.category}</p>
                  <p className="sample-name">{SAMPLE.name}</p>
                </div>
                <p className="sample-score">
                  {SAMPLE_SCORE}
                  <span>/100</span>
                </p>
              </div>
              <p className="sample-line">{SAMPLE.oneLiner}</p>
              <p className="sample-excerpt">{SAMPLE.teardownMd.slice(0, 220)}…</p>
              <div className="sample-actions">
                <Link href={`/ideas/${SAMPLE.slug}`} className="btn-ghost" style={{ marginTop: "1.25rem" }}>
                  Open public page →
                </Link>
                <Link href="/pricing" className="btn-primary" style={{ marginTop: "1.25rem" }}>
                  Unlock Operator →
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="proof-plane" id="proof" data-reveal>
          <div className="proof-inner">
            <p className="proof-kicker">Unpack · USD</p>
            <h2 className="proof-title">Operator and Foundry, unpacked.</h2>
            <p className="proof-lede">
              Dense enough to justify the price. Clear enough to decide in one scroll — after you’ve
              seen why it exists.
            </p>

            <div className="proof-grid">
              <div className="proof-col">
                <div className="proof-col-head">
                  <p className="proof-col-name">Operator · $15/mo</p>
                  <p className="proof-col-sub">First 100 seats at launch price</p>
                </div>
                <ul className="proof-list">
                  {OPERATOR.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <Link href="/pricing" className="btn-primary" style={{ marginTop: "1.5rem" }}>
                  Unlock Operator →
                </Link>
              </div>

              <div className="proof-col proof-col-hot">
                <div className="proof-col-head">
                  <p className="proof-col-name">Foundry Solo · $99</p>
                  <p className="proof-col-sub">One-time · instant zip</p>
                </div>
                <ul className="proof-list">
                  {SOLO.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <Link href="/foundry" className="btn-primary" style={{ marginTop: "1.5rem" }}>
                  Foundry Solo — $99 →
                </Link>
              </div>
            </div>

            <div className="proof-compare">
              <h3 className="proof-compare-title">Scout vs Operator</h3>
              <div className="proof-table-wrap">
                <table className="proof-table">
                  <thead>
                    <tr>
                      <th>Outcome</th>
                      <th>Scout</th>
                      <th>Operator</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PROOF_COMPARE.map((row) => (
                      <tr key={row.label}>
                        <td>{row.label}</td>
                        <td>{row.scout}</td>
                        <td>{row.operator}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <section className="closing" data-reveal>
          <div className="closing-inner">
            <h2 className="closing-title">
              Every week you wait is another week building the wrong thing.
            </h2>
            <div className="closing-cta">
              <Link href="/pricing" className="btn-primary">
                Get pricing · USD
              </Link>
              <Link href="/foundry" className="btn-ghost">
                Buy Foundry
              </Link>
            </div>
            <div className="closing-waitlist">
              <p className="closing-waitlist-label">Free Scout brief — weekly</p>
              <WaitlistForm cta="Join the list" layout="row" />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
