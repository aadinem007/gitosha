import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { WaitlistForm } from "@/components/WaitlistForm";
import { SEED_IDEAS, totalScore } from "@/lib/ideas-data";

const TOP_IDEAS = [...SEED_IDEAS]
  .sort((a, b) => totalScore(b.scores) - totalScore(a.scores))
  .slice(0, 5);

export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <section className="hero-plane mx-auto max-w-6xl overflow-hidden px-6 pb-16 pt-16 sm:pb-24 sm:pt-28">
          <p className="animate-draft font-display text-5xl font-extrabold tracking-tight text-[var(--ink)] sm:text-7xl md:text-8xl">
            SHIPYARD
          </p>
          <h1 className="animate-rise-delay mt-6 max-w-2xl font-display text-2xl font-semibold leading-snug text-[var(--fog)] sm:text-3xl">
            Know which software business is worth building — then ship it on a production scaffold.
          </h1>
          <p className="animate-rise-delay-2 mt-5 max-w-xl text-base text-[var(--muted)] sm:text-lg">
            Every week we pressure-test real opportunities on a public 10-dimension rubric. We publish
            the weak scores too. Paying operators get the full vault; builders get Foundry — the same
            stack this product runs on.
          </p>
          <div className="animate-rise-delay-2 mt-9 flex flex-col gap-4">
            <WaitlistForm cta="Get the free weekly issue" />
            <div className="flex flex-wrap gap-4 text-sm">
              <Link
                href="/pricing"
                className="font-semibold text-[var(--brass)] underline-offset-4 hover:underline"
              >
                Operator — ₹999/mo launch price →
              </Link>
              <Link href="/foundry-kit" className="text-[var(--muted)] hover:text-[var(--ink)]">
                Foundry Solo — ₹9,999
              </Link>
            </div>
          </div>
        </section>

        <section className="border-y border-[var(--line)]/80 bg-[var(--panel)]/30">
          <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 sm:grid-cols-3">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--brass)]">01</p>
              <p className="mt-2 font-display text-lg font-semibold">Honest scores</p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                No vanity 90+/100s. Round one: zero concepts cleared that bar.
              </p>
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--brass)]">02</p>
              <p className="mt-2 font-display text-lg font-semibold">Kill criteria</p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Operators get what to avoid — not just what to chase.
              </p>
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--brass)]">03</p>
              <p className="mt-2 font-display text-lg font-semibold">Scaffold included</p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Research alone is cheap. Foundry is the same billing stack we run in production.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-display text-xl font-semibold">Live scoreboard</h2>
            <Link href="/method" className="text-sm text-[var(--muted)] hover:text-[var(--ink)]">
              How scoring works →
            </Link>
          </div>
          <div className="mt-5 overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--panel)]/60">
            <table className="w-full text-sm">
              <thead className="border-b border-[var(--line)] text-left text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-3 font-medium">Opportunity</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="hidden px-4 py-3 font-medium sm:table-cell">Thesis</th>
                  <th className="px-4 py-3 text-right font-medium">Score</th>
                </tr>
              </thead>
              <tbody>
                {TOP_IDEAS.map((idea) => (
                  <tr key={idea.slug} className="border-t border-[var(--line)]">
                    <td className="px-4 py-3 font-medium">
                      <Link href={`/ideas/${idea.slug}`} className="hover:text-[var(--brass)]">
                        {idea.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[var(--muted)]">{idea.category}</td>
                    <td className="hidden px-4 py-3 text-[var(--muted)] sm:table-cell">
                      {idea.oneLiner}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-[var(--signal)]">
                      {totalScore(idea.scores)}/100
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24">
          <h2 className="font-display text-xl font-semibold">Two products. One yard.</h2>
          <div className="mt-6 grid gap-8 sm:grid-cols-2">
            <div className="border-t border-[var(--brass)]/40 pt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brass)]">
                Research
              </p>
              <h3 className="mt-2 font-display text-lg font-semibold">The Vault</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Scored opportunities, teardowns, kill criteria, launch checklists, and exportable
                score data — updated weekly against live market signals.
              </p>
              <Link
                href="/pricing"
                className="mt-4 inline-block text-sm font-semibold text-[var(--ink)] hover:text-[var(--brass)]"
              >
                See Operator pricing →
              </Link>
            </div>
            <div className="border-t border-[var(--brass)]/40 pt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brass)]">
                Scaffold
              </p>
              <h3 className="mt-2 font-display text-lg font-semibold">Foundry</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Auth, database, Razorpay billing, webhooks, rate limits, and deploy pipeline — so you
                build the product, not the plumbing.
              </p>
              <Link
                href="/foundry-kit"
                className="mt-4 inline-block text-sm font-semibold text-[var(--ink)] hover:text-[var(--brass)]"
              >
                Inspect Foundry →
              </Link>
            </div>
          </div>
          <p className="mt-12 max-w-2xl text-sm text-[var(--muted)]">
            Built for Indian builders first — UPI and cards via Razorpay.{" "}
            <Link href="/security" className="text-[var(--brass)] hover:underline">
              Security posture
            </Link>{" "}
            is public on purpose.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
