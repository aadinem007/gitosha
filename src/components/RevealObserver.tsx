"use client";

import { useEffect } from "react";

/**
 * One-shot scroll reveal for `[data-reveal]` sections.
 * Fail-open: content stays visible until JS opts into hide-until-reveal.
 * Respects prefers-reduced-motion. Never leaves content hidden if IO fails.
 */
export function RevealObserver() {
  useEffect(() => {
    const root = document.documentElement;
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!nodes.length) return;

    const revealAll = () => {
      nodes.forEach((el) => el.classList.add("is-inview"));
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      revealAll();
      return;
    }

    // Opt into hide-until-reveal only after we are ready to observe
    root.setAttribute("data-reveal-js", "");

    let io: IntersectionObserver | null = null;
    try {
      io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            entry.target.classList.add("is-inview");
            io?.unobserve(entry.target);
          }
        },
        { threshold: 0.08, rootMargin: "0px 0px -4% 0px" }
      );
    } catch {
      root.removeAttribute("data-reveal-js");
      revealAll();
      return;
    }

    nodes.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      if (rect.top < vh * 0.92 && rect.bottom > 0) {
        el.classList.add("is-inview");
        return;
      }
      io?.observe(el);
    });

    // Faster failsafe — never leave copy invisible
    const failSafe = window.setTimeout(() => {
      nodes.forEach((el) => {
        if (!el.classList.contains("is-inview")) el.classList.add("is-inview");
      });
    }, 1200);

    return () => {
      window.clearTimeout(failSafe);
      io?.disconnect();
      root.removeAttribute("data-reveal-js");
    };
  }, []);

  return null;
}
