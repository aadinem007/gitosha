"use client";

import { useState } from "react";
import { LicensePortal } from "@/components/LicensePortal";

type Stored = {
  product?: string;
  email?: string;
  licenseKey?: string;
};

function readStoredCheckout(initialEmail: string, initialKey: string) {
  if (initialKey) {
    return { email: initialEmail, key: initialKey, ready: true };
  }
  if (typeof window === "undefined") {
    return { email: initialEmail, key: initialKey, ready: Boolean(initialKey) };
  }
  try {
    const raw = sessionStorage.getItem("gitosha_checkout");
    if (!raw) {
      return { email: initialEmail, key: initialKey, ready: true };
    }
    const data = JSON.parse(raw) as Stored;
    sessionStorage.removeItem("gitosha_checkout");
    return {
      email: data.email ?? initialEmail,
      key: data.licenseKey ?? initialKey,
      ready: true,
    };
  } catch {
    return { email: initialEmail, key: initialKey, ready: true };
  }
}

/**
 * Reads one-time checkout payload from sessionStorage (never from URL query).
 */
export function CheckoutFulfillClient({
  initialEmail = "",
  initialKey = "",
  product,
}: {
  initialEmail?: string;
  initialKey?: string;
  product?: string;
}) {
  const [{ email, key, ready }] = useState(() =>
    readStoredCheckout(initialEmail, initialKey)
  );

  if (!ready) {
    return <p className="text-center text-sm text-[var(--muted)]">Preparing your download…</p>;
  }

  return (
    <>
      {key ? (
        <div className="mt-6 rounded-lg border border-[var(--brass)]/40 bg-[var(--panel)] px-4 py-5 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brass-dim)]">
            License key — save this
          </p>
          <p className="mt-2 font-mono text-xl font-semibold tracking-wide">{key}</p>
          {email ? <p className="mt-2 text-xs text-[var(--muted)]">Issued to {email}</p> : null}
        </div>
      ) : null}

      <div className="mt-8">
        <LicensePortal initialEmail={email} initialKey={key} />
      </div>

      {product === "bundle" ? (
        <p className="mt-6 text-center text-sm text-[var(--signal)]">
          Bundle bonus: Vault is unlocked too —{" "}
          <a href="/login" className="underline">
            sign in
          </a>
          .
        </p>
      ) : null}
    </>
  );
}
