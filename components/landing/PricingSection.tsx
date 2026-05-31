"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n-context";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const PricingSection = () => {
  const { t } = useI18n();
  const router = useRouter();
  const [isCheckoutLoading, setIsCheckoutLoading] = useState<string | null>(null);
  const [isAnnual, setIsAnnual] = useState(false);

  const handleUpgrade = async (priceId: string) => {
    setIsCheckoutLoading(priceId);
    try {
      // Verificamos si hay sesión activa antes de intentar checkout
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Si no hay sesión, redirigir al login con returnTo para volver después
        router.push('/login');
        return;
      }

      // Usuario autenticado → crear sesión de Stripe Checkout
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Error al procesar el pago');
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error('No se pudo iniciar el checkout');
      }
    } catch (error) {
      toast.error('Error de conexión. Intenta de nuevo.');
    } finally {
      setIsCheckoutLoading(null);
    }
  };

  return (
    <section className="py-24 relative z-10" id="pricing">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{t('landing.pricing.title') || 'Planes de Precios Claros'}</h2>
          <p className="mt-4 text-lg text-slate-400">{t('landing.pricing.subtitle') || 'Elige el plan que mejor se adapte al tamaño de tu catálogo.'}</p>
        </div>
        {/* Toggle Mensual/Anual */}
        <div className="flex justify-center items-center gap-4 mb-12">
          <span className={`text-sm font-semibold transition-colors ${!isAnnual ? "text-white" : "text-slate-400"}`}>
            Facturación Mensual
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background-dark"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-primary transition-transform ${
                isAnnual ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <span className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${isAnnual ? "text-white" : "text-slate-400"}`}>
            Facturación Anual
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-primary">Ahorra 10%</span>
          </span>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-8 items-start">
          {/* Free Plan */}
          <div className="rounded-3xl border border-border-dark bg-surface-dark/40 p-8 backdrop-blur-md transition-transform hover:-translate-y-1">
            <h3 className="text-lg font-semibold leading-8 text-white">{t('landing.pricing.plans.starter.name') || 'Free'}</h3>
            <p className="mt-4 text-sm leading-6 text-slate-400">{t('landing.pricing.plans.starter.desc') || 'Empieza a optimizar tu catálogo sin costo.'}</p>
            <p className="mt-6 flex items-baseline gap-x-1">
              <span className="text-4xl font-bold tracking-tight text-white">$0</span>
              <span className="text-sm font-semibold leading-6 text-slate-400">{isAnnual ? "/año" : "/mes"}</span>
            </p>
            <button
              onClick={() => router.push('/signup')}
              className="mt-6 block w-full rounded-md border border-border-dark bg-white/5 py-2 px-3 text-center text-sm font-semibold leading-6 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {t('landing.pricing.plans.starter.cta') || 'Comenzar Gratis'}
            </button>
            <ul className="mt-8 space-y-3 text-sm leading-6 text-slate-300" role="list">
              <li className="flex gap-x-3"><span className="material-symbols-outlined text-primary text-sm notranslate" translate="no" lang="zxx">check</span> {t('landing.pricing.plans.starter.features.item1') || 'Hasta 1,000 productos'}</li>
              <li className="flex gap-x-3"><span className="material-symbols-outlined text-primary text-sm notranslate" translate="no" lang="zxx">check</span> {t('landing.pricing.plans.starter.features.item2') || 'Auditoría Visual básica'}</li>
              <li className="flex gap-x-3"><span className="material-symbols-outlined text-primary text-sm notranslate" translate="no" lang="zxx">check</span> {t('landing.pricing.plans.starter.features.item3') || 'Sincronización semanal'}</li>
            </ul>
          </div>

          {/* Pro Plan */}
          <div className="relative rounded-3xl border-2 border-primary bg-surface-dark/80 p-8 shadow-[0_0_40px_rgba(16,183,127,0.15)] backdrop-blur-xl transition-transform hover:-translate-y-1 lg:-mt-4 lg:mb-4 lg:p-10 pricing-glow">
            <div className="absolute -top-5 left-0 right-0 mx-auto w-32 rounded-full bg-primary px-3 py-1 text-center text-xs font-semibold text-background-dark shadow-lg">{t('landing.pricing.plans.pro.badge') || 'Más Popular'}</div>
            <h3 className="text-lg font-semibold leading-8 text-white">{t('landing.pricing.plans.pro.name') || 'Pro'}</h3>
            <p className="mt-4 text-sm leading-6 text-slate-400">{t('landing.pricing.plans.pro.desc') || 'Para marcas en crecimiento que buscan automatización total.'}</p>
            <p className="mt-6 flex items-baseline gap-x-1">
              <span className="text-5xl font-bold tracking-tight text-white">{isAnnual ? "$539" : "$49"}</span>
              <span className="text-sm font-semibold leading-6 text-slate-400">{isAnnual ? "/año" : "/mes"}</span>
            </p>
            <button
              onClick={() => handleUpgrade(isAnnual ? (process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_ANNUAL || '') : (process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO || ''))}
              disabled={!!isCheckoutLoading}
              className="mt-6 block w-full rounded-md bg-primary py-2.5 px-3 text-center text-sm font-semibold leading-6 text-background-dark shadow-sm hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isCheckoutLoading === (isAnnual ? process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_ANNUAL : process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO) ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Procesando...
                </span>
              ) : (
                t('landing.pricing.plans.pro.cta') || 'Prueba Gratuita'
              )}
            </button>
            <ul className="mt-8 space-y-3 text-sm leading-6 text-slate-300" role="list">
              <li className="flex gap-x-3"><span className="material-symbols-outlined text-primary text-sm notranslate" translate="no" lang="zxx">check</span> {t('landing.pricing.plans.pro.features.item1') || 'Hasta 10,000 productos'}</li>
              <li className="flex gap-x-3"><span className="material-symbols-outlined text-primary text-sm notranslate" translate="no" lang="zxx">check</span> {t('landing.pricing.plans.pro.features.item2') || 'Escritura IA Ilimitada'}</li>
              <li className="flex gap-x-3"><span className="material-symbols-outlined text-primary text-sm notranslate" translate="no" lang="zxx">check</span> {t('landing.pricing.plans.pro.features.item3') || 'Revenue at Risk Dashboard'}</li>
              <li className="flex gap-x-3"><span className="material-symbols-outlined text-primary text-sm notranslate" translate="no" lang="zxx">check</span> {t('landing.pricing.plans.pro.features.item4') || 'Auto-sync diario'}</li>
            </ul>
          </div>

          {/* Enterprise Plan */}
          <div className="rounded-3xl border border-border-dark bg-surface-dark/40 p-8 backdrop-blur-md transition-transform hover:-translate-y-1">
            <h3 className="text-lg font-semibold leading-8 text-white">{t('landing.pricing.plans.enterprise.name') || 'Enterprise'}</h3>
            <p className="mt-4 text-sm leading-6 text-slate-400">{t('landing.pricing.plans.enterprise.desc') || 'Soluciones personalizadas para volúmenes masivos.'}</p>
            <p className="mt-6 flex items-baseline gap-x-1">
              <span className="text-4xl font-bold tracking-tight text-white">{isAnnual ? "$1,089" : "$99"}</span>
              <span className="text-sm font-semibold leading-6 text-slate-400">{isAnnual ? "/año" : "/mes"}</span>
            </p>
            <button
              onClick={() => handleUpgrade(isAnnual ? (process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_BUSINESS_ANNUAL || '') : (process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_BUSINESS || ''))}
              disabled={!!isCheckoutLoading}
              className="mt-6 block w-full rounded-md border border-border-dark bg-white/5 py-2 px-3 text-center text-sm font-semibold leading-6 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isCheckoutLoading === (isAnnual ? process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_BUSINESS_ANNUAL : process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_BUSINESS) ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Procesando...
                </span>
              ) : (
                t('landing.pricing.plans.enterprise.cta') || 'Contactar Ventas'
              )}
            </button>
            <ul className="mt-8 space-y-3 text-sm leading-6 text-slate-300" role="list">
              <li className="flex gap-x-3"><span className="material-symbols-outlined text-primary text-sm notranslate" translate="no" lang="zxx">check</span> {t('landing.pricing.plans.enterprise.features.item1') || 'Productos ilimitados'}</li>
              <li className="flex gap-x-3"><span className="material-symbols-outlined text-primary text-sm notranslate" translate="no" lang="zxx">check</span> {t('landing.pricing.plans.enterprise.features.item2') || 'Modelos de IA personalizados'}</li>
              <li className="flex gap-x-3"><span className="material-symbols-outlined text-primary text-sm notranslate" translate="no" lang="zxx">check</span> {t('landing.pricing.plans.enterprise.features.item3') || 'Manager de éxito dedicado'}</li>
              <li className="flex gap-x-3"><span className="material-symbols-outlined text-primary text-sm notranslate" translate="no" lang="zxx">check</span> {t('landing.pricing.plans.enterprise.features.item4') || 'Acceso vía API'}</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
