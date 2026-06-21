import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Katalog AI dashboard preview for Shopify catalog optimization";
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
          alignItems: "center",
          background: "#09090b",
          color: "white",
          display: "flex",
          fontFamily: "Arial, sans-serif",
          height: "100%",
          justifyContent: "center",
          padding: 72,
          width: "100%",
        }}
      >
        <div
          style={{
            border: "1px solid rgba(16, 183, 127, 0.35)",
            borderRadius: 28,
            display: "flex",
            flexDirection: "column",
            height: "100%",
            justifyContent: "space-between",
            padding: 52,
            width: "100%",
            background:
              "linear-gradient(135deg, rgba(16, 183, 127, 0.22), rgba(18, 18, 20, 0.92) 42%, rgba(12, 12, 14, 1))",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                alignItems: "center",
                background: "#10b77f",
                borderRadius: 16,
                color: "#09090b",
                display: "flex",
                fontSize: 34,
                fontWeight: 900,
                height: 68,
                justifyContent: "center",
                width: 68,
              }}
            >
              K
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ color: "#ffffff", fontSize: 34, fontWeight: 800 }}>
                Katalog AI
              </span>
              <span style={{ color: "#86efac", fontSize: 22 }}>
                Shopify catalog optimization agent
              </span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <h1
              style={{
                fontSize: 78,
                fontWeight: 900,
                letterSpacing: 0,
                lineHeight: 1.02,
                margin: 0,
                maxWidth: 850,
              }}
            >
              Turn product content gaps into revenue opportunities.
            </h1>
            <p
              style={{
                color: "#cbd5e1",
                fontSize: 30,
                lineHeight: 1.35,
                margin: 0,
                maxWidth: 840,
              }}
            >
              Audit Shopify products, rewrite SEO metadata, and sync better
              listings with AI.
            </p>
          </div>

          <div style={{ display: "flex", gap: 18 }}>
            {["Catalog audit", "SEO metadata", "Shopify sync"].map((item) => (
              <div
                key={item}
                style={{
                  background: "rgba(9, 9, 11, 0.72)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 999,
                  color: "#e2e8f0",
                  fontSize: 22,
                  fontWeight: 700,
                  padding: "14px 22px",
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
