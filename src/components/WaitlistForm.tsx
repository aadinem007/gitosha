"use client";

import { useId, useState } from "react";

export function WaitlistForm({
  cta = "Get the free issue",
  layout = "row",
}: {
  cta?: string;
  /** row = homepage; stack = pricing cards / narrow columns */
  layout?: "row" | "stack";
}) {
  const emailId = useId();
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
      <p
        className="relative min-h-[2.75rem] text-sm font-medium leading-snug text-[var(--brass-dim)]"
        role="status"
      >
        You&apos;re on the list. First issue lands this week.
      </p>
    );
  }

  const stacked = layout === "stack";

  return (
    <form
      onSubmit={handleSubmit}
      className={stacked ? "form-stack form-stack-tight" : "form-row"}
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
      <label htmlFor={emailId} className={stacked ? "form-label" : "sr-only"}>
        Email
      </label>
      <input
        id={emailId}
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
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className={stacked ? "btn-primary form-submit w-full" : "btn-primary form-submit"}
      >
        {status === "loading" ? "Joining…" : cta}
      </button>
      <p className="form-error" aria-live="polite">
        {status === "error" ? "Something went wrong — try again." : "\u00a0"}
      </p>
    </form>
  );
}
