import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Katalog AI",
  description: "Terms of Service for Katalog AI, the AI-powered Shopify catalog optimization platform. Read our agreement covering usage, data, and account responsibilities.",
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
