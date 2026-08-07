import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { RevealObserver } from "@/components/RevealObserver";
import { WaitlistForm } from "@/components/WaitlistForm";
import { TrackField } from "@/components/TrackField";
import { BRAND } from "@/lib/brand";
import { VAULT_PLANS } from "@/lib/pricing";
import { SEED_IDEAS, totalScore } from "@/lib/ideas-data";

export const metadata: Metadata = {
  title: "Vault — Scored opportunity research | Gitosha",
  description:
    "Know what to build. Ten scored dimensions, explicit go/no-go criteria, anti-portfolio rejects, financial sketches, and magic-link access — Scout free through Studio.",
};

const SCOREBOARD = SEED_IDEAS.slice(0, 5).map((idea) => ({
  name: idea.name,
  score: totalScore(idea.scores),
  category: idea.category,
  slug: idea.slug,
}));

const SAMPLE = SEED_IDEAS.find((i) => i.slug === "recoverly") ?? SEED_IDEAS[2];
const SAMPLE_SCORE = totalScore(SAMPLE.scores);

const DIMENSIONS = [
  { n: "01", name: "Demand", detail: "Evidence people already search for or pay for a solution." },
  { n: "02", name: "Competition", detail: "Higher score = less crowded, clearer gap to own." },
  { n: "03", name: "Scalability", detail: "Can revenue grow without linear headcount?" },
  { n: "04", name: "Automation", detail: "How much of delivery can run without humans?" },
  { n: "05", name: "Profit margin", detail: "Gross margin after infra, payments, and support." },
  { n: "06", name: "MRR potential", detail: "Realistic recurring ceiling for a lean team." },
  { n: "07", name: "Barrier to entry", detail: "Higher = easier for a small team to start." },
  { n: "08", name: "AI leverage", detail: "Where models create durable cost or speed advantage." },
  { n: "09", name: "Global reach", detail: "Works across borders without local sales teams." },
  { n: "10", name: "Time to launch", detail: "Higher = faster path to first paying customer." },
];

const WEEKLY = [
  {
    title: "Scored archive",
    body: "Every concept lands with a 10-dimension breakdown out of 100. The archive grows — you search it, you don’t re-scroll Twitter.",
  },
  {
    title: "Full teardowns",
    body: "Operator unlocks Markdown teardowns: wedge, competitors, why now, and where the idea dies if you ignore the gates.",
  },
  {
    title: "Anti-portfolio",
    body: "Concepts we reject on purpose. Seeing the fails is how you trust the passes.",
  },
  {
    title: "Go / no-go criteria",
    body: "Pass/fail gates written as rules — not vibes. Ship, pass, or defer in one sitting.",
  },
  {
    title: "Financial sketches",
    body: "Unit-economics notes per opportunity so you don’t invent ARR from a landing-page fantasy.",
  },
  {
    title: "14-day launch checklist",
    body: "Tied to each scored idea — what to validate first, what to ignore until money moves.",
  },
  {
    title: "CSV export",
    body: "One-click scoreboard export for partners, investors, or your own pipeline board.",
  },
  {
    title: "Magic-link Vault",
    body: "Sign in with email. Private research surface. No password theater.",
  },
];

const SITTING = [
  {
    step: "01",
    title: "Open the scoreboard",
    body: "Sort by total. Skim category + one-liner. Kill anything under your personal floor in under two minutes.",
  },
  {
    step: "02",
    title: "Read go/no-go gates",
    body: "Operator shows pass/fail criteria. If demand is soft and competition is brutal with no wedge — you pass. Explicitly.",
  },
  {
    step: "03",
    title: "Check the anti-portfolio",
    body: "Confirm you’re not rebuilding something we already rejected for a reason that still holds.",
  },
  {
    step: "04",
    title: "Decide ship / pass / defer",
    body: "Ship = build this week. Pass = never. Defer = revisit when a gate flips. Export CSV if the team needs a shared language.",
  },
];

const WHO = [
  {
    title: "Indie operators",
    body: "You pick one niche and ship. Vault filters weak ideas before you burn a quarter on plumbing or positioning.",
  },
  {
    title: "Studios & agencies",
    body: "Studio seats keep founders, PMs, and freelancers on the same scored language — client pitches start with evidence, not blank Notion boards.",
  },
  {
    title: "Founders tired of vanity lists",
    body: "We publish low scores. If an idea fails go/no-go criteria, you see why — before you raise, hire, or rewrite the homepage.",
  },
];

