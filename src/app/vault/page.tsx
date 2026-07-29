import { redirect } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function VaultPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  // Defense-in-depth: never rely only on proxy/middleware for AuthZ
  const userEmail = data.user?.email?.toLowerCase();
  if (!userEmail) {
    redirect("/login?next=/vault");
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
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-6 pb-16 pt-28 sm:pb-20 sm:pt-32">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="animate-rise text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brass-dim)]">
                Research
              </p>
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
                  className="font-semibold text-[var(--brass-dim)] underline-offset-4 hover:underline"
                >
                  Export CSV
                </a>
              )}
            </div>
          </div>

          {!isPro && (
            <div className="mt-8 rounded-lg border border-[var(--line)] bg-[var(--panel)]/60 px-4 py-3 text-sm leading-relaxed text-[var(--fog)]">
              You&apos;re on Scout (free). Full teardowns unlock on Operator.{" "}
              <a
                href="/pricing"
                className="font-semibold text-[var(--brass-dim)] underline-offset-4 hover:underline"
              >
                Upgrade — $15/mo launch price
              </a>
            </div>
          )}

          <div className="mt-10 space-y-3">
            {ideas.map((idea) => {
              const locked = idea.isPremium && !isPro;
              return (
                <div
                  key={idea.id}
                  className="score-row rounded-lg border border-[var(--line)] bg-[var(--panel)]/40 p-5"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="font-display font-semibold">{idea.name}</p>
                    <span className="font-mono text-sm text-[var(--signal)]">
                      {idea.totalScore}
                      <span className="text-[var(--muted)]">/100</span>
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--muted)]">{idea.category}</p>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--fog)]">{idea.oneLiner}</p>
                  {locked ? (
                    <p className="mt-3 text-xs text-[var(--muted)]">
                      Full teardown locked — Operator only.
                    </p>
                  ) : (
                    idea.teardownMd && (
                      <p className="mt-3 text-sm leading-relaxed text-[var(--ink)]/90">
                        {idea.teardownMd}
                      </p>
                    )
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
