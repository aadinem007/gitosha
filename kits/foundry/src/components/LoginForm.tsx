"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const supabase = createSupabaseBrowserClient();
    const origin = window.location.origin;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${origin}/api/auth/callback?next=/dashboard` },
    });
    setStatus(error ? "error" : "sent");
  }

  if (status === "sent") {
    return <p className="text-sm text-[var(--accent)]">Check your email for the magic link.</p>;
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-3">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@company.com"
        className="rounded-md border border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-md bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[#04120c] disabled:opacity-60"
      >
        {status === "loading" ? "Sending…" : "Email me a login link"}
      </button>
      {status === "error" && <p className="text-xs text-red-400">Could not send link. Try again.</p>}
    </form>
  );
}
