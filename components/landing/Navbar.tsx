"use client";

import { useI18n } from "@/lib/i18n-context";
import { Brand } from "@/components/ui/brand";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { ArrowRight, X, Menu } from 'lucide-react'

export const Navbar = () => {
  const { t } = useI18n();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      buttonRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const menu = menuRef.current;
    if (!menu) return;

    const focusableElements = menu.querySelectorAll<HTMLElement>(
      'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleTab);
    return () => window.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-border-dark/50 bg-background-dark/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link 
          href="/"
          className="flex items-center gap-2 cursor-pointer transition-all hover:drop-shadow-[0_0_8px_rgba(16,183,127,0.5)]"
          aria-label="Katalog AI — Home"
          translate="no"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-dark.svg"
            alt=""
            draggable={false}
            translate="no"
            className="h-8 w-8 md:h-10 md:w-10 select-none"
            style={{ objectFit: "contain" }}
            aria-hidden="true"
          />
          <span className="text-base md:text-lg font-bold text-white whitespace-nowrap notranslate" translate="no">
            Katalog <span>AI</span>
          </span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          <Link 
            href="/features"
            className={`text-sm font-medium transition-colors cursor-pointer ${pathname === '/features' ? 'text-white' : 'text-slate-400 hover:text-white'}`}
          >
            {t('nav.features') || 'Features'}
          </Link>
          <Link 
            href="/integrations"
            className={`text-sm font-medium transition-colors cursor-pointer ${pathname === '/integrations' ? 'text-white' : 'text-slate-400 hover:text-white'}`}
          >
            {t('nav.how_it_works') || 'Integrations'}
          </Link>
          <Link 
            href="/pricing"
            className={`text-sm font-medium transition-colors cursor-pointer ${pathname === '/pricing' ? 'text-white' : 'text-slate-400 hover:text-white'}`}
          >
            {t('nav.pricing') || 'Precios'}
          </Link>
          <Link 
            href="/faq"
            className={`text-sm font-medium transition-colors cursor-pointer ${pathname === '/faq' ? 'text-white' : 'text-slate-400 hover:text-white'}`}
          >
            {t('nav.faq') || 'FAQ'}
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/signup"
            className="group relative flex h-9 items-center justify-center overflow-hidden rounded-lg bg-primary px-4 text-sm font-medium text-background-dark transition-all hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,183,127,0.4)]"
          >
            <span className="relative z-10 flex items-center gap-2">
              <span className="capitalize">{t('common.connect_store') || 'start free'}</span>
              <ArrowRight className="text-[18px] transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>

          {/* Mobile menu button */}
          <button
            ref={buttonRef}
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors md:hidden cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? (
              <X className="text-[24px]" />
            ) : (
              <Menu className="text-[24px]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div
          ref={menuRef}
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          id="mobile-menu"
          className="md:hidden fixed top-[64px] left-0 right-0 bottom-0 bg-background-dark/95 backdrop-blur-lg z-40 flex flex-col border-t border-border-dark/50"
        >
          <nav className="flex flex-col p-6 gap-6 h-full">
            <Link
              href="/"
              role="menuitem"
              className="text-xl font-medium text-slate-200 hover:text-white transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/features"
              role="menuitem"
              className="text-xl font-medium text-slate-200 hover:text-white transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {t('nav.features') || 'Features'}
            </Link>
            <Link
              href="/integrations"
              role="menuitem"
              className="text-xl font-medium text-slate-200 hover:text-white transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {t('nav.how_it_works') || 'Integrations'}
            </Link>
            <Link
              href="/pricing"
              role="menuitem"
              className="text-xl font-medium text-slate-200 hover:text-white transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {t('nav.pricing') || 'Precios'}
            </Link>
            <Link
              href="/faq"
              role="menuitem"
              className="text-xl font-medium text-slate-200 hover:text-white transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {t('nav.faq') || 'FAQ'}
            </Link>
            
            <div className="mt-auto pb-8">
              <Link
                href="/signup"
                className="flex h-14 w-full items-center justify-center rounded-xl bg-primary px-8 text-lg font-bold text-background-dark shadow-[0_0_40px_rgba(16,183,127,0.4)] transition-all hover:bg-emerald-400 text-center"
                onClick={() => setIsOpen(false)}
              >
                {t('common.connect_store') || 'Start free'}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </nav>
  );
};
