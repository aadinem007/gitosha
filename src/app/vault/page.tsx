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
            <h1 className="text-3xl font-semibold tracking-tight">The Vault</h1>
            <span className="text-sm text-neutral-500">{ideas.length} ideas scored</span>
          </div>
          {!isPro && (
            <div className="mt-4 rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-neutral-300">
              You&apos;re on the Free tier — full teardowns are Pro-only.{" "}
              <a href="/pricing" className="font-medium text-white underline">
                Upgrade for $19/mo
              </a>
            </div>
          )}
          <div className="mt-8 space-y-3">
            {ideas.map((idea) => {
              const locked = idea.isPremium && !isPro;
              return (
                <div key={idea.id} className="rounded-xl border border-neutral-800 p-5">
                  <div className="flex items-baseline justify-between">
                    <p className="font-medium">{idea.name}</p>
                    <span className="font-mono text-sm text-emerald-400">{idea.totalScore}/100</span>
                  </div>
                  <p className="mt-1 text-sm text-neutral-500">{idea.category}</p>
                  <p className="mt-2 text-sm text-neutral-400">{idea.oneLiner}</p>
                  {locked ? (
                    <p className="mt-3 text-xs text-neutral-500">
                      Full teardown locked — Pro subscribers only.
                    </p>
                  ) : (
                    idea.teardownMd && (
                      <p className="mt-3 text-sm text-neutral-300">{idea.teardownMd}</p>
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
