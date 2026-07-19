"use client";

import { useEffect } from "react";
import { Navbar } from "@/components/landing/Navbar";

export default function PrivacyPage() {

  useEffect(() => {
    document.title = "Privacy Policy | Katalog AI";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Privacy Policy for Katalog AI. Learn how we collect, use, share, and protect your Shopify store data, product catalog information, and account security.');
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background-dark text-slate-100 font-display antialiased selection:bg-primary/30 overflow-x-hidden">
      <div className="fixed inset-0 z-0 bg-neural-glow pointer-events-none opacity-50"></div>
      <div className="fixed inset-0 z-0 opacity-[0.03] bg-grid-pattern bg-grid pointer-events-none"></div>

      <Navbar />

      <main className="relative z-10 pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">
              Privacy Policy
            </h1>
            <p className="text-slate-400 text-lg mb-12">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>

            <div className="glass-card p-8 md:p-12 space-y-12 text-slate-300 leading-relaxed shadow-glow/5 border-white/5">

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="w-8 h-[1px] bg-primary/50"></span>
                  1. Introduction
                </h2>
                <p>
                  Katalog AI ("we," "our," or "us") operates the Katalog AI Shopify app and website. This Privacy Policy explains how we collect, use, share, and protect your personal data when you use our service.
                </p>
                <p>
                  By installing Katalog AI on your Shopify store and using our service, you agree to the practices described in this policy. If you do not agree, please uninstall the app and discontinue use.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="w-8 h-[1px] bg-primary/50"></span>
                  2. Information We Collect
                </h2>
                <p className="font-semibold text-white">Account information:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Email address</li>
                  <li>Full name (if provided)</li>
                  <li>Shopify shop domain (after OAuth authentication)</li>
                </ul>
                <p className="font-semibold text-white mt-4">Shopify product data (after OAuth):</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Product titles, descriptions, and body HTML</li>
                  <li>Tags, vendor, price, and compare-at price</li>
                  <li>Image URLs</li>
                  <li>Inventory quantities</li>
                  <li>Sales data for the last 7, 30, and 90 days</li>
                  <li>Variants and metadata</li>
                </ul>
                <p className="font-semibold text-white mt-4">Usage data:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Optimization requests and audit results</li>
                  <li>Brand Rules you create</li>
                  <li>Feature usage (pages visited, actions taken)</li>
                </ul>
                <p className="font-semibold text-white mt-4">Payment data (via Stripe):</p>
                <p>
                  We do not store credit card numbers. Stripe, our payment processor, stores card type, last four digits, and expiration date. All payment data is handled in accordance with Stripe's privacy policy.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="w-8 h-[1px] bg-primary/50"></span>
                  3. How We Use Your Information
                </h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>To provide the Katalog AI service: audit, optimize, and sync product catalogs</li>
                  <li>To process payments via Stripe</li>
                  <li>To send service notifications (credit renewal, Auto-Scale triggers)</li>
                  <li>To improve our product using aggregate analytics (not individual tracking)</li>
                  <li>To respond to support requests</li>
                  <li>To detect and prevent fraud</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="w-8 h-[1px] bg-primary/50"></span>
                  4. How We Share Your Information
                </h2>
                <p className="font-semibold text-emerald-400">We do not sell your data to third parties.</p>
                <p className="mt-4">We use the following subprocessors to provide our service:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li><strong>Supabase</strong> — Database and authentication (<a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">supabase.com/privacy</a>)</li>
                  <li><strong>Shopify</strong> — OAuth provider and product data source (<a href="https://www.shopify.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">shopify.com/legal/privacy</a>)</li>
                  <li><strong>Vercel</strong> — Hosting and edge functions (<a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">vercel.com/legal/privacy-policy</a>)</li>
                  <li><strong>Google (Gemini API)</strong> — AI provider for optimization (<a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">policies.google.com/privacy</a>)</li>
                  <li><strong>Stripe</strong> — Payment processing (<a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">stripe.com/privacy</a>)</li>
                </ul>
                <p className="mt-4">
                  We may disclose information if required by law, court order, or to protect our legal rights.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="w-8 h-[1px] bg-primary/50"></span>
                  5. Data Retention
                </h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Account data:</strong> Retained while your account is active; deleted within 30 days of account deletion request.</li>
                  <li><strong>Shopify product data:</strong> Retained while your subscription is active; deleted within 30 days of subscription termination.</li>
                  <li><strong>Optimization results:</strong> Retained while your subscription is active; aggregated or anonymized after deletion.</li>
                  <li><strong>Payment records:</strong> Retained for 7 years to comply with tax and legal requirements.</li>
                  <li><strong>Audit logs:</strong> Retained for 90 days.</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="w-8 h-[1px] bg-primary/50"></span>
                  6. Your Rights
                </h2>
                <p>
                  Depending on your jurisdiction (GDPR, CCPA, and similar laws), you have the following rights:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li><strong>Access:</strong> Request a copy of your personal data.</li>
                  <li><strong>Rectification:</strong> Request correction of inaccurate data.</li>
                  <li><strong>Erasure:</strong> Request deletion of your data ("right to be forgotten").</li>
                  <li><strong>Restriction:</strong> Request we limit processing of your data.</li>
                  <li><strong>Portability:</strong> Request your data in a machine-readable format.</li>
                  <li><strong>Objection:</strong> Object to certain processing activities.</li>
                </ul>
                <p className="mt-4">
                  To exercise these rights, contact us at <span className="text-primary font-semibold">privacy@katalog.ai</span>.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="w-8 h-[1px] bg-primary/50"></span>
                  7. Security
                </h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>We use TLS encryption (HTTPS) for data in transit.</li>
                  <li>We use encryption at rest, provided by Supabase.</li>
                  <li>We use Row-Level Security (RLS) to ensure users can only access their own data.</li>
                  <li>We use OAuth 2.0 for Shopify authentication — we never see your Shopify admin password.</li>
                  <li>We do <strong>not</strong> have SOC 2, ISO 27001, or end-to-end encryption certifications.</li>
                </ul>
                <p className="mt-4">
                  Despite these measures, no system is 100% secure. We cannot guarantee absolute security.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="w-8 h-[1px] bg-primary/50"></span>
                  8. International Data Transfers
                </h2>
                <p>
                  Your data may be processed in countries other than your own, including the United States and Ireland. We rely on Standard Contractual Clauses (SCCs) for transfers from the European Economic Area (EEA) to non-EEA countries. By using Katalog AI, you consent to these transfers.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="w-8 h-[1px] bg-primary/50"></span>
                  9. Children's Privacy
                </h2>
                <p>
                  Katalog AI is not intended for users under 16 years of age. We do not knowingly collect personal data from children. If you believe we have collected data from a child, please contact us at <span className="text-primary font-semibold">privacy@katalog.ai</span>.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="w-8 h-[1px] bg-primary/50"></span>
                  10. Changes to This Policy
                </h2>
                <p>
                  We may update this Privacy Policy from time to time. Material changes will be notified via email at least 30 days before taking effect. Continued use of Katalog AI after the effective date constitutes acceptance of the updated policy.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="w-8 h-[1px] bg-primary/50"></span>
                  11. Contact Us
                </h2>
                <p>
                  For privacy-related inquiries, GDPR or CCPA requests, or general questions:
                </p>
                <p className="mt-2">
                  Email: <span className="text-primary font-semibold">privacy@katalog.ai</span>
                </p>
                <p>
                  For support: <span className="text-primary font-semibold">support@katalog.ai</span>
                </p>
              </section>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
