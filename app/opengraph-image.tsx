import { ImageResponse } from "next/og";

/** Default social card for every page: black field, wordmark, tagline, burgundy rule. */
export const alt = "CULT.URE — Beyond the noise. Into the culture.";
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
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#000000",
          color: "#FFFFFF",
        }}
      >
        <div style={{ display: "flex", fontSize: 22, letterSpacing: 6, textTransform: "uppercase", color: "rgba(255,255,255,0.6)" }}>
          Digital growth, marketing &amp; creative agency
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 168, fontWeight: 600, letterSpacing: -8, lineHeight: 1 }}>
            CULT<span style={{ color: "#8a4a52" }}>.</span>URE
          </div>
          <div style={{ display: "flex", width: 120, height: 6, background: "#240C0E", marginTop: 40, border: "1px solid rgba(255,255,255,0.25)" }} />
        </div>
        <div style={{ display: "flex", fontSize: 30, letterSpacing: 8, textTransform: "uppercase" }}>
          Beyond the noise. Into the culture.
        </div>
      </div>
    ),
    size,
  );
}
