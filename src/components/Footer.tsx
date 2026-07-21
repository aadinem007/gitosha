import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--line)] py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-display text-sm font-semibold tracking-wide text-[var(--ink)]">SHIPYARD</p>
          <p className="mt-2 max-w-sm text-sm text-[var(--muted)]">
            Opportunity research and production scaffolds for builders who ship.
          </p>
        </div>
        <div className="flex flex-wrap gap-5 text-sm text-[var(--muted)]">
          <Link href="/method" className="hover:text-[var(--ink)]">
            Method
          </Link>
          <Link href="/pricing" className="hover:text-[var(--ink)]">
            Pricing
          </Link>
          <Link href="/license" className="hover:text-[var(--ink)]">
            License
          </Link>
          <a href="mailto:aaditya.shah8005@gmail.com" className="hover:text-[var(--ink)]">
            Contact
          </a>
        </div>
      </div>
      <p className="mx-auto mt-8 max-w-6xl px-6 text-xs text-[var(--muted)]/70">
        © {new Date().getFullYear()} Shipyard
      </p>
    </footer>
  );
}
