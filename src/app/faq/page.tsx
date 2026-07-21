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
    q: "What do I get on Operator (₹999/mo launch)?",
    a: "Everything in free Scout, plus every premium teardown, kill criteria, financial sketch, 14-day launch checklist, competitor map, CSV export, magic-link Vault access, and 15% off Foundry forever. Cancel anytime.",
    links: [
      { label: "See all Operator features", href: "/whats-inside" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    q: "What am I buying with Foundry Agency (₹29,999)?",
    a: "The Solo production zip, plus unlimited client projects, white-label rights, handoff/invoice/proposal/white-label docs in the zip, priority support, and 1 year of Studio Vault (5 seats). Not a custom build of your client’s product — the scaffold you reuse every engagement.",
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
    q: "What’s in the Launch Bundle (₹14,999)?",
    a: "Foundry Solo + 12 months Operator in one payment — cheaper than buying Solo plus a year of monthly Operator at launch pricing separately.",
    links: [{ label: "Pricing", href: "/pricing" }],
  },
  {
    q: "How do payments work?",
    a: "Razorpay in INR — UPI, cards, netbanking. Amounts are set on the server. Test Mode may still be active until Live KYC is finished.",
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
        <section className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brass)]">FAQ</p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight">Straight answers</h1>
          <div className="rule mt-6 max-w-[6rem]" />
          <div className="mt-12 space-y-8">
            {FAQS.map((item) => (
              <div key={item.q} className="border-t border-[var(--line)] pt-6">
                <h2 className="font-display text-lg font-semibold text-[var(--ink)]">{item.q}</h2>
                <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{item.a}</p>
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
          <p className="mt-14 text-sm text-[var(--muted)]">
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
