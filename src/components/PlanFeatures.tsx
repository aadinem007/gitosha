"use client";

import { useState } from "react";

const DEFAULT_PREVIEW = 5;

export function PlanFeatures({
  features,
  previewCount = DEFAULT_PREVIEW,
}: {
  features: string[];
  previewCount?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const preview = features.slice(0, previewCount);
  const rest = features.slice(previewCount);

  return (
    <ul className="mt-4 space-y-2.5 text-[1.05rem] leading-snug text-[var(--support)]">
      {preview.map((f) => (
        <li key={f} className="leading-snug">
          — {f}
        </li>
      ))}
      {expanded &&
        rest.map((f) => (
          <li key={f} className="leading-snug">
            — {f}
          </li>
        ))}
      {rest.length > 0 && (
        <li className="leading-snug">
          <button
            type="button"
            className="plan-features-more inline-flex items-center gap-1 font-semibold text-[var(--ink)] underline decoration-[var(--brass)] decoration-2 underline-offset-4 transition-colors hover:text-[var(--signal)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]"
            aria-expanded={expanded}
            onClick={() => setExpanded((v) => !v)}
          >
            <span>{expanded ? "Show less" : `+${rest.length} more included`}</span>
            <span aria-hidden="true" className="text-[0.85em]">
              {expanded ? "▴" : "▾"}
            </span>
          </button>
        </li>
      )}
    </ul>
  );
}
