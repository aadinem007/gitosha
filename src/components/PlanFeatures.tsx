const DEFAULT_PREVIEW = 5;

/**
 * Expandable plan feature list — native details/summary (no client boundary).
 */
export function PlanFeatures({
  features,
  previewCount = DEFAULT_PREVIEW,
}: {
  features: string[];
  previewCount?: number;
}) {
  const preview = features.slice(0, previewCount);
  const rest = features.slice(previewCount);

  return (
    <div className="mt-4">
      <ul className="space-y-2.5 text-[1.05rem] leading-snug text-[var(--support)]">
        {preview.map((f) => (
          <li key={f} className="leading-snug">
            — {f}
          </li>
        ))}
      </ul>
      {rest.length > 0 && (
        <details className="plan-features-more group mt-2.5">
          <summary className="inline-flex cursor-pointer list-none items-center gap-1 font-semibold text-[var(--ink)] underline decoration-[var(--brass)] decoration-2 underline-offset-4 transition-colors hover:text-[var(--fog)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)] [&::-webkit-details-marker]:hidden">
            <span className="inline group-open:hidden">
              +{rest.length} more included{" "}
              <span aria-hidden="true" className="text-[0.85em]">
                ▾
              </span>
            </span>
            <span className="hidden group-open:inline">
              Show less{" "}
              <span aria-hidden="true" className="text-[0.85em]">
                ▴
              </span>
            </span>
          </summary>
          <ul className="mt-2.5 space-y-2.5 text-[1.05rem] leading-snug text-[var(--support)]">
            {rest.map((f) => (
              <li key={f} className="leading-snug">
                — {f}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
