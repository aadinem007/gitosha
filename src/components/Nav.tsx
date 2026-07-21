import Link from "next/link";

export function Nav() {
  return (
    <header className="glass-nav sticky top-0 z-40">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-lg font-bold tracking-tight text-[var(--ink)]">
          SHIPYARD
        </Link>
        <div className="flex items-center gap-1 text-sm text-[var(--muted)] sm:gap-2">
          <Link
            href="/method"
            className="hidden rounded-md px-3 py-1.5 transition hover:bg-white/5 hover:text-[var(--ink)] sm:inline"
          >
            Method
          </Link>
          <Link
            href="/vault"
            className="rounded-md px-3 py-1.5 transition hover:bg-white/5 hover:text-[var(--ink)]"
          >
            Vault
          </Link>
          <Link
            href="/foundry-kit"
            className="rounded-md px-3 py-1.5 transition hover:bg-white/5 hover:text-[var(--ink)]"
          >
            Foundry
          </Link>
          <Link
            href="/license"
            className="hidden rounded-md px-3 py-1.5 transition hover:bg-white/5 hover:text-[var(--ink)] md:inline"
          >
            License
          </Link>
          <Link
            href="/pricing"
            className="rounded-md px-3 py-1.5 transition hover:bg-white/5 hover:text-[var(--ink)]"
          >
            Pricing
          </Link>
          <Link href="/login" className="btn-primary ml-2 px-3.5 py-1.5 text-sm">
            Sign in
          </Link>
        </div>
      </nav>
    </header>
  );
}
