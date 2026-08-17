import { useId } from "react";

type Motif = "orbit" | "vault" | "foundry";

export function StudioMark({
  motif = "orbit",
  intensity = "full",
}: {
  motif?: Motif;
  intensity?: "full" | "quiet" | "stage";
}) {
  const uid = useId().replace(/:/g, "");
  const Art = motif === "vault" ? VaultArt : motif === "foundry" ? FoundryArt : OrbitArt;

  return (
    <div
      className={`studio-mark studio-mark-${motif} studio-mark-${intensity}`}
      aria-hidden="true"
    >
      <Art id={uid} />
    </div>
  );
}

function Defs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-chrome`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#2c3036" />
        <stop offset="28%" stopColor="#8b99a6" />
        <stop offset="46%" stopColor="#f2f6f8" />
        <stop offset="62%" stopColor="#6d7884" />
        <stop offset="100%" stopColor="#16181c" />
      </linearGradient>
      <linearGradient id={`${id}-chrome-v`} x1="0.15" y1="0" x2="0.85" y2="1">
        <stop offset="0%" stopColor="#1a1c1e" />
        <stop offset="22%" stopColor="#6a7580" />
        <stop offset="48%" stopColor="#dce6ec" />
        <stop offset="70%" stopColor="#4a545c" />
        <stop offset="100%" stopColor="#0e1012" />
      </linearGradient>
      <radialGradient id={`${id}-ball`} cx="32%" cy="28%" r="72%">
        <stop offset="0%" stopColor="#f4f7f8" />
        <stop offset="38%" stopColor="#9aa8b2" />
        <stop offset="100%" stopColor="#1c1f22" />
      </radialGradient>
      <radialGradient id={`${id}-matte`} cx="40%" cy="32%" r="70%">
        <stop offset="0%" stopColor="#3a3c38" />
        <stop offset="100%" stopColor="#121410" />
      </radialGradient>
      <linearGradient id={`${id}-lime`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#c8ff00" stopOpacity="0.15" />
        <stop offset="50%" stopColor="#c8ff00" />
        <stop offset="100%" stopColor="#c8ff00" stopOpacity="0.2" />
      </linearGradient>
      <pattern id={`${id}-grid`} width="32" height="32" patternUnits="userSpaceOnUse">
        <path d="M32 0H0V32" fill="none" stroke="rgba(243,243,238,0.06)" strokeWidth="1" />
      </pattern>
    </defs>
  );
}

function OrbitArt({ id }: { id: string }) {
  return (
    <svg viewBox="0 0 960 720" fill="none" role="presentation">
      <Defs id={id} />
      <rect width="960" height="720" fill={`url(#${id}-grid)`} />
      <ellipse cx="620" cy="340" rx="280" ry="210" fill="rgba(200,255,0,0.05)" />
      <ellipse
        cx="560"
        cy="350"
        rx="340"
        ry="118"
        stroke="#c8ff00"
        strokeWidth="1.75"
        opacity="0.92"
        transform="rotate(-16 560 350)"
      />
      <ellipse
        cx="560"
        cy="350"
        rx="250"
        ry="86"
        stroke="#c8ff00"
        strokeWidth="1.15"
        opacity="0.55"
        transform="rotate(22 560 350)"
      />
      <ellipse
        cx="560"
        cy="350"
        rx="168"
        ry="58"
        stroke="rgba(187,204,215,0.45)"
        strokeWidth="1"
        transform="rotate(-4 560 350)"
      />
      <polygon
        points="520,96 628,132 628,548 520,584 412,548 412,132"
        fill={`url(#${id}-chrome-v)`}
        stroke="rgba(243,243,238,0.18)"
        strokeWidth="1"
      />
      <polygon points="520,96 628,132 520,168 412,132" fill="rgba(242,246,248,0.35)" />
      <line x1="520" y1="96" x2="520" y2="584" stroke="rgba(200,255,0,0.55)" strokeWidth="1.5" />
      <circle cx="738" cy="214" r="46" fill={`url(#${id}-ball)`} />
      <circle cx="738" cy="214" r="46" stroke="rgba(243,243,238,0.2)" />
      <circle cx="392" cy="468" r="72" fill={`url(#${id}-matte)`} />
      <circle cx="392" cy="468" r="72" stroke="rgba(200,255,0,0.18)" />
      <path
        d="M214 268L262 242L310 268L310 322L262 348L214 322Z"
        fill={`url(#${id}-chrome)`}
        stroke="rgba(243,243,238,0.16)"
      />
      <rect
        x="786"
        y="428"
        width="54"
        height="54"
        fill="#1a1c18"
        stroke="rgba(200,255,0,0.55)"
        transform="rotate(18 813 455)"
      />
      <g stroke="rgba(243,243,238,0.28)" strokeWidth="1">
        <path d="M120 92H188" />
        <path d="M120 92V148" />
        <path d="M840 628H772" />
        <path d="M840 628V572" />
      </g>
      <text x="132" y="178" fill="#c8ff00" fontSize="11" letterSpacing="2.4" fontFamily="ui-monospace, monospace">
        SHIP / PASS / DEFER
      </text>
      <text x="708" y="636" fill="rgba(243,243,238,0.45)" fontSize="11" letterSpacing="2.2" fontFamily="ui-monospace, monospace">
        10 DIM · 100
      </text>
    </svg>
  );
}

