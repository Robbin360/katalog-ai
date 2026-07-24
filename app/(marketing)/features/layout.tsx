import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Features | Katalog AI" },
  description: "Auto-Pilot, Brand Brain, SEO audit, and more. Optimize your Shopify catalog with AI.",
  alternates: { canonical: `${SITE_URL}/features` },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Features | Katalog AI",
    description: "Auto-Pilot, Brand Brain, SEO audit, and more. Optimize your Shopify catalog with AI.",
    url: `${SITE_URL}/features`,
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: "Katalog AI Features" }],
  },
};

export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
