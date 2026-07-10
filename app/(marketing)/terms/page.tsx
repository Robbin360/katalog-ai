"use client";

import { useEffect } from "react";
import { useI18n } from "@/lib/i18n-context";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export default function TermsPage() {
  const { t } = useI18n();

  useEffect(() => {
    document.title = "Terms of Service | Katalog AI";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Terms of Service for Katalog AI, the AI-powered Shopify catalog optimization platform. Read our agreement covering usage, data, and account responsibilities.');
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background-dark text-slate-100 font-display antialiased selection:bg-primary/30 overflow-x-hidden">
      {/* Background decoration - Neural Glow & Grid from Stitch */}
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
                  Service Agreement
                </h2>
                <p>
                  By using Katalog AI, you agree to allow our platform to analyze and optimize your store performance metrics. You maintain full ownership of your data and can revoke access at any time through your store platform settings.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="w-8 h-[1px] bg-primary/50"></span>
                  Authorized Use
                </h2>
                <p>
                  You agree to use Katalog AI only for lawful purposes and in accordance with the terms of your e-commerce platform (e.g., Shopify Partner Terms). Any misuse of the autonomous optimization features is strictly prohibited.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="w-8 h-[1px] bg-primary/50"></span>
                  Account Security
                </h2>
                <p>
                  You are responsible for maintaining the confidentiality of your credentials. Katalog AI uses Supabase Auth to provide secure access, but you must ensure your own security practices are up to date.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}