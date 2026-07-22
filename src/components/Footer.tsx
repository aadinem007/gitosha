import Link from "next/link";
import { BRAND } from "@/lib/brand";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-quiet">
          <Link href="/" className="site-footer-brand">
            {BRAND.nameUpper}
          </Link>
          <nav className="site-footer-links" aria-label="Footer">
            <Link href="/">Home</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/#vault">{BRAND.products.vault}</Link>
            <Link href="/#foundry">{BRAND.products.foundry}</Link>
            <Link href="/faq">FAQ</Link>
            <Link href="/refund">Refunds</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
            <a href="mailto:aaditya.shah8005@gmail.com">Contact</a>
          </nav>
        </div>
        <div className="site-footer-bottom">
          <p>
            © {year} {BRAND.name}
          </p>
          <p>{BRAND.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
