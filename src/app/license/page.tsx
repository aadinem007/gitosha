import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { LicensePortal } from "@/components/LicensePortal";

export default async function LicensePage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; key?: string }>;
}) {
  const { email = "", key = "" } = await searchParams;

  return (
    <>
      <Nav />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <section className="mx-auto max-w-2xl px-6 pb-16 pt-28 sm:pb-20 sm:pt-32">
          <p className="animate-rise text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brass-dim)]">
            Delivery
          </p>
          <h1 className="animate-rise-delay mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Your license
          </h1>
          <div className="rule mt-6 max-w-xs" />
          <p className="animate-rise-delay-2 mt-6 leading-relaxed text-[var(--muted)]">
            Enter the email and license key from checkout. Download Foundry as a zip — no manual email
            from us required. You can re-download anytime.
          </p>
          <div className="mt-10 rounded-xl border border-[var(--line)] bg-[var(--panel)]/50 p-6 sm:p-8">
            <LicensePortal initialEmail={email} initialKey={key} />
          </div>
          <ol className="mt-12 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-[var(--muted)]">
            <li>Download the zip</li>
            <li>
              Unzip → open the <code className="font-mono text-[var(--fog)]">foundry-kit</code> folder
            </li>
            <li>
              Copy <code className="font-mono text-[var(--fog)]">env.example</code> to{" "}
              <code className="font-mono text-[var(--fog)]">.env</code> and fill your keys
            </li>
            <li>
              Run{" "}
              <code className="font-mono text-[var(--fog)]">
                npm install && npx prisma db push && npm run dev
              </code>
            </li>
          </ol>
        </section>
      </main>
      <Footer />
    </>
  );
}
