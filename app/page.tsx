"use client";

import { useI18n } from "@/lib/i18n-context";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { PricingSection } from "@/components/landing/PricingSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { StatsBar } from "@/components/landing/StatsBar";

export default function LandingPage() {
  const { t } = useI18n();

  return (
    <div className="flex flex-col min-h-screen bg-background-dark text-slate-100 font-display antialiased selection:bg-primary/30 overflow-x-hidden">
      {/* Background decoration - Neural Glow & Grid from Stitch */}
      <div className="fixed inset-0 z-0 bg-neural-glow pointer-events-none"></div>
      <div className="fixed inset-0 z-0 opacity-[0.03] bg-grid-pattern bg-grid pointer-events-none"></div>

      <Navbar />

      <main className="relative z-10 pt-16">
        <Hero />
        <StatsBar />
        <Features />
        <PricingSection />
        <FAQSection />
      </main>
    </div>
  );
}
