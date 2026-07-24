import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Terms of Service | Katalog AI" },
  description: "Terms and conditions for using Katalog AI.",
  alternates: { canonical: `${SITE_URL}/terms` },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Terms of Service | Katalog AI",
    description: "Terms and conditions for using Katalog AI.",
    url: `${SITE_URL}/terms`,
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
