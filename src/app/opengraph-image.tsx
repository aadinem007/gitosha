import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand";

export const alt = `${BRAND.name} — ${BRAND.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          backgroundColor: "#0c0c0c",
          padding: 72,
        }}
      >
        <div
          style={{
            width: 128,
            height: 10,
            backgroundColor: "#c8ff00",
            marginBottom: 32,
          }}
        />
        <div
          style={{
            fontSize: 96,
            color: "#f3f3ee",
            fontWeight: 700,
            letterSpacing: -2,
            lineHeight: 0.95,
          }}
        >
          GITOSHA
        </div>
        <div style={{ fontSize: 34, color: "#c8ff00", marginTop: 20 }}>
          {BRAND.tagline}
        </div>
      </div>
    ),
    { ...size }
  );
}
