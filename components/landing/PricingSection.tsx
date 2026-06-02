"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n-context";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type PlanFeature = {
  brand: string | null;
  text: string;
};

type PricingPlan = {
  id: "free" | "pro" | "business";
  name: string;
  descKey: string;
  capacityKey: string;
  renewalKey: string;
  ctaKey: string;
  highlightKey?: string;
  description: string;
  capacity: string;
  renewal: string;
  cta: string;
  badge?: string;
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
  },
] as any[]; // Use any[] or let TypeScript infer because of price properties on some plans only

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

        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-3">
          {plans.map((plan) => {
            const isPro = plan.id === "pro";
            const priceId = isAnnual ? plan.priceIdAnnual : plan.priceIdMonthly;
            const isLoading = isCheckoutLoading === priceId;

            const planName = plan.name;
            const planDesc = translate(plan.descKey, plan.description);
            const planCapacity = translate(plan.capacityKey, plan.capacity);
            const planRenewal = translate(plan.renewalKey, plan.renewal);
            const planCta = translate(plan.ctaKey, plan.cta);
            const highlight = plan.highlightKey ? translate(plan.highlightKey, plan.highlight || "") : undefined;
            const features = plan.features.map((f, i) => ({
              brand: f.brand,
              text: t(plan.featuresKeys[i]) || f.text,
            }));

            return (
              <div
                key={plan.id}
                className={cn(
                  "relative flex h-full min-h-[620px] flex-col rounded-3xl border bg-zinc-950/70 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-md transition-transform hover:-translate-y-1 sm:p-8",
                  isPro
                    ? "border-primary shadow-[0_0_0_1px_rgba(16,183,127,0.35),0_28px_90px_rgba(16,183,127,0.14)] lg:-mt-4"
                    : "border-zinc-800"
                )}
              >
                {isPro && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-[11px] font-bold uppercase leading-5 text-background-dark shadow-[0_0_24px_rgba(16,183,127,0.35)]">
                    {t("landing.pricing.plans.pro.badge") || plan.badge}
                  </div>
                )}

                {/* Cabecera */}
                <div>
                  <h3 className="notranslate text-sm font-bold tracking-[0.22em] text-zinc-300">{planName}</h3>
                  <div className="mt-6 flex items-end gap-2">
                    <span className="text-5xl font-black tracking-tight text-white sm:text-6xl">
                      {isAnnual ? (plan.annualPrice || "$0") : (plan.monthlyPrice || "$0")}
                    </span>
                    <span className="pb-2 text-sm font-semibold text-zinc-500">
                      {isAnnual && plan.id !== "free" ? "/año" : "/mes"}
                    </span>
                  </div>
                  <p className="mt-5 min-h-[48px] text-sm leading-5 text-muted-foreground">{planDesc}</p>
                </div>

                {/* Caja Gris */}
                <div className="mt-8 rounded-2xl border border-white/10 bg-zinc-900/50 p-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-zinc-500">{t("landing.pricing.capacity_label") || "TU CAPACIDAD"}</p>
                  <p className="mt-3 whitespace-nowrap text-xl font-bold leading-tight text-white">{planCapacity}</p>
                  <p className="mt-2 min-h-8 text-xs font-medium leading-4 text-muted-foreground">{planRenewal}</p>
                </div>

                {/* Contenedor de viñetas que se expande */}
                <div className="flex-1 mt-6">
                  {/* Highlight sin check */}
                  {highlight && (
                    <p className="text-sm italic text-zinc-400 mb-4 pb-2 border-b border-zinc-800">{highlight}</p>
                  )}
                  <ul className="space-y-3 text-sm leading-6 text-zinc-300" role="list">
                    {features.map((feature, index) => (
                      <li key={`${feature.brand || feature.text}-${index}`} className="flex gap-3">
                        <Check className="mt-1 size-4 shrink-0 text-primary" />
                        <span>
                          {feature.brand ? (
                            <>
                              <span className="notranslate">{feature.brand}</span>
                              {feature.text && <span> {feature.text}</span>}
                            </>
                          ) : (
                            <span>{feature.text}</span>
                          )}
                          {plan.comingSoon?.[index] && (
                            <span className="ml-2 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                              {t("landing.pricing.coming_soon") || "Coming soon"}
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Botón */}
                <div className="mt-8">
                  <button
                    type="button"
                    onClick={() => (plan.id === "free" ? router.push("/signup") : handleUpgrade(priceId || ""))}
                    disabled={plan.id !== "free" && (!priceId || !!isCheckoutLoading)}
                    className={cn(
                      "inline-flex h-11 w-full items-center justify-center rounded-md px-4 text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-50",
                      isPro
                        ? "bg-primary text-background-dark shadow-[0_0_24px_rgba(16,183,127,0.22)] hover:bg-emerald-400"
                        : "border border-zinc-700 bg-white/[0.03] text-white hover:border-zinc-500 hover:bg-white/[0.07]"
                    )}
                  >
                    {isLoading ? <Loader2 className="size-4 animate-spin" /> : planCta}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
