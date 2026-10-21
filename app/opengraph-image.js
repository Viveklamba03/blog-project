import { ImageResponse } from "next/og";

export const alt = "SportsBud — Sports News & Analysis";
export const size = {
  width: 1200,
  height: 630,
};
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
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #1d4ed8 0%, #172554 100%)",
          color: "white",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ fontSize: 28, fontWeight: 700, color: "#bfdbfe" }}>
          SPORTS NEWS & ANALYSIS
        </div>
        <div style={{ marginTop: 24, fontSize: 88, fontWeight: 800 }}>
          SportsBud
        </div>
        <div style={{ marginTop: 20, fontSize: 34, color: "#dbeafe" }}>
          Stories. Analysis. Cricket.
        </div>
      </div>
    ),
    size
  );
}
