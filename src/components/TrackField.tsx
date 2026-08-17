import { StudioMark } from "@/components/StudioMark";

/**
 * Dark studio field — static chrome/lime mark (no WebGL).
 * Hero uses the orbit instrument; chapters pick vault or foundry motifs.
 */
export function TrackField({
  intensity = "full",
  motif = "orbit",
}: {
  intensity?: "full" | "quiet" | "stage";
  motif?: "orbit" | "vault" | "foundry";
}) {
  return (
    <div
      className={`track-field track-field-dark track-field-${intensity} track-field-passive`}
      aria-hidden="true"
    >
      <StudioMark motif={motif} intensity={intensity} />
    </div>
  );
}
