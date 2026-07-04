"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n-context";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PricingCard } from "@/components/pricing-card";

type PlanFeature = {
  brand: string | null;
  text: string;
};

type PricingPlan = {
  id: "free" | "pro" | "pro-max" | "business";
  name: string;
  descKey: string;
  capacityKey: string;
  renewalKey: string;
  ctaKey: string;
  highlightKey?: string;
  description: string;
  monthlyPrice?: string;
  annualPrice?: string;
  capacity: string;
  renewal: string;
  cta: string;
  badge?: string;
  badgeKey?: string;
  highlight?: string;
  priceIdMonthly?: string;
  priceIdAnnual?: string;
  features: PlanFeature[];
  featuresKeys: string[];
  comingSoon?: boolean[];
};

const plans: PricingPlan[] = [
  {
    id: "free",
    name: "FREE",
    descKey: "landing.pricing.plans.starter.desc",
    capacityKey: "landing.pricing.plans.starter.capacity",
    renewalKey: "landing.pricing.plans.starter.renewal",
    ctaKey: "landing.pricing.plans.starter.cta",
    description: "Discover your revenue at risk. No credit card.",
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
  },
  {
    id: "pro",
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
    badgeKey: "landing.pricing.plans.pro.badge",
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
  },
  {
    id: "pro-max",
    name: "PRO PLUS",
    descKey: "landing.pricing.plans.proMax.desc",
    capacityKey: "landing.pricing.plans.proMax.capacity",
    renewalKey: "landing.pricing.plans.proMax.renewal",
    ctaKey: "landing.pricing.plans.proMax.cta",
    description: "For individual merchants looking to grow their business.",
    monthlyPrice: "$139",
    annualPrice: "$1,499",
    capacity: "250 Credits",
    renewal: "Renews every month.",
    cta: "Activate PRO PLUS →",
    highlight: "↳ Everything in Pro, plus:",
    highlightKey: "landing.pricing.plans.proMax.includedFrom",
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
  },
  {
    id: "business",
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
    badgeKey: "landing.pricing.plans.enterprise.badge",
    highlight: "↳ Everything in Pro Plus, plus:",
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
  },
];

export const PricingSection = () => {
  const { t } = useI18n();
  const router = useRouter();
  const [isCheckoutLoading, setIsCheckoutLoading] = useState<string | null>(null);
  const [isAnnual, setIsAnnual] = useState(false);

  const translate = (key: string, fallback: string) => t(key) ?? fallback;

  const handleUpgrade = async (priceId: string) => {
    setIsCheckoutLoading(priceId);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Payment processing error");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Could not start checkout");
      }
    } catch {
      toast.error("Connection error. Try again.");
    } finally {
      setIsCheckoutLoading(null);
    }
  };

  return (
    <section className="relative z-10 py-24" id="pricing">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {t("landing.pricing.title") || "Clear Pricing Plans"}
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            {t("landing.pricing.subtitle") || "Choose the plan that best fits your catalog size."}
          </p>
        </div>

        <div className="mb-12 flex items-center justify-center gap-4">
          <span className={cn("text-sm font-semibold transition-colors", !isAnnual ? "text-white" : "text-slate-400")}>
            {t("landing.pricing.toggle.monthly") || "Monthly Billing"}
          </span>
          <button
            type="button"
            aria-pressed={isAnnual}
            onClick={() => setIsAnnual(!isAnnual)}
            className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background-dark"
          >
            <span
              className={cn(
                "inline-block size-4 rounded-full bg-primary transition-transform",
                isAnnual ? "translate-x-6" : "translate-x-1"
              )}
            />
          </button>
          <span className={cn("flex items-center gap-1.5 text-sm font-semibold transition-colors", isAnnual ? "text-white" : "text-slate-400")}>
            {t("landing.pricing.toggle.annual") || "Annual Billing"}
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-primary">
              {t("landing.pricing.toggle.save") || "Save 10%"}
            </span>
          </span>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-4">
          {plans.map((plan) => {
            const priceId = isAnnual ? plan.priceIdAnnual : plan.priceIdMonthly;
            const features = plan.features.map((f, i) => ({
              brand: f.brand,
              text: t(plan.featuresKeys[i]) || f.text,
              comingSoon: plan.comingSoon?.[i],
            }));

            return (
              <PricingCard
                key={plan.id}
                id={plan.id}
                title={plan.name}
                description={translate(plan.descKey, plan.description)}
                price={isAnnual ? (plan.annualPrice || "$0") : (plan.monthlyPrice || "$0")}
                priceSuffix={isAnnual ? "/año" : "/mes"}
                capacity={translate(plan.capacityKey, plan.capacity)}
                renewal={translate(plan.renewalKey, plan.renewal)}
                highlight={plan.highlightKey ? translate(plan.highlightKey, plan.highlight || "") : undefined}
                features={features}
                recommended={plan.id === "pro"}
                badge={plan.badgeKey ? t(plan.badgeKey) : plan.badge}
                actionLabel={translate(plan.ctaKey, plan.cta)}
                actionHref={plan.id === "free" ? "/signup" : undefined}
                onActionClick={plan.id !== "free" ? () => handleUpgrade(priceId || "") : undefined}
                disabled={plan.id !== "free" && !priceId}
                isLoading={isCheckoutLoading === priceId}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};
