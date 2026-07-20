import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CheckoutButton } from "@/components/CheckoutButton";
import { FOUNDRY_PLANS } from "@/lib/pricing";

const STACK = [
  "Next.js 15 (App Router) + TypeScript",
  "Tailwind CSS",
  "Prisma + PostgreSQL (Supabase-ready)",
  "Supabase Auth (magic link, pre-wired)",
  "Razorpay Checkout + webhooks (subscriptions and one-time — INR)",
  "Resend for transactional email",
  "Docker + GitHub Actions CI",
];

const AGENT_NATIVE = [
  "An /docs/ARCHITECTURE.md written for a coding agent to read first, not last",
  "Every module has a one-line intent comment an agent can grep for",
  "Consistent file-per-concern layout so an agent can predict where new code goes",
  "A seed script and .env.example an agent can run without asking you 12 questions",
];

export default function FoundryKitPage() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-6 py-16">
          <p className="text-xs font-medium uppercase tracking-widest text-sky-400">
            Starter kit
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Foundry Kit</h1>
          <p className="mt-4 max-w-2xl text-neutral-400">
            The same production scaffold this venture was built on. Clone it, point a coding agent
            at the architecture docs, and ship your first paying customer in days instead of weeks.
          </p>

          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            <div>
              <h2 className="text-sm font-semibold text-neutral-300">What&apos;s in the stack</h2>
              <ul className="mt-3 space-y-2 text-sm text-neutral-400">
                {STACK.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-300">Why &quot;agent-native&quot;</h2>
              <ul className="mt-3 space-y-2 text-sm text-neutral-400">
                {AGENT_NATIVE.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {FOUNDRY_PLANS.map((plan) => (
              <div key={plan.id} className="flex flex-col rounded-xl border border-neutral-800 p-6">
                <p className="font-medium">{plan.name}</p>
                <p className="mt-2">
                  <span className="text-3xl font-semibold">{plan.price}</span>{" "}
                  <span className="text-sm text-neutral-500">{plan.cadence}</span>
                </p>
                <p className="mt-2 text-sm text-neutral-400">{plan.description}</p>
                <div className="mt-6">
                  <CheckoutButton planId={plan.id} label={plan.cta} primary={plan.id === "foundry-solo"} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
