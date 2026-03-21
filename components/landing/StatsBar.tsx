"use client";

import { useI18n } from "@/lib/i18n-context";

export const StatsBar = () => {
  const { t } = useI18n();

  return (
    <section className="border-y border-border-dark bg-surface-darker/50 py-10 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 text-center sm:grid-cols-3">
          <div className="flex flex-col items-center justify-center gap-1">
            <dt className="text-sm font-medium leading-6 text-slate-400 font-display">
              {t('landing.stats.processed') || 'Activos Procesados'}
            </dt>
            <dd className="text-3xl font-bold tracking-tight text-white">50,000+</dd>
          </div>
          <div className="flex flex-col items-center justify-center gap-1">
            <dt className="text-sm font-medium leading-6 text-slate-400 font-display">
              {t('landing.stats.lift') || 'Aumento de Ingresos Prom.'}
            </dt>
            <dd className="text-3xl font-bold tracking-tight text-primary drop-shadow-[0_0_8px_rgba(16,183,127,0.5)]">20%</dd>
          </div>
          <div className="flex flex-col items-center justify-center gap-1">
            <dt className="text-sm font-medium leading-6 text-slate-400 font-display">
              {t('landing.stats.stores') || 'Tiendas Optimizadas'}
            </dt>
            <dd className="text-3xl font-bold tracking-tight text-white">500+</dd>
          </div>
        </div>
      </div>
    </section>
  );
};
