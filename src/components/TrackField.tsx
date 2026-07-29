"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const CinematicTrack = dynamic(
  () => import("./CinematicTrack").then((m) => m.CinematicTrack),
  { ssr: false, loading: () => null }
);

function StaticStudioFallback() {
  return (
    <>
      <div className="studio-void" />
      <div className="studio-glow studio-glow-side" />
      <div className="track-grain" />
    </>
  );
}

/**
 * Full-bleed studio 3D — real GLB prop, Lando-style right weight.
 */
export function TrackField({
  intensity = "full",
}: {
  intensity?: "full" | "quiet";
}) {
  const [webglReady, setWebglReady] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setWebglReady(true), 40);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div
      className={`track-field track-field-studio${intensity === "quiet" ? " track-field-quiet" : ""}${
        webglReady ? " track-field-live" : ""
      }`}
      aria-hidden="true"
    >
      <div className="track-fallback">
        <StaticStudioFallback />
      </div>
      <CinematicTrack intensity={intensity} />
      <div className="track-fog track-fog-soft" />
      <div className="track-vignette" />
    </div>
  );
}
