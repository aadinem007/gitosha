"use client";

import { useState } from "react";

export function WaitlistForm({
  cta = "Get the free issue",
  layout = "row",
}: {
  cta?: string;
  /** row = homepage; stack = pricing cards / narrow columns */
  layout?: "row" | "stack";
}) {
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

  const stacked = layout === "stack";

  return (
    <form
      onSubmit={handleSubmit}
      className={
        stacked
          ? "flex w-full flex-col gap-2"
          : "flex w-full max-w-md flex-col gap-2 sm:flex-row sm:items-stretch"
      }
    >
      <label className="sr-only absolute -left-[9999px]" aria-hidden="true">
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
        className="min-w-0 flex-1 rounded-md border border-[var(--line)] bg-[var(--panel)] px-4 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--muted)] focus:border-[var(--brass)] focus:outline-none"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className={
          stacked
            ? "btn-primary w-full px-4 py-2.5 text-sm disabled:opacity-60"
            : "btn-primary whitespace-nowrap px-4 py-2.5 text-sm disabled:opacity-60"
        }
      >
        {status === "loading" ? "Joining…" : cta}
      </button>
      {status === "error" && (
        <p className="text-xs text-red-400 sm:col-span-2">Something went wrong — try again.</p>
      )}
    </form>
  );
}
