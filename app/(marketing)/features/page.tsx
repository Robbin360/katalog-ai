"use client";

import Link from 'next/link';
import { Brand } from '@/components/ui/brand';
import { useI18n } from '@/lib/i18n-context';
import { Navbar } from '@/components/landing/Navbar';

export default function FeaturesPage() {
    const { t } = useI18n();

    return (
        <div className="bg-background-dark font-display text-slate-100 min-h-screen selection:bg-primary/30 antialiased">
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes orbit {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes pulse-sphere {
                    0%, 100% { transform: scale(1); opacity: 0.8; }
                    50% { transform: scale(1.1); opacity: 1; }
                }
                .animate-orbit-slow { animation: orbit 20s linear infinite; }
                .animate-orbit-reverse { animation: orbit 25s linear infinite reverse; }
                .animate-pulse-sphere { animation: pulse-sphere 4s ease-in-out infinite; }
                .neural-glow {
                    filter: blur(80px);
                    background: radial-gradient(circle, rgba(16, 183, 127, 0.15) 0%, rgba(16, 183, 127, 0) 70%);
                }
                .emerald-pulse {
                    box-shadow: 0 0 0 0 rgba(16, 183, 127, 0.4);
                    animation: pulse-emerald 2s infinite;
                }
                @keyframes pulse-emerald {
                    0% { box-shadow: 0 0 0 0 rgba(16, 183, 127, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(16, 183, 127, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(16, 183, 127, 0); }
                }
                .command-gradient {
                    background: linear-gradient(180deg, rgba(16, 183, 127, 0.05) 0%, rgba(9, 9, 11, 0) 100%);
                }
                .neural-node {
                    position: absolute;
                    border-radius: 9999px;
                    background-color: #10b77f;
                    box-shadow: 0 0 10px rgba(16,183,127,0.8);
                }
                .orbital-ring {
                    position: absolute;
                    border-radius: 9999px;
                    border: 1px solid rgba(16, 183, 127, 0.2);
                }
            `}} />

            <Navbar />

            <main className="relative">
                {/* HERO SECTION */}
                <section className="relative pt-16 pb-20 overflow-hidden">
                    <div className="neural-glow absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] pointer-events-none"></div>
                    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="relative z-10 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6">
                                <span className="size-2 rounded-full bg-primary animate-pulse"></span>
                                <span className="text-[10px] font-bold tracking-widest uppercase text-primary">{t('features.hero.badge')}</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40 mb-6">
                                {t('features.hero.title_pre')} <Brand className="text-primary" /> <br />{t('features.hero.title_post')}
                            </h1>
                            <p className="text-slate-400 text-lg md:text-xl leading-relaxed max-w-xl mx-auto lg:mx-0">
                                {t('features.hero.subtitle')}
                            </p>
                            <div className="mt-10 flex justify-center lg:justify-start">
                                <Link href="/signup" className="bg-white text-black font-extrabold px-10 py-4 rounded-xl hover:bg-slate-100 transition-all shadow-xl shadow-white/10 scale-100 hover:scale-105 active:scale-95">
                                    {t('features.hero.cta')}
                                </Link>
                            </div>
                        </div>

                        {/* NEURAL CORE GRAPHIC REPLACEMENT */}
                        <div className="relative flex justify-center items-center h-[400px] md:h-[500px]">
                            <div className="relative w-full max-w-[400px] aspect-square flex items-center justify-center">
                                {/* Core glows */}
                                <div className="absolute size-24 bg-primary/30 rounded-full blur-2xl animate-pulse-sphere"></div>
                                <div className="absolute size-16 bg-primary rounded-full blur-md opacity-40"></div>
                                <div className="relative size-10 bg-primary rounded-full shadow-[0_0_30px_#10b77f] z-20"></div>

                                {/* Orbital rings */}
                                <div className="orbital-ring size-[200px] border-primary/20 animate-orbit-slow" style={{ transform: "rotateX(65deg) rotateY(15deg)" }}></div>
                                <div className="orbital-ring size-[280px] border-primary/10 animate-orbit-reverse" style={{ transform: "rotateX(-45deg) rotateY(30deg)" }}></div>
                                <div className="orbital-ring size-[360px] border-primary/5 animate-orbit-slow" style={{ transform: "rotateX(20deg) rotateY(-40deg)" }}></div>

                                {/* Floating Neural Nodes */}
                                <div className="neural-node size-1.5 top-[20%] left-[30%] animate-pulse"></div>
                                <div className="neural-node size-2 top-[45%] left-[15%]"></div>
                                <div className="neural-node size-1 top-[70%] left-[25%] opacity-60"></div>
                                <div className="neural-node size-2.5 top-[30%] right-[20%] animate-pulse" style={{ animationDelay: "1s" }}></div>
                                <div className="neural-node size-1.5 top-[60%] right-[10%]"></div>
                                <div className="neural-node size-1 bottom-[15%] right-[40%] opacity-40"></div>
                                <div className="neural-node size-2 bottom-[30%] left-[50%] animate-pulse" style={{ animationDelay: "0.5s" }}></div>

                                {/* Data connection lines */}
                                <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 400 400">
                                    <defs>
                                        <linearGradient id="lineGrad" x1="0%" x2="100%" y1="0%" y2="100%">
                                            <stop offset="0%" stopColor="#10b77f" stopOpacity="0"></stop>
                                            <stop offset="50%" stopColor="#10b77f" stopOpacity="1"></stop>
                                            <stop offset="100%" stopColor="#10b77f" stopOpacity="0"></stop>
                                        </linearGradient>
                                    </defs>
                                    <path d="M120,80 L200,200 L320,120" fill="none" stroke="url(#lineGrad)" strokeWidth="0.5"></path>
                                    <path d="M60,180 L200,200 L360,240" fill="none" stroke="url(#lineGrad)" strokeWidth="0.5"></path>
                                    <path d="M100,280 L200,200 L240,340" fill="none" stroke="url(#lineGrad)" strokeWidth="0.5"></path>
                                    <circle cx="200" cy="200" fill="none" r="120" stroke="#10b77f" strokeDasharray="4 8" strokeWidth="0.2"></circle>
                                </svg>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3-WIDGET DASHBOARD SECTION */}
                <section translate="no" className="py-24 bg-white/[0.01] border-y border-white/5">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-white mb-4">{t('features.dashboard_widgets.title')}</h2>
                            <p className="text-slate-400 text-lg">{t('features.dashboard_widgets.subtitle')}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            {/* Widget 1: Revenue at Risk */}
                            <div className="glass-card bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 hover:border-primary/30 transition-all">
                                <div className="flex justify-between items-start mb-6">
                                    <span className="text-slate-400 text-sm font-medium">{t('features.dashboard_widgets.revenue.label')}</span>
                                    <span className="material-symbols-outlined text-primary">trending_up</span>
                                </div>
                                <div className="text-4xl font-bold text-white mb-2">$42.8k</div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary w-3/4"></div>
                                </div>
                                <p className="text-xs text-slate-500 mt-4 italic">{t('features.dashboard_widgets.revenue.footer')}</p>
                            </div>

                            {/* Widget 2: Salud del Catálogo */}
                            <div className="glass-card bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 border-primary/20">
                                <div className="flex justify-between items-start mb-6">
                                    <span className="text-slate-400 text-sm font-medium">{t('features.dashboard_widgets.health.label')}</span>
                                    <div className="size-2 rounded-full bg-primary emerald-pulse"></div>
                                </div>
                                <div className="text-5xl font-black text-primary mb-2">98.2<span className="text-xl font-normal text-slate-500">%</span></div>
                                <div className="flex gap-1 mt-4">
                                    <div className="h-8 flex-1 bg-primary/20 rounded-sm"></div>
                                    <div className="h-8 flex-1 bg-primary/40 rounded-sm"></div>
                                    <div className="h-8 flex-1 bg-primary/60 rounded-sm"></div>
                                    <div className="h-8 flex-1 bg-primary/80 rounded-sm"></div>
                                    <div className="h-8 flex-1 bg-primary rounded-sm"></div>
                                </div>
                            </div>

                            {/* Widget 3: Cola de Optimización */}
                            <div className="glass-card bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 hover:border-white/20 transition-all flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl font-bold tracking-tight text-slate-100">{t('features.dashboard_widgets.queue.title')}</h3>
                                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary">
                                        <span className="material-symbols-outlined text-2xl font-bold">layers</span>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between bg-primary/10 border border-primary/20 px-5 py-4 rounded-full transition-all hover:bg-primary/15">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center size-8 rounded-full bg-primary/20 text-primary">
                                                <span className="material-symbols-outlined text-xl">check_circle</span>
                                            </div>
                                            <span className="text-primary font-bold text-lg">1,248 {t('features.dashboard_widgets.queue.optimized')}</span>
                                        </div>
                                        <div className="size-2.5 rounded-full bg-primary animate-pulse"></div>
                                    </div>
                                    <div className="flex items-center justify-between bg-blue-500/10 border border-blue-500/20 px-5 py-4 rounded-full transition-all hover:bg-blue-500/15">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center size-8 rounded-full bg-blue-500/20 text-blue-500">
                                                <span className="material-symbols-outlined text-xl">query_stats</span>
                                            </div>
                                            <span className="text-blue-500 font-bold text-lg">15 {t('features.dashboard_widgets.queue.in_progress')}</span>
                                        </div>
                                        <span className="material-symbols-outlined text-blue-500 text-xl animate-spin">sync</span>
                                    </div>
                                    <div className="flex items-center justify-between bg-red-500/10 border border-red-500/20 px-5 py-4 rounded-full transition-all hover:bg-red-500/15">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center size-8 rounded-full bg-red-500/20 text-red-500">
                                                <span className="material-symbols-outlined text-xl">error</span>
                                            </div>
                                            <span className="text-red-500 font-bold text-lg">84 {t('features.dashboard_widgets.queue.critical')}</span>
                                        </div>
                                        <span className="material-symbols-outlined text-red-500 text-xl">warning</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                {/* AUTO-PILOT SECTION */}
                <section className="py-24 relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="command-gradient border border-white/10 rounded-[40px] p-8 md:p-16 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[100px] pointer-events-none"></div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                                <div>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/5 border border-white/10 mb-6">
                                        <span translate="no" className="text-[10px] font-black tracking-widest uppercase text-slate-400">{t('features.autoPilot.badge')}</span>
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">{t('features.autoPilot.title')}</h2>
                                    <p className="text-slate-400 text-lg leading-relaxed mb-8">
                                        {t('features.autoPilot.desc')}
                                    </p>

                                    <ul className="space-y-4">
                                        <li className="flex items-center gap-3 text-sm text-slate-300">
                                            <span translate="no" className="material-symbols-outlined text-primary text-lg">verified</span>
                                            {t('features.autoPilot.list.0') || 'Continuous background optimization'}
                                        </li>
                                        <li className="flex items-center gap-3 text-sm text-slate-300">
                                            <span translate="no" className="material-symbols-outlined text-primary text-lg">verified</span>
                                            {t('features.autoPilot.list.1') || 'Up to 5 products per cycle on Pro, 10 on Business'}
                                        </li>
                                        <li className="flex items-center gap-3 text-sm text-slate-300">
                                            <span translate="no" className="material-symbols-outlined text-primary text-lg">verified</span>
                                            {t('features.autoPilot.list.2') || 'Runs continuously in the background'}
                                        </li>
                                        <li className="flex items-center gap-3 text-sm text-slate-300">
                                            <span translate="no" className="material-symbols-outlined text-primary text-lg">verified</span>
                                            {t('features.autoPilot.list.3') || 'Configure once, runs on autopilot'}
                                        </li>
                                    </ul>
                                </div>

                                <div className="glass-card bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4 border-white/20 shadow-2xl">
                                    <div translate="no" className="bg-black/40 rounded-xl p-6 font-mono text-xs text-primary/80 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <span className="size-2 rounded-full bg-red-500/50"></span>
                                            <span className="size-2 rounded-full bg-yellow-500/50"></span>
                                            <span className="size-2 rounded-full bg-green-500/50"></span>
                                            <span translate="no" className="ml-2 text-slate-500">Auto-Pilot Runtime v2.0.1</span>
                                        </div>
                                        <div className="border-t border-white/5 pt-3">
                                            <p>&gt; {t('features.autoPilot.terminal.analyzing')}</p>
                                            <p>&gt; {t('features.autoPilot.terminal.low_conv')}</p>
                                            <p className="text-white">&gt; {t('features.autoPilot.terminal.executing')}</p>
                                            <p>&gt; {t('features.autoPilot.terminal.new_title')} "{t('features.autoPilot.terminal.new_title')}"</p>
                                            <p className="text-emerald-400">&gt; {t('features.autoPilot.terminal.success')}</p>

                                            <Link href="/" className="group flex items-center gap-2">
                                                <div className="h-8 w-8 rounded bg-primary/20 text-primary flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                                                    <span translate="no" className="material-symbols-outlined text-sm">auto_awesome</span>
                                                </div>
                                                <Brand className="text-lg font-bold tracking-tight text-white" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-24 max-w-7xl mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">{t('features.cta_final.title')}</h2>
                    <Link href="/signup" className="inline-block bg-primary hover:bg-[#0da371] text-background-dark font-black px-10 py-5 rounded-2xl text-xl shadow-2xl shadow-primary/20 transition-transform hover:-translate-y-1">
                        {t('features.cta_final.btn')}
                    </Link>
                </section>
            </main>
        </div>
    );
}
