import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { BRAND } from "@/lib/brand";

export default function NotFound() {
  return (
    <>
      <Nav />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <section className="mx-auto flex min-h-[70vh] max-w-xl flex-col justify-center px-6 py-28 text-center">
          <p className="kicker">404</p>
          <h1 className="mt-4 font-display text-4xl tracking-wide text-[var(--ink)] sm:text-5xl">
            Page not found
          </h1>
          <p className="mt-4 text-base leading-relaxed text-[var(--support)]">
            That URL is not a {BRAND.name} page. Head home, or open pricing if you were trying to
            buy.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/" className="btn-primary">
              Home
            </Link>
            <Link href="/pricing" className="btn-ghost">
              Pricing
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
