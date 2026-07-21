import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <>
      <Nav />
      <main className="flex-1">
        <section className="mx-auto flex max-w-sm flex-col justify-center px-6 py-20 sm:min-h-[70vh] sm:py-24">
          <p className="animate-rise text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brass)]">
            Access
          </p>
          <h1 className="animate-rise-delay mt-3 font-display text-3xl font-bold tracking-tight">
            Sign in
          </h1>
          <div className="animate-pulse-line rule mt-5 max-w-[7rem]" />
          <p className="animate-rise-delay-2 mt-5 text-sm leading-relaxed text-[var(--muted)]">
            No password — we email you a one-time magic link.
          </p>
          <div className="mt-8 rounded-xl border border-[var(--line)] bg-[var(--panel)]/50 p-5">
            <LoginForm next={next ?? "/vault"} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
