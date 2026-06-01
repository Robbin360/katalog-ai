"use client";

import { useI18n } from "@/lib/i18n-context";
import { Brand } from "@/components/ui/brand";
import Link from "next/link";

export const Navbar = () => {
  const { t } = useI18n();


  return (
    <nav className="fixed top-0 z-50 w-full border-b border-border-dark/50 bg-background-dark/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link 
          href="/"
          className="flex items-center cursor-pointer"
          translate="no"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-dark.svg"
            alt="Katalog AI"
            draggable={false}
            translate="no"
            className="h-10 w-auto select-none"
            style={{ objectFit: "contain" }}
          />
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          <Link 
            href="/features"
            className="text-sm font-medium text-slate-400 transition-colors hover:text-white cursor-pointer"
          >
            {t('nav.features') || 'Features'}
          </Link>
          <Link 
            href="/integrations"
            className="text-sm font-medium text-slate-400 transition-colors hover:text-white cursor-pointer"
          >
            {t('nav.how_it_works') || 'Integrations'}
          </Link>
          <Link 
            href="/pricing"
            className="text-sm font-medium text-slate-400 transition-colors hover:text-white cursor-pointer"
          >
            {t('nav.pricing') || 'Precios'}
          </Link>
          <Link 
            href="/faq"
            className="text-sm font-medium text-slate-400 transition-colors hover:text-white cursor-pointer"
          >
            {t('nav.faq') || 'FAQ'}
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login">
            <button className="group relative flex h-9 items-center justify-center overflow-hidden rounded-lg bg-primary px-4 text-sm font-medium text-background-dark transition-all hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,183,127,0.4)]">
              <span className="relative z-10 flex items-center gap-2">
                <span className="capitalize">{t('common.connect_store') || 'connect store'}</span>
                <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-0.5 notranslate" translate="no" lang="zxx">arrow_forward</span>
              </span>
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
};
