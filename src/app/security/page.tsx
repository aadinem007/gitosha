import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

const CONTROLS = [
  {
    title: "Transport security",
    detail: "HSTS, HTTPS-only, upgrade-insecure-requests enforced at the edge.",
  },
  {
    title: "Browser isolation",
    detail: "Content-Security-Policy, frame denial, nosniff, locked permissions policy.",
  },
  {
    title: "Payment integrity",
    detail: "Razorpay order amounts set server-side only. Signatures verified on every capture.",
  },
  {
    title: "Abuse controls",
    detail: "Rate limits on checkout, waitlist, verify, and webhooks. Honeypot on signup forms.",
  },
  {
    title: "Access control",
    detail: "Vault routes require authenticated sessions. Secrets never shipped to the browser.",
  },
  {
    title: "Data layer",
    detail: "Parameterized Prisma queries. No raw SQL concatenation. Source maps disabled in production.",
  },
];

export default function SecurityPage() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 py-16">
          <h1 className="font-display text-4xl font-bold">Security</h1>
          <p className="mt-4 text-[var(--muted)]">
            No product is unhackable. Ours is built so the obvious failure modes — leaked secrets,
            forged payments, spam floods, clickjacking, XSS injection — are closed by default.
          </p>

          <div className="mt-12 space-y-6">
            {CONTROLS.map((c) => (
              <div key={c.title} className="border-t border-[var(--line)] pt-5">
                <h2 className="font-display text-lg font-semibold">{c.title}</h2>
                <p className="mt-2 text-sm text-[var(--muted)]">{c.detail}</p>
              </div>
            ))}
          </div>

          <p className="mt-12 text-sm text-[var(--muted)]">
            Found a vulnerability? Email{" "}
            <a href="mailto:aaditya.shah8005@gmail.com" className="text-[var(--brass)]">
              aaditya.shah8005@gmail.com
            </a>
            . We treat reports seriously.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
