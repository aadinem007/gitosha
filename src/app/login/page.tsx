import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { TrackField } from "@/components/TrackField";
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
      <main className="flex-1 relative overflow-hidden">
        <TrackField intensity="quiet" />
        <section className="login-stage">
          <Link href="/" className="login-back">
            ← Home
          </Link>
          <p className="animate-rise text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brass)]">
            Access
          </p>
          <h1 className="animate-rise-delay mt-3 font-display text-3xl font-bold tracking-tight">
            Sign in
          </h1>
          <div className="rule mt-5 max-w-[7rem]" />
          <p className="animate-rise-delay-2 mt-5 text-sm leading-relaxed text-[var(--muted)]">
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
