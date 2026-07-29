"use client";

import { useEffect } from "react";

/**
 * One-shot scroll reveal for `[data-reveal]` sections.
 * Respects prefers-reduced-motion (marks in-view immediately).
 */
export function RevealObserver() {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!nodes.length) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      nodes.forEach((el) => el.classList.add("is-inview"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-inview");
          io.unobserve(entry.target);
        }
      },
      // Earlier trigger + lower bar so tall sections clearly animate on scroll
      { threshold: 0.08, rootMargin: "0px 0px -4% 0px" }
    );

    nodes.forEach((el) => {
      // Already on-screen at hydrate (e.g. hero support) — reveal immediately
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      if (rect.top < vh * 0.92 && rect.bottom > 0) {
        el.classList.add("is-inview");
        return;
      }
      io.observe(el);
    });

    return () => io.disconnect();
  }, []);

  return null;
}
