import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import Link from "next/link";

const DIMENSIONS = [
  { name: "Demand", detail: "Evidence people already search for / pay for a solution." },
  { name: "Competition", detail: "Higher score = less crowded, clearer gap." },
  { name: "Scalability", detail: "Can revenue grow without linear headcount?" },
  { name: "Automation", detail: "How much of delivery can run without humans?" },
  { name: "Profit margin", detail: "Gross margin after infra, payments, support." },
  { name: "MRR potential", detail: "Realistic recurring revenue ceiling for a lean team." },
  { name: "Barrier to entry", detail: "Higher = easier for a small team to start." },
  { name: "AI leverage", detail: "Where models create durable cost/speed advantage." },
  { name: "Global reach", detail: "Works across borders without local sales teams." },
  { name: "Time to launch", detail: "Higher = faster path to first paying customer." },
];

export default function MethodPage() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 pb-16 pt-28 sm:pb-20 sm:pt-32">
          <p className="animate-rise text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brass)]">
            Rubric
          </p>
          <h1 className="animate-rise-delay mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            The method
          </h1>
          <div className="rule mt-6 max-w-xs" />
          <p className="animate-rise-delay-2 mt-6 text-lg leading-relaxed text-[var(--muted)]">
            Gitosha does not invent unicorns. We score opportunities the same way every week, publish
            the bad scores too, and refuse to inflate totals to hit a vanity bar.
          </p>

          <h2 className="mt-14 font-display text-xl font-semibold">Ten dimensions · 100 points</h2>
          <div className="mt-6 space-y-0">
            {DIMENSIONS.map((d, i) => (
              <div key={d.name} className="border-t border-[var(--line)] py-4">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-[10px] tracking-[0.18em] text-[var(--brass)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="font-display font-semibold text-[var(--ink)]">{d.name}</p>
                </div>
                <p className="mt-1 pl-9 text-sm leading-relaxed text-[var(--muted)]">{d.detail}</p>
              </div>
            ))}
          </div>

          <h2 className="mt-14 font-display text-xl font-semibold">What operators also get</h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
            Kill criteria for each idea, an anti-portfolio of concepts we reject, competitor maps, and a
            14-day launch checklist. Research that only celebrates winners is marketing. We sell judgment.
          </p>

          <div className="mt-12 border-t border-[var(--line)] pt-8">
            <p className="text-sm leading-relaxed text-[var(--fog)]">
              Round one finding: out of 18 concepts, none honestly cleared 90/100. That is the point.
              Perfect scores on every axis do not exist in the wild.
            </p>
            <Link
              href="/pricing"
              className="mt-5 inline-block text-sm font-semibold text-[var(--brass)] underline-offset-4 hover:underline"
            >
              Get Operator access →
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