const OBJECTIONS = [
  {
    q: "Isn’t this just another idea newsletter?",
    a: "No. Scout is a taste. Operator is a research vault: teardowns, kill criteria, anti-portfolio, financial sketches, CSV, and a private archive that compounds. Newsletters celebrate winners. We sell judgment.",
  },
  {
    q: "Why publish bad scores?",
    a: "Because research that only celebrates winners is marketing. Round one: out of 18 concepts, none honestly cleared 90/100. That is the product — not a highlight reel.",
  },
  {
    q: "Can I decide in one sitting?",
    a: "That’s the design target. Scoreboard → gates → anti-portfolio → ship/pass/defer. If you need a week of Slack debate after Operator, you’re ignoring the gates.",
  },
  {
    q: "What if I also need to ship?",
    a: "Operator includes 15% off Foundry forever. Launch Bundle pairs Foundry Solo with a year of Operator if you want research and a production zip in one checkout.",
  },
  {
    q: "Scout is free — what’s the catch?",
    a: "No card. No trap. Public method, public scores, public rejects, Gita on-site. Operator unlocks premium teardowns and the private vault. Cancel anytime through the paid period.",
  },
];

const scout = VAULT_PLANS.find((p) => p.id === "vault-free")!;
const operator = VAULT_PLANS.find((p) => p.id === "vault-pro")!;
const annual = VAULT_PLANS.find((p) => p.id === "vault-pro-annual")!;
const studio = VAULT_PLANS.find((p) => p.id === "vault-team")!;

const LADDER = [scout, operator, annual, studio];

