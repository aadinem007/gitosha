import Link from "next/link";

export function Nav() {
  return (
    <header className="glass-nav sticky top-0 z-40">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3.5 sm:px-6 sm:py-4">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Link
            href="/"
            className="font-display text-lg font-bold tracking-tight text-[var(--ink)] transition hover:text-[var(--brass)]"
          >
            GITOSHA
          </Link>
          <Link
            href="/"
            className="rounded-md border border-[var(--brass)]/45 bg-[var(--brass)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--brass)] transition hover:bg-[var(--brass)]/20 sm:px-3 sm:text-sm"
          >
            Home
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-0.5 text-sm text-[var(--muted)] sm:gap-1">
          <Link
            href="/method"
            className="hidden rounded-md px-2.5 py-1.5 transition hover:bg-white/5 hover:text-[var(--ink)] sm:inline sm:px-3"
          >
            Method
          </Link>
          <Link
            href="/faq"
            className="hidden rounded-md px-2.5 py-1.5 transition hover:bg-white/5 hover:text-[var(--ink)] md:inline sm:px-3"
          >
            FAQ
          </Link>
          <Link
            href="/vault"
            className="rounded-md px-2.5 py-1.5 transition hover:bg-white/5 hover:text-[var(--ink)] sm:px-3"
          >
            Vault
          </Link>
          <Link
            href="/foundry-kit"
            className="rounded-md px-2.5 py-1.5 transition hover:bg-white/5 hover:text-[var(--ink)] sm:px-3"
          >
            Foundry
          </Link>
          <Link
            href="/license"
            className="hidden rounded-md px-2.5 py-1.5 transition hover:bg-white/5 hover:text-[var(--ink)] lg:inline sm:px-3"
          >
            License
          </Link>
          <Link
            href="/pricing"
            className="rounded-md px-2.5 py-1.5 transition hover:bg-white/5 hover:text-[var(--ink)] sm:px-3"
          >
            Pricing
          </Link>
          <Link href="/login" className="btn-primary ml-1 px-3.5 py-1.5 text-sm sm:ml-2">
            Sign in
          </Link>
        </div>
      </nav>
    </header>
  );
}
