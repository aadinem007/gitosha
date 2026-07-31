import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { SEED_IDEAS, totalScore, type IdeaScores } from "@/lib/ideas-data";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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
  if (!idea) return { title: "Opportunity not found" };
  return {
    title: `${idea.name} — ${totalScore(idea.scores)}/100 | Gitosha`,
    description: idea.oneLiner,
  };
}

export default async function IdeaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const found = SEED_IDEAS.find((i) => i.slug === slug);
  if (!found) {
    notFound();
    return null;
  }
  const idea = found;

  const score = totalScore(idea.scores);

  // Premium teardowns require Operator — never leak Pro copy on public SEO pages
  let canReadTeardown = !idea.isPremium;
  if (idea.isPremium) {
    try {
      const supabase = await createSupabaseServerClient();
      const { data } = await supabase.auth.getUser();
      if (data.user?.email) {
        const subscriber = await prisma.subscriber.findUnique({
          where: { email: data.user.email.toLowerCase() },
        });
        canReadTeardown =
          (subscriber?.tier === "PRO" || subscriber?.tier === "TEAM") &&
          subscriber?.status === "ACTIVE";
      }
    } catch {
      canReadTeardown = false;
    }
  }

  return (
    <>
      <Nav />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <article className="mx-auto max-w-3xl px-6 py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brass-dim)]">
            {idea.category}
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight">{idea.name}</h1>
          <p className="mt-3 text-lg text-[var(--muted)]">{idea.oneLiner}</p>
          <p className="mt-4 font-mono text-2xl text-[var(--signal)]">{score}/100</p>

          <div className="mt-10 overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--panel)]/50">
            <table className="w-full text-sm">
              <thead className="border-b border-[var(--line)] text-left text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-3 font-medium">Dimension</th>
                  <th className="px-4 py-3 text-right font-medium">/10</th>
                </tr>
              </thead>
              <tbody>
                {SCORE_LABELS.map(({ key, label }) => (
                  <tr key={key} className="border-t border-[var(--line)]">
                    <td className="px-4 py-2.5">{label}</td>
                    <td className="px-4 py-2.5 text-right font-mono">{idea.scores[key]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 border-t border-[var(--line)] pt-6">
            <h2 className="font-display font-semibold">Teardown</h2>
            {canReadTeardown ? (
              <p className="mt-2 text-sm text-[var(--fog)]">{idea.teardownMd}</p>
            ) : (
              <>
                <p className="mt-2 text-sm text-[var(--fog)]">
                  Full competitor map, go/no-go gates, and launch notes unlock on Operator.
                </p>
                <p className="mt-4 text-sm text-[var(--muted)]">
                  <Link href="/pricing" className="text-[var(--brass-dim)] underline">
                    Unlock Operator — $15/mo launch
                  </Link>
                  {" · "}
                  <Link href="/login" className="underline">
                    Sign in
                  </Link>{" "}
                  if you already subscribe.
                </p>
              </>
            )}
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/pricing"
              className="btn-primary px-4 py-2.5 text-center text-sm"
            >
              Unlock Operator — $15/mo
            </Link>
            <Link
              href="/foundry"
              className="rounded-md border border-[var(--line)] px-4 py-2.5 text-center text-sm font-semibold"
            >
              Foundry Solo — $99
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
