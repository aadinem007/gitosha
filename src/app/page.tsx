import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { WaitlistForm } from "@/components/WaitlistForm";
import { SEED_IDEAS, totalScore } from "@/lib/ideas-data";

const TOP_IDEAS = [...SEED_IDEAS]
  .sort((a, b) => totalScore(b.scores) - totalScore(a.scores))
  .slice(0, 6);

export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <section className="hero-plane mx-auto max-w-6xl overflow-hidden px-6 pt-10 sm:pt-16">
          <p className="animate-rise text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brass)]">
            Research yard · India-first · 2026
          </p>
          <h1 className="brand-mark animate-draft mt-5 font-display">SHIPYARD</h1>
          <div className="rule animate-pulse-line mt-8 max-w-md" />
          <p className="animate-rise-delay mt-8 max-w-2xl font-display text-2xl font-medium leading-snug text-[var(--fog)] sm:text-[2rem]">
            Know which software business is worth building — then ship it on a production scaffold.
          </p>
          <p className="animate-rise-delay-2 mt-5 max-w-xl text-base leading-relaxed text-[var(--muted)] sm:text-lg">
            Weekly scored opportunities on a public 10-dimension rubric. Weak scores published on
            purpose. Operators get the full vault. Builders get Foundry — instant download after
            payment.
          </p>
          <div className="animate-rise-delay-2 mt-10 flex flex-col gap-5">
            <WaitlistForm cta="Get the free weekly issue" />
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <Link
                href="/pricing"
                className="btn-primary px-5 py-2.5 text-sm"
              >
                View pricing
              </Link>
              <Link
                href="/foundry-kit"
                className="btn-ghost px-5 py-2.5 text-sm text-[var(--fog)]"
              >
                Inspect Foundry
              </Link>
              <span className="text-[var(--muted)]">
                Help? Tap <span className="font-semibold text-[var(--brass)]">ASK</span>
              </span>
            </div>
          </div>
        </section>

        <section className="border-y border-[var(--line)] bg-[var(--panel)]/40">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-3">
            {[
              {
                n: "01",
                t: "Honest scores",
                d: "No vanity 90+/100s. Round one: zero concepts cleared that bar.",
              },
              {
                n: "02",
                t: "Kill criteria",
                d: "Operators learn what to avoid — not only what to chase.",
              },
              {
                n: "03",
                t: "Instant delivery",
                d: "Foundry zip unlocks the moment Razorpay confirms payment.",
              },
            ].map((item) => (
              <div key={item.n} className="animate-rise">
                <p className="font-mono text-xs tracking-[0.22em] text-[var(--brass)]">{item.n}</p>
                <p className="mt-3 font-display text-xl font-semibold">{item.t}</p>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{item.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-24">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brass)]">
                Live board
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Scoreboard
              </h2>
            </div>
            <Link href="/method" className="text-sm text-[var(--muted)] transition hover:text-[var(--ink)]">
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

        <section className="mx-auto max-w-6xl px-6 pb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brass)]">
            Products
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Two ways in.</h2>
          <div className="mt-10 grid gap-12 sm:grid-cols-2">
            <div>
              <div className="rule mb-6 max-w-[8rem]" />
              <h3 className="font-display text-2xl font-semibold">The Vault</h3>
              <p className="mt-3 leading-relaxed text-[var(--muted)]">
                Scored opportunities, teardowns, kill criteria, launch checklists, competitor maps,
                and CSV export — updated weekly.
              </p>
              <Link
                href="/pricing"
                className="mt-6 inline-block text-sm font-semibold text-[var(--brass)] hover:underline"
              >
                Operator from ₹999/mo →
              </Link>
            </div>
            <div>
              <div className="rule mb-6 max-w-[8rem]" />
              <h3 className="font-display text-2xl font-semibold">Foundry</h3>
              <p className="mt-3 leading-relaxed text-[var(--muted)]">
                Production SaaS zip: auth, Postgres, Razorpay, webhooks, deploy pipeline. Pay once —
                download instantly from your license portal.
              </p>
              <Link
                href="/foundry-kit"
                className="mt-6 inline-block text-sm font-semibold text-[var(--brass)] hover:underline"
              >
                Foundry from ₹9,999 →
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-28">
          <div className="cta-band">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brass)]">
              Ready
            </p>
            <h2 className="mt-3 max-w-xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Pick a plan. Pay in INR. Ship this week.
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-[var(--muted)]">
              Launch Operator pricing is live. Foundry downloads unlock automatically after checkout.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/pricing" className="btn-primary px-5 py-2.5 text-sm">
                Go to pricing
              </Link>
              <Link href="/license" className="btn-ghost px-5 py-2.5 text-sm text-[var(--fog)]">
                Already paid? License portal
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
