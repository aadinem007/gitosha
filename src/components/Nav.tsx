import Link from "next/link";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/method", label: "Method", hide: "sm" as const },
  { href: "/vault", label: "Vault" },
  { href: "/foundry-kit", label: "Foundry" },
  { href: "/license", label: "License", hide: "md" as const },
  { href: "/pricing", label: "Pricing" },
];

export function Nav() {
  return (
    <header className="glass-nav sticky top-0 z-40">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link
          href="/"
          className="font-display text-lg font-bold tracking-tight text-[var(--ink)] transition hover:text-[var(--brass)]"
        >
          SHIPYARD
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-0.5 text-sm text-[var(--muted)] sm:gap-1">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-md px-2.5 py-1.5 transition hover:bg-white/5 hover:text-[var(--ink)] sm:px-3 ${
                l.hide === "sm" ? "hidden sm:inline" : ""
              } ${l.hide === "md" ? "hidden md:inline" : ""}`}
            >
              {l.label}
            </Link>
          ))}
          <Link href="/login" className="btn-primary ml-1 px-3.5 py-1.5 text-sm sm:ml-2">
            Sign in
          </Link>
        </div>
      </nav>
    </header>
  );
}
