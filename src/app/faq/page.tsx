import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "FAQ — Gitosha",
  description: "Answers about Vault, Foundry Solo vs Agency, downloads, payments, and refunds.",
};

const FAQS: { q: string; a: string; links?: { label: string; href: string }[] }[] = [
  {
    q: "What do I get on Operator ($15/mo launch)?",
    a: "Everything in free Scout, plus every premium teardown (Markdown), kill criteria as pass/fail gates, anti-portfolio of rejects, financial sketches, 14-day launch checklists, competitor maps + positioning wedges, 10-dimension breakdowns, CSV export, magic-link Vault, searchable growing archive, email support for access & billing, and 15% off Foundry forever. Cancel anytime — built to decide ship/kill/park in one sitting.",
    links: [
      { label: "See all Operator features", href: "/whats-inside" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    q: "What am I buying with Foundry Agency ($249)?",
    a: "The Solo production zip (auth, database, checkout, webhooks, deploy docs — same stack Gitosha runs), plus unlimited client projects, white-label rights, handoff/invoice/proposal/white-label docs in the zip, priority support, 1 year of Studio Vault (5 seats), and commercial rights for agency resale of your builds. Not a custom build of your client’s product — the scaffold + rights pack you reuse every engagement.",
    links: [
      { label: "Full inventory", href: "/whats-inside" },
      { label: "Inspect Foundry", href: "/foundry-kit" },
    ],
  },
  {
    q: "How do I get the files after paying?",
    a: "Checkout shows your license key (GITO-…). Open License, enter the same email + key, download the zip. Re-download anytime (fair-use cap).",
    links: [{ label: "License portal", href: "/license" }],
  },
  {
    q: "Solo vs Agency — which should I buy?",
    a: "Solo if you ship one product for yourself. Agency if you build for clients, need white-label, templates, priority support, or a year of Studio Vault.",
    links: [{ label: "Compare on Foundry", href: "/foundry-kit#compare" }],
  },
  {
    q: "What’s in the Launch Bundle ($149)?",
    a: "Foundry Solo (full zip) + 12 months Operator — kill criteria, premium teardowns, CSV export, magic-link Vault — in one payment. Saves ~$130 vs Solo + monthlies at launch price. Best if you want research and the ship kit without two cart decisions.",
    links: [{ label: "Pricing", href: "/pricing" }],
  },
  {
    q: "How do payments work?",
    a: "Pay securely via Stripe Checkout (cards worldwide). Amounts are locked on the server in USD.",
    links: [{ label: "Pricing", href: "/pricing" }],
  },
  {
    q: "Refunds?",
    a: "Digital downloads have limited refunds after the zip is obtained. Unused Vault access has a short review window. See the Refund Policy.",
    links: [{ label: "Refund Policy", href: "/refund" }],
  },
];

export default function FaqPage() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 pb-16 pt-28 sm:pb-20 sm:pt-32">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brass)]">FAQ</p>
          <h1 className="mt-3 font-display text-5xl font-bold tracking-tight">Straight answers</h1>
          <div className="rule mt-6 max-w-[6rem]" />
          <div className="mt-12 space-y-8">
            {FAQS.map((item) => (
              <div key={item.q} className="border-t border-[var(--line)] pt-6">
                <h2 className="font-display text-lg font-semibold text-[var(--ink)]">{item.q}</h2>
                <p className="mt-3 text-base leading-relaxed text-[var(--support)]">{item.a}</p>
                {item.links && (
                  <div className="mt-3 flex flex-wrap gap-3">
                    {item.links.map((l) => (
                      <Link
                        key={l.href}
                        href={l.href}
                        className="text-sm font-semibold text-[var(--brass)] hover:underline"
                      >
                        {l.label} →
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="mt-14 text-sm text-[var(--support)]">
            Still stuck? Tap <span className="text-[var(--brass)]">ASK</span> or email{" "}
            <a href="mailto:aaditya.shah8005@gmail.com" className="text-[var(--brass)] hover:underline">
              aaditya.shah8005@gmail.com
            </a>
            .
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
