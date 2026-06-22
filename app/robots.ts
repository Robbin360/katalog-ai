import type { MetadataRoute } from "next";

const siteUrl = "https://katalog-ai-navy.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/integrations", "/features", "/pricing", "/faq", "/about", "/contact"],
        disallow: ["/api/", "/auth/callback", "/dashboard", "/account", "/inventory"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
