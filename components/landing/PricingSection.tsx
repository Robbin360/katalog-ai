"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n-context";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PricingCard } from "@/components/pricing-card";
import { PLANS, type PlanId } from "@/lib/pricing-config";

type PlanFeature = {
  brand: string | null;
  text: string;
};

const planMeta: Record<PlanId, {
  descKey: string;
  capacityKey: string;
  renewalKey: string;
  ctaKey: string;
  highlightKey?: string;
  badgeKey?: string;
  priceIdMonthly?: string;
  priceIdAnnual?: string;
  featuresKeys: string[];
  comingSoon: boolean[];
}> = {
  free: {
    descKey: "landing.pricing.plans.starter.desc",
    capacityKey: "landing.pricing.plans.starter.capacity",
    renewalKey: "landing.pricing.plans.starter.renewal",
    ctaKey: "landing.pricing.plans.starter.cta",
    featuresKeys: [
      "landing.pricing.plans.starter.features.item1",
      "landing.pricing.plans.starter.features.item2",
      "landing.pricing.plans.starter.features.item3",
      "landing.pricing.plans.starter.features.item4",
      "landing.pricing.plans.starter.features.item5",
    ],
    comingSoon: [false, false, false, false, false],
  },
  pro: {
    descKey: "landing.pricing.plans.pro.desc",
    capacityKey: "landing.pricing.plans.pro.capacity",
    renewalKey: "landing.pricing.plans.pro.renewal",
    ctaKey: "landing.pricing.plans.pro.cta",
    highlightKey: "landing.pricing.plans.pro.includedFrom",
    badgeKey: "landing.pricing.plans.pro.badge",
    priceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO,
    priceIdAnnual: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_ANNUAL,
    featuresKeys: [
      "landing.pricing.plans.pro.features.item3",
      "landing.pricing.plans.pro.features.item4",
      "landing.pricing.plans.pro.features.item5",
    ],
    comingSoon: [false, false, false],
  },
  business: {
    descKey: "landing.pricing.plans.enterprise.desc",
    capacityKey: "landing.pricing.plans.enterprise.capacity",
    renewalKey: "landing.pricing.plans.enterprise.renewal",
    ctaKey: "landing.pricing.plans.enterprise.cta",
    highlightKey: "landing.pricing.plans.enterprise.includedFrom",
    badgeKey: "landing.pricing.plans.enterprise.badge",
    priceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_BUSINESS,
    priceIdAnnual: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_BUSINESS_ANNUAL,
    featuresKeys: [
      "landing.pricing.plans.enterprise.features.item3",
      "landing.pricing.plans.enterprise.features.item4",
      "landing.pricing.plans.enterprise.features.item5",
      "landing.pricing.plans.enterprise.features.item6",
    ],
    comingSoon: [false, false, false, false],
  },
};

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
              {t("landing.pricing.toggle.save") || "Save 17% (2 months free)"}
            </span>
          </span>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-3">
          {PLANS.map((plan) => {
            const meta = planMeta[plan.id];
            const priceId = isAnnual ? meta.priceIdAnnual : meta.priceIdMonthly;
            const features = plan.features.map((f, i) => ({
              brand: null,
              text: t(meta.featuresKeys[i]) || f,
              comingSoon: meta.comingSoon?.[i],
            }));

            return (
              <PricingCard
                key={plan.id}
                id={plan.id}
                title={plan.name}
                description={translate(meta.descKey, plan.description)}
                price={isAnnual ? plan.annualPrice : plan.monthlyPrice}
                priceSuffix={isAnnual ? t('pricing.billing.suffix_year') : t('pricing.billing.suffix_month')}
                monthlyPrice={plan.monthlyPrice}
                annualPrice={plan.annualPrice}
                billingCycle={isAnnual ? "annually" : "monthly"}
                capacity={translate(meta.capacityKey, plan.capacity)}
                renewal={translate(meta.renewalKey, plan.renewal)}
                highlight={meta.highlightKey ? translate(meta.highlightKey, plan.highlight) : undefined}
                features={features}
                recommended={plan.id === "pro"}
                badge={meta.badgeKey ? t(meta.badgeKey) : plan.badge}
                actionLabel={translate(meta.ctaKey, plan.cta)}
                actionHref="/signup"
                onActionClick={undefined}
                disabled={false}
                isLoading={false}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};
