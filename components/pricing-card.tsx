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
  id: "free" | "pro" | "pro-max" | "business";
  title: string;
  description: string;
  price: string | number;
  priceSuffix?: string;
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
  className?: string;
}

export function PricingCard({
  id,
  title,
  description,
  price,
  priceSuffix,
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
  className,
}: PricingCardProps) {
  const { t } = useI18n();

  const isPro = id === "pro" || id === "pro-max";

  const buttonContent = isLoading ? (
    <Loader2 className="size-4 animate-spin" />
  ) : (
    <span className="notranslate">{current ? t('account.billing.current_plan') || "Plan actual" : actionLabel}</span>
  );

  return (
    <div
      className={cn(
        "relative flex h-full min-h-[620px] flex-col rounded-3xl border bg-zinc-950/70 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-md transition-transform hover:-translate-y-1 sm:p-8",
        recommended
          ? "border-primary shadow-[0_0_0_1px_rgba(16,183,127,0.35),0_28px_90px_rgba(16,183,127,0.14)] lg:-mt-4"
          : "border-zinc-800",
        className
      )}
    >
      {recommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-[11px] font-bold uppercase leading-5 text-background-dark shadow-[0_0_24px_rgba(16,183,127,0.35)]">
          {badge || "Recommended"}
        </div>
      )}

      {/* Cabecera */}
      <div>
        <h3 className="notranslate text-sm font-bold tracking-[0.22em] text-zinc-300 uppercase">{title}</h3>
        <div className="mt-6 flex items-end gap-2">
          <span className="text-5xl font-black tracking-tight text-white sm:text-6xl">
            {price}
          </span>
          {id !== "free" && (
            <span className="pb-2 text-sm font-semibold text-zinc-500">
              {priceSuffix}
            </span>
          )}
        </div>
        <p className="mt-5 min-h-[48px] text-sm leading-5 text-muted-foreground">{description}</p>
      </div>

      {/* Caja de Capacidad */}
      <div className="mt-8 rounded-2xl border border-white/10 bg-zinc-900/50 p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-zinc-500">
          {t("landing.pricing.capacity_label") || "TU CAPACIDAD"}
        </p>
        <p className="mt-3 whitespace-nowrap text-xl font-bold leading-tight text-white">{capacity}</p>
        <p className="mt-2 min-h-8 text-xs font-medium leading-4 text-muted-foreground">{renewal}</p>
      </div>

      {/* Características */}
      <div className="flex-1 mt-6">
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
                    <span className="notranslate font-semibold text-white">{feature.brand}</span>
                    {feature.text && <span> {feature.text}</span>}
                  </>
                ) : (
                  <span>{feature.text}</span>
                )}
                {feature.comingSoon && (
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
        {actionHref ? (
          <Link
            href={actionHref}
            className={cn(
              "inline-flex h-11 w-full items-center justify-center rounded-full px-4 text-sm font-bold transition-all",
              isPro
                ? "bg-primary text-background-dark shadow-[0_0_24px_rgba(16,183,127,0.22)] hover:bg-emerald-400"
                : "border border-zinc-700 bg-white/[0.03] text-white hover:border-zinc-500 hover:bg-white/[0.07]"
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
              isPro
                ? "bg-primary text-background-dark shadow-[0_0_24px_rgba(16,183,127,0.22)] hover:bg-emerald-400"
                : "border border-zinc-700 bg-white/[0.03] text-white hover:border-zinc-500 hover:bg-white/[0.07]"
            )}
          >
            {buttonContent}
          </button>
        )}
      </div>
    </div>
  );
}
