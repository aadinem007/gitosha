"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { authCallbackUrl } from "@/lib/site";

export function LoginForm({ next }: { next: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const supabase = createSupabaseBrowserClient();

    // Always use NEXT_PUBLIC_SITE_URL when set (production), not window.location.
    // Supabase will reject / overwrite redirects that aren't in the allow list —
    // Site URL must also be https://gitosha.vercel.app in the Supabase dashboard.
    const emailRedirectTo = authCallbackUrl(next);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo,
      },
    });
    setStatus(error ? "error" : "sent");
  }

  if (status === "sent") {
    return (
      <p className="text-sm text-[var(--signal)]">
        Check your inbox for a magic link to finish signing in.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        type="email"
        required
        placeholder="you@company.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="rounded-md border border-[var(--line)] bg-[var(--panel)] px-4 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--muted)] focus:border-[var(--brass)] focus:outline-none"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="btn-primary px-4 py-2.5 text-sm disabled:opacity-60"
      >
        {status === "loading" ? "Sending…" : "Email me a magic link"}
      </button>
      <p className="min-h-[1.1rem] text-xs leading-snug text-red-600" aria-live="polite">
        {status === "error" ? "Something went wrong — try again." : "\u00a0"}
      </p>
    </form>
  );
}
