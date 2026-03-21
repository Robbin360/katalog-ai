"use client";

import { useI18n } from "@/lib/i18n-context";
import Link from "next/link";

export const FAQSection = () => {
  const { t } = useI18n();

  return (
    <>
      <section className="py-24 border-t border-border-dark bg-surface-darker/30" id="faq">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white text-center mb-12">{t('landing.faq.title') || 'Inteligencia, simplificada.'}</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <details key={i} className="group rounded-xl bg-surface-dark border border-border-dark px-4 py-3 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between text-white">
                  <h3 className="font-medium text-sm">{t(`landing.faq.q${i}.question`)}</h3>
                  <span className="ml-1.5 flex-shrink-0 rounded-full bg-white/5 p-1 text-white sm:p-1.5 group-open:bg-primary/20 group-open:text-primary transition-colors notranslate" translate="no">
                    <span className="material-symbols-outlined group-open:hidden text-lg" translate="no" lang="zxx">add</span>
                    <span className="material-symbols-outlined hidden group-open:block text-lg" translate="no" lang="zxx">remove</span>
                  </span>
                </summary>
                <p className="mt-2 leading-relaxed text-slate-400 text-sm">
                  {t(`landing.faq.q${i}.answer`)}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Hero CTA Final */}
      <section className="relative py-24 px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none"></div>
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl bg-surface-dark border border-border-dark px-6 py-16 text-center shadow-2xl sm:px-16 lg:py-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/20 blur-[100px] rounded-full pointer-events-none"></div>
          <h2 className="relative z-10 text-3xl font-bold tracking-tight text-white sm:text-4xl">{t('landing.final_cta.title') || '¿Listo para reparar tu catálogo?'}</h2>
          <p className="relative z-10 mx-auto mt-6 max-w-xl text-lg text-slate-300">{t('landing.final_cta.subtitle') || 'Únete a cientos de comerciantes de Shopify que ya optimizan sus ingresos con honestidad y precisión.'}</p>
          <div className="relative z-10 mt-10 flex justify-center">
            <Link href="/login">
              <button className="flex h-14 min-w-[200px] items-center justify-center rounded-xl bg-primary px-8 text-lg font-bold text-background-dark shadow-[0_0_40px_rgba(16,183,127,0.4)] transition-all hover:scale-105 hover:bg-emerald-400">
                {t('landing.final_cta.cta') || 'Prueba Gratuita'}
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Integrated Footer from Stitch */}
      <footer className="border-t border-border-dark bg-background-dark py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 notranslate" translate="no">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/20 text-primary">
              <span className="material-symbols-outlined text-sm" translate="no" lang="zxx">auto_awesome</span>
            </div>
            <span className="text-sm font-semibold text-white">Katalog AI</span>
          </div>
          <div className="flex gap-8">
            <a className="text-sm text-slate-500 hover:text-white transition-colors" href="#">{t('footer.privacy') || 'Privacidad'}</a>
            <a className="text-sm text-slate-500 hover:text-white transition-colors" href="#">{t('footer.terms') || 'Términos'}</a>
            <a className="text-sm text-slate-500 hover:text-white transition-colors" href="#">{t('footer.support') || 'Soporte'}</a>
          </div>
          <p className="text-sm text-slate-600">{t('footer.copyright') || '© 2024 Katalog AI. Todos los derechos reservados.'}</p>
        </div>
      </footer>
    </>
  );
};
