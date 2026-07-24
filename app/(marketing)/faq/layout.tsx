import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "FAQ | Katalog AI" },
  description: "Answers to common questions about Katalog AI, pricing, Auto-Pilot, and more.",
  alternates: { canonical: `${SITE_URL}/faq` },
  robots: { index: true, follow: true },
  openGraph: {
    title: "FAQ | Katalog AI",
    description: "Answers to common questions about Katalog AI, pricing, Auto-Pilot, and more.",
    url: `${SITE_URL}/faq`,
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: "Katalog AI FAQ" }],
  },
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
