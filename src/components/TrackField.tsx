"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const CinematicTrack = dynamic(
  () => import("./CinematicTrack").then((m) => m.CinematicTrack),
  { ssr: false, loading: () => null }
);

/**
 * Dark studio WebGL field — procedural abstract sculpture (no GLB / helmet).
 */
export function TrackField({
  intensity = "full",
}: {
  intensity?: "full" | "quiet" | "stage";
}) {
  const [webglReady, setWebglReady] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setWebglReady(true), 20);
    return () => window.clearTimeout(t);
  }, []);

  const interactive = intensity === "full";

  return (
    <div
      className={`track-field track-field-dark track-field-${intensity}${
        interactive ? " track-field-interactive" : " track-field-passive"
      }${webglReady ? " track-field-live" : ""}`}
      aria-hidden="true"
    >
      <div className="track-fallback track-fallback-dark" />
      <CinematicTrack intensity={intensity} />
    </div>
  );
}
