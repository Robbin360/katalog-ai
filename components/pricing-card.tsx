"use client";

import React from "react";
import Link from "next/link";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n-context";

export interface PlanFeature {
  brand: string | null;
  text: string;
  comingSoon?: boolean;
}

interface PricingCardProps {
  id: "free" | "pro" | "business";
  title: string;
  description: string;
  price: string | number;
  priceSuffix?: string;
  monthlyPrice?: string | number;
  annualPrice?: string | number;
  billingCycle?: "monthly" | "annually";
  capacity: string;
  renewal: string;
  highlight?: string;
  features: PlanFeature[];
  current?: boolean;         // Used in Dashboard to indicate user's active plan
  recommended?: boolean;     // Highlights the Pro card
  badge?: string;            // E.g., "Recommended" or "Most Popular"
  actionLabel: string;       // Text for the CTA button
  actionHref?: string;       // Used in marketing pages (Static Link)
  onActionClick?: () => void;// Used in interactive pages (e.g., Stripe payment)
  disabled?: boolean;
  isLoading?: boolean;       // Show spinner on loading checkout
  disableShift?: boolean;    // When true, suppresses the lg:-mt-4 lift on recommended cards (pricing page grid)
  className?: string;
}

export function PricingCard({
  id,
  title,
  description,
  price,
  priceSuffix,
  monthlyPrice,
  annualPrice,
  billingCycle,
  capacity,
  renewal,
  highlight,
  features,
  current = false,
  recommended = false,
  badge,
  actionLabel,
  actionHref,
  onActionClick,
  disabled = false,
  isLoading = false,
  disableShift = false,
  className,
}: PricingCardProps) {
  const { t } = useI18n();

  const isFree = id === "free";

  // Slice features to max 3 visible bullets for the Free plan
  const visibleFeatures = isFree ? features.slice(0, 3) : features;

  const buttonContent = isLoading ? (
    <Loader2 className="size-4 animate-spin" />
  ) : (
    <span className="notranslate">{current ? t('account.billing.current_plan') || "Plan actual" : actionLabel}</span>
  );

  const buttonClasses = id === "business"
    ? "bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-500/20 dark:shadow-[0_0_24px_rgba(16,183,127,0.22)]"
    : id === "pro"
    ? "border border-emerald-500/60 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100/80 dark:border-emerald-400/40 dark:text-emerald-300 dark:bg-transparent dark:hover:bg-emerald-400/10"
    : "border border-zinc-300 bg-zinc-50 text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-white/[0.03] dark:text-white dark:hover:border-zinc-500 dark:hover:bg-white/[0.07]";

  return (
    <div
      className={cn(
        "relative flex h-full flex-col rounded-3xl border bg-white text-zinc-900 shadow-xl backdrop-blur-md transition-all duration-300 dark:bg-zinc-950/70 dark:text-zinc-100 dark:shadow-[0_24px_80px_rgba(0,0,0,0.35)]",
        isFree
          ? "min-h-[500px] p-5 sm:p-6"
          : "min-h-[620px] p-6 sm:p-8",
        id === "business"
          ? "border-emerald-500/50 ring-2 ring-emerald-500/20 shadow-2xl dark:border-emerald-400/30 dark:ring-1 dark:ring-emerald-400/40 dark:shadow-[0_0_50px_-12px_rgba(16,183,127,0.55)] lg:-mt-4 hover:-translate-y-1"
          : "border-zinc-200 hover:border-zinc-300 hover:shadow-2xl dark:border-zinc-800 dark:hover:border-zinc-700 hover:-translate-y-1",
        className
      )}
    >
      {/* Badge spacer — h-7 (28px) reserved for ALL paid plans so prices align vertically. */}
      {!isFree && <div className="h-7" />}

      {/* Absolute Badge */}
      {!isFree && badge && (
        <div
          translate="no"
          className={cn(
            "absolute -top-3 left-1/2 -translate-x-1/2 z-10",
            id === "business"
              ? "rounded-full bg-emerald-500 text-white shadow-[0_2px_12px_rgba(16,183,127,0.35)] px-4 py-1 text-[13px] md:text-[11px] font-bold uppercase leading-5"
              : "rounded-full border border-emerald-500/60 bg-emerald-50 text-emerald-700 dark:bg-zinc-900 dark:text-emerald-400 text-[13px] md:text-[11px] font-bold uppercase tracking-wide px-4 py-1 shadow-sm"
          )}
        >
          {badge}
        </div>
      )}

      {/* Cabecera */}
      <div>
        <h3 translate="no" className="notranslate text-sm font-bold tracking-[0.22em] text-zinc-600 dark:text-zinc-300 uppercase">{title}</h3>
        <div className={cn("flex items-end gap-2", isFree ? "mt-4" : "mt-6")}>
          <span className="text-5xl font-black tracking-tight text-zinc-900 dark:text-white sm:text-6xl" style={{ display: billingCycle !== "annually" ? undefined : "none" }}>
            {monthlyPrice || price}
          </span>
          <span className="text-5xl font-black tracking-tight text-zinc-900 dark:text-white sm:text-6xl" style={{ display: billingCycle === "annually" ? undefined : "none" }}>
            {annualPrice || price}
          </span>
          {id !== "free" && (
            <span className="pb-2 text-sm font-semibold text-zinc-500 dark:text-zinc-500">
              <span style={{ display: billingCycle !== "annually" ? undefined : "none" }}>
                {monthlyPrice ? "/month" : priceSuffix}
              </span>
              <span style={{ display: billingCycle === "annually" ? undefined : "none" }}>
                {annualPrice ? "/year" : priceSuffix}
              </span>
            </span>
          )}
        </div>
        <p className="mt-5 min-h-[48px] text-sm leading-5 text-zinc-600 dark:text-muted-foreground">{description}</p>
      </div>

      {/* Caja de Capacidad */}
      <div className={cn("rounded-2xl border border-zinc-200 bg-zinc-50/80 dark:border-white/10 dark:bg-zinc-900/50", isFree ? "mt-5 p-4" : "mt-8 p-5")}>
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">
          {t("landing.pricing.capacity_label") || "TU CAPACIDAD"}
        </p>
        <p className="mt-3 whitespace-nowrap text-xl font-bold leading-tight text-zinc-900 dark:text-white">{capacity}</p>
        <p className="mt-2 min-h-8 text-xs font-medium leading-4 text-zinc-600 dark:text-muted-foreground">{renewal}</p>
      </div>

      {/* Características */}
      <div className="flex-1 mt-6">
        {highlight && (
          <p className="text-sm italic text-zinc-600 dark:text-zinc-400 mb-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">{highlight}</p>
        )}
        <ul className={cn("text-sm leading-6 text-zinc-700 dark:text-zinc-300", isFree ? "space-y-2" : "space-y-3")} role="list">
          {visibleFeatures.map((feature, index) => (
            <li key={`${feature.brand || feature.text}-${index}`} className="flex gap-3">
              <Check className="mt-1 size-4 shrink-0 text-emerald-600 dark:text-primary" />
              <span>
                {feature.brand ? (
                  <>
                    <span translate="no" className="notranslate font-semibold text-zinc-900 dark:text-white">{feature.brand}</span>
                    {feature.text && <span className="text-zinc-700 dark:text-zinc-300"> {feature.text}</span>}
                  </>
                ) : (
                  <span>{feature.text}</span>
                )}
                {feature.comingSoon && (
                  <span className="ml-2 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    {t("landing.pricing.coming_soon") || "Coming soon"}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Botón */}
      <div className={isFree ? "mt-6" : "mt-8"}>
        {actionHref ? (
          <Link
            href={actionHref}
            className={cn(
              "inline-flex h-11 w-full items-center justify-center rounded-full px-4 text-sm font-bold transition-all",
              buttonClasses
            )}
          >
            {buttonContent}
          </Link>
        ) : (
          <button
            type="button"
            onClick={onActionClick}
            disabled={current || disabled || isLoading || (id !== "free" && !onActionClick)}
            className={cn(
              "inline-flex h-11 w-full items-center justify-center rounded-full px-4 text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-50",
              buttonClasses
            )}
          >
            {buttonContent}
          </button>
        )}
      </div>
    </div>
  );
}
