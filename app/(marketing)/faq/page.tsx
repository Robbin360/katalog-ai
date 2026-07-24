"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
    Search,
    ChevronDown,
    MessageCircle,
    Zap,
    ShieldCheck,
    Globe,
    CreditCard,
    MessageSquare,
    Sparkles
} from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { useI18n } from "@/lib/i18n-context";

type FAQItem = {
    question: string;
    answer: string;
    category: string;
};

const FAQPage = () => {
    const { t, Trans, locale } = useI18n();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    useEffect(() => {
        document.title = "FAQ | Katalog AI — Shopify Catalog Optimization";
        const meta = document.querySelector('meta[name="description"]');
        if (meta) meta.setAttribute('content', 'Get answers about Katalog AI: how AI catalog optimization works, supported platforms, pricing plans, Shopify integration, and store connection process.');
        const link = document.querySelector('link[rel="canonical"]') || document.createElement('link');
        link.rel = 'canonical'; link.href = '/faq';
        document.head.appendChild(link);
        const robots = document.querySelector('meta[name="robots"]') || document.createElement('meta');
        robots.name = 'robots'; robots.content = 'index, follow';
        document.head.appendChild(robots);
    }, []);

    const CATEGORIES = ["all", "general", "ia", "integrations", "plans"];

    const FAQ_DATA: FAQItem[] = useMemo(() => {
        const items = [];
        // Tenemos 11 items definidos en los JSON
        for (let i = 0; i < 11; i++) {
            items.push({
                category: t(`faq.items.${i}.category`),
                question: t(`faq.items.${i}.question`),
                answer: t(`faq.items.${i}.answer`)
            });
        }
        return items;
    }, [t, locale]);

    function extractText(value: unknown): string {
      if (typeof value === 'string') return value;
      if (typeof value === 'number') return String(value);
      if (Array.isArray(value)) return value.map(extractText).join(' ');
      if (value && typeof value === 'object' && 'props' in value) {
        return extractText((value as any).props?.children);
      }
      return '';
    }

    const filteredFaqs = useMemo(() => {
        const itemsWithIndex = FAQ_DATA.map((item, originalIndex) => ({ ...item, originalIndex }));

        let filtered = itemsWithIndex;

        if (activeCategory !== 'all') {
            const categoryLabel = t(`faq.categories.${activeCategory}`);
            filtered = filtered.filter(item => item.category === categoryLabel);
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(item => {
                const searchText = `${extractText(item.question)} ${extractText(item.answer)}`.toLowerCase();
                return searchText.includes(q);
            });
        }

        return filtered;
    }, [searchQuery, activeCategory, FAQ_DATA, t]);

    const faqJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: FAQ_DATA.map(item => ({
            '@type': 'Question',
            name: extractText(item.question),
            acceptedAnswer: {
                '@type': 'Answer',
                text: extractText(item.answer),
            },
        })),
    };

    return (
    <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="min-h-screen bg-[#09090b] text-white pt-32 pb-20 px-4">
            {/* Background Decorative Glow */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[10%] w-[600px] h-[600px] bg-primary/20 blur-[130px] rounded-full"></div>
                <div className="absolute bottom-[-5%] right-[5%] w-[400px] h-[400px] bg-emerald-900/10 blur-[100px] rounded-full"></div>
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Header Section */}
                <div className="text-center mb-16 space-y-6">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                        {t('faq.title')} <span className="text-primary italic">{t('faq.highlight')}</span>
                    </h1>
                    <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                        {t('faq.subtitle')}
                    </p>

                    {/* Search Bar */}
                    <div className="relative mt-12 max-w-xl mx-auto group">
                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                            <Search className="text-zinc-500 group-focus-within:text-primary transition-colors" size={20} />
                        </div>
                        <input
                            type="text"
                            placeholder={t('faq.search_placeholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-zinc-900/40 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 backdrop-blur-xl transition-all"
                        />
                        <div className="absolute right-5 inset-y-0 flex items-center pointer-events-none">
                            <span className="text-[10px] font-mono text-zinc-700 border border-zinc-800 px-1.5 py-0.5 rounded leading-none uppercase">Ctrl K</span>
                        </div>
                    </div>

                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{
                            __html: JSON.stringify(faqJsonLd).replace(/</g, '\\u003c').replace(/>/g, '\\u003e'),
                        }}
                    />
                </div>

                {/* Categories Tabs */}
                <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${activeCategory === cat
                                ? "bg-primary text-black"
                                : "bg-zinc-900/50 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-white/5"
                                }`}
                        >
                            {t(`faq.categories.${cat}`)}
                        </button>
                    ))}
                </div>

                {/* FAQ List (Accordion) */}
                <div className="space-y-4 min-h-[400px]">
                    {filteredFaqs.length > 0 ? (
                        filteredFaqs.map((faq, idx) => {
                            const isOpen = openIndex === faq.originalIndex;
                            return (
                                <div
                                    key={`faq-${faq.originalIndex}`}
                                    className={`group rounded-2xl border transition-all duration-300 ${isOpen
                                        ? "bg-zinc-900/60 border-primary/30 shadow-[0_4px_20px_-10px_rgba(16,183,127,0.1)]"
                                        : "bg-zinc-900/30 border-white/5 hover:border-white/10"
                                        }`}
                                >
                                    <button
                                        onClick={() => setOpenIndex(isOpen ? null : faq.originalIndex)}
                                        className="w-full flex items-center justify-between p-6 text-left"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-lg transition-colors ${isOpen ? "bg-primary/10 text-primary" : "bg-zinc-800/50 text-zinc-500"}`}>
                                                {faq.category === t('faq.categories.general') && <Globe size={18} />}
                                                {faq.category === t('faq.categories.ia') && <Sparkles size={18} />}
                                                {faq.category === t('faq.categories.integrations') && <ShieldCheck size={18} />}
                                                {faq.category === t('faq.categories.plans') && <CreditCard size={18} />}
                                            </div>
                                            <Trans i18nKey={`faq.items.${faq.originalIndex}.question`} className={`font-semibold text-lg transition-colors ${isOpen ? "text-white" : "text-zinc-300"}`} />
                                        </div>
                                        <ChevronDown
                                            className={`text-zinc-500 transition-transform duration-300 ${isOpen ? "rotate-180 text-primary" : ""}`}
                                            size={20}
                                        />
                                    </button>
                                    <div
                                        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                                            }`}
                                    >
                                        <div className="px-6 pb-6 pt-0 ml-14">
                                            <Trans i18nKey={`faq.items.${faq.originalIndex}.answer`} className="text-zinc-400 leading-relaxed text-base block" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-20 bg-zinc-900/20 rounded-3xl border border-dashed border-white/5">
                            <div className="inline-flex p-4 rounded-full bg-zinc-800/50 text-zinc-500 mb-4">
                                <Search size={32} />
                            </div>
                            <h3 className="text-xl font-medium text-white">{t('faq.no_results')}</h3>
                            <p className="text-zinc-500 mt-2">{t('faq.no_results_sub')}</p>
                            <button
                                onClick={() => { setSearchQuery(""); setActiveCategory("all"); }}
                                className="mt-6 text-primary hover:underline underline-offset-4 text-sm font-medium"
                            >
                                {t('faq.clear_filters')}
                            </button>
                        </div>
                    )}
                </div>

                {/* Suggestions Section */}
                <div className="mt-32 relative group">
                    <div className="absolute inset-0 bg-primary/10 blur-3xl opacity-0 group-hover:opacity-50 transition-opacity duration-700 rounded-full scale-75"></div>
                    <div className="relative p-10 md:p-14 rounded-[3rem] bg-zinc-900/40 border border-white/5 backdrop-blur-3xl text-center space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                            <Zap size={12} fill="currentColor" /> {t('faq.suggestions.label')}
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                            {t('faq.suggestions.title_pre')} <span className="text-primary">{t('faq.suggestions.title_highlight')}</span>{t('faq.suggestions.title_post')}
                        </h2>
                        <p className="text-zinc-400 text-lg max-w-xl mx-auto">
                            {t('faq.suggestions.desc')}
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <Link
                                href="mailto:support@katalog.ai"
                                className="w-full sm:w-auto px-10 py-4 bg-primary text-black font-bold rounded-2xl hover:bg-white transition-all duration-300 flex items-center justify-center gap-3 shadow-[0_10px_30px_-10px_rgba(16,183,127,0.3)] hover:scale-105"
                            >
                                <MessageSquare size={20} />
                                {t('faq.suggestions.btn_send')}
                            </Link>
                            <Link
                                href="/contact"
                                className="w-full sm:w-auto px-10 py-4 bg-white/5 text-white font-bold rounded-2xl border border-white/10 hover:bg-white/10 transition-all"
                            >
                                {t('faq.suggestions.btn_support')}
                            </Link>
                        </div>
                        <div className="flex items-center justify-center gap-6 pt-8 grayscale opacity-30">
                            <div className="flex items-center gap-2 text-xs font-medium"><MessageCircle size={14} /> {t('faq.suggestions.footer_wa')}</div>
                            <div className="flex items-center gap-2 text-xs font-medium"><Globe size={14} /> {t('faq.suggestions.footer_email')}</div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
    );
};

export default FAQPage;
