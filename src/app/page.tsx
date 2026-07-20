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
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-6 pt-20 pb-16">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-neutral-500">
            Weekly issue #0 · Free
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Stop guessing which micro-SaaS idea is worth building.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-neutral-400">
            Every week Shipyard pressure-tests 15-20 real business ideas against live demand
            signals, competitor teardowns, and pricing benchmarks — then scores each one on a
            public 10-dimension rubric. No inflated scores, no recycled listicles.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <WaitlistForm />
            <p className="text-xs text-neutral-500">
              Free forever tier. Upgrade to Pro for the full database and launch kits.
            </p>
          </div>
        </section>

        {/* Live scoreboard teaser */}
        <section className="mx-auto max-w-6xl px-6 pb-16">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-semibold">This week&apos;s top-scored ideas</h2>
            <Link href="/vault" className="text-sm text-neutral-400 hover:text-white">
              View full database →
            </Link>
          </div>
          <div className="mt-6 overflow-hidden rounded-xl border border-neutral-800">
            <table className="w-full text-sm">
              <thead className="bg-neutral-900 text-left text-neutral-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Idea</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="hidden px-4 py-3 font-medium sm:table-cell">One-liner</th>
                  <th className="px-4 py-3 text-right font-medium">Score</th>
                </tr>
              </thead>
              <tbody>
                {TOP_IDEAS.map((idea) => (
                  <tr key={idea.slug} className="border-t border-neutral-800">
                    <td className="px-4 py-3 font-medium">{idea.name}</td>
                    <td className="px-4 py-3 text-neutral-400">{idea.category}</td>
                    <td className="hidden px-4 py-3 text-neutral-400 sm:table-cell">
                      {idea.oneLiner}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-400">
                      {totalScore(idea.scores)}/100
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-neutral-500">
            Scored on demand, competition, scalability, automation, margin, MRR potential, barrier
            to entry, AI leverage, global reach, and time to launch. Full teardowns for Pro
            subscribers.
          </p>
        </section>

        {/* Two products */}
        <section className="mx-auto max-w-6xl px-6 pb-20">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-neutral-800 p-6">
              <p className="text-xs font-medium uppercase tracking-widest text-emerald-400">
                Research
              </p>
              <h3 className="mt-2 text-lg font-semibold">Build-Intel Vault</h3>
              <p className="mt-2 text-sm text-neutral-400">
                The full scored opportunity database, updated weekly, with financial models and
                launch kits for every idea that clears the bar.
              </p>
              <Link
                href="/pricing"
                className="mt-4 inline-block text-sm font-medium text-white hover:underline"
              >
                See pricing →
              </Link>
            </div>
            <div className="rounded-xl border border-neutral-800 p-6">
              <p className="text-xs font-medium uppercase tracking-widest text-sky-400">
                Starter kit
              </p>
              <h3 className="mt-2 text-lg font-semibold">Foundry Kit</h3>
              <p className="mt-2 text-sm text-neutral-400">
                An AI-agent-native SaaS starter kit — Next.js, Prisma, Supabase, Razorpay billing
                pre-wired, and architecture docs written for coding agents, not just humans.
              </p>
              <Link
                href="/foundry-kit"
                className="mt-4 inline-block text-sm font-medium text-white hover:underline"
              >
                See what&apos;s inside →
              </Link>
            </div>
          </div>
        </section>

        {/* Why not another idea list */}
        <section className="mx-auto max-w-6xl px-6 pb-24">
          <h2 className="text-xl font-semibold">Why this isn&apos;t another idea listicle</h2>
          <div className="mt-6 grid gap-6 text-sm text-neutral-400 sm:grid-cols-3">
            <div>
              <p className="font-medium text-white">Scored, not vibes</p>
              <p className="mt-1">
                Every idea gets the same 10-dimension rubric, published in full — including the
                ones that score badly.
              </p>
            </div>
            <div>
              <p className="font-medium text-white">Re-scored weekly</p>
              <p className="mt-1">
                Static listicles rot. We re-run the research pipeline every week against current
                competitor and pricing data.
              </p>
            </div>
            <div>
              <p className="font-medium text-white">Honest about the bar</p>
              <p className="mt-1">
                We don&apos;t inflate scores to make every idea look like a unicorn. Most don&apos;t
                clear a strict bar — that&apos;s the point.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
