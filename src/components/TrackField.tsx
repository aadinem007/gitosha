"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { acquireStageSlot } from "@/lib/track-scene-slot";

const CinematicTrack = dynamic(
  () => import("./CinematicTrack").then((m) => m.CinematicTrack),
  { ssr: false, loading: () => null }
);

/**
 * Dark studio WebGL field — procedural abstract sculpture (no GLB / helmet).
 * Hero stays live; stage/quiet share one concurrent scene and dispose off-screen.
 */
export function TrackField({
  intensity = "full",
}: {
  intensity?: "full" | "quiet" | "stage";
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [webglReady, setWebglReady] = useState(false);
  const [inView, setInView] = useState(false);
  const [hasSlot, setHasSlot] = useState(intensity === "full");

  useEffect(() => {
    const t = window.setTimeout(() => setWebglReady(true), 20);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    let io: IntersectionObserver;
    try {
      io = new IntersectionObserver(
        ([entry]) => {
          setInView(entry.isIntersecting && entry.intersectionRatio > 0.06);
        },
        { threshold: [0, 0.06, 0.2], rootMargin: "8% 0px" }
      );
    } catch {
      setInView(true);
      return;
    }
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (intensity === "full") {
      setHasSlot(true);
      return;
    }
    if (!inView) {
      setHasSlot(false);
      return;
    }
    return acquireStageSlot(setHasSlot);
  }, [intensity, inView]);

  const shouldMount =
    webglReady && (intensity === "full" ? true : hasSlot && inView);

  const interactive = intensity === "full";

  return (
    <div
      ref={rootRef}
      className={`track-field track-field-dark track-field-${intensity}${
        interactive ? " track-field-interactive" : " track-field-passive"
      }${shouldMount ? " track-field-live" : ""}`}
      aria-hidden="true"
    >
      <div className="track-fallback track-fallback-dark" />
      {shouldMount ? <CinematicTrack intensity={intensity} /> : null}
    </div>
  );
}
