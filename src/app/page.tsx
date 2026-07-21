import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { WaitlistForm } from "@/components/WaitlistForm";
import { SEED_IDEAS, totalScore } from "@/lib/ideas-data";

const TOP_IDEAS = [...SEED_IDEAS]
  .sort((a, b) => totalScore(b.scores) - totalScore(a.scores))
  .slice(0, 6);

const PROOF = [
  { k: "18", l: "ideas scored honestly" },
  { k: "0", l: "vanity 90+/100 scores" },
  { k: "10", l: "public scoring dimensions" },
  { k: "₹0", l: "to start as Scout" },
];

const STEPS = [
  {
    n: "01",
    t: "See what’s worth building",
    d: "Browse the live scoreboard. Read the method. Notice we publish the weak scores too — that’s the filter.",
  },
  {
    n: "02",
    t: "Unlock Operator or grab Foundry",
    d: "Pay in INR via UPI. Vault unlocks on sign-in. Foundry drops a license key and a zip — same minute.",
  },
  {
    n: "03",
    t: "Ship before the excuse arrives",
    d: "Customize the scaffold. Launch. Or hand Agency builds to clients with white-label and handoff docs ready.",
  },
];

const FEATURES = [
  {
    t: "Yardhand — on-site guide",
    d: "Tap ASK. Instant answers on pricing, downloads, Solo vs Agency. No ticket queue.",
  },
  {
    t: "License portal",
    d: "Re-download Foundry whenever you need. Email + key. No chasing us on WhatsApp.",
  },
  {
    t: "Vault CSV export",
    d: "Operators export the full scoreboard. Bring the research into your own sheets.",
  },
  {
    t: "Agency studio kit",
    d: "Handoff, invoice, proposal, white-label docs inside the ₹29,999 zip — built for client work.",
  },
  {
    t: "Razorpay-native",
    d: "UPI and cards. Amounts locked server-side. Built for Indian operators first.",
  },
  {
    t: "Public method",
    d: "We don’t hide the rubric. If the scoring feels wrong, you’ll see why — and argue with data.",
  },
];

