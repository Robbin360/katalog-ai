"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n-context";

export const Footer = () => {
  const { t } = useI18n();

  return (
    <footer className="border-t border-border-dark bg-background-dark py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Logo */}
        <div className="flex items-center gap-2 notranslate" translate="no">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-dark.svg" alt="Katalog AI Logo" className="h-6 w-6 object-contain" />
          <span className="text-sm font-semibold text-white">Katalog AI</span>
        </div>

        {/* Links */}
        <div className="flex gap-8">
          <Link className="text-sm text-slate-500 hover:text-white transition-colors" href="/privacy">
            {t("footer.privacy") || "Privacy"}
          </Link>
          <Link className="text-sm text-slate-500 hover:text-white transition-colors" href="/terms">
            {t("footer.terms") || "Terms"}
          </Link>
          <a className="text-sm text-slate-500 hover:text-white transition-colors" href="#">
            {t("footer.support") || "Support"}
          </a>
        </div>

        {/* Copyright */}
        <p className="text-sm text-slate-600">
          © {new Date().getFullYear()} {t("footer.copyright") || "Katalog AI. All rights reserved."}
        </p>
      </div>
    </footer>
  );
};
