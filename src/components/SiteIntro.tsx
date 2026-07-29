"use client";

import { useEffect, useState } from "react";
import { BRAND } from "@/lib/brand";

type IntroPhase = "boot" | "hold" | "exit" | "done";

/**
 * Brief forge flash — papaya field, then reveal the site.
 * Skips after first visit in-session; respects reduced motion.
 */
export function SiteIntro() {
  const [phase, setPhase] = useState<IntroPhase>("boot");

  useEffect(() => {
    let cancelled = false;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || sessionStorage.getItem("gitosha-intro") === "1") {
      const skip = window.setTimeout(() => {
        if (!cancelled) setPhase("done");
      }, 0);
      return () => {
        cancelled = true;
        window.clearTimeout(skip);
      };
    }

    const t1 = window.setTimeout(() => {
      if (!cancelled) setPhase("hold");
    }, 40);
    const t2 = window.setTimeout(() => {
      if (!cancelled) setPhase("exit");
    }, 1100);
    const t3 = window.setTimeout(() => {
      if (cancelled) return;
      sessionStorage.setItem("gitosha-intro", "1");
      setPhase("done");
    }, 1750);

    return () => {
      cancelled = true;
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
