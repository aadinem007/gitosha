import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function VaultPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  const subscriber = data.user?.email
    ? await prisma.subscriber.findUnique({ where: { email: data.user.email } })
    : null;

  const isPro = subscriber?.tier === "PRO" || subscriber?.tier === "TEAM";
  const ideas = await prisma.idea.findMany({ orderBy: { totalScore: "desc" } });

  return (
    <>
      <Nav />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex items-baseline justify-between">
            <h1 className="font-display text-3xl font-bold tracking-tight">The Vault</h1>
            <span className="text-sm text-[var(--muted)]">{ideas.length} opportunities scored</span>
          </div>
          {!isPro && (
            <div className="mt-4 rounded-md border border-[var(--line)] bg-[var(--panel)] px-4 py-3 text-sm text-[var(--fog)]">
              You&apos;re on Scout (free). Full teardowns unlock on Operator.{" "}
              <a href="/pricing" className="font-semibold text-[var(--brass)] underline">
                Upgrade — ₹999/mo launch price
              </a>
            </div>
          )}
          <div className="mt-8 space-y-3">
            {ideas.map((idea) => {
              const locked = idea.isPremium && !isPro;
              return (
                <div key={idea.id} className="rounded-lg border border-[var(--line)] bg-[var(--panel)]/40 p-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="font-display font-semibold">{idea.name}</p>
                    <span className="font-mono text-sm text-[var(--signal)]">{idea.totalScore}/100</span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--muted)]">{idea.category}</p>
                  <p className="mt-2 text-sm text-[var(--fog)]">{idea.oneLiner}</p>
                  {locked ? (
                    <p className="mt-3 text-xs text-[var(--muted)]">Full teardown locked — Operator only.</p>
                  ) : (
                    idea.teardownMd && (
                      <p className="mt-3 text-sm text-[var(--ink)]/90">{idea.teardownMd}</p>
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
