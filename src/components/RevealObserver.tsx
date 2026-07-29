"use client";

import { useEffect } from "react";

/**
 * One-shot scroll reveal for `[data-reveal]` sections.
 * Respects prefers-reduced-motion. Never leaves content hidden if IO fails.
 */
export function RevealObserver() {
  useEffect(() => {
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
        // Earlier trigger + lower bar so tall sections clearly animate on scroll
        { threshold: 0.08, rootMargin: "0px 0px -4% 0px" }
      );
    } catch {
      revealAll();
      return;
    }

    nodes.forEach((el) => {
      // Already on-screen at hydrate (e.g. hero support) — reveal immediately
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      if (rect.top < vh * 0.92 && rect.bottom > 0) {
        el.classList.add("is-inview");
        return;
      }
      io?.observe(el);
    });

    // Safety net: never leave copy invisible if IO never fires
    const failSafe = window.setTimeout(() => {
      nodes.forEach((el) => {
        if (!el.classList.contains("is-inview")) el.classList.add("is-inview");
      });
    }, 3500);

    return () => {
      window.clearTimeout(failSafe);
      io?.disconnect();
    };
  }, []);

  return null;
}
