import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { RevealObserver } from "@/components/RevealObserver";
import { WaitlistForm } from "@/components/WaitlistForm";
import { TrackField } from "@/components/TrackField";
import { BRAND } from "@/lib/brand";
import { SEED_IDEAS, totalScore } from "@/lib/ideas-data";

export const metadata: Metadata = {
  title: "Method — How Gitosha scores opportunities",
  description:
    "Ten dimensions out of 100. Explicit ship / pass / defer. Why niches beat Twitter lists — and how research is produced week to week.",
};

const DIMENSIONS = [
  {
    name: "Demand",
    detail:
      "Evidence people already search for or pay for a solution. Search intent, existing spend, and willingness-to-pay signals beat vibes from a friend who “would totally use this.”",
    gate: "Pass if demand < 6 with no paid evidence.",
  },
  {
    name: "Competition",
    detail:
      "Higher score = less crowded, clearer gap. Crowded markets can still win with a wedge — but the score stays honest about how hard the wedge has to work.",
    gate: "Pass if competition ≥ 8 (crowded) and no wedge.",
  },
  {
    name: "Scalability",
    detail:
      "Can revenue grow without linear headcount? Services-heavy delivery caps the ceiling even when demand is real.",
    gate: "Defer if growth requires hiring before product-market fit is proven.",
  },
  {
    name: "Automation",
    detail:
      "How much of delivery can run without humans in the loop? Manual ops kill margin and weekends.",
    gate: "Flag ideas that need white-glove delivery as default.",
  },
  {
    name: "Profit margin",
    detail:
      "Gross margin after infra, payments, and support — not vanity ARR. Payment fees and support load count.",
    gate: "Pass when unit economics only work at fantasy conversion rates.",
  },
  {
    name: "MRR potential",
    detail:
      "Realistic recurring ceiling for a lean team. A huge TAM with no path to recurring cash is still a weak operator bet.",
    gate: "Prefer niches where a small team can hit meaningful MRR without a sales army.",
  },
  {
    name: "Barrier to entry",
    detail:
      "Higher = easier for a small team to start. Regulatory moats and capital intensity are scored as friction, not prestige.",
    gate: "Defer solo founders when time-to-start is brutal without a co-founder or budget.",
  },
  {
    name: "AI leverage",
    detail:
      "Where models create durable cost or speed advantage — not “sprinkle GPT on a CRUD app.” Durable leverage beats feature theater.",
    gate: "Discount ideas where AI is a sticker, not a cost structure.",
  },
  {
    name: "Global reach",
    detail:
      "Works across borders without local sales teams. International operators need products that don’t require a city-by-city hustle.",
    gate: "Local-only plays need a local advantage — or they get scored down.",
  },
  {
    name: "Time to launch",
    detail:
      "Higher = faster path to first paying customer. Long builds without paid validation are deferred for solo operators.",
    gate: "Defer if time-to-launch < 5 for solo founders.",
  },
];

const PHILOSOPHY = [
  {
    title: "Same rubric every week",
    body: "We don’t invent a new scoring story for every concept. Ten dimensions, one hundred points, explicit gates. Comparability is the product.",
  },
  {
    title: "Publish the rejects",
    body: "Research that only celebrates winners is marketing. The anti-portfolio exists so you trust the passes — and skip the quarter-killers we already killed.",
  },
  {
    title: "Ship / pass / defer",
    body: "Scores are inputs. Decisions are outputs. Operator writes go/no-go as pass/fail gates so you leave with a decision, not a bookmark.",
  },
  {
    title: "Niches over Twitter lists",
    body: "Vanity idea lists optimize for shareability. We optimize for operators who pick one niche and ship — international, USD-priced, allergic to hype.",
  },
];

