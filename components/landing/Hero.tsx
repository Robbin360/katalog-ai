"use client";

import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/lib/i18n-context";

export const Hero = () => {
  const { t } = useI18n();

  return (
    <section className="relative z-10 px-4 pt-20 pb-16 sm:px-6 lg:px-8 lg:pt-32 lg:pb-24 overflow-hidden">

      <div className="mx-auto max-w-4xl text-center">
        <h1 className="bg-gradient-to-b from-white to-slate-400 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-6xl lg:text-7xl leading-tight">
          {t('landing.hero.title') || 'Your Shopify Catalog, Optimized by AI.'}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
          {t('landing.hero.subtitle') || 'Katalog AI audita tu tienda, corrige listings de baja calidad y desbloquea ingresos ocultos mediante procesamiento neuronal avanzado. Deja de adivinar y empieza a escalar.'}
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/signup"
            className="group flex h-14 w-full min-w-[200px] items-center justify-center rounded-lg bg-primary px-8 text-lg font-bold text-background-dark transition-all hover:bg-emerald-400 hover:shadow-[0_0_30px_rgba(16,183,127,0.3)] hover:scale-105 sm:w-auto capitalize text-center"
          >
            {t('landing.hero.cta') || 'connect store'}
          </Link>
        </div>

        {/* Dashboard Preview */}
        <div className="mt-20 relative mx-auto max-w-6xl rounded-2xl border border-white/5 bg-surface-darker/50 p-2 shadow-2xl backdrop-blur-xl">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 blur-[80px] rounded-full pointer-events-none"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/10 blur-[80px] rounded-full pointer-events-none"></div>
          <div className="relative overflow-hidden rounded-xl bg-[#0c0c0e] border border-white/10 shadow-inner">
            <Image
              src="/dashboard-preview.png"
              alt="Katalog AI Dashboard showing Opportunity Radar with KPIs, catalog health metrics, and priority issues table"
              width={1200}
              height={675}
              className="w-full h-auto"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};
