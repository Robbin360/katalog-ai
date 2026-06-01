"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n-context";

export const Hero = () => {
  const { t } = useI18n();

  return (
    <section className="relative z-10 px-4 pt-20 pb-16 sm:px-6 lg:px-8 lg:pt-32 lg:pb-24 overflow-hidden">

      <div className="mx-auto max-w-4xl text-center">
        <div className="mb-6 inline-flex items-center rounded-full border border-border-dark bg-surface-dark px-3 py-1 text-xs font-medium text-primary shadow-[0_0_10px_rgba(16,183,127,0.1)]">
          <span className="flex h-1.5 w-1.5 rounded-full bg-primary mr-2"></span>
          {t('landing.hero.badge') || 'v2.0 Neural Engine Activo'}
        </div>
        <h1 className="bg-gradient-to-b from-white to-slate-400 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-6xl lg:text-7xl leading-tight">
          {t('landing.hero.title') || 'Tu catálogo de Shopify,\noptimizado por IA.'}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
          {t('landing.hero.subtitle') || 'Katalog AI audita tu tienda, corrige listings de baja calidad y desbloquea ingresos ocultos mediante procesamiento neuronal avanzado. Deja de adivinar y empieza a escalar.'}
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/login" className="w-full sm:w-auto">
            <button className="group flex h-14 w-full min-w-[200px] items-center justify-center rounded-lg bg-primary px-8 text-lg font-bold text-background-dark transition-all hover:bg-emerald-400 hover:shadow-[0_0_30px_rgba(16,183,127,0.3)] hover:scale-105 sm:w-auto">
              {t('landing.hero.cta') || 'Connect Store'}
            </button>
          </Link>
        </div>

        {/* Dashboard Mockup */}
        <div className="mt-20 relative mx-auto max-w-6xl rounded-2xl border border-white/5 bg-surface-darker/50 p-2 shadow-2xl backdrop-blur-xl">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 blur-[80px] rounded-full pointer-events-none"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/10 blur-[80px] rounded-full pointer-events-none"></div>

          <div className="relative overflow-hidden rounded-xl bg-[#0c0c0e] border border-white/10 shadow-inner flex flex-row h-[500px] md:h-[600px] text-left">
            {/* Mockup Sidebar */}
            <div className="hidden md:flex w-64 flex-col border-r border-white/5 bg-surface-darker/90 backdrop-blur-md">
              <div className="p-6 border-b border-white/5">
                <div className="flex items-center gap-2 text-white font-bold">
                  <div className="h-6 w-6 rounded bg-primary/20 text-primary flex items-center justify-center notranslate" translate="no">
                    <span className="material-symbols-outlined text-sm" translate="no" lang="zxx">auto_awesome</span>
                  </div>
                  <span className="notranslate" translate="no">Katalog AI</span>
                </div>
              </div>
              <div className="flex-1 py-6 px-3 space-y-1 relative">
                {/* Decorative Mockup Sidebar Text */}
                <div className="absolute left-4 top-10 text-4xl font-black text-white/5 select-none pointer-events-none notranslate" translate="no">
                  PANEL
                </div>

                <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('landing.mockup.sidebar.main') || 'Main'}</div>
                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-white bg-primary/10 border border-primary/10 rounded-lg notranslate" translate="no">
                  <span className="material-symbols-outlined text-primary" translate="no" lang="zxx">dashboard</span>
                  {t('landing.mockup.sidebar.dashboard') || 'Dashboard'}
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors notranslate" translate="no">
                  <span className="material-symbols-outlined" translate="no" lang="zxx">inventory_2</span>
                  {t('landing.mockup.sidebar.inventory') || 'Inventory'}
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors notranslate" translate="no">
                  <span className="material-symbols-outlined" translate="no" lang="zxx">psychology</span>
                  {t('landing.mockup.sidebar.brain') || 'Brand Brain'}
                </button>
                <div className="mt-6 px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('landing.mockup.sidebar.analysis') || 'Analysis'}</div>
                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors notranslate" translate="no">
                  <span className="material-symbols-outlined" translate="no" lang="zxx">query_stats</span>
                  {t('landing.mockup.sidebar.audits') || 'Audits'}
                </button>
                <button 
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors notranslate"
                  translate="no"
                >
                  <span className="material-symbols-outlined" translate="no" lang="zxx">settings</span>
                  {t('landing.mockup.sidebar.settings') || 'Settings'}
                </button>
              </div>
              <div className="p-4 border-t border-white/5">
                <div className="flex items-center gap-3 px-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 border border-white/10"></div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-white">Admin User</span>
                    <span className="text-[10px] text-slate-500">{t('landing.mockup.sidebar.user_plan') || 'Pro Plan'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mockup Main Content */}
            <div className="flex-1 flex flex-col bg-grid-pattern bg-[length:20px_20px] relative">
              <div className="absolute inset-0 bg-gradient-to-b from-[#0c0c0e] via-transparent to-[#0c0c0e] opacity-80 pointer-events-none"></div>

              {/* Mockup Header */}
              <div className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-white/5 bg-[#0c0c0e]/80 backdrop-blur-sm">
                <div>
                  <h2 className="text-xl font-bold text-white">{t('landing.mockup.header.title') || 'Opportunity Radar'}</h2>
                  <p className="text-sm text-slate-400">{t('landing.mockup.header.subtitle') || 'Real-time optimization insights'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-medium text-emerald-400">{t('landing.mockup.header.engine_status') || 'Neural Engine Active'}</span>
                  </div>
                  <button className="h-8 w-8 flex items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:text-white notranslate" translate="no">
                    <span className="material-symbols-outlined text-sm" translate="no" lang="zxx">notifications</span>
                  </button>
                </div>
              </div>

              {/* Mockup Content Area */}
              <div className="relative z-10 p-8 space-y-8 overflow-y-auto h-full pb-20">
                {/* Decorative Mockup Main Text */}
                <div className="absolute left-8 top-1/2 -track-y-1/2 text-7xl font-black text-white/[0.03] uppercase select-none pointer-events-none notranslate" translate="no">
                  {t('landing.mockup.header.stats_label') || 'ESTADÍSTICAS DE CONSULTA'}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* KPI 1 */}
                  <div className="dashboard-glass p-5 rounded-xl flex flex-col justify-between group hover:border-red-500/30 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-xs font-semibold text-slate-400 uppercase">{t('landing.mockup.kpis.revenue.label') || 'Revenue at Risk'}</span>
                      <span className="p-1 rounded bg-red-500/10 text-red-500 notranslate" translate="no">
                        <span className="material-symbols-outlined text-sm" translate="no" lang="zxx">trending_down</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-2xl font-bold text-white">$1,240.00</span>
                      <div className="mt-1 flex items-center gap-1 text-xs text-red-400 notranslate" translate="no">
                        <span className="material-symbols-outlined text-[10px]" dangerouslySetInnerHTML={{ __html: '&#xe002;' }}></span>
                        <span>{t('landing.mockup.kpis.revenue.footer') || 'Critical attention needed'}</span>
                      </div>
                    </div>
                  </div>

                  {/* KPI 2 */}
                  <div className="dashboard-glass p-5 rounded-xl flex flex-col justify-between group hover:border-primary/30 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-xs font-semibold text-slate-400 uppercase">{t('landing.mockup.kpis.health.label') || 'Catalog Health'}</span>
                      <span className="p-1 rounded bg-primary/10 text-primary notranslate" translate="no">
                        <span className="material-symbols-outlined text-sm" translate="no" lang="zxx">health_metrics</span>
                      </span>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <span className="text-2xl font-bold text-white">82%</span>
                        <span className="block text-xs text-slate-500 mt-1">{t('landing.mockup.kpis.health.footer') || '+4% from last scan'}</span>
                      </div>
                      <div className="relative h-10 w-10">
                        <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                          <path className="text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                          <path className="text-primary drop-shadow-[0_0_8px_rgba(16,183,127,0.5)]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="82, 100" strokeWidth="3"></path>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* KPI 3 */}
                  <div className="dashboard-glass p-5 rounded-xl flex flex-col justify-between group hover:border-blue-500/30 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-xs font-semibold text-slate-400 uppercase">{t('landing.mockup.kpis.queue.label') || 'Optimization Queue'}</span>
                      <span className="p-1 rounded bg-blue-500/10 text-blue-500 notranslate" translate="no">
                        <span className="material-symbols-outlined text-sm" translate="no" lang="zxx">queue</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-2xl font-bold text-white">14</span>
                      <span className="block text-xs text-slate-500 mt-1">{t('landing.mockup.kpis.queue.footer') || 'Assets processing'}</span>
                    </div>
                    <div className="mt-3 w-full bg-slate-800 rounded-full h-1">
                      <div className="bg-blue-500 h-1 rounded-full w-2/3 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                    </div>
                  </div>
                </div>

                {/* Mockup Table */}
                <div className="dashboard-glass rounded-xl overflow-hidden flex-1">
                  <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">{t('landing.mockup.table.title') || 'High Priority Issues'}</h3>
                    <button className="text-xs text-primary hover:text-emerald-400 font-medium">{t('landing.mockup.table.view_all') || 'View All'}</button>
                  </div>
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-xs text-slate-500 border-b border-white/5">
                        <th className="px-6 py-3 font-medium uppercase tracking-wider">{t('landing.mockup.table.columns.product') || 'Product'}</th>
                        <th className="px-6 py-3 font-medium uppercase tracking-wider">{t('landing.mockup.table.columns.status') || 'Status'}</th>
                        <th className="px-6 py-3 font-medium uppercase tracking-wider text-right">{t('landing.mockup.table.columns.quality') || 'Quality Score'}</th>
                        <th className="px-6 py-3 font-medium uppercase tracking-wider text-right">{t('landing.mockup.table.columns.loss') || 'Est. Loss'}</th>
                        <th className="px-6 py-3 font-medium uppercase tracking-wider text-right">{t('landing.mockup.table.columns.action') || 'Action'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      <tr className="group hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded bg-slate-800 border border-white/10 flex items-center justify-center text-xs font-bold text-slate-600">IMG</div>
                            <span className="font-medium text-slate-300 group-hover:text-white">Classic Cotton Tee</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center rounded-md bg-red-400/10 px-2 py-1 text-xs font-medium text-red-400 ring-1 ring-inset ring-red-400/20">ERROR</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-red-400 font-bold">45%</span>
                            <div className="w-16 bg-slate-800 rounded-full h-1.5">
                              <div className="bg-red-500 h-1.5 rounded-full w-[45%]"></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-slate-400">$120.00</td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-primary hover:text-emerald-300 text-xs font-bold uppercase tracking-wide">{t('landing.mockup.table.actions.fix') || 'Fix Now'}</button>
                        </td>
                      </tr>
                      <tr className="group hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded bg-slate-800 border border-white/10 flex items-center justify-center text-xs font-bold text-slate-600">IMG</div>
                            <span className="font-medium text-slate-300 group-hover:text-white">Vintage Denim Jacket</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center rounded-md bg-orange-400/10 px-2 py-1 text-xs font-medium text-orange-400 ring-1 ring-inset ring-orange-400/20">AT RISK</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-orange-400 font-bold">38%</span>
                            <div className="w-16 bg-slate-800 rounded-full h-1.5">
                              <div className="bg-orange-500 h-1.5 rounded-full w-[38%]"></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-slate-400">$85.50</td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-primary hover:text-emerald-300 text-xs font-bold uppercase tracking-wide">{t('landing.mockup.table.actions.review') || 'Review'}</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