export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <section className="hero-plane mx-auto max-w-6xl overflow-hidden px-6 pt-10 sm:pt-14">
          <p className="animate-rise text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brass)]">
            Stop gambling months on the wrong product
          </p>
          <h1 className="brand-mark animate-draft mt-5 font-display">SHIPYARD</h1>
          <div className="rule animate-pulse-line mt-8 max-w-md" />
          <p className="animate-rise-delay mt-8 max-w-2xl font-display text-2xl font-medium leading-snug text-[var(--fog)] sm:text-[2.05rem]">
            Know the software business worth building — then ship it on a scaffold that already takes money.
          </p>
          <p className="animate-rise-delay-2 mt-5 max-w-xl text-base leading-relaxed text-[var(--muted)] sm:text-lg">
            Honest scores. Kill criteria. Instant Foundry download after UPI. Built so Indian builders
            stop drowning in fake “100 SaaS ideas” lists and start collecting revenue.
          </p>
          <div className="animate-rise-delay-2 mt-10 flex flex-col gap-5">
            <WaitlistForm cta="Send me the free weekly issue" />
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <Link href="/pricing" className="btn-primary px-6 py-3 text-sm">
                See launch pricing →
              </Link>
              <Link href="/foundry-kit" className="btn-ghost px-6 py-3 text-sm text-[var(--fog)]">
                Why studios pay ₹29,999
              </Link>
              <span className="text-[var(--muted)]">
                Or tap <span className="font-semibold text-[var(--brass)]">ASK</span>
              </span>
            </div>
          </div>
        </section>

        <section className="border-y border-[var(--line)]">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 py-10 sm:grid-cols-4">
            {PROOF.map((p) => (
              <div key={p.l} className="text-center sm:text-left">
                <p className="font-display text-3xl font-bold text-[var(--brass)] sm:text-4xl">{p.k}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">{p.l}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-b border-[var(--line)] bg-[var(--panel)]/35">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n}>
                <p className="font-mono text-xs tracking-[0.22em] text-[var(--brass)]">{s.n}</p>
                <p className="mt-3 font-display text-xl font-semibold">{s.t}</p>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-24">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brass)]">
                Live board
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                The scoreboard doesn’t flatter you.
              </h2>
              <p className="mt-3 max-w-xl text-sm text-[var(--muted)]">
                If an idea is weak, the number says so. That’s the product.
              </p>
            </div>
            <Link href="/method" className="text-sm font-semibold text-[var(--brass)] hover:underline">
              How scoring works →
            </Link>
          </div>

          <div className="board-shell mt-8">
            <table className="w-full text-sm">
              <thead className="border-b border-[var(--line)] text-left text-[var(--muted)]">
                <tr>
                  <th className="px-5 py-4 font-medium">Opportunity</th>
                  <th className="px-5 py-4 font-medium">Category</th>
                  <th className="hidden px-5 py-4 font-medium lg:table-cell">Thesis</th>
                  <th className="px-5 py-4 text-right font-medium">Score</th>
                </tr>
              </thead>
              <tbody>
                {TOP_IDEAS.map((idea) => {
                  const score = totalScore(idea.scores);
                  return (
                    <tr key={idea.slug} className="score-row border-t border-[var(--line)]">
                      <td className="px-5 py-4 font-medium">
                        <Link href={`/ideas/${idea.slug}`} className="hover:text-[var(--brass)]">
                          {idea.name}
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-[var(--muted)]">{idea.category}</td>
                      <td className="hidden max-w-md truncate px-5 py-4 text-[var(--muted)] lg:table-cell">
                        {idea.oneLiner}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="font-mono text-base text-[var(--signal)]">{score}</span>
                        <span className="font-mono text-[var(--muted)]">/100</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-20">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brass)]">
            Built in
          </p>
          <h2 className="mt-2 max-w-2xl font-display text-3xl font-semibold sm:text-4xl">
            Features that make paying feel obvious.
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.t} className="feature-tile">
                <h3 className="font-display text-lg font-semibold text-[var(--ink)]">{f.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{f.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brass)]">
            Products
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Two doors. Same yard.</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            <div className="product-panel">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brass)]">Research</p>
              <h3 className="mt-3 font-display text-2xl font-semibold">The Vault</h3>
              <p className="mt-3 leading-relaxed text-[var(--muted)]">
                From ₹999/mo launch — full teardowns, kill criteria, competitor maps, launch
                checklists, CSV export. Cancel anytime.
              </p>
              <Link href="/pricing" className="mt-6 inline-flex btn-primary px-5 py-2.5 text-sm">
                Unlock Operator
              </Link>
            </div>
            <div className="product-panel product-panel-hot">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brass)]">Scaffold</p>
              <h3 className="mt-3 font-display text-2xl font-semibold">Foundry</h3>
              <p className="mt-3 leading-relaxed text-[var(--muted)]">
                Solo ₹9,999 or Agency ₹29,999. Pay once. Download the zip. Studios get unlimited
                client builds + white-label + a year of Studio Vault.
              </p>
              <Link href="/foundry-kit" className="mt-6 inline-flex btn-primary px-5 py-2.5 text-sm">
                Inspect Foundry
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-28">
          <div className="cta-band">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brass)]">
              Last honest pitch
            </p>
            <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Every week you wait is another week building the wrong thing.
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-[var(--muted)]">
              Launch Operator is ₹999/mo for the first 100. Foundry unlocks the second you pay. Legal
              pages are public. Ask Yardhand anything.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/pricing" className="btn-primary px-6 py-3 text-sm">
                I’m ready — show pricing
              </Link>
              <Link href="/faq" className="btn-ghost px-6 py-3 text-sm text-[var(--fog)]">
                Read FAQ first
              </Link>
              <Link href="/license" className="btn-ghost px-6 py-3 text-sm text-[var(--fog)]">
                Already paid
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
