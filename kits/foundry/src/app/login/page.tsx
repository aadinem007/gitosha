import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="mx-auto flex max-w-md flex-1 flex-col justify-center px-6 py-24">
      <h1 className="text-3xl font-bold">Sign in</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">Magic link — no password to remember.</p>
      <div className="mt-8">
        <LoginForm />
      </div>
    </main>
  );
}
