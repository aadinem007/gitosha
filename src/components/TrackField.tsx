"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const CinematicTrack = dynamic(
  () => import("./CinematicTrack").then((m) => m.CinematicTrack),
  { ssr: false, loading: () => null }
);

function StaticStudioFallback({ rich }: { rich?: boolean }) {
  return (
    <>
      <div className="studio-void" />
      <div className="studio-glow" />
      <div className="studio-topo" />
      {rich ? <div className="studio-ring" /> : null}
      <div className="track-grain" />
    </>
  );
}

/**
 * Full-bleed studio 3D atmosphere (Lando-style layered relic).
 * CSS underlay until WebGL owns the frame.
 */
export function TrackField({
  intensity = "full",
}: {
  intensity?: "full" | "quiet";
}) {
  const [webglReady, setWebglReady] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setWebglReady(true), 60);
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
        <StaticStudioFallback rich={intensity === "full"} />
      </div>
      <CinematicTrack intensity={intensity} />
      <div className="track-fog track-fog-soft" />
      <div className="track-vignette" />
    </div>
  );
}
