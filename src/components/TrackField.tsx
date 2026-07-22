"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const CinematicTrack = dynamic(
  () => import("./CinematicTrack").then((m) => m.CinematicTrack),
  { ssr: false, loading: () => null }
);

function StaticTrackFallback() {
  return (
    <>
      <div className="track-vanish" />
      <div className="track-sweep" />
      <svg className="track-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M48 0 L18 100" />
        <path d="M50 0 L50 100" />
        <path d="M52 0 L82 100" />
        <path d="M45 0 L5 100" />
        <path d="M55 0 L95 100" />
      </svg>
    </>
  );
}

/**
 * Abstract vanishing-track atmosphere.
 * WebGL when motion is allowed; CSS/SVG fallback for reduced-motion / no-JS.
 */
export function TrackField({ intensity = "full" }: { intensity?: "full" | "quiet" }) {
  const [allowWebGL, setAllowWebGL] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setAllowWebGL(!mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <div
      className={`track-field${intensity === "quiet" ? " track-field-quiet" : ""}`}
      aria-hidden="true"
    >
      <StaticTrackFallback />
      {allowWebGL ? <CinematicTrack /> : null}
      <div className="track-fog" />
      <div className="track-vignette" />
    </div>
  );
}
