import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { SEED_IDEAS, totalScore, type IdeaScores } from "@/lib/ideas-data";

const SCORE_LABELS: { key: keyof IdeaScores; label: string }[] = [
  { key: "demand", label: "Demand" },
  { key: "competition", label: "Competition" },
  { key: "scalability", label: "Scalability" },
  { key: "automation", label: "Automation" },
  { key: "margin", label: "Profit margin" },
  { key: "mrrPotential", label: "MRR potential" },
  { key: "barrierToEntry", label: "Barrier to entry" },
  { key: "aiLeverage", label: "AI leverage" },
  { key: "globalReach", label: "Global reach" },
  { key: "timeToLaunch", label: "Time to launch" },
];

export function generateStaticParams() {
  return SEED_IDEAS.map((idea) => ({ slug: idea.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const idea = SEED_IDEAS.find((i) => i.slug === slug);
  if (!idea) return { title: "Idea not found" };
  return {
    title: `${idea.name} — scored ${totalScore(idea.scores)}/100 | Shipyard`,
    description: idea.oneLiner,
  };
}

export default async function IdeaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const idea = SEED_IDEAS.find((i) => i.slug === slug);
  if (!idea) notFound();

  const score = totalScore(idea.scores);

  return (
    <>
      <Nav />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-6 py-16">
          <p className="text-xs font-medium uppercase tracking-widest text-neutral-500">
            {idea.category} · Scored idea
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">{idea.name}</h1>
          <p className="mt-3 text-lg text-neutral-400">{idea.oneLiner}</p>
          <p className="mt-4 font-mono text-2xl text-emerald-400">{score}/100</p>

          <div className="mt-10 overflow-hidden rounded-xl border border-neutral-800">
            <table className="w-full text-sm">
              <thead className="bg-neutral-900 text-left text-neutral-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Dimension</th>
                  <th className="px-4 py-3 text-right font-medium">Score / 10</th>
                </tr>
              </thead>
              <tbody>
                {SCORE_LABELS.map(({ key, label }) => (
                  <tr key={key} className="border-t border-neutral-800">
                    <td className="px-4 py-2.5">{label}</td>
                    <td className="px-4 py-2.5 text-right font-mono">{idea.scores[key]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 rounded-xl border border-neutral-800 p-5">
            <h2 className="font-semibold">Teardown</h2>
            <p className="mt-2 text-sm text-neutral-400">{idea.teardownMd}</p>
            {idea.isPremium && (
              <p className="mt-4 text-sm text-neutral-500">
                Full competitor map, pricing model, and launch kit are in{" "}
                <Link href="/pricing" className="text-white underline">
                  Vault Pro (₹1,499/mo)
                </Link>
                .
              </p>
            )}
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/pricing"
              className="rounded-lg bg-white px-4 py-2.5 text-center text-sm font-semibold text-neutral-950"
            >
              Unlock full database — ₹1,499/mo
            </Link>
            <Link
              href="/foundry-kit"
              className="rounded-lg border border-neutral-700 px-4 py-2.5 text-center text-sm font-semibold text-white"
            >
              Or buy Foundry Kit — ₹11,999
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
