"use client";

import { useEffect } from "react";
import { Navbar } from "@/components/landing/Navbar";

export default function TermsPage() {

  useEffect(() => {
    document.title = "Terms of Service | Katalog AI";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Terms of Service for Katalog AI, the AI-powered Shopify catalog optimization platform. Read our agreement covering subscription plans, credits, refunds, and usage policies.');
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
              Terms of Service
            </h1>
            <p className="text-slate-400 text-lg mb-12">
              Effective Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>

            <div className="glass-card p-8 md:p-12 space-y-12 text-slate-300 leading-relaxed shadow-glow/5 border-white/5">

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="w-8 h-[1px] bg-primary/50"></span>
                  1. Acceptance of Terms
                </h2>
                <p>
                  By installing Katalog AI on your Shopify store and using the service, you agree to be bound by these Terms of Service. If you do not agree, do not install or use the app.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="w-8 h-[1px] bg-primary/50"></span>
                  2. Description of Service
                </h2>
                <p>
                  Katalog AI is a Shopify app that audits and optimizes product catalogs. The service uses AI (Gemini) to generate SEO-optimized titles, descriptions, and metadata for your products.
                </p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li><strong>Auto-Pilot:</strong> Runs continuously in the background (approximately every 30 seconds), processing products for optimization — up to 5 per cycle on Pro, 10 per cycle on Business.</li>
                  <li><strong>Brand Rules:</strong> Custom instructions you define, applied to optimizations.</li>
                  <li><strong>CSV Export:</strong> Download audit results (Pro and Business plans only).</li>
                </ul>
                <p className="mt-2">
                  The service is currently available in English only.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="w-8 h-[1px] bg-primary/50"></span>
                  3. Account Registration
                </h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You must have a Shopify store to use Katalog AI.</li>
                  <li>You must provide accurate information during registration.</li>
                  <li>You are responsible for maintaining the security of your account.</li>
                  <li>One account per Shopify store.</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="w-8 h-[1px] bg-primary/50"></span>
                  4. Subscription Plans and Billing
                </h2>
                <p className="font-semibold text-white">Plans:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Free:</strong> $0/month, 15 credits/month, perpetually renews.</li>
                  <li><strong>Pro:</strong> $49/month or $490/year, 250 credits/month.</li>
                  <li><strong>Business:</strong> $149/month or $1,490/year, 800 credits/month.</li>
                  <li><strong>Enterprise:</strong> Custom pricing — contact sales.</li>
                </ul>
                <p className="font-semibold text-white mt-4">Billing:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Monthly plans are billed every 30 days via Stripe.</li>
                  <li>Annual plans are billed upfront for 12 months via Stripe.</li>
                  <li>All prices are in USD. Taxes may apply based on your location.</li>
                </ul>
                <p className="font-semibold text-white mt-4">Subscription changes:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Upgrade: a prorated charge is applied immediately.</li>
                  <li>Downgrade: takes effect at the end of the current billing period.</li>
                  <li>Cancellation: takes effect at the end of the current billing period. No partial refunds for monthly plans.</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="w-8 h-[1px] bg-primary/50"></span>
                  5. Credits and Usage
                </h2>
                <p>
                  <strong>What is a credit:</strong> 1 credit = 1 product optimized (audit + AI optimization + sync to Shopify).
                </p>
                <p className="font-semibold text-white mt-4">Credit allocation:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Free: 15 credits/month</li>
                  <li>Pro: 250 credits/month</li>
                  <li>Business: 800 credits/month</li>
                  <li>Enterprise: custom</li>
                </ul>
                <p className="font-semibold text-white mt-4">Credit renewal:</p>
                <p>
                  Credits renew automatically at the start of each billing cycle (a cron job runs daily at 2 AM UTC). Free plan credits renew monthly as long as the account is active.
                </p>
                <p className="font-semibold text-white mt-4">Credit expiration:</p>
                <p>
                  Unused credits do <strong>not</strong> roll over to the next billing cycle. Credits are reset to zero at the start of each cycle after renewal.
                </p>
                <p className="font-semibold text-white mt-4">Auto-Scale (Pro and Business only):</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>When you reach 80% of your monthly credits, Auto-Scale recharges 50 credits at $0.25 each ($12.50 total).</li>
                  <li>Maximum recharge per cycle: 1000 credits (configurable).</li>
                  <li>Auto-Scale can be disabled in your account settings.</li>
                </ul>
                <p className="font-semibold text-white mt-4">Credit purchases (top-ups):</p>
                <p>
                  One-time credit purchases are non-refundable. Purchased credits expire 12 months after purchase.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="w-8 h-[1px] bg-primary/50"></span>
                  6. Acceptable Use
                </h2>
                <p>You agree <strong>not</strong> to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Use Katalog AI to process unlawful, harmful, or abusive content.</li>
                  <li>Attempt to access other users' data.</li>
                  <li>Reverse engineer, decompile, or disassemble the service.</li>
                  <li>Use the service to spam, scrape, or violate Shopify's terms.</li>
                  <li>Resell or sublicense access to Katalog AI without written permission.</li>
                  <li>Exceed the rate limits or capacity of your plan.</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="w-8 h-[1px] bg-primary/50"></span>
                  7. Refund Policy
                </h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Monthly subscriptions:</strong> No refunds for partial months. Cancellation takes effect at the end of the current billing period.</li>
                  <li><strong>Annual subscriptions:</strong> Full refund within 14 days of purchase. After 14 days, refunds are pro-rated based on remaining months.</li>
                  <li><strong>Credit purchases (top-ups):</strong> Non-refundable.</li>
                  <li><strong>Failed optimizations:</strong> Credits are automatically refunded via our credit compensation system.</li>
                </ul>
                <p className="mt-2">
                  To request a refund, contact <span className="text-primary font-semibold">support@katalog.ai</span> with your account email and reason.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="w-8 h-[1px] bg-primary/50"></span>
                  8. Limitation of Liability
                </h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Katalog AI is provided "as is" without warranties of any kind, express or implied.</li>
                  <li>We do not guarantee that optimizations will improve conversion rates, SEO rankings, or revenue.</li>
                  <li>We are not liable for indirect, incidental, or consequential damages.</li>
                  <li>Our total liability is limited to the amount you paid in the last 12 months.</li>
                  <li>We are not liable for data loss caused by Shopify API outages, Stripe outages, or third-party service failures.</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="w-8 h-[1px] bg-primary/50"></span>
                  9. Intellectual Property
                </h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Katalog AI and all its content (excluding user data) are owned by [Company Legal Name].</li>
                  <li>You retain all rights to your product data.</li>
                  <li>You grant us a limited license to process your product data for the purpose of providing the service.</li>
                  <li>We may use aggregated, anonymized data to improve our AI models.</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="w-8 h-[1px] bg-primary/50"></span>
                  10. Termination
                </h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You can cancel your subscription anytime from your Katalog AI account or Shopify admin.</li>
                  <li>We may terminate or suspend your account for violation of these terms.</li>
                  <li>Upon termination:
                    <ul className="list-disc pl-6 mt-1 space-y-1">
                      <li>Your credits are forfeited (no refunds except as stated in the Refund Policy).</li>
                      <li>Your data is deleted within 30 days (except payment records retained for 7 years).</li>
                      <li>Your Shopify integration is disconnected.</li>
                    </ul>
                  </li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="w-8 h-[1px] bg-primary/50"></span>
                  11. Auto-Pilot Usage Limits
                </h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Auto-Pilot processes up to 5 products per cycle on Pro, 10 on Business.</li>
                  <li>A "cycle" runs approximately every 30 seconds (continuous background processing).</li>
                  <li>We reserve the right to throttle Auto-Pilot during high-load periods.</li>
                  <li>Auto-Pilot only processes products that have not yet been optimized or have been flagged for re-optimization.</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="w-8 h-[1px] bg-primary/50"></span>
                  12. Changes to Terms
                </h2>
                <p>
                  We may update these Terms of Service from time to time. Material changes will be notified via email at least 30 days before taking effect. Continued use of Katalog AI after the effective date constitutes acceptance of the updated terms.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="w-8 h-[1px] bg-primary/50"></span>
                  13. Governing Law
                </h2>
                <p>
                  These terms are governed by the laws of [Country/State]. Disputes will be resolved in the courts of [City].
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="w-8 h-[1px] bg-primary/50"></span>
                  14. Contact Us
                </h2>
                <p>
                  For support inquiries: <span className="text-primary font-semibold">support@katalog.ai</span>
                </p>
                <p>
                  For legal notices: <span className="text-primary font-semibold">legal@katalog.ai</span>
                </p>
              </section>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
