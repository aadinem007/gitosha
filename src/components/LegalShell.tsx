import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { LegalMetaBlock } from "@/lib/legal/sections";
import { legalFooterDisclaimer } from "@/lib/legal/config";
import type { LegalConfig } from "@/lib/legal/types";

export function LegalShell({
  title,
  config,
  children,
}: {
  title: string;
  config: LegalConfig;
  children: React.ReactNode;
}) {
  return (
    <>
      <Nav />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <article className="mx-auto max-w-3xl px-6 pb-16 pt-28 sm:pb-20 sm:pt-32">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brass-dim)]">
            Legal
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight">{title}</h1>
          <div className="mt-6">
            <LegalMetaBlock config={config} />
          </div>
          <div className="rule mt-8 max-w-[6rem]" />
          <div className="legal-prose mt-10 space-y-6 text-[15px] leading-relaxed text-[var(--fog)]">
            {children}
          </div>
          <aside className="mt-12 rounded-sm border border-[var(--line)] bg-[var(--panel)] p-4 text-sm text-[var(--muted)]">
            <p>{legalFooterDisclaimer()}</p>
            <p className="mt-2">
              <Link href="/legal" className="text-[var(--brass-dim)] hover:underline">
                All legal documents
              </Link>
              {" · "}
              <Link href="/legal/rights" className="text-[var(--brass-dim)] hover:underline">
                Data rights
              </Link>
              {" · "}
              <Link href="/legal/preferences" className="text-[var(--brass-dim)] hover:underline">
                Preferences
              </Link>
            </p>
          </aside>
        </article>
      </main>
      <Footer />
    </>
  );
}
