"use client";

import { useEffect } from "react";
import Link from "next/link";
import { BRAND } from "@/lib/brand";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <p className="kicker">Error</p>
      <h1 className="mt-4 font-display text-4xl tracking-wide text-[var(--ink)] sm:text-5xl">
        Something glitched
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--support)]">
        {BRAND.name} hit an unexpected error. Try again, or head home and keep shipping.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button type="button" className="btn-primary" onClick={() => unstable_retry()}>
          Try again
        </button>
        <Link href="/" className="btn-ghost">
          Home
        </Link>
      </div>
    </div>
  );
}
