import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { LoginForm } from "@/components/LoginForm";
import { safeRedirectPath } from "@/lib/secure";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <>
      <Nav />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <section className="login-stage">
          <Link href="/" className="login-back">
            ← Home
          </Link>
          <p className="animate-rise text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brass-dim)]">
            Access
          </p>
          <h1 className="animate-rise-delay mt-3 font-display text-5xl font-bold tracking-tight text-[var(--ink)]">
            Sign in
          </h1>
          <div className="rule mt-5 max-w-[7rem]" />
          <p className="animate-rise-delay-2 mt-5 text-base leading-relaxed text-[var(--support)]">
            No password — we email you a one-time magic link.
          </p>
          <div className="login-panel mt-8">
            <LoginForm next={safeRedirectPath(next, "/vault")} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
