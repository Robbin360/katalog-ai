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
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">("monthly");

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
      ],
      featuresKeys: [
        "landing.pricing.plans.pro.features.item1",
        "landing.pricing.plans.pro.features.item2",
        "landing.pricing.plans.pro.features.item3",
      ],
      comingSoon: [false, false, false],
      popular: true,
    },
    {
      id: "pro-max" as const,
      name: "PRO PLUS",
      descKey: "landing.pricing.plans.proMax.desc",
      capacityKey: "landing.pricing.plans.proMax.capacity",
      renewalKey: "landing.pricing.plans.proMax.renewal",
      ctaKey: "landing.pricing.plans.proMax.cta",
      description: "For power users.",
      monthlyPrice: "$139",
      annualPrice: "$1,499",
      capacity: "250 Credits",
      renewal: "Renews every month.",
      cta: "Activate PRO PLUS →",
      highlight: "↳ Everything in Pro, plus:",
      features: [
        { brand: null, text: "24/7 Auto-Pilot" },
        { brand: "RAG Engine", text: "" },
        { brand: null, text: "Custom Brand Rules" },
        { brand: null, text: "CSV Export" },
      ],
      featuresKeys: [
        "landing.pricing.plans.proMax.features.item1",
        "landing.pricing.plans.proMax.features.item2",
        "landing.pricing.plans.proMax.features.item3",
        "landing.pricing.plans.proMax.features.item4",
      ],
      comingSoon: [false, false, false, false],
      popular: false,
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
      badge: "BEST VALUE",
      highlight: "↳ Everything in Pro, plus:",
      priceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_BUSINESS,
      priceIdAnnual: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_BUSINESS_ANNUAL,
      features: [
        { brand: "Sleeper Agent", text: "(Sales learning)" },
        { brand: null, text: "Multiple Brand Rules" },
        { brand: null, text: "Priority processing queue" },
        { brand: null, text: "10 products/cycle (Auto-Pilot)" },
      ],
      featuresKeys: [
        "landing.pricing.plans.enterprise.features.item1",
        "landing.pricing.plans.enterprise.features.item2",
        "landing.pricing.plans.enterprise.features.item3",
        "landing.pricing.plans.enterprise.features.item4",
      ],
      comingSoon: [false, false, false, false],
      popular: false,
    },
  ];

  const comparisonData = {
    categories: [
      {
        name: "LIMITS & CREDITS",
        features: [
          { name: "Catalog Audit (SEO Score)", values: ["Up to 500 SKUs", "Unlimited", "Unlimited", "Unlimited"] },
          { name: "AI Optimization Credits", values: ["5 (One-time)", "250 / month", "250 / month", "700 / month"] },
          { name: "Extra Credit Cost", values: ["N/A", "$0.25", "$0.25", "$0.25"] },
          { name: "Failure Compensation", values: ["N/A", "Free credit if 2+ failures in 24h", "Free credit if 2+ failures in 24h", "Free credit if 2+ failures in 24h"] },
        ],
      },
      {
        name: "AGENT WORKFORCE",
        features: [
          { name: "Crew Size", values: ["1 Agent", "4 Agents", "4 Agents", "4 Agents"] },
          { name: "Copywriting RAG", values: ["None", "Global (Ogilvy/Cialdini)", "Global (Ogilvy/Cialdini)", "Global + Custom"] },
          { name: "Sleeper Agent (Nightly Learning)", values: [false, false, false, true] },
          { name: "Brand Voice Rules", values: ["None", "1 Global Set", "1 Global Set", "Multiple Sets"] },
          { name: "Revenue Safety Lock", values: [false, "Never touches a winning product", "Never touches a winning product", "Never touches a winning product"] },
        ],
      },
      {
        name: "WORKFLOW & AUTOMATION",
        features: [
          { name: "Automation Level", values: ["Manual", "24/7 Auto-Pilot", "24/7 Auto-Pilot", "24/7 Auto-Pilot"] },
          { name: "Inventory Sync", values: ["Manual", "Automated Background", "Automated Background", "Automated Background"] },
          { name: "Auto-Pilot Batch Size", values: ["N/A", "3 products/cycle", "5 products/cycle", "10 products/cycle"] },
          { name: "Publishing Method", values: ["Blocked", "Direct to Shopify", "Direct to Shopify", "Direct to Shopify"] },
          { name: "CSV Export", values: ["—", "—", "CSV", "CSV + API"] },
          { name: "Connected Stores", values: ["1 Store", "1 Store", "1 Store", "Up to 3 Stores"] },
        ],
      },
      {
        name: "SUPPORT & INFRASTRUCTURE",
        features: [
          { name: "Queue Priority", values: ["Standard", "High", "High", "Maximum"] },
          { name: "Support", values: ["Basic Email", "Priority Email (<48h)", "Priority Email (<48h)", "VIP Support (<12h)"] },
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

        {/* Pricing Cards Grid — 3:4:4:4 proportional columns. Free is narrower; paid plans are equal width. */}
        <div className="grid grid-cols-1 md:grid-cols-[3fr_4fr_4fr_4fr] gap-4 items-start pt-4 mb-24">
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
                priceSuffix={isAnnual ? t('pricing.billing.suffix_year') : t('pricing.billing.suffix_month')}
                capacity={t(plan.capacityKey) || plan.capacity}
                renewal={t(plan.renewalKey) || plan.renewal}
                highlight={plan.highlightKey ? t(plan.highlightKey) || plan.highlight : undefined}
                features={features}
                recommended={plan.popular}
                badge={plan.badge}
                actionLabel={t(plan.ctaKey) || plan.cta}
                actionHref="/signup"
                disableShift={true}
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
              <colgroup>
                {/* Feature label column: 20% | Free: 15.2% | Pro, Pro Plus, Business: 21.6% each */}
                {/* Total: 20 + 15.2 + 21.6 + 21.6 + 21.6 = 100% */}
                <col style={{ width: "20%" }} />
                <col style={{ width: "15.2%" }} />
                <col style={{ width: "21.6%" }} />
                <col style={{ width: "21.6%" }} />
                <col style={{ width: "21.6%" }} />
              </colgroup>
              <thead>
                <tr className="border-b border-white/5">
                  <th className="p-8 text-sm font-bold text-zinc-500 uppercase tracking-widest">{t('pricing.comparison.functionality')}</th>
                  <th className="p-8 text-zinc-300 font-bold text-center">FREE</th>
                  <th className="p-8 text-primary font-bold text-center">PRO</th>
                  <th className="p-8 text-zinc-300 font-bold text-center">PRO PLUS</th>
                  <th className="p-8 text-zinc-300 font-bold text-center">BUSINESS</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.categories.map((category) => (
                  <React.Fragment key={category.name}>
                    <tr className="bg-white/2">
                      <td colSpan={5} className="px-8 py-4 text-xs font-black text-primary/80 uppercase tracking-[0.2em]">
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
                              <span className={`text-sm ${value.includes("Próximamente") || value.includes("desarrollo") || value.includes("Coming soon") || value.includes("soon")
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

        {/* Credit Packs */}
        <div className="py-20">
          <div className="max-w-7xl mx-auto bg-zinc-900/30 rounded-[3rem] p-12" style={{ overflow: 'visible' }}>
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">{t('pricing.creditPacks.title')}</h2>
              <p className="text-zinc-500">{t('pricing.creditPacks.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Pack 100 */}
              <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-8 flex flex-col items-center text-center">
                <p className="text-5xl font-black text-white mb-2">$28</p>
                <p className="text-sm text-zinc-500 mb-1">$0.28{t('pricing.creditPacks.pack_suffix')}</p>
                <p className="text-lg font-semibold text-zinc-300 mb-6">+100 credits</p>
                <p className="text-xs text-zinc-600 mb-8">{t('pricing.creditPacks.once')}</p>
                <Link
                  href="/contact"
                  className="inline-flex h-11 w-full items-center justify-center rounded-full px-4 text-sm font-bold border border-zinc-700 bg-white/[0.03] text-white hover:border-zinc-500 hover:bg-white/[0.07] transition-all"
                >
                  {t('pricing.creditPacks.buy')}
                </Link>
              </div>

              {/* Pack 500 */}
              <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-8 flex flex-col items-center text-center">
                <p className="text-5xl font-black text-white mb-2">$130</p>
                <p className="text-sm text-zinc-500 mb-1">$0.26{t('pricing.creditPacks.pack_suffix')}</p>
                <p className="text-lg font-semibold text-zinc-300 mb-6">+500 credits</p>
                <p className="text-xs text-zinc-600 mb-8">{t('pricing.creditPacks.once')}</p>
                <Link
                  href="/contact"
                  className="inline-flex h-11 w-full items-center justify-center rounded-full px-4 text-sm font-bold border border-zinc-700 bg-white/[0.03] text-white hover:border-zinc-500 hover:bg-white/[0.07] transition-all"
                >
                  {t('pricing.creditPacks.buy')}
                </Link>
              </div>

              {/* Pack 2000 */}
              <div className="rounded-2xl border border-primary/20 bg-zinc-900/50 pt-10 pb-8 px-8 flex flex-col items-center text-center relative" style={{ overflow: 'visible' }}>
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 rounded-full bg-primary/10 border border-primary/20 px-3 py-0.5 text-[10px] font-semibold text-primary whitespace-nowrap">
                  {t('pricing.creditPacks.best_value')}
                </div>
                <p className="text-5xl font-black text-white mb-2">$480</p>
                <p className="text-sm text-zinc-500 mb-1">$0.24{t('pricing.creditPacks.pack_suffix')}</p>
                <p className="text-lg font-semibold text-zinc-300 mb-6">+2,000 credits</p>
                <p className="text-xs text-zinc-600 mb-8">{t('pricing.creditPacks.once')}</p>
                <Link
                  href="/contact"
                  className="inline-flex h-11 w-full items-center justify-center rounded-full px-4 text-sm font-bold border border-zinc-700 bg-white/[0.03] text-white hover:border-zinc-500 hover:bg-white/[0.07] transition-all"
                >
                  {t('pricing.creditPacks.buy')}
                </Link>
              </div>
            </div>

            <p className="text-center text-sm text-zinc-600 mt-12">
              {t('pricing.creditPacks.disclaimer')}
            </p>
          </div>
        </div>

        {/* Auto-Scale */}
        <div className="py-20 max-w-4xl mx-auto">
          <div className="bg-zinc-900/20 border border-white/5 rounded-3xl p-8 md:p-12 backdrop-blur">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <span className="material-symbols-outlined text-primary text-sm">rocket_launch</span>
                <span className="text-[10px] font-black tracking-widest uppercase text-primary">{t('pricing.autoScale.badge')}</span>
              </div>

              <h2 className="text-3xl font-bold mb-4">{t('pricing.autoScale.title')}</h2>
              <p className="text-zinc-400 max-w-xl mx-auto text-lg">
                {t('pricing.autoScale.subtitle')}
              </p>
            </div>

            <div className="max-w-2xl mx-auto space-y-6 mb-10">
              <p className="text-zinc-400 leading-relaxed">
                {t('pricing.autoScale.desc1')}
              </p>
              <p className="text-zinc-400 leading-relaxed">
                {t('pricing.autoScale.desc2')}
              </p>
            </div>

            {/* Dashboard Mockup */}
            <div className="max-w-xl mx-auto bg-zinc-950 border border-white/10 rounded-xl p-6 font-mono text-sm space-y-4 mb-10">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-primary"></span>
                <span className="text-primary font-semibold">{t('pricing.autoScale.mockup.status')}</span>
                <span className="text-white">{t('pricing.autoScale.mockup.active')}</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-zinc-400">{t('pricing.autoScale.mockup.included')}</span>
                  <span className="text-white">700 {t('pricing.autoScale.mockup.month')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">{t('pricing.autoScale.mockup.used')}</span>
                  <span className="text-white">643 (92%)</span>
                </div>
                <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: "92%" }}></div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex justify-between">
                  <span className="text-zinc-400">{t('pricing.autoScale.mockup.recharges')}</span>
                  <span className="text-white">{t('pricing.autoScale.mockup.pack')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">{t('pricing.autoScale.mockup.extra')}</span>
                  <span className="text-white">$12.50</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">{t('pricing.autoScale.mockup.cap')}</span>
                  <span className="flex items-center gap-2">
                    <span className="text-white">$200</span>
                    <span className="bg-white/5 px-2 py-0.5 rounded text-xs text-zinc-300 cursor-pointer hover:bg-white/10 transition-colors">{t('pricing.autoScale.mockup.edit')}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-zinc-500 mb-2">{t('pricing.autoScale.footer1')}</p>
              <p className="text-zinc-600 text-sm">{t('pricing.autoScale.footer2')}</p>
            </div>
          </div>
        </div>

        {/* Enterprise */}
        <div className="py-20 max-w-4xl mx-auto">
          <div className="bg-zinc-900/20 border border-white/5 rounded-3xl p-8 md:p-12 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <span className="text-[10px] font-black tracking-widest uppercase text-primary">{t('pricing.enterprise.badge')}</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 mb-6">
              {t('pricing.enterprise.title')}
            </h2>

            <p className="text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed mb-12">
              {t('pricing.enterprise.subtitle')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
              <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-5 text-left">
                <p className="text-2xl font-black text-white mb-1">{t('pricing.enterprise.credits.title')}</p>
                <p className="text-sm text-zinc-500">{t('pricing.enterprise.credits.desc')}</p>
              </div>
              <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-5 text-left">
                <p className="text-2xl font-black text-white mb-1">{t('pricing.enterprise.stores.title')}</p>
                <p className="text-sm text-zinc-500">{t('pricing.enterprise.stores.desc')}</p>
              </div>
              <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-5 text-left">
                <p className="text-2xl font-black text-white mb-1">{t('pricing.enterprise.manager.title')}</p>
                <p className="text-sm text-zinc-500">{t('pricing.enterprise.manager.desc')}</p>
              </div>
              <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-5 text-left">
                <p className="text-2xl font-black text-white mb-1">{t('pricing.enterprise.sla.title')}</p>
                <p className="text-sm text-zinc-500">{t('pricing.enterprise.sla.desc')}</p>
              </div>
              <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-5 text-left">
                <p className="text-2xl font-black text-white mb-1">{t('pricing.enterprise.custom.title')}</p>
                <p className="text-sm text-zinc-500">{t('pricing.enterprise.custom.desc')}</p>
              </div>
              <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-5 text-left">
                <p className="text-2xl font-black text-white mb-1">{t('pricing.enterprise.annual.title')}</p>
                <p className="text-sm text-zinc-500">{t('pricing.enterprise.annual.desc')}</p>
              </div>
            </div>

            <p className="text-2xl font-bold text-white mb-2">{t('pricing.enterprise.price')}</p>
            <p className="text-sm text-zinc-500 mb-8">{t('pricing.enterprise.price_desc')}</p>

            <Link
              href="/contact"
              className="inline-flex h-12 items-center justify-center rounded-full px-8 text-sm font-bold bg-primary text-background-dark shadow-[0_0_24px_rgba(16,183,127,0.22)] hover:bg-emerald-400 transition-all"
            >
              {t('pricing.enterprise.cta')}
            </Link>
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
