import Link from "next/link";
import { BRAND } from "@/lib/brand";

export function Nav() {
  return (
    <header className="site-nav">
      <nav className="site-nav-inner" aria-label="Primary">
        <Link href="/" className="site-nav-brand" aria-label={`${BRAND.name} — Home`}>
          {BRAND.nameUpper}
        </Link>

        <div className="site-nav-links">
          <Link href="/" className="site-nav-link site-nav-home">
            Home
          </Link>
          <Link href="/#vault" className="site-nav-link">
            {BRAND.products.vault}
          </Link>
          <Link href="/#foundry" className="site-nav-link">
            {BRAND.products.foundry}
          </Link>
          <Link href="/pricing" className="site-nav-link">
            Pricing
          </Link>
          <Link href="/login" className="site-nav-signin">
            Sign in
          </Link>
        </div>
      </nav>
    </header>
  );
}
