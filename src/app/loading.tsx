import { BRAND } from "@/lib/brand";

export default function Loading() {
  return (
    <div
      className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <p className="font-display text-3xl tracking-[0.18em] text-[var(--ink)] sm:text-4xl">
        {BRAND.nameUpper}
      </p>
      <div
        className="h-1 w-24 origin-left bg-[var(--brass)]"
        style={{ animation: "rise 0.9s cubic-bezier(0.22, 1, 0.36, 1) both" }}
      />
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
        Loading
      </p>
    </div>
  );
}
