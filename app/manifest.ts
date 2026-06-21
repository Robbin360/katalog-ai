import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Katalog AI",
    short_name: "Katalog AI",
    description:
      "AI-powered Shopify catalog auditing, SEO metadata generation, and product content optimization.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#10b77f",
    categories: ["business", "productivity", "shopping"],
    icons: [
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/opengraph-image",
        sizes: "1200x630",
        type: "image/png",
      },
    ],
  };
}
