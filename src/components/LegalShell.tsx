import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export function LegalShell({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-6 pb-16 pt-28 sm:pb-20 sm:pt-32">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brass-dim)]">Legal</p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight">{title}</h1>
          <p className="mt-3 text-sm text-[var(--muted)]">Last updated: {updated}</p>
          <div className="rule mt-8 max-w-[6rem]" />
          <div className="legal-prose mt-10 space-y-6 text-[15px] leading-relaxed text-[var(--fog)]">
            {children}
          </div>
          <p className="mt-14 text-sm text-[var(--muted)]">
            Questions?{" "}
            <a href="mailto:aaditya.shah8005@gmail.com" className="text-[var(--brass-dim)] hover:underline">
              aaditya.shah8005@gmail.com
            </a>
            {" · "}
            <Link href="/" className="hover:text-[var(--ink)]">
              Home
            </Link>
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
