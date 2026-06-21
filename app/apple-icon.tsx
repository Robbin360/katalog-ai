import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#09090b",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            alignItems: "center",
            background: "#10b77f",
            borderRadius: 40,
            color: "#09090b",
            display: "flex",
            fontFamily: "Arial, sans-serif",
            fontSize: 96,
            fontWeight: 900,
            height: 132,
            justifyContent: "center",
            width: 132,
          }}
        >
          K
        </div>
      </div>
    ),
    size,
  );
}
