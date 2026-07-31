"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Forces every direct `.plan-shell` child to the tallest card's height.
 * CSS grid/subgrid kept failing across breakpoints — measure is unambiguous.
 */
export function EqualHeightPlans({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const shells = () =>
      Array.from(root.querySelectorAll<HTMLElement>(":scope > .plan-shell"));

    const sync = () => {
      const items = shells();
      if (!items.length) return;
      items.forEach((el) => {
        el.style.minHeight = "";
      });
      // Only equalize when 2+ cards share a row (side-by-side)
      const top = items[0].offsetTop;
      const row = items.filter((el) => Math.abs(el.offsetTop - top) < 2);
      if (row.length < 2) return;
      const max = Math.max(...row.map((el) => el.offsetHeight));
      row.forEach((el) => {
        el.style.minHeight = `${max}px`;
      });
    };

    const ro = new ResizeObserver(() => {
      window.requestAnimationFrame(sync);
    });
    ro.observe(root);
    shells().forEach((el) => ro.observe(el));
    window.addEventListener("resize", sync);
    sync();
    // Fonts / late layout
    const t = window.setTimeout(sync, 120);

    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", sync);
      ro.disconnect();
    };
  }, [children]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
