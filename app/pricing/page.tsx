"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, HelpCircle, Minus } from "lucide-react";
import { Brand } from "@/components/ui/brand";
import { Navbar } from "@/components/landing/Navbar";
import { useI18n } from "@/lib/i18n-context";
import { PricingCard } from "@/components/pricing-card";

const PricingPage = () => {
  const { t, Trans } = useI18n();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">("annually");

  const plans = [
    {
      id: "free" as const,
      name: "FREE",
      descKey: "landing.pricing.plans.starter.desc",
      capacityKey: "landing.pricing.plans.starter.capacity",
      renewalKey: "landing.pricing.plans.starter.renewal",
      ctaKey: "landing.pricing.plans.starter.cta",
      description: "Discover your revenue at risk. No credit card.",
      monthlyPrice: "$0",
      capacity: "5 Credits",
      renewal: "One-time AI gift.",
      cta: "Audit my store for free",
      features: [
        { brand: null, text: "SEO Audit (Up to 500 SKUs)" },
        { brand: null, text: "Revenue at Risk Radar" },
        { brand: null, text: "Manual sync" },
      ],
      featuresKeys: [
        "landing.pricing.plans.starter.features.item1",
        "landing.pricing.plans.starter.features.item2",
        "landing.pricing.plans.starter.features.item3",
      ],
      comingSoon: [false, false, false],
      popular: false,
    },
    {
      id: "pro" as const,
      name: "PRO",
      descKey: "landing.pricing.plans.pro.desc",
      capacityKey: "landing.pricing.plans.pro.capacity",
      renewalKey: "landing.pricing.plans.pro.renewal",
      ctaKey: "landing.pricing.plans.pro.cta",
      highlightKey: "landing.pricing.plans.pro.includedFrom",
      description: "Your 24/7 marketing employee.",
      monthlyPrice: "$49",
      annualPrice: "$529",
      capacity: "250 Credits",
      renewal: "Renews every month.",
      cta: "Activate Auto-Pilot →",
      badge: "Recommended",
      highlight: "↳ Everything in Free, plus:",
      priceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO,
      priceIdAnnual: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_ANNUAL,
      features: [
        { brand: null, text: "24/7 Auto-Pilot" },
        { brand: "RAG Engine", text: "" },
        { brand: null, text: "Custom Brand Rules" },
        { brand: null, text: "Fast-Track Sync (Stock at no cost)" },
      ],
      featuresKeys: [
        "landing.pricing.plans.pro.features.item1",
        "landing.pricing.plans.pro.features.item2",
        "landing.pricing.plans.pro.features.item3",
        "landing.pricing.plans.pro.features.item4",
      ],
      comingSoon: [false, false, false, false],
      popular: true,
    },
    {
      id: "business" as const,
      name: "BUSINESS",
      descKey: "landing.pricing.plans.enterprise.desc",
      capacityKey: "landing.pricing.plans.enterprise.capacity",
      renewalKey: "landing.pricing.plans.enterprise.renewal",
      ctaKey: "landing.pricing.plans.enterprise.cta",
      highlightKey: "landing.pricing.plans.enterprise.includedFrom",
      description: "Your autonomous agency that learns overnight.",
      monthlyPrice: "$149",
      annualPrice: "$1,609",
      capacity: "700 Credits",
      renewal: "Extended monthly limit.",
      cta: "Activate Business →",
      highlight: "↳ Everything in Pro, plus:",
      priceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_BUSINESS,
      priceIdAnnual: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_BUSINESS_ANNUAL,
      features: [
        { brand: "Sleeper Agent", text: "(Sales learning)" },
        { brand: null, text: "Knowledge Injector" },
        { brand: null, text: "Multiple Brand Rules" },
        { brand: null, text: "Priority processing queue" },
      ],
      featuresKeys: [
        "landing.pricing.plans.enterprise.features.item1",
        "landing.pricing.plans.enterprise.features.item2",
        "landing.pricing.plans.enterprise.features.item3",
        "landing.pricing.plans.enterprise.features.item4",
      ],
      comingSoon: [false, true, false, false],
      popular: false,
    },
  ];

  const comparisonData = {
    categories: [
      {
        name: "LIMITS & CREDITS",
        features: [
          { name: "Catalog Audit (SEO Score)", values: ["Up to 500 SKUs", "Unlimited", "Unlimited"] },
          { name: "AI Optimization Credits", values: ["5 (One-time)", "250 / month", "700 / month"] },
          { name: "Extra Credit Cost", values: ["N/A", "$0.07", "$0.07"] },
        ],
      },
      {
        name: "AI INTELLIGENCE",
        features: [
          { name: "AI Engine", values: ["Basic (Audit only)", "Advanced (Pro + 120B Judge)", "Advanced (Pro + 120B Judge)"] },
          { name: "Copywriting RAG", values: ["None", "Global (Ogilvy/Cialdini)", "Global + Custom"] },
          { name: "Knowledge Injector (PDFs)", values: [false, false, true] },
          { name: "Sleeper Agent (Nightly Learning)", values: [false, false, true] },
          { name: "Brand Voice Rules", values: ["None", "1 Global Set", "Multiple Sets"] },
        ],
      },
      {
        name: "WORKFLOW & AUTOMATION",
        features: [
          { name: "Automation Level", values: ["Manual", "24/7 Auto-Pilot", "24/7 Auto-Pilot"] },
          { name: "Inventory Sync", values: ["Manual", "Automated Background", "Automated Background"] },
          { name: "Fast-Track Bypass ($0 Cost)", values: [false, true, true] },
          { name: "Publishing Method", values: ["Blocked", "Direct to Shopify", "Direct to Shopify"] },
          { name: "Connected Stores", values: ["1 Store", "1 Store", "Up to 2 Stores"] },
        ],
      },
      {
        name: "SUPPORT & INFRASTRUCTURE",
        features: [
          { name: "Queue Priority", values: ["Standard", "High", "Maximum"] },
          { name: "Support", values: ["Basic Email", "Priority Email (<48h)", "VIP Support (<12h)"] },
        ],
      },
    ],
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="min-h-screen bg-[#09090b] text-white pt-32 pb-20 px-4 Selection:bg-primary/30">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/30 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-emerald-900/20 blur-[100px] rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            <Trans i18nKey="pricing.title" />
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
            {t('pricing.description')}
          </p>

          {/* Toggle Billing */}
          <div className="mt-10 flex items-center justify-center gap-4">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`text-sm font-medium transition-colors ${billingCycle === "monthly" ? "text-white" : "text-zinc-500"}`}
            >
              {t('pricing.billing.monthly')}
            </button>
            <div
              className="w-14 h-7 bg-zinc-800 rounded-full p-1 cursor-pointer flex items-center relative"
              onClick={() => setBillingCycle(billingCycle === "monthly" ? "annually" : "monthly")}
            >
              <div
                className={`w-5 h-5 bg-primary rounded-full shadow-lg transform transition-transform duration-300 ease-spring ${billingCycle === "annually" ? "translate-x-7" : "translate-x-0"}`}
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setBillingCycle("annually")}
                className={`text-sm font-medium transition-colors ${billingCycle === "annually" ? "text-white" : "text-zinc-500"}`}
              >
                {t('pricing.billing.annually')}
              </button>
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20 animate-pulse">
                {t('pricing.billing.save')}
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {plans.map((plan) => {
            const isAnnual = billingCycle === "annually";
            const features = plan.features.map((f, i) => ({
              ...f,
              comingSoon: plan.comingSoon?.[i],
            }));

            return (
              <PricingCard
                key={plan.id}
                id={plan.id}
                title={plan.name}
                description={t(plan.descKey) || plan.description}
                price={isAnnual ? (plan.annualPrice || plan.monthlyPrice || "$0") : (plan.monthlyPrice || "$0")}
                priceSuffix={isAnnual ? "/año" : "/mes"}
                capacity={t(plan.capacityKey) || plan.capacity}
                renewal={t(plan.renewalKey) || plan.renewal}
                highlight={plan.highlightKey ? t(plan.highlightKey) || plan.highlight : undefined}
                features={features}
                recommended={plan.popular}
                badge={plan.badge}
                actionLabel={t(plan.ctaKey) || plan.cta}
                actionHref="/signup"
              />
            );
          })}
        </div>

        {/* Detailed Comparison Table */}
        <div className="mt-32">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t('pricing.comparison.title')}</h2>
            <p className="text-zinc-500">{t('pricing.comparison.subtitle')}</p>
          </div>

          <div className="overflow-x-auto rounded-[2rem] border border-white/5 bg-zinc-900/20 backdrop-blur-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="p-8 text-sm font-bold text-zinc-500 uppercase tracking-widest">{t('pricing.comparison.functionality')}</th>
                  <th className="p-8 text-zinc-300 font-bold text-center">FREE</th>
                  <th className="p-8 text-primary font-bold text-center">PRO</th>
                  <th className="p-8 text-zinc-300 font-bold text-center">BUSINESS</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.categories.map((category) => (
                  <React.Fragment key={category.name}>
                    <tr className="bg-white/2">
                      <td colSpan={4} className="px-8 py-4 text-xs font-black text-primary/80 uppercase tracking-[0.2em]">
                        {category.name}
                      </td>
                    </tr>
                    {category.features.map((feature) => (
                      <tr key={feature.name} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                        <td className="px-8 py-6 group">
                          <div className="flex items-center gap-2">
                            <span className="text-zinc-400 group-hover:text-white transition-colors">{feature.name}</span>
                            <HelpCircle size={14} className="text-zinc-700 cursor-help" />
                          </div>
                        </td>
                        {feature.values.map((value, i) => (
                          <td key={i} className="px-8 py-6 text-center">
                            {typeof value === "boolean" ? (
                              value ? (
                                <Check size={20} className="text-primary mx-auto" />
                              ) : (
                                <Minus size={20} className="text-zinc-800 mx-auto" />
                              )
                            ) : (
                              <span className={`text-sm ${value.includes("Próximamente") || value.includes("desarrollo")
                                ? "text-zinc-600 italic"
                                : value === "Tiempo Real" || value.includes("Prioridad")
                                  ? "text-primary font-medium"
                                  : "text-zinc-400"
                                }`}>
                                {value}
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ CTA */}
        <div className="mt-32 p-12 rounded-[3rem] bg-gradient-to-r from-primary/10 to-transparent border border-primary/20 text-center space-y-6">
          <h2 className="text-3xl font-bold">{t('pricing.faq_cta.title')}</h2>
          <p className="text-zinc-400 max-w-xl mx-auto">
            {t('pricing.faq_cta.description')}
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <Link
              href="/faq"
              className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-primary transition-colors"
            >
              {t('pricing.faq_cta.faq_btn')}
            </Link>
            <Link
              href="/contact"
              className="px-8 py-3 bg-transparent border border-white/20 text-white font-bold rounded-xl hover:bg-white/5 transition-colors"
            >
              {t('pricing.faq_cta.support_btn')}
            </Link>
          </div>
        </div>

        {/* Footer info */}
        </div>
      </main>
    </div>
  );
};

export default PricingPage;
