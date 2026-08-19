"use client";

import { useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { authCallbackUrl } from "@/lib/site";

export function LoginForm({ next }: { next: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, next }),
      });
      const data = (await res.json()) as { ok?: boolean; branded?: boolean; fallback?: boolean };

      if (res.ok && data.branded) {
        setStatus("sent");
        return;
      }

      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: authCallbackUrl(next),
        },
      });
      setStatus(error ? "error" : "sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <p className="text-sm font-medium leading-snug text-[var(--ink)]" role="status">
        Check your inbox for a magic link to finish signing in.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="form-stack">
      <label htmlFor="login-email" className="form-label">
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
        placeholder="you@company.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="form-input"
        disabled={status === "loading"}
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
      <button type="submit" disabled={status === "loading"} className="btn-primary form-submit">
        {status === "loading" ? "Sending…" : "Email me a magic link"}
      </button>
      <p className="form-error" aria-live="polite">
        {status === "error" ? "Couldn’t send the link. Check the email and try again." : "\u00a0"}
      </p>
    </form>
  );
}