function VaultArt({ id }: { id: string }) {
  const cells = [
    [1, 0, 1, 0, 1],
    [0, 1, 0, 1, 0],
  ];
  return (
    <svg viewBox="0 0 960 720" fill="none" role="presentation">
      <Defs id={id} />
      <rect width="960" height="720" fill={`url(#${id}-grid)`} />
      <rect x="168" y="148" width="624" height="424" fill="rgba(12,12,12,0.35)" stroke="rgba(243,243,238,0.1)" />
      {cells.flatMap((row, r) =>
        row.map((hot, c) => {
          const x = 208 + c * 112;
          const y = 214 + r * 148;
          return (
            <g key={`${r}-${c}`}>
              <rect
                x={x}
                y={y}
                width="92"
                height="112"
                fill={hot ? "rgba(200,255,0,0.92)" : `url(#${id}-chrome)`}
                stroke={hot ? "#c8ff00" : "rgba(243,243,238,0.16)"}
                strokeWidth="1"
              />
              <text
                x={x + 14}
                y={y + 28}
                fill={hot ? "#0a0a0a" : "rgba(243,243,238,0.55)"}
                fontSize="11"
                letterSpacing="1.6"
                fontFamily="ui-monospace, monospace"
              >
                {String(r * 5 + c + 1).padStart(2, "0")}
              </text>
            </g>
          );
        })
      )}
      <circle cx="480" cy="360" r="214" stroke="#c8ff00" strokeWidth="1.25" opacity="0.35" />
      <path d="M480 118V602M168 360H792" stroke="rgba(200,255,0,0.22)" strokeWidth="1" />
      <text x="184" y="178" fill="#c8ff00" fontSize="12" letterSpacing="2.6" fontFamily="ui-monospace, monospace">
        RESEARCH PLANE
      </text>
      <text x="620" y="598" fill="rgba(243,243,238,0.4)" fontSize="11" letterSpacing="2" fontFamily="ui-monospace, monospace">
        SCORE / 100
      </text>
    </svg>
  );
}

function FoundryArt({ id }: { id: string }) {
  const plates = [
    { x: 220, y: 168, w: 520, h: 78 },
    { x: 248, y: 268, w: 520, h: 78 },
    { x: 276, y: 368, w: 520, h: 78 },
    { x: 304, y: 468, w: 520, h: 78 },
  ];
  return (
    <svg viewBox="0 0 960 720" fill="none" role="presentation">
      <Defs id={id} />
      <rect width="960" height="720" fill={`url(#${id}-grid)`} />
      {plates.map((p, i) => (
        <g key={p.y}>
          <rect
            x={p.x}
            y={p.y}
            width={p.w}
            height={p.h}
            fill={i === 1 ? "#c8ff00" : `url(#${id}-chrome)`}
            stroke={i === 1 ? "#c8ff00" : "rgba(243,243,238,0.16)"}
          />
          <rect
            x={p.x + 22}
            y={p.y + 22}
            width="18"
            height="18"
            fill={i === 1 ? "#0a0a0a" : "rgba(12,12,12,0.55)"}
          />
          <text
            x={p.x + 56}
            y={p.y + 48}
            fill={i === 1 ? "#0a0a0a" : "rgba(243,243,238,0.7)"}
            fontSize="14"
            letterSpacing="2.4"
            fontFamily="ui-monospace, monospace"
          >
            {["AUTH", "CHECKOUT", "WEBHOOK", "DEPLOY"][i]}
          </text>
        </g>
      ))}
      <path
        d="M188 206V506"
        stroke="#c8ff00"
        strokeWidth="2"
        strokeDasharray="6 8"
        opacity="0.7"
      />
      <text x="184" y="148" fill="#c8ff00" fontSize="12" letterSpacing="2.6" fontFamily="ui-monospace, monospace">
        DELIVERY PLANE
      </text>
    </svg>
  );
}
