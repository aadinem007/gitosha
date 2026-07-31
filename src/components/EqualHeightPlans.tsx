"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

/**
 * Equalize heights per visual row so footers share one baseline.
 * Re-measures on resize, fonts, and child size changes.
 */
export function EqualHeightPlans({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;

    const shells = () =>
      Array.from(root.querySelectorAll<HTMLElement>(":scope > .plan-shell"));

    const sync = () => {
      const items = shells();
      if (!items.length) return;

      items.forEach((el) => {
        el.style.minHeight = "";
        el.style.height = "";
      });

      // Group into rows by offsetTop
      const rows: HTMLElement[][] = [];
      for (const el of items) {
        const top = el.offsetTop;
        const row = rows.find((r) => Math.abs(r[0].offsetTop - top) < 4);
        if (row) row.push(el);
        else rows.push([el]);
      }

      for (const row of rows) {
        if (row.length < 2) continue;
        const max = Math.max(...row.map((el) => el.getBoundingClientRect().height));
        row.forEach((el) => {
          el.style.minHeight = `${Math.ceil(max)}px`;
        });
      }
    };

    const ro = new ResizeObserver(() => {
      window.requestAnimationFrame(sync);
    });
    ro.observe(root);
    shells().forEach((el) => ro.observe(el));

    window.addEventListener("resize", sync);
    document.fonts?.ready?.then(() => sync()).catch(() => undefined);
    sync();
    const t1 = window.setTimeout(sync, 50);
    const t2 = window.setTimeout(sync, 300);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
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
