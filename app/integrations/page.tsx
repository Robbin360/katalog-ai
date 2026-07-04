import type { Metadata, Viewport } from "next";
import { IntegrationsPageClient } from "@/components/integrations/IntegrationsPageClient";

const siteUrl = "https://katalog-ai-navy.vercel.app";
const pageUrl = `${siteUrl}/integrations`;
const title = "Integrations | Katalog AI";
const description = "Katalog AI integrates natively with Shopify. BigCommerce, WooCommerce, and Magento are on our roadmap. Real-time catalog sync and automated product optimization for Shopify merchants.";

// Schema JSON-LD para IA-Readability
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Katalog AI",
  url: siteUrl,
  logo: `${siteUrl}/logo-dark.svg`,
  description: "AI-powered Shopify catalog optimization platform",
  foundingDate: "2026-01-01",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    url: `${siteUrl}/contact`,
  },
  sameAs: [
    "https://twitter.com/katalogai",
    "https://linkedin.com/company/katalog-ai",
    "https://github.com/katalog-ai",
  ],
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Katalog AI",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: pageUrl,
  image: `${siteUrl}/opengraph-image`,
  description,
  datePublished: "2026-01-15",
  dateModified: new Date().toISOString().split('T')[0],
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
    "Shopify integration",
    "Real-time catalog sync",
    "API-based data exchange",
  ],
};

const webPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: title,
  description,
  url: pageUrl,
  datePublished: "2026-01-15",
  dateModified: new Date().toISOString().split('T')[0],
  author: {
    "@type": "Organization",
    name: "Katalog AI",
    url: siteUrl,
  },
  publisher: {
    "@type": "Organization",
    name: "Katalog AI",
    logo: {
      "@type": "ImageObject",
      url: `${siteUrl}/logo-dark.svg`,
    },
  },
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
    canonical: "/integrations",
    languages: {
      en: "/integrations",
      "x-default": "/integrations",
    },
  },
  keywords: [
    "Shopify integration",
    "BigCommerce integration",
    "WooCommerce integration",
    "Magento integration",
    "e-commerce platform integration",
    "Katalog AI integrations",
    "catalog sync",
    "API integration",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: pageUrl,
    siteName: "Katalog AI",
    title,
    description,
    images: [
      {
        url: `${siteUrl}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "Katalog AI integrations with Shopify, BigCommerce, WooCommerce, and Magento",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [`${siteUrl}/opengraph-image`],
    creator: "@katalogai",
    site: "@katalogai",
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

export default function IntegrationsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([organizationSchema, softwareSchema, webPageSchema]),
        }}
      />
      <IntegrationsPageClient />
    </>
  );
}
