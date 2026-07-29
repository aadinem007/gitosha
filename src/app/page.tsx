import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { TrackField } from "@/components/TrackField";
import { SiteIntro } from "@/components/SiteIntro";
import { WaitlistForm } from "@/components/WaitlistForm";
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

const KILL_LINES = [
  "Kill if demand < 6 with no paid evidence",
  "Kill if competition ≥ 8 and no wedge",
  "Park if time-to-launch < 5 for solo founders",
];

const METHOD_DIMS = [
  { n: "01", name: "Demand", detail: "People already search for — or pay for — this." },
  { n: "02", name: "Competition", detail: "Higher score = clearer gap, less crowded." },
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
    body: "You pick one niche and ship. Operator kills dead ideas; Foundry removes plumbing weeks.",
  },
  {
    title: "Studios & agencies",
    body: "Agency license + Studio Vault so client pitches start scored — not blank Notion boards.",
  },
  {
    title: "Founders who hate vanity lists",
    body: "We publish low scores. If an idea dies on kill criteria, you see why — before you burn a quarter.",
  },
];

const PROOF_COMPARE = [
  {
    label: "Decide what to ship",
    scout: "Public scores + method",
    operator: "Full teardowns + kill criteria",
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

const MANIFESTO = [
  {
    mark: "I.",
    text: (
      <>
        <strong>Ideas are cheap. Quarters are not.</strong> Most “opportunity lists” flatter you.
        We score what can actually ship — and we publish the rejects.
      </>
    ),
  },
  {
    mark: "II.",
    text: (
      <>
        <strong>Judgment before code.</strong> Ten dimensions. Kill criteria. Financial sketches.
        You decide in one sitting, not after three weekends of scaffolding.
      </>
    ),
  },
  {
    mark: "III.",
    text: (
      <>
        <strong>Then you ship for real.</strong> Foundry is the same production stack Gitosha runs —
        auth, checkout, webhooks, deploy docs. Not a toy demo.
      </>
    ),
  },
];

export default function Home() {
  return (
    <>
      <SiteIntro />
      <Nav />
      <main className="flex-1">
        <section className="hero-cinematic">
          <TrackField />
          <div className="hero-stage">
            <h1 className="brand-mark animate-draft">
              Gito<em>sha</em>
            </h1>
            <p className="hero-line animate-rise">{BRAND.tagline}</p>
            <p className="hero-support animate-rise">
              Scored research for what deserves to exist — and a production scaffold that already
              takes payments. Built for international operators. Priced in USD.
            </p>
            <div className="hero-cta animate-rise-delay">
              <Link href="/pricing" className="btn-primary">
                See what it costs
              </Link>
              <Link href="/#story" className="btn-ghost">
                Read the story
              </Link>
            </div>
            <p className="hero-orbit-hint animate-rise-delay-2">Drag the forge to orbit</p>
          </div>
        </section>

        {/* Brand story */}
        <section className="story-band" id="story">
          <div className="story-band-inner">
            <p className="story-band-kicker">The name · the promise</p>
            <h2 className="story-band-title">
              Guide the idea. Walk the path. <em>Ship the craft.</em>
            </h2>
            <div className="story-band-prose">
              <p>
                <strong>Gi</strong> is insight — the Vault, where opportunities get scored like an
                operator would score them: demand, margin, competition, time-to-launch, AI leverage,
                and the rest. No influencer thread. No “500 SaaS ideas.”
              </p>
              <p>
                <strong>To</strong> is the crossing — the uncomfortable middle between “interesting”
                and “I should build this.” Kill criteria live here. So do the ideas we refuse to
                romanticize.
              </p>
              <p>
                <strong>Sha</strong> is craft — Foundry, the zip you download the same minute you
                pay. Auth. Checkout. Webhooks. Deploy docs. The boring weeks, already done.
              </p>
            </div>
          </div>

          <div className="story-band-inner story-band-wide">
            <div className="story-pillars">
              <div className="story-pillar">
                <p className="story-pillar-n">01 · Vault</p>
                <p className="story-pillar-title">Know</p>
                <p className="story-pillar-body">
                  Weekly scored opportunities with teardowns, kill lines, and launch checklists —
                  for people who decide with evidence.
                </p>
              </div>
              <div className="story-pillar">
                <p className="story-pillar-n">02 · Method</p>
                <p className="story-pillar-title">Judge</p>
                <p className="story-pillar-body">
                  One rubric. One hundred points. Public rejects. Judgment you can trust because we
                  show what we walked away from.
                </p>
              </div>
              <div className="story-pillar">
                <p className="story-pillar-n">03 · Foundry</p>
                <p className="story-pillar-title">Ship</p>
                <p className="story-pillar-body">
                  A production SaaS scaffold — Solo for your product, Agency for every client after.
                  Instant download. Same stack we run.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Manifesto */}
        <section className="story-band" id="manifesto" style={{ background: "var(--panel)" }}>
          <div className="story-band-inner">
            <p className="story-band-kicker">Why Gitosha exists</p>
            <h2 className="story-band-title">
              Most founders don’t fail from laziness. They fail from <em>building the wrong thing.</em>
            </h2>
            <p className="story-band-lede">
              You can feel it — the quiet dread of another month polishing a product nobody asked
              for. Gitosha is the antidote: ruthless selection first, then a path that actually
              ships.
            </p>
            <ul className="manifesto-list">
              {MANIFESTO.map((item) => (
                <li key={item.mark}>
                  <span className="manifesto-mark">{item.mark}</span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Problem / tension */}
        <section className="story-band" id="tension">
          <div className="story-band-inner">
            <p className="story-band-kicker">The trap</p>
            <h2 className="story-band-title">
              Twitter lists make you feel productive. They don’t make you <em>correct.</em>
            </h2>
            <div className="story-band-prose">
              <p>
                A hundred “AI SaaS ideas” is entertainment. A score with kill criteria is a
                decision. We built Gitosha for operators who would rather kill an idea on Tuesday
                than discover the truth in November.
              </p>
              <p>
                And when the idea survives? You shouldn’t spend three weeks reinventing auth,
                checkout, and webhook unlocks. That’s Foundry — so the first week is product, not
                plumbing.
              </p>
            </div>
            <Link href="/method" className="story-link" style={{ marginTop: "2rem" }}>
              See how we score →
            </Link>
          </div>
        </section>

        {/* Vault chapter */}
        <section className="chapter chapter-vault" id="vault">
          <div className="chapter-visual">
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
                {KILL_LINES.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="chapter-inner copy-scrim-soft">
            <p className="chapter-index">01</p>
            <p className="chapter-eyebrow">{BRAND.products.vault}</p>
            <h2 className="chapter-title">Kill bad ideas early. Fall in love with the survivors.</h2>
            <p className="chapter-copy">
              Operator unlocks every teardown, financial sketch, and launch checklist — from $15/mo
              for the first 100 seats. Scout stays free forever, because honesty should be public.
            </p>
            <Link href="/pricing" className="chapter-link">
              Unlock Operator →
            </Link>
          </div>
        </section>

        {/* Foundry chapter */}
        <section className="chapter chapter-foundry" id="foundry">
          <div className="chapter-inner copy-scrim-soft">
            <p className="chapter-index">02</p>
            <p className="chapter-eyebrow">{BRAND.products.foundry}</p>
            <h2 className="chapter-title">Ship on day one — not week six.</h2>
            <p className="chapter-copy">
              Solo $99 for your product. Agency $249 for every client after. Pay once in USD.
              Download the same minute. The scaffold already takes payments because we refuse to
              sell you homework.
            </p>
            <Link href="/foundry-kit" className="chapter-link">
              Inspect Foundry →
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

        {/* Method */}
        <section className="story-plane" id="method">
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

        {/* Inside Foundry */}
        <section className="story-plane story-plane-alt" id="inside">
          <div className="story-inner">
            <p className="story-kicker">04 · Inside Foundry</p>
            <h2 className="story-title">What’s in the zip.</h2>
            <p className="story-lede">
              Not a Notion template. A production scaffold that already takes payments — the same
              patterns Gitosha runs on.
            </p>
            <div className="walk-grid">
              {FOUNDRY_WALK.map((item) => (
                <div key={item.title} className="walk-cell">
                  <p className="walk-title">{item.title}</p>
                  <p className="walk-body">{item.body}</p>
                </div>
              ))}
            </div>
            <Link href="/foundry-kit" className="story-link">
              Inspect Foundry →
            </Link>
          </div>
        </section>

        {/* Who */}
        <section className="story-plane" id="for">
          <div className="story-inner">
            <p className="story-kicker">05 · Who it’s for</p>
            <h2 className="story-title">Built for people who ship — not people who collect tabs.</h2>
            <p className="story-lede">
              International operators. Studios. Founders who would rather hear “kill it” than
              “maybe someday.”
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

        {/* Sample */}
        <section className="story-plane story-plane-alt" id="sample">
          <div className="story-inner">
            <p className="story-kicker">06 · Sample score</p>
            <h2 className="story-title">A real scored idea.</h2>
            <p className="story-lede">
              Public preview. Operator unlocks the full teardown, kill criteria, and launch
              checklist.
            </p>
            <div className="sample-card copy-scrim">
              <div className="sample-head">
                <div>
                  <p className="sample-name">{SAMPLE.name}</p>
                  <p className="sample-cat">{SAMPLE.category}</p>
                </div>
                <p className="sample-score">
                  {SAMPLE_SCORE}
                  <span>/100</span>
                </p>
              </div>
              <p className="sample-line">{SAMPLE.oneLiner}</p>
              <p className="sample-excerpt">{SAMPLE.teardownMd.slice(0, 220)}…</p>
              <div className="sample-actions">
                <Link href={`/ideas/${SAMPLE.slug}`} className="story-link">
                  Open public page →
                </Link>
                <Link href="/pricing" className="story-link story-link-dim">
                  Unlock Operator →
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="proof-plane" id="proof">
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
                <Link href="/pricing" className="proof-link">
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
                <Link href="/foundry-kit" className="proof-link">
                  Open Foundry →
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

        <section className="closing">
          <div className="closing-inner">
            <h2 className="closing-title">
              Every week you wait is another week building the wrong thing.
            </h2>
            <p className="story-band-lede" style={{ maxWidth: "36rem", margin: "1rem auto 0" }}>
              Start with Operator if you need judgment. Start with Foundry if you already know —
              and refuse to rebuild the boring parts.
            </p>
            <div className="closing-cta">
              <Link href="/pricing" className="btn-primary">
                Get pricing · USD
              </Link>
              <Link href="/foundry-kit" className="btn-ghost">
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
