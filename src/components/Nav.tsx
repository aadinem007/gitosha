import Link from "next/link";

export function Nav() {
  return (
    <header className="border-b border-[var(--line)]/80 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="font-display text-xl font-bold tracking-tight text-[var(--ink)]">
          SHIPYARD
        </Link>
        <div className="flex items-center gap-5 text-sm text-[var(--muted)]">
          <Link href="/method" className="hidden hover:text-[var(--ink)] sm:inline">
            Method
          </Link>
          <Link href="/security" className="hidden hover:text-[var(--ink)] md:inline">
            Security
          </Link>
          <Link href="/vault" className="hover:text-[var(--ink)]">
            Vault
          </Link>
          <Link href="/foundry-kit" className="hover:text-[var(--ink)]">
            Foundry
          </Link>
          <Link href="/pricing" className="hover:text-[var(--ink)]">
            Pricing
          </Link>
          <Link
            href="/login"
            className="rounded-md bg-[var(--brass)] px-3.5 py-1.5 font-semibold text-[var(--hull)] hover:brightness-110"
          >
            Sign in
          </Link>
        </div>
      </nav>
    </header>
  );
}
