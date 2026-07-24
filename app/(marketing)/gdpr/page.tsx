import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GDPR Compliance | Katalog AI",
  description: "Your GDPR rights and how to exercise them with Katalog AI.",
  alternates: { canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://katalog-ai-navy.vercel.app'}/gdpr` },
  robots: { index: true, follow: true },
};

import { Navbar } from "@/components/landing/Navbar";

export default function GDPRPage() {

  return (
    <div className="flex flex-col min-h-screen bg-background-dark text-slate-100 font-display antialiased selection:bg-primary/30 overflow-x-hidden">
      <div className="fixed inset-0 z-0 bg-neural-glow pointer-events-none opacity-50"></div>
      <div className="fixed inset-0 z-0 opacity-[0.03] bg-grid-pattern bg-grid pointer-events-none"></div>

      <Navbar />

      <main className="relative z-10 pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">
              GDPR Compliance
            </h1>
            <p className="text-slate-400 text-lg mb-12">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>

            <div className="prose prose-invert prose-slate max-w-none space-y-6">
              <section>
                <h2 className="text-white text-2xl font-bold">Data Controller</h2>
                <p>
                  Katalog AI acts as a data processor for Shopify merchant data and as a data controller
                  for user account information. For GDPR-related inquiries, contact privacy@katalog.ai.
                </p>
              </section>

              <section>
                <h2 className="text-white text-2xl font-bold">Your Rights</h2>
                <p>
                  Under the General Data Protection Regulation (GDPR), you have the following rights:
                </p>
                <ul className="list-disc pl-6 space-y-1 mt-2 text-slate-300">
                  <li><strong>Right to Access:</strong> Request a copy of the personal data we hold about you.</li>
                  <li><strong>Right to Rectification:</strong> Request correction of inaccurate data.</li>
                  <li><strong>Right to Erasure:</strong> Request deletion of your data (subject to legal obligations).</li>
                  <li><strong>Right to Restrict Processing:</strong> Request limitation of how we use your data.</li>
                  <li><strong>Right to Data Portability:</strong> Request transfer of your data to another service.</li>
                  <li><strong>Right to Object:</strong> Object to processing based on legitimate interests.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-white text-2xl font-bold">Data We Process</h2>
                <ul className="list-disc pl-6 space-y-1 mt-2 text-slate-300">
                  <li><strong>Account Data:</strong> Email, name, billing information (processed via Stripe).</li>
                  <li><strong>Shopify Data:</strong> Product catalog information accessed via Shopify API with your consent.</li>
                  <li><strong>Usage Data:</strong> Analytics on how you interact with our service.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-white text-2xl font-bold">Data Retention</h2>
                <p>
                  We retain your personal data for as long as your account is active. Upon account deletion,
                  we delete or anonymize your data within 30 days, except where legal obligations require
                  longer retention (e.g., billing records retained for 7 years).
                </p>
              </section>

              <section>
                <h2 className="text-white text-2xl font-bold">International Transfers</h2>
                <p>
                  Your data may be processed in the United States, Europe, or other locations where our
                  subprocessors operate. We ensure appropriate safeguards (Standard Contractual Clauses)
                  are in place for international data transfers.
                </p>
              </section>

              <section>
                <h2 className="text-white text-2xl font-bold">Data Protection Officer</h2>
                <p>
                  For GDPR-related requests, contact our privacy team at privacy@katalog.ai.
                  We will respond to your request within 30 days.
                </p>
              </section>

              <section>
                <h2 className="text-white text-2xl font-bold">Complaints</h2>
                <p>
                  If you believe we have violated your data protection rights, you have the right to
                  lodge a complaint with your local data protection authority.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
