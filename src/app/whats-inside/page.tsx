import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "What's inside Foundry — Shipyard",
  description: "Full inventory of the Foundry zip for Solo and Agency buyers.",
};

const SOLO = [
  "Next.js App Router + TypeScript app",
  "Tailwind design tokens",
  "Prisma + Postgres schema",
  "Supabase magic-link auth",
  "Razorpay order + verify + webhook",
  "Dashboard gated by auth",
  "Waitlist API + honeypot pattern",
  "Rate limiting helpers",
  "Docker + CI starter",
  "Architecture + getting started docs",
];

const AGENCY = [
  "Everything in Solo",
  "Client handoff checklist",
  "Invoice template",
  "Proposal template",
  "White-label delivery guide",
  "Unlimited client commercial rights",
  "1 year Studio Vault entitlement (account unlock)",
];

export default function WhatsInsidePage() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brass)]">
            Inventory
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight">
            What’s inside the zip
          </h1>
          <p className="mt-4 text-[var(--muted)] leading-relaxed">
            No mystery box. Here’s exactly what drops after payment — so ₹9,999 and ₹29,999 feel
            concrete before you buy.
          </p>
          <div className="rule mt-8 max-w-[6rem]" />

          <h2 className="mt-12 font-display text-xl font-semibold">Foundry Solo</h2>
          <ul className="mt-4 space-y-2 text-sm text-[var(--fog)]">
            {SOLO.map((i) => (
              <li key={i}>— {i}</li>
            ))}
          </ul>

          <h2 className="mt-12 font-display text-xl font-semibold text-[var(--brass)]">
            Agency adds
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-[var(--fog)]">
            {AGENCY.map((i) => (
              <li key={i}>— {i}</li>
            ))}
          </ul>

          <div className="mt-12 flex flex-wrap gap-3">
            <Link href="/pricing" className="btn-primary px-5 py-2.5 text-sm">
              Buy on pricing
            </Link>
            <Link href="/foundry-kit" className="btn-ghost px-5 py-2.5 text-sm text-[var(--fog)]">
              Back to Foundry
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
