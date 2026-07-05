"use client";

import { useI18n } from "@/lib/i18n-context";
import Link from "next/link";
import { Footer } from "@/components/landing/Footer";
import { useState } from "react";

export interface FAQItem {
  question: string;
  answer: string;
}

export const FAQAccordion = ({ items, enableSchema = false }: { items: FAQItem[]; enableSchema?: boolean }) => {
  const [openItems, setOpenItems] = useState<Record<number, boolean>>(() => {
    const initial: Record<number, boolean> = {};
    items.forEach((_, idx) => {
      initial[idx] = idx === 0; // index 0 open by default
    });
    return initial;
  });

  const allOpen = items.every((_, idx) => openItems[idx]);

  const handleExpandCollapse = () => {
    const nextState: Record<number, boolean> = {};
    items.forEach((_, idx) => {
      nextState[idx] = !allOpen;
    });
    setOpenItems(nextState);
  };

  const handleToggle = (idx: number) => {
    setOpenItems((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  return (
    <>
      {enableSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": items.map((item) => ({
                "@type": "Question",
                "name": item.question,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": item.answer,
                },
              })),
            }),
          }}
        />
      )}
      <div className="flex justify-end mb-4">
        <button
          type="button"
          onClick={handleExpandCollapse}
          className="text-sm text-slate-400 hover:text-primary transition-colors cursor-pointer"
        >
          {allOpen ? "Collapse all" : "Expand all"}
        </button>
      </div>
      <div className="space-y-4">
        {items.map((item, idx) => (
          <details
            key={idx}
            open={openItems[idx]}
            className="group rounded-xl bg-surface-dark border border-border-dark px-4 py-3 [&_summary::-webkit-details-marker]:hidden"
          >
            <summary
              onClick={(e) => {
                e.preventDefault();
                handleToggle(idx);
              }}
              className="flex cursor-pointer items-center justify-between text-white"
            >
              <h3 className="font-medium text-sm">{item.question}</h3>
              <span className="ml-1.5 flex-shrink-0 rounded-full bg-white/5 p-1 text-white sm:p-1.5 group-open:bg-primary/20 group-open:text-primary transition-colors notranslate" translate="no">
                <span className="material-symbols-outlined group-open:hidden text-lg" translate="no" lang="zxx">add</span>
                <span className="material-symbols-outlined hidden group-open:block text-lg" translate="no" lang="zxx">remove</span>
              </span>
            </summary>
            <p className="mt-2 leading-relaxed text-slate-400 text-sm">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </>
  );
};

export const FAQSection = () => {
  const { t } = useI18n();

  const items = [1, 2, 3, 4].map((i) => ({
    question: t(`landing.faq.q${i}.question`) || "",
    answer: t(`landing.faq.q${i}.answer`) || "",
  }));

  return (
    <>
      <section className="py-24 border-t border-border-dark bg-surface-darker/30" id="faq">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white text-center mb-12">{t('landing.faq.title') || 'Inteligencia, simplificada.'}</h2>
          <FAQAccordion items={items} enableSchema={true} />
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
            <Link
              href="/signup"
              className="flex h-14 min-w-[200px] items-center justify-center rounded-xl bg-primary px-8 text-lg font-bold text-background-dark shadow-[0_0_40px_rgba(16,183,127,0.4)] transition-all hover:scale-105 hover:bg-emerald-400 text-center"
            >
              {t('landing.pricing.plans.starter.cta') || 'Audit my store for free'}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </>
  );
};

