import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legal | Katalog AI",
  description: "Legal documents and policies for Katalog AI — Terms, Privacy, Cookies, GDPR.",
  alternates: { canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://katalog-ai-navy.vercel.app'}/legal` },
};

import { Navbar } from "@/components/landing/Navbar";

export default function LegalNoticePage() {

  return (
    <div className="flex flex-col min-h-screen bg-background-dark text-slate-100 font-display antialiased selection:bg-primary/30 overflow-x-hidden">
      <div className="fixed inset-0 z-0 bg-neural-glow pointer-events-none opacity-50"></div>
      <div className="fixed inset-0 z-0 opacity-[0.03] bg-grid-pattern bg-grid pointer-events-none"></div>

      <Navbar />

      <main className="relative z-10 pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">
              Legal Notice
            </h1>
            <p className="text-slate-400 text-lg mb-12">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>

            <div className="prose prose-invert prose-slate max-w-none space-y-6">
              <section>
                <h2 className="text-white text-2xl font-bold">Company Information</h2>
                <p>
                  Katalog AI is a product catalog optimization service for Shopify stores.
                </p>
                <ul className="list-disc pl-6 space-y-1 mt-2 text-slate-300">
                  <li><strong>Service Name:</strong> Katalog AI</li>
                  <li><strong>Contact Email:</strong> support@katalog.ai</li>
                  <li><strong>Privacy Contact:</strong> privacy@katalog.ai</li>
                  <li><strong>Legal Contact:</strong> legal@katalog.ai</li>
                </ul>
              </section>

              <section>
                <h2 className="text-white text-2xl font-bold">Service</h2>
                <p>
                  Katalog AI provides AI-powered catalog auditing, optimization, and publishing tools
                  for Shopify merchants. The service is available as a Shopify app and operates
                  on a Software-as-a-Service (SaaS) model with tiered subscription plans.
                </p>
              </section>

              <section>
                <h2 className="text-white text-2xl font-bold">Contact</h2>
                <p>
                  For any questions regarding this legal notice, please contact us at:
                </p>
                <ul className="list-disc pl-6 space-y-1 mt-2 text-slate-300">
                  <li>Email: legal@katalog.ai</li>
                  <li>Support: support@katalog.ai</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
