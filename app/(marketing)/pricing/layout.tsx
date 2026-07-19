import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing Plans | Katalog AI — Your Shopify Catalog, Optimized by AI.",
  description: "Transparent pricing for Katalog AI. Start with a free Shopify catalog audit, scale to Pro at $49/mo or Business at $149/mo. No hidden fees.",
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
