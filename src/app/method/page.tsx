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
        <section className="mx-auto max-w-3xl px-6 py-16">
          <h1 className="font-display text-4xl font-bold">The method</h1>
          <p className="mt-4 text-[var(--muted)]">
            Shipyard does not invent unicorns. We score opportunities the same way every week, publish
            the bad scores too, and refuse to inflate totals to hit a vanity bar.
          </p>

          <h2 className="mt-12 font-display text-xl font-semibold">Ten dimensions · 100 points</h2>
          <div className="mt-6 space-y-4">
            {DIMENSIONS.map((d) => (
              <div key={d.name} className="border-t border-[var(--line)] pt-4">
                <p className="font-semibold text-[var(--ink)]">{d.name}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">{d.detail}</p>
              </div>
            ))}
          </div>

          <h2 className="mt-14 font-display text-xl font-semibold">What operators also get</h2>
          <p className="mt-3 text-sm text-[var(--muted)]">
            Kill criteria for each idea, an anti-portfolio of concepts we reject, competitor maps, and a
            14-day launch checklist. Research that only celebrates winners is marketing. We sell judgment.
          </p>

          <div className="mt-12 border-t border-[var(--line)] pt-6">
            <p className="text-sm text-[var(--fog)]">
              Round one finding: out of 18 concepts, none honestly cleared 90/100. That is the point.
              Perfect scores on every axis do not exist in the wild.
            </p>
            <Link href="/pricing" className="mt-4 inline-block text-sm font-semibold text-[var(--brass)]">
              Get Operator access →
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
