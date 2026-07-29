"use client";

import { useEffect, useState } from "react";
import { BRAND } from "@/lib/brand";

/**
 * Lando-style flash intro — papaya field, then reveal the 3D world.
 * Skips after first visit in-session; respects reduced motion.
 */
export function SiteIntro() {
  const [phase, setPhase] = useState<"boot" | "hold" | "exit" | "done">("boot");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || sessionStorage.getItem("gitosha-intro") === "1") {
      setPhase("done");
      return;
    }

    const t1 = window.setTimeout(() => setPhase("hold"), 40);
    const t2 = window.setTimeout(() => setPhase("exit"), 1100);
    const t3 = window.setTimeout(() => {
      sessionStorage.setItem("gitosha-intro", "1");
      setPhase("done");
    }, 1750);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      className={`site-intro site-intro-${phase}`}
      aria-hidden="true"
      role="presentation"
    >
      <p className="site-intro-mark">LOAD {BRAND.nameUpper}</p>
    </div>
  );
}
