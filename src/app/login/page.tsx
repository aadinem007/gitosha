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
        <section className="mx-auto max-w-sm px-6 py-24">
          <h1 className="font-display text-2xl font-bold">Sign in</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            No password — we email you a one-time magic link.
          </p>
          <div className="mt-6">
            <LoginForm next={next ?? "/vault"} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
