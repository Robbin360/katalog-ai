"use client";

import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { PricingSection } from "@/components/landing/PricingSection";
import { FAQSection } from "@/components/landing/FAQSection";

export function LandingPageClient() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-background-dark font-display text-slate-100 antialiased selection:bg-primary/30">
      <div className="pointer-events-none fixed inset-0 z-0 bg-neural-glow" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-grid-pattern bg-grid opacity-[0.03]" />

      <Navbar />

      <main className="relative z-10 pt-16">
        <Hero />
        <Features />
        <PricingSection />
        <FAQSection />
      </main>
    </div>
  );
}
