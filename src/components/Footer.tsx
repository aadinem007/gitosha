import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-[var(--line)]">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="font-display text-sm font-semibold tracking-wide text-[var(--ink)]">
              SHIPYARD
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-[var(--muted)]">
              Opportunity research and production scaffolds for builders who ship.
            </p>
            <Link
              href="/"
              className="mt-5 inline-flex text-sm font-semibold text-[var(--brass)] hover:underline"
            >
              ← Home
            </Link>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brass)]">
              Product
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-[var(--muted)]">
              <li>
                <Link href="/vault" className="hover:text-[var(--ink)]">
                  Vault
                </Link>
              </li>
              <li>
                <Link href="/foundry-kit" className="hover:text-[var(--ink)]">
                  Foundry
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-[var(--ink)]">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/license" className="hover:text-[var(--ink)]">
                  License download
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brass)]">
              Company
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-[var(--muted)]">
              <li>
                <Link href="/method" className="hover:text-[var(--ink)]">
                  Method
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[var(--ink)]">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-[var(--ink)]">
                  Home
                </Link>
              </li>
              <li>
                <a href="mailto:aaditya.shah8005@gmail.com" className="hover:text-[var(--ink)]">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brass)]">
              Legal
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-[var(--muted)]">
              <li>
                <Link href="/terms" className="hover:text-[var(--ink)]">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[var(--ink)]">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/refund" className="hover:text-[var(--ink)]">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-[var(--line)] pt-8 text-xs text-[var(--muted)]/80 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Shipyard. All rights reserved.</p>
          <p>India · Payments via Razorpay · Prices in INR</p>
        </div>
      </div>
    </footer>
  );
}
