"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n-context";

export const Footer = () => {
  const { t } = useI18n();

  return (
    <footer className="border-t border-border-dark bg-background-dark py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8">
          {/* Logo and Description */}
          <div className="flex flex-col gap-3 max-w-xs">
            <div className="flex items-center gap-2 notranslate" translate="no">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-dark.svg" alt="Katalog AI Logo" className="h-6 w-6 object-contain" />
              <span className="text-sm font-semibold text-white">Katalog AI</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              AI-powered catalog optimization for Shopify.
            </p>
          </div>

          {/* Links Sections */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Product</h3>
              <div className="flex flex-col gap-2">
                <Link className="text-sm text-slate-500 hover:text-white transition-colors" href="/features">
                  Features
                </Link>
                <Link className="text-sm text-slate-500 hover:text-white transition-colors" href="/integrations">
                  Integrations
                </Link>
                <Link className="text-sm text-slate-500 hover:text-white transition-colors" href="/pricing">
                  Pricing
                </Link>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Company</h3>
              <div className="flex flex-col gap-2">
                <Link className="text-sm text-slate-500 hover:text-white transition-colors" href="/about">
                  {t("footer.about") || "About Us"}
                </Link>
                <Link className="text-sm text-slate-500 hover:text-white transition-colors" href="/contact">
                  {t("footer.contact") || "Contact"}
                </Link>
                <Link className="text-sm text-slate-500 hover:text-white transition-colors" href="/faq">
                  FAQ
                </Link>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Legal</h3>
              <div className="flex flex-col gap-2">
                <Link className="text-sm text-slate-500 hover:text-white transition-colors" href="/privacy">
                  {t("footer.privacy") || "Privacy"}
                </Link>
                <Link className="text-sm text-slate-500 hover:text-white transition-colors" href="/terms">
                  {t("footer.terms") || "Terms"}
                </Link>
                <Link className="text-sm text-slate-500 hover:text-white transition-colors" href="/legal">
                  Legal
                </Link>
                <Link className="text-sm text-slate-500 hover:text-white transition-colors" href="/cookies">
                  Cookie Policy
                </Link>
                <Link className="text-sm text-slate-500 hover:text-white transition-colors" href="/gdpr">
                  GDPR
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media Links and Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-white/5">
          <p className="text-sm text-slate-600">
            © {new Date().getFullYear()} {t("footer.copyright") || "Katalog AI. All rights reserved."}
          </p>
        </div>
      </div>
    </footer>
  );
};
