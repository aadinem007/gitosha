import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export function AdminShell({
  title,
  description,
  wide = false,
  children,
}: {
  title: string;
  description: React.ReactNode;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <>
      <Nav />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <div
          className={
            wide
              ? "mx-auto max-w-5xl px-4 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-32"
              : "mx-auto max-w-3xl px-6 pb-16 pt-28 sm:pb-20 sm:pt-32"
          }
        >
          <p className="kicker">Admin</p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight">{title}</h1>
          <p className="mt-3 text-sm text-[var(--muted)]">{description}</p>
          <div className="rule mt-8 max-w-[6rem]" />
          <div className="mt-10">{children}</div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export function AdminDenied({
  status,
  loginNext,
}: {
  status: number;
  loginNext: string;
}) {
  return (
    <div className="surface p-6 text-sm">
      <p className="font-semibold text-[var(--ink)]">
        {status === 401 ? "Sign in required" : "Forbidden"}
      </p>
      <p className="mt-2 text-[var(--muted)]">
        Access is deny-by-default. Your session email must be listed in{" "}
        <code>LEGAL_ADMIN_EMAILS</code> or <code>ADMIN_EMAILS</code>.
      </p>
      <p className="mt-4">
        <Link href={`/login?next=${encodeURIComponent(loginNext)}`} className="underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
