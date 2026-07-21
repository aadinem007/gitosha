"use client";

import { useState } from "react";

export function WaitlistForm({ cta = "Get the free issue" }: { cta?: string }) {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, company }),
      });
      if (!res.ok) throw new Error();
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <p className="text-sm font-medium text-[var(--brass)]">
        You&apos;re on the list. First issue lands this week.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex w-full max-w-md gap-2">
      {/* Honeypot — hidden from humans */}
      <label className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        Company
        <input
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </label>
      <input
        type="email"
        required
        placeholder="you@company.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1 rounded-md border border-[var(--line)] bg-[var(--panel)] px-4 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--muted)] focus:border-[var(--brass)] focus:outline-none"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="whitespace-nowrap rounded-md bg-[var(--brass)] px-4 py-2.5 text-sm font-semibold text-[var(--hull)] hover:brightness-110 disabled:opacity-60"
      >
        {status === "loading" ? "Joining…" : cta}
      </button>
      {status === "error" && (
        <p className="absolute mt-12 text-xs text-red-400">Something went wrong — try again.</p>
      )}
    </form>
  );
}
