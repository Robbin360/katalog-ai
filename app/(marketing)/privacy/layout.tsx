import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Katalog AI",
  description: "Privacy Policy for Katalog AI. Learn how we collect, use, and protect your Shopify store data, product catalog information, and account security.",
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
