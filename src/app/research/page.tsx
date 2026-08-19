import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { SignOutButton } from "@/components/SignOutButton";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Research vault | Gitosha",
  description: "Signed-in scored opportunity vault.",
  robots: { index: false, follow: false },
};

export default async function ResearchVaultPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  // Defense-in-depth: never rely only on proxy/middleware for AuthZ
  const userEmail = data.user?.email?.toLowerCase();
  if (!userEmail) {
    redirect("/login?next=/research");
  }

  const subscriber = await prisma.subscriber.findUnique({
    where: { email: userEmail },
  });

  const isPro =
    (subscriber?.tier === "PRO" || subscriber?.tier === "TEAM") &&
    subscriber?.status === "ACTIVE";
  const ideas = await prisma.idea.findMany({ orderBy: { totalScore: "desc" } });

  return (
    <>
      <Nav />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <section className="mx-auto max-w-6xl px-6 pb-16 pt-28 sm:pb-20 sm:pt-32">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="kicker animate-rise">Research</p>
              <h1 className="animate-rise-delay mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
                The Vault
              </h1>
              <div className="rule mt-5 max-w-xs" />
            </div>
            <div className="flex items-center gap-4 text-sm text-[var(--muted)]">
              <span className="font-mono text-xs tracking-wide">
                {ideas.length} opportunities scored
              </span>
              {isPro && (
                <a
                  href="/api/vault/export"
                  className="font-semibold text-[var(--ink)] underline-offset-4 hover:underline"
                >
                  Export CSV
                </a>
              )}
              <SignOutButton />
            </div>
          </div>

          {!isPro && (
            <div className="vault-locked mt-8 text-sm leading-relaxed text-[var(--fog)]">
              <p className="font-semibold text-[var(--ink)]">You&apos;re on Scout (free)</p>
              <p className="mt-1.5">
                Full teardowns, go/no-go criteria, and CSV export unlock on Operator.
              </p>
              <Link href="/pricing" className="btn-primary mt-4 inline-flex text-sm">
                Upgrade — $15/mo launch price
              </Link>
            </div>
          )}

          {ideas.length === 0 ? (
            <div className="vault-empty mt-10">
              <p className="font-display text-xl font-semibold text-[var(--ink)]">
                No scored ideas yet
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[var(--support)]">
                The research board is empty right now. Browse public samples or check back after the
                next scoring pass.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Link href="/ideas/recoverly" className="btn-primary text-sm">
                  Open sample idea
                </Link>
                <Link href="/method" className="btn-ghost text-sm">
                  Read the method
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-10 space-y-3">
              {ideas.map((idea) => {
                const locked = idea.isPremium && !isPro;
                const preview = idea.teardownMd
                  ? idea.teardownMd
                      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
                      .replace(/\*\*/g, "")
                      .trim()
                  : "";
                return (
                  <article key={idea.id} className="score-row surface p-5">
                    <div className="flex items-baseline justify-between gap-3">
                      <Link
                        href={`/ideas/${idea.slug}`}
                        className="font-display font-semibold text-[var(--ink)] underline-offset-4 hover:underline"
                      >
                        {idea.name}
                      </Link>
                      <span className="font-mono text-sm text-[var(--ink)]">
                        {idea.totalScore}
                        <span className="text-[var(--muted)]">/100</span>
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-[var(--muted)]">{idea.category}</p>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--fog)]">{idea.oneLiner}</p>
                    {locked ? (
                      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ink)]">
                        <Link href={`/ideas/${idea.slug}`} className="hover:underline">
                          Full teardown locked — Operator only →
                        </Link>
                      </p>
                    ) : preview ? (
                      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[var(--ink)]/90">
                        {preview}
                      </p>
                    ) : null}
                    <p className="mt-3">
                      <Link
                        href={`/ideas/${idea.slug}`}
                        className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--support)] underline-offset-4 hover:text-[var(--ink)] hover:underline"
                      >
                        Open idea →
                      </Link>
                    </p>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
