import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: "FAQ — Gitosha",
  description: "Answers about Vault, Foundry Solo vs Agency, downloads, payments, and refunds.",
};

const FAQS: { q: string; a: string; links?: { label: string; href: string }[] }[] = [
  {
    q: "What do I get on Operator ($15/mo launch)?",
    a: "Everything in free Scout, plus every premium teardown (Markdown), go/no-go criteria as pass/fail gates, anti-portfolio of rejects, financial sketches, 14-day launch checklists, competitor maps + positioning wedges, 10-dimension breakdowns, CSV export, magic-link Vault, searchable growing archive, email support for access & billing, and 15% off Foundry forever. Cancel anytime — built to decide ship / pass / defer in one sitting.",
    links: [
      { label: "See all Operator features", href: "/whats-inside" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    q: "What am I buying with Foundry Agency ($249)?",
    a: "The Solo production zip (auth, database, checkout, webhooks, deploy docs — same stack Gitosha runs), plus unlimited client projects, white-label rights, handoff/invoice/proposal/white-label docs in the zip, priority support, 1 year of Studio Vault (5 seats), and commercial rights for agency resale of your builds. Not a custom build of your client’s product — the production foundation + rights pack you reuse every engagement.",
    links: [
      { label: "Full inventory", href: "/whats-inside" },
      { label: "Inspect Foundry", href: "/foundry" },
      { label: "Buy Foundry", href: "/foundry-kit" },
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
    links: [{ label: "Compare on Foundry", href: "/foundry#compare" }],
  },
  {
    q: "What’s in the Launch Bundle ($149)?",
    a: "Foundry Solo (full zip) + 12 months Operator — go/no-go criteria, premium teardowns, CSV export, magic-link Vault — in one payment. Saves ~$130 vs Solo + monthlies at launch price. Best if you want research and the ship kit without two cart decisions.",
    links: [{ label: "Pricing", href: "/pricing" }],
  },
  {
    q: "How do payments work?",
    a: "Pay securely at checkout with cards worldwide. List prices are in USD; amounts are locked on the server.",
    links: [{ label: "Pricing", href: "/pricing" }],
  },
  {
    q: "Refunds?",
    a: "Digital downloads have limited refunds after the zip is obtained. Unused Vault access has a short review window. See the Refund Policy.",
    links: [{ label: "Refund Policy", href: "/refund" }],
  },
  {
    q: "What does Gitosha mean?",
    a: "G is guide / insight (Vault). To is the path from idea to build. Sha is ship, shastra, craft (Foundry). Gita is the on-site guide. The brand story is the full version.",
    links: [{ label: "About / brand story", href: "/about" }],
  },
];

export default function FaqPage() {
  return (
    <>
      <Nav />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <section className="mx-auto max-w-3xl px-6 pb-16 pt-28 sm:pb-20 sm:pt-32">
          <p className="kicker">FAQ</p>
          <h1 className="mt-3 font-display text-5xl font-bold tracking-tight">Straight answers</h1>
          <div className="rule mt-6 max-w-[6rem]" />
          <div className="mt-10 space-y-7">
            {FAQS.map((item) => (
              <div key={item.q} className="border-t border-[var(--line)] pt-5">
                <h2 className="font-display text-lg font-semibold text-[var(--ink)]">{item.q}</h2>
                <p className="mt-2.5 text-base leading-relaxed text-[var(--support)]">{item.a}</p>
                {item.links && (
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                    {item.links.map((l) => (
                      <Link key={l.href} href={l.href} className="text-link">
                        {l.label} →
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="mt-12 text-sm text-[var(--support)]">
            Still stuck? Tap <span className="font-semibold text-[var(--ink)]">ASK</span> or email{" "}
            <a
              href={`mailto:${BRAND.supportEmail}`}
              className="underline underline-offset-2 hover:text-[var(--ink)]"
            >
              {BRAND.supportEmail}
            </a>
            .
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