const PROCESS = [
  {
    step: "01",
    title: "Surface candidates",
    body: "From operator pain, payment leaks, underserved niches, and “someone will pay for this” evidence — not from what’s trending on X.",
  },
  {
    step: "02",
    title: "Score all ten axes",
    body: "Demand through time-to-launch. No axis gets a free ten because the one-liner sounds clever.",
  },
  {
    step: "03",
    title: "Write the teardown",
    body: "Wedge, competitors, why now, where it dies. Premium Markdown lives behind Operator; public pages still show honest totals.",
  },
  {
    step: "04",
    title: "Encode go/no-go",
    body: "Pass/fail gates tied to the scores. If demand is soft and competition is brutal with no wedge — pass. Explicitly.",
  },
  {
    step: "05",
    title: "Publish rejects too",
    body: "Anti-portfolio entries keep the method honest. Round one finding: out of 18 concepts, none honestly cleared 90/100.",
  },
  {
    step: "06",
    title: "Archive & compound",
    body: "The vault grows. CSV export, magic-link access, searchable history — so next quarter’s decision starts from evidence, not memory.",
  },
];

const VS_LISTS = [
  {
    label: "Goal",
    lists: "Go viral / look prolific",
    method: "Decide ship / pass / defer",
  },
  {
    label: "Scoring",
    lists: "Optional, inconsistent, or missing",
    method: "Ten dimensions · same rubric weekly",
  },
  {
    label: "Rejects",
    lists: "Hidden or never written",
    method: "Anti-portfolio published on purpose",
  },
  {
    label: "Decision aid",
    lists: "Inspiration dump",
    method: "Go/no-go gates + financial sketches",
  },
  {
    label: "Audience",
    lists: "Scrollers collecting tabs",
    method: "Operators picking one niche",
  },
];

const SAMPLE = SEED_IDEAS.find((i) => i.slug === "recoverly") ?? SEED_IDEAS[2];
const SAMPLE_SCORE = totalScore(SAMPLE.scores);

