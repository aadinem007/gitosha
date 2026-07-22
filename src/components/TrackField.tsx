"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const CinematicTrack = dynamic(
  () => import("./CinematicTrack").then((m) => m.CinematicTrack),
  { ssr: false, loading: () => null }
);

function StaticTrackFallback({ rich }: { rich?: boolean }) {
  return (
    <>
      <div className="track-vanish" />
      <div className="track-horizon" />
      <div className="track-grain" />
      <div className="track-sweep" />
      <div className="track-sweep track-sweep-2" />
      <div className="track-dashes" />
      {rich ? <div className="track-ribbons" /> : null}
      <svg className="track-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M48 0 L12 100" />
        <path d="M49 0 L30 100" />
        <path d="M50 0 L50 100" />
        <path d="M51 0 L70 100" />
        <path d="M52 0 L88 100" />
        <path d="M45 0 L2 100" />
        <path d="M55 0 L98 100" />
        <path className="track-line-hot" d="M50 8 L50 100" />
      </svg>
    </>
  );
}

/**
 * Full-bleed 3D track atmosphere.
 * WebGL always mounts (including reduced-motion → static rich frame).
 * CSS/SVG underlay only until the canvas is ready — never the hero itself.
 */
export function TrackField({
  intensity = "full",
}: {
  intensity?: "full" | "quiet";
}) {
  const [webglReady, setWebglReady] = useState(false);

  useEffect(() => {
    // Give the dynamic chunk a beat, then fade CSS fallback so WebGL owns the frame
    const t = window.setTimeout(() => setWebglReady(true), 80);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div
      className={`track-field${intensity === "quiet" ? " track-field-quiet" : ""}${
        webglReady ? " track-field-live" : ""
      }`}
      aria-hidden="true"
    >
      <div className="track-fallback">
        <StaticTrackFallback rich={intensity === "full"} />
      </div>
      <CinematicTrack intensity={intensity} />
      <div className="track-fog" />
      <div className="track-vignette" />
    </div>
  );
}
