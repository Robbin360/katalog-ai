import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Privacy Policy | Katalog AI" },
  description: "How Katalog AI collects, uses, and protects your data.",
  alternates: { canonical: `${SITE_URL}/privacy` },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Privacy Policy | Katalog AI",
    description: "How Katalog AI collects, uses, and protects your data.",
    url: `${SITE_URL}/privacy`,
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
