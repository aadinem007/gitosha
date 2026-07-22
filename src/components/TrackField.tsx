/**
 * Abstract vanishing-track atmosphere — CSS/SVG only.
 * No McLaren / Lando assets.
 */
export function TrackField() {
  return (
    <div className="track-field" aria-hidden="true">
      <div className="track-vanish" />
      <div className="track-sweep" />
      <svg className="track-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M48 0 L18 100" />
        <path d="M50 0 L50 100" />
        <path d="M52 0 L82 100" />
        <path d="M45 0 L5 100" />
        <path d="M55 0 L95 100" />
      </svg>
    </div>
  );
}
