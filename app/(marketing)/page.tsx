import type { Metadata, Viewport } from "next";
import { LandingPageClient } from "@/components/landing/LandingPageClient";

const siteUrl = "https://katalog-ai-navy.vercel.app";
const title = "Katalog AI | Your Shopify Catalog, Optimized by AI.";
const description =
  "Katalog AI audits your Shopify catalog, rewrites SEO, recovers revenue, and syncs — while you focus on selling.";


export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  applicationName: "Katalog AI",
  authors: [{ name: "Katalog AI", url: siteUrl }],
  creator: "Katalog AI",
  publisher: "Katalog AI",
  alternates: {
    canonical: "/",
    languages: {
      en: "/",
      "x-default": "/",
    },
  },
  manifest: "/manifest.webmanifest",
  icons: {
    apple: [
      {
        url: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  keywords: [
    "Shopify AI",
    "Shopify SEO",
    "catalog optimization",
    "product description generator",
    "ecommerce optimization",
    "AI product content",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Katalog AI",
    title,
    description,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Katalog AI dashboard preview for Shopify catalog optimization",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#10b77f",
  colorScheme: "dark",
};

export default function LandingPage() {
  return (
    <>
      <LandingPageClient />
    </>
  );
}
