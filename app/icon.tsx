import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
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
            borderRadius: 6,
            color: "#09090b",
            display: "flex",
            fontFamily: "Arial, sans-serif",
            fontSize: 20,
            fontWeight: 900,
            height: 24,
            justifyContent: "center",
            width: 24,
          }}
        >
          K
        </div>
      </div>
    ),
    size,
  );
}
