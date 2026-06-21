import type { Metadata, Viewport } from "next";
import { LandingPageClient } from "@/components/landing/LandingPageClient";

const siteUrl = "https://katalog-ai-navy.vercel.app";
const title = "Katalog AI | Shopify Catalog Optimization Agent";
const description =
  "Katalog AI audits Shopify products, rewrites SEO titles and descriptions, prioritizes revenue opportunities, and syncs optimized catalog content back to your store.";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Katalog AI",
  url: siteUrl,
  logo: `${siteUrl}/logo-dark.svg`,
  description,
  foundingDate: "2026-01-01",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    url: `${siteUrl}/login`,
  },
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Katalog AI",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: siteUrl,
  image: `${siteUrl}/opengraph-image`,
  description,
  datePublished: "2026-06-21",
  dateModified: "2026-06-21",
  author: {
    "@type": "Organization",
    name: "Katalog AI",
    url: siteUrl,
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
  },
  featureList: [
    "Shopify catalog audit",
    "AI product title and description optimization",
    "Revenue-at-risk prioritization",
    "SEO metadata generation",
    "One-click Shopify sync",
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What does Katalog AI optimize?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Katalog AI reviews Shopify product titles, descriptions, metadata, tags, and catalog completeness to find SEO and conversion opportunities.",
      },
    },
    {
      "@type": "Question",
      name: "Does Katalog AI sync changes back to Shopify?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Approved optimizations can be synchronized back to Shopify so merchants can improve listings without manual copy and paste work.",
      },
    },
    {
      "@type": "Question",
      name: "Who is Katalog AI for?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Katalog AI is built for Shopify merchants and ecommerce operators who need cleaner product content, stronger SEO metadata, and clearer revenue prioritization.",
      },
    },
  ],
};

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([organizationSchema, softwareSchema, faqSchema]),
        }}
      />
      <LandingPageClient />
    </>
  );
}
