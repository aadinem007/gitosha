"use client";

import { useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const supabase = createSupabaseBrowserClient();
      const origin = window.location.origin;
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${origin}/api/auth/callback?next=/dashboard` },
      });
      setStatus(error ? "error" : "sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <p className="text-sm font-medium text-[var(--accent)]" role="status">
        Check your inbox for a magic link to finish signing in.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-3">
      <label htmlFor="login-email" className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
        Work email
      </label>
      <input
        id="login-email"
        type="email"
        name="email"
        required
        autoComplete="email"
        inputMode="email"
        enterKeyHint="send"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@company.com"
        className="rounded-md border border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-sm"
      />
      <p className="text-xs leading-snug text-[var(--muted)]">
        By continuing you agree to our{" "}
        <Link href="/terms" className="underline">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline">
          Privacy Policy
        </Link>
        .
      </p>
      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-md bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[#04120c] disabled:opacity-60"
      >
        {status === "loading" ? "Sending…" : "Email me a magic link"}
      </button>
      <p className="min-h-[1.2rem] text-xs font-semibold text-red-400" aria-live="polite">
        {status === "error" ? "Something went wrong — try again." : "\u00a0"}
      </p>
    </form>
  );
}