export default function MethodPage() {
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
            Method
          </p>
          <h1 className="animate-rise-delay mt-3">The method</h1>
          <div className="rule mt-6 max-w-xs" />
          <p className="animate-rise-delay-2 mt-6 max-w-2xl text-lg leading-relaxed text-[var(--support)]">
            {BRAND.name} does not invent unicorns. We score opportunities the same way every week,
            publish the bad scores too, and refuse to inflate totals to hit a vanity bar. Judgment you
            can trust — not a highlight reel.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/vault" className="btn-primary">
              Explore Vault →
            </Link>
            <Link href="/pricing" className="btn-ghost">
              Unlock Operator →
            </Link>
          </div>
        </section>

        <section className="mega-split" data-reveal>
          <div className="mega-split-visual" aria-hidden="true">
            <TrackField intensity="stage" motif="vault" />
          </div>
          <div className="mega-split-inner">
            <h2 className="mega-split-title" aria-label="Score honestly">
              <span className="mega-split-word">Score</span>
              <span className="mega-split-word mega-split-word-accent">honestly</span>
            </h2>
            <p className="mega-split-copy">
              Same ten dimensions every week. Ship, pass, or defer — not another inspiration dump.
            </p>
          </div>
        </section>

        <section className="story-plane" data-reveal>
          <div className="story-inner">
            <p className="story-kicker">Philosophy</p>
            <h2 className="story-title">Why this rubric exists.</h2>
            <p className="story-lede">
              Operators don’t need more ideas. They need a shared language for killing weak ones fast —
              and committing to a niche without a quarter of Slack debate.
            </p>
            <div className="walk-grid">
              {PHILOSOPHY.map((item) => (
                <div key={item.title} className="walk-cell">
                  <p className="walk-title">{item.title}</p>
                  <p className="walk-body">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="story-plane story-plane-alt" data-reveal>
          <div className="story-inner">
            <p className="story-kicker">Ten dimensions · 100 points</p>
            <h2 className="story-title">Every axis, explained.</h2>
            <p className="story-lede">
              Each dimension is scored so totals stay comparable week to week. Gates below are examples
              of how Operator turns scores into ship / pass / defer — not vibes.
            </p>
            <div className="mt-10 space-y-0">
              {DIMENSIONS.map((d, i) => (
                <div key={d.name} className="border-t border-[var(--line)] py-6">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-[10px] tracking-[0.18em] text-[var(--brass-dim)]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="font-display text-xl font-semibold text-[var(--ink)]">{d.name}</h3>
                  </div>
                  <p className="mt-2 max-w-3xl pl-9 text-base leading-relaxed text-[var(--support)]">
                    {d.detail}
                  </p>
                  <p className="mt-3 max-w-3xl pl-9 text-sm font-medium text-[var(--fog)]">
                    Example gate: {d.gate}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="story-plane" data-reveal>
          <div className="story-inner">
            <p className="story-kicker">How research is produced</p>
            <h2 className="story-title">Week to week, not once.</h2>
            <p className="story-lede">
              The vault is a compounding archive — not a one-off PDF. Process below is how concepts move
              from candidate to scored, gated, and (when they fail) published as rejects.
            </p>
            <div className="walk-grid">
              {PROCESS.map((item) => (
                <div key={item.step} className="walk-cell">
                  <p className="method-n">{item.step}</p>
                  <p className="walk-title">
                    {item.title}
                  </p>
                  <p className="walk-body">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="proof-plane" data-reveal>
          <div className="proof-inner">
            <p className="proof-kicker">Niches ≠ Twitter lists</p>
            <h2 className="proof-title">Why we refuse vanity lists.</h2>
            <p className="proof-lede">
              Lists optimize for volume and shares. The method optimizes for a single operator decision:
              ship this niche, pass forever, or defer until a gate flips.
            </p>
            <div className="proof-table-wrap mt-8">
              <table className="proof-table">
                <thead>
                  <tr>
                    <th>Axis</th>
                    <th>Idea lists</th>
                    <th>Gitosha method</th>
                  </tr>
                </thead>
                <tbody>
                  {VS_LISTS.map((row) => (
                    <tr key={row.label}>
                      <td>{row.label}</td>
                      <td>{row.lists}</td>
                      <td>{row.method}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="story-plane story-plane-alt" data-reveal>
          <div className="story-inner">
            <p className="story-kicker">Worked example</p>
            <h2 className="story-title">Scores without the hype.</h2>
            <p className="story-lede">
              Public sample — honest total, public excerpt. Operator unlocks the full teardown and
              launch checklist.
            </p>
            <div className="sample-card copy-scrim mt-8">
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
              <p className="sample-excerpt">{SAMPLE.teardownMd.slice(0, 260)}…</p>
              <div className="sample-actions">
                <Link href={`/ideas/${SAMPLE.slug}`} className="btn-ghost">
                  Open public page →
                </Link>
                <Link href="/vault" className="btn-primary">
                  Full Vault story →
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="story-plane" data-reveal>
          <div className="story-inner">
            <p className="story-kicker">What operators also get</p>
            <h2 className="story-title">Beyond the rubric.</h2>
            <p className="story-lede">
              Clear go/no-go criteria for each idea, an anti-portfolio of concepts we reject, competitor
              maps, financial sketches, 14-day launch checklists, CSV export, and magic-link access to
              the private vault. Research that only celebrates winners is marketing. We sell judgment.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/pricing" className="story-link">
                Get Operator access →
              </Link>
              <Link href="/whats-inside" className="story-link story-link-dim">
                Feature inventory →
              </Link>
            </div>
            <p className="mt-10 max-w-2xl text-sm leading-relaxed text-[var(--fog)]">
              Round one finding: out of 18 concepts, none honestly cleared 90/100. That is the point.
              Perfect scores on every axis do not exist in the wild.
            </p>
          </div>
        </section>

        <section className="closing" data-reveal>
          <div className="closing-inner">
            <h2 className="closing-title">
              Same rubric. Honest totals. Decide in one sitting.
            </h2>
            <div className="closing-cta">
              <Link href="/vault" className="btn-primary">
                Enter Vault →
              </Link>
              <Link href="/pricing" className="btn-ghost">
                Pricing · USD
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
