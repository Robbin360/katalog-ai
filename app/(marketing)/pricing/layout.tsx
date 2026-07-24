import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Pricing | Katalog AI" },
  description: "Audit, optimize, and sync your Shopify catalog with AI. Plans from $0 to $149/mo.",
  alternates: { canonical: `${SITE_URL}/pricing` },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Pricing | Katalog AI",
    description: "Audit, optimize, and sync your Shopify catalog with AI. Plans from $0 to $149/mo.",
    url: `${SITE_URL}/pricing`,
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: "Katalog AI Pricing" }],
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
