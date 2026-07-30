"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Clears HttpOnly session via server route, then returns to /login. */
export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    try {
      await fetch("/api/auth/sign-out", { method: "POST", credentials: "same-origin" });
      router.replace("/login");
      router.refresh();
    } catch {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={busy}
      className={
        className ??
        "text-sm font-semibold text-[var(--muted)] underline-offset-4 hover:underline disabled:opacity-60"
      }
    >
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