export default function VaultProductPage() {
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
            {BRAND.products.vault}
          </p>
          <h1 className="animate-rise-delay mt-3">{BRAND.products.vaultFull}</h1>
          <div className="rule mt-6 max-w-xs" />
          <p className="animate-rise-delay-2 mt-6 max-w-2xl text-lg leading-relaxed text-[var(--support)]">
            {BRAND.vaultBody}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/pricing" className="btn-primary">
              See Vault plans →
            </Link>
            <Link href="/login?next=/research" className="btn-ghost">
              Open research vault →
            </Link>
            <Link href="/method" className="btn-ghost">
              Read the method →
            </Link>
          </div>
        </section>

        <section className="story-plane" data-reveal>
          <div className="story-inner">
            <p className="story-kicker">What it is</p>
            <h2 className="story-title">Research built for operators who decide.</h2>
            <p className="story-lede">
              The Vault is Gitosha’s scored opportunity database — not a Twitter list, not a Notion dump,
              not a “100 SaaS ideas” PDF. Every concept is scored the same way every week across ten
              dimensions. Explicit go/no-go frameworks. Public rejects. Private teardowns for people who
              pay to stop guessing.
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

        <section className="chapter chapter-vault" data-reveal>
          <div className="chapter-visual">
            <TrackField intensity="stage" />
            <div className="chapter-visual-frame" aria-label="Live scoreboard sample">
              <p className="chapter-visual-label">Research plane · sample</p>
              <ul className="hud-scoreboard">
                {SCOREBOARD.map((row) => (
                  <li key={row.slug} className="hud-score-row">
                    <span className="hud-score-name">{row.name}</span>
                    <span className="hud-score-meta">{row.category}</span>
                    <span className="hud-score-val">{row.score}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="chapter-inner chapter-inner-vault copy-scrim-soft">
            <p className="chapter-index">01</p>
            <p className="chapter-eyebrow">Scoreboard</p>
            <h2 className="chapter-title chapter-title-section">Same rubric. Honest totals.</h2>
            <p className="chapter-copy">
              Ten dimensions. One hundred points. We refuse to inflate totals to hit a vanity bar. Browse
              public idea pages free — Operator unlocks the full teardown stack behind the score.
            </p>
            <Link href={`/ideas/${SAMPLE.slug}`} className="chapter-link">
              Open a public sample →
            </Link>
          </div>
        </section>

        <section className="story-plane story-plane-alt" data-reveal>
          <div className="story-inner">
            <p className="story-kicker">Scoring method</p>
            <h2 className="story-title">Ten dimensions · ship / pass / defer</h2>
            <p className="story-lede">
              Scores are inputs. Decisions are outputs. Operator turns each idea into pass/fail gates so
              you leave with ship, pass, or defer — not another bookmark.
            </p>
            <div className="method-grid">
              {DIMENSIONS.map((d) => (
                <div key={d.n} className="method-cell">
                  <p className="method-n">{d.n}</p>
                  <p className="method-name">{d.name}</p>
                  <p className="method-detail">{d.detail}</p>
                </div>
              ))}
            </div>
            <Link href="/method" className="story-link">
              Full method &amp; philosophy →
            </Link>
          </div>
        </section>

        <section className="story-plane" data-reveal>
          <div className="story-inner">
            <p className="story-kicker">Week to week</p>
            <h2 className="story-title">What you actually get.</h2>
            <p className="story-lede">
              Scout tastes the public plane. Operator unlocks the private vault — archive, teardowns,
              anti-portfolio, gates, sketches, checklists, CSV, and Gita when you’re stuck on product
              questions.
            </p>
            <div className="walk-grid">
              {WEEKLY.map((item) => (
                <div key={item.title} className="walk-cell">
                  <p className="walk-title">{item.title}</p>
                  <p className="walk-body">{item.body}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/whats-inside" className="story-link">
                Full feature inventory →
              </Link>
              <Link href="/faq" className="story-link story-link-dim">
                FAQ →
              </Link>
            </div>
          </div>
        </section>

        <section className="story-plane story-plane-alt" id="sample" data-reveal>
          <div className="story-inner">
            <p className="story-kicker">Sample score</p>
            <h2 className="story-title">A real scored idea.</h2>
            <p className="story-lede">
              Public preview. Operator unlocks the full teardown, go/no-go criteria, and launch checklist.
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
              <p className="sample-excerpt">{SAMPLE.teardownMd.slice(0, 280)}…</p>
              <div className="sample-actions">
                <Link href={`/ideas/${SAMPLE.slug}`} className="btn-ghost">
                  Open public page →
                </Link>
                <Link href="/pricing" className="btn-primary">
                  Unlock Operator →
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="proof-plane" data-reveal>
          <div className="proof-inner">
            <p className="proof-kicker">Plan ladder · USD</p>
            <h2 className="proof-title">Scout → Operator → Annual → Studio</h2>
            <p className="proof-lede">
              Free forever on Scout. Launch lock-in on Operator for the first 100 seats. Annual if you
              hate monthly decisions. Studio when the team needs one research brain.
            </p>
            <div className="proof-grid">
              {LADDER.map((plan) => (
                <div
                  key={plan.id}
                  className={`proof-col${plan.highlight ? " proof-col-hot" : ""}`}
                >
                  <div className="proof-col-head">
                    <p className="proof-col-name">
                      {plan.name} · {plan.price}
                      {plan.cadence.startsWith("/") ? plan.cadence : ` · ${plan.cadence}`}
                    </p>
                    <p className="proof-col-sub">{plan.description}</p>
                  </div>
                  <ul className="proof-list">
                    {plan.features.slice(0, 6).map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                  <Link href="/pricing" className="btn-primary">
                    {plan.mode === "none" ? "Start free on pricing →" : `${plan.cta} →`}
                  </Link>
                </div>
              ))}
            </div>
            <p className="mt-8 text-sm text-[var(--support)]">
              Checkout amounts are locked server-side. List prices are USD.{" "}
              <Link href="/pricing" className="font-semibold text-[var(--brass-dim)] hover:underline">
                Compare every inclusion on Pricing
              </Link>
              .
            </p>
          </div>
        </section>

        <section className="story-plane" data-reveal>
          <div className="story-inner">
            <p className="story-kicker">Operator ritual</p>
            <h2 className="story-title">How operators use it in a sitting.</h2>
            <p className="story-lede">
              Designed for a focused block — not a doom-scroll. Four moves, one decision.
            </p>
            <div className="walk-grid">
              {SITTING.map((item) => (
                <div key={item.step} className="walk-cell">
                  <p className="method-n">{item.step}</p>
                  <p className="walk-title">
                    {item.title}
                  </p>
                  <p className="walk-body">{item.body}</p>
                </div>
              ))}
            </div>
            <Link href="/login?next=/research" className="story-link">
              Sign in to research →
            </Link>
          </div>
        </section>

        <section className="story-plane story-plane-alt" data-reveal>
          <div className="story-inner">
            <p className="story-kicker">Objections</p>
            <h2 className="story-title">Straight answers.</h2>
            <p className="story-lede">
              If you’re still deciding, these are the questions people actually ask before they unlock
              Operator.
            </p>
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
              <Link href="/faq" className="story-link">
                More FAQ →
              </Link>
              <Link href="/foundry" className="story-link story-link-dim">
                Also shipping? See Foundry →
              </Link>
            </div>
          </div>
        </section>

        <section className="cta-band mx-auto max-w-6xl px-4 sm:px-6" data-reveal>
          <h2 className="font-display text-3xl tracking-wide sm:text-4xl">
            Stop guessing what to build.
          </h2>
          <p className="mt-3 max-w-xl text-[var(--support)]">
            Scout is free. Operator unlocks the vault. Foundry is waiting when the decision is ship.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/pricing" className="btn-primary">
              Unlock Operator →
            </Link>
            <Link href="/method" className="btn-ghost">
              Read the method
            </Link>
            <Link href="/foundry-kit" className="btn-ghost">
              Buy Foundry
            </Link>
          </div>
        </section>

        <section className="closing" data-reveal>
          <div className="closing-inner">
            <h2 className="closing-title">
              Every week you wait is another week building the wrong thing.
            </h2>
            <div className="closing-cta">
              <Link href="/pricing" className="btn-primary">
                Get Vault pricing · USD
              </Link>
              <Link href="/login?next=/research" className="btn-ghost">
                Sign in
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
