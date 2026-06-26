import { ImageResponse } from "next/og";

export const alt = "SteerClub — Earn the Road.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#111111",
          padding: "72px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 40,
            fontWeight: 900,
            letterSpacing: "-0.02em",
            color: "#ffffff",
          }}
        >
          STEER<span style={{ color: "#D7FF2F" }}>CLUB</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: "0.25em",
              color: "#D7FF2F",
              textTransform: "uppercase",
              marginBottom: 24,
            }}
          >
            India&apos;s Driving Confidence Platform
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              fontSize: 92,
              fontWeight: 900,
              lineHeight: 1.02,
              letterSpacing: "-0.03em",
              color: "#ffffff",
              textTransform: "uppercase",
            }}
          >
            Drive&nbsp;<span style={{ color: "#D7FF2F" }}>Skills.</span>&nbsp;Own the Road.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 28,
            color: "#707070",
          }}
        >
          <span>Take your Steer Score — ₹299</span>
          <span style={{ color: "#ffffff", fontWeight: 800 }}>steerclub.in</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
