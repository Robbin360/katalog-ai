"use client";

import { useEffect } from "react";
import { Navbar } from "@/components/landing/Navbar";

export default function PrivacyPage() {

  useEffect(() => {
    document.title = "Privacy Policy | Katalog AI";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Privacy Policy for Katalog AI. Learn how we collect, use, and protect your Shopify store data, product catalog information, and account security.');
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
              Privacy Policy
            </h1>
            <p className="text-slate-400 text-lg mb-12">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>

            <div className="glass-card p-8 md:p-12 space-y-12 text-slate-300 leading-relaxed shadow-glow/5 border-white/5">
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="w-8 h-[1px] bg-primary/50"></span>
                  Information We Collect
                </h2>
                <p>
                  We collect information that is necessary to provide our scheduled e-commerce optimization services. This includes store data, product performance metrics, and account information required for integrations with platforms like Shopify.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="w-8 h-[1px] bg-primary/50"></span>
                  How We Use Your Data
                </h2>
                <p>
                  Your data is used specifically for technical analysis of your catalog (titles, descriptions, images, and metadata) and for executing optimization tasks you configure through Auto-Pilot. We never sell your data to third parties.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="w-8 h-[1px] bg-primary/50"></span>
                  Security
                </h2>
                <p>
                  We implement industry-standard security measures including end-to-end encryption and secure OAuth protocols via Supabase to ensure your store credentials and data remain private.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}