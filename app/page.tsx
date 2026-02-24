import Link from "next/link";
import React from "react";

export default function Home() {
  return (
    <div className="bg-background-dark text-slate-100 font-display antialiased overflow-x-hidden selection:bg-primary/30 selection:text-white">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b border-border-dark/50 bg-background-dark/70 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex-1 flex justify-start">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/20 text-primary">
                <span className="material-symbols-outlined text-xl">auto_awesome</span>
              </div>
              <span className="text-lg font-bold tracking-tight text-white">Katalog AI</span>
            </Link>
          </div>

          <div className="hidden md:flex flex-1 justify-center items-center gap-8">
            <Link className="text-sm font-medium text-slate-400 transition-colors hover:text-primary" href="/features">Capacidades</Link>
            <Link className="text-sm font-medium text-slate-400 transition-colors hover:text-primary" href="/integrations">Integraciones</Link>
            <Link className="text-sm font-medium text-slate-400 transition-colors hover:text-primary" href="/pricing">Precios</Link>
            <Link className="text-sm font-medium text-slate-400 transition-colors hover:text-primary" href="/faq">FAQ</Link>
          </div>

          <div className="flex-1 flex justify-end items-center gap-4">
            <Link href="/login">
              <button className="group relative flex h-9 items-center justify-center overflow-hidden rounded-lg bg-primary px-6 text-sm font-bold text-background-dark transition-all hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,183,127,0.4)]">
                Connect Store
              </button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative pt-16">
        <div className="absolute inset-0 z-0 bg-neural-glow pointer-events-none"></div>
        <div className="absolute inset-0 z-0 opacity-[0.03] bg-grid-pattern bg-grid pointer-events-none"></div>

        {/* Hero */}
        <section className="relative z-10 px-4 pt-20 pb-16 sm:px-6 lg:px-8 lg:pt-32 lg:pb-24">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center rounded-full border border-border-dark bg-surface-dark px-3 py-1 text-xs font-medium text-primary shadow-[0_0_10px_rgba(16,183,127,0.1)]">
              <span className="flex h-1.5 w-1.5 rounded-full bg-primary mr-2 animate-pulse"></span>
              v2.0 Neural Engine Active
            </div>
            <h1 className="bg-gradient-to-b from-white to-slate-400 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-6xl lg:text-7xl leading-tight">
              Your Shopify Catalog,<br />
              Optimized by AI.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
              Katalog AI audits your store, fixes low-quality listings, and unlocks hidden revenue using advanced neural processing. Stop guessing and start scaling.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/login" className="w-full sm:w-auto">
                <button className="group flex h-14 w-full min-w-[200px] items-center justify-center rounded-lg bg-primary px-8 text-lg font-bold text-background-dark transition-all hover:bg-emerald-400 hover:shadow-[0_0_30px_rgba(16,183,127,0.3)] hover:scale-105">
                  Connect Store
                </button>
              </Link>
            </div>

            {/* Dashboard Mockup from Stitch */}
            <div className="mt-20 relative mx-auto max-w-6xl rounded-2xl border border-white/5 bg-surface-darker/50 p-2 shadow-2xl backdrop-blur-xl">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 blur-[80px] rounded-full pointer-events-none"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/10 blur-[80px] rounded-full pointer-events-none"></div>

              <div className="relative overflow-hidden rounded-xl bg-[#0c0c0e] border border-white/10 shadow-inner flex flex-row h-[500px] md:h-[600px] text-left">
                {/* Mockup Sidebar */}
                <div className="hidden md:flex w-64 flex-col border-r border-white/5 bg-surface-darker/90 backdrop-blur-md">
                  <div className="p-6 border-b border-white/5">
                    <div className="flex items-center gap-2 text-white font-bold">
                      <div className="h-6 w-6 rounded bg-primary/20 text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-sm">auto_awesome</span>
                      </div>
                      Katalog AI
                    </div>
                  </div>
                  <div className="flex-1 py-6 px-3 space-y-1">
                    <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Main</div>
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-white bg-primary/10 border border-primary/10 rounded-lg">
                      <span className="material-symbols-outlined text-primary">dashboard</span>
                      Dashboard
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                      <span className="material-symbols-outlined">inventory_2</span>
                      Inventory
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                      <span className="material-symbols-outlined">psychology</span>
                      Brand Brain
                    </button>
                    <div className="mt-6 px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Analysis</div>
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                      <span className="material-symbols-outlined">query_stats</span>
                      Audits
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                      <span className="material-symbols-outlined">settings</span>
                      Settings
                    </button>
                  </div>
                  <div className="p-4 border-t border-white/5">
                    <div className="flex items-center gap-3 px-2">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 border border-white/10"></div>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-white">Admin User</span>
                        <span className="text-[10px] text-slate-500">Pro Plan</span>
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
                      <h2 className="text-xl font-bold text-white">Opportunity Radar</h2>
                      <p className="text-sm text-slate-400">Real-time optimization insights</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-xs font-medium text-emerald-400">Neural Engine Active</span>
                      </div>
                    </div>
                  </div>

                  {/* Mockup Content Area */}
                  <div className="relative z-10 p-8 space-y-8 overflow-y-auto h-full pb-20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* KPI 1 */}
                      <div className="dashboard-glass p-5 rounded-xl flex flex-col justify-between group hover:border-red-500/30 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-xs font-semibold text-slate-400 uppercase">Revenue at Risk</span>
                          <span className="p-1 rounded bg-red-500/10 text-red-500">
                            <span className="material-symbols-outlined text-sm">trending_down</span>
                          </span>
                        </div>
                        <div>
                          <span className="text-2xl font-bold text-white">$1,240.00</span>
                          <div className="mt-1 flex items-center gap-1 text-xs text-red-400">
                            <span className="material-symbols-outlined text-[10px]">warning</span>
                            <span>Critical attention needed</span>
                          </div>
                        </div>
                      </div>

                      {/* KPI 2 */}
                      <div className="dashboard-glass p-5 rounded-xl flex flex-col justify-between group hover:border-primary/30 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-xs font-semibold text-slate-400 uppercase">Catalog Health</span>
                          <span className="p-1 rounded bg-primary/10 text-primary">
                            <span className="material-symbols-outlined text-sm">health_metrics</span>
                          </span>
                        </div>
                        <div className="flex items-end justify-between">
                          <div>
                            <span className="text-2xl font-bold text-white">82%</span>
                            <span className="block text-xs text-slate-500 mt-1">+4% from last scan</span>
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
                          <span className="text-xs font-semibold text-slate-400 uppercase">Optimization Queue</span>
                          <span className="p-1 rounded bg-blue-500/10 text-blue-500">
                            <span className="material-symbols-outlined text-sm">queue</span>
                          </span>
                        </div>
                        <div>
                          <span className="text-2xl font-bold text-white">14</span>
                          <span className="block text-xs text-slate-500 mt-1">Assets processing</span>
                        </div>
                        <div className="mt-3 w-full bg-slate-800 rounded-full h-1">
                          <div className="bg-blue-500 h-1 rounded-full w-2/3 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                        </div>
                      </div>
                    </div>

                    {/* Mockup Table */}
                    <div className="dashboard-glass rounded-xl overflow-hidden flex-1">
                      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white">High Priority Issues</h3>
                        <button className="text-xs text-primary hover:text-emerald-400 font-medium">View All</button>
                      </div>
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="text-xs text-slate-500 border-b border-white/5">
                            <th className="px-6 py-3 font-medium uppercase tracking-wider">Product</th>
                            <th className="px-6 py-3 font-medium uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 font-medium uppercase tracking-wider text-right">Quality Score</th>
                            <th className="px-6 py-3 font-medium uppercase tracking-wider text-right">Est. Loss</th>
                            <th className="px-6 py-3 font-medium uppercase tracking-wider text-right">Action</th>
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
                              <button className="text-primary hover:text-emerald-300 text-xs font-bold uppercase tracking-wide">Fix Now</button>
                            </td>
                          </tr>
                          {/* Second Row */}
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
                              <button className="text-primary hover:text-emerald-300 text-xs font-bold uppercase tracking-wide">Review</button>
                            </td>
                          </tr>
                          {/* Third Row */}
                          <tr className="group hover:bg-white/[0.02] transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded bg-slate-800 border border-white/10 flex items-center justify-center text-xs font-bold text-slate-600">IMG</div>
                                <span className="font-medium text-slate-300 group-hover:text-white">Leather Ankle Boots</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center rounded-md bg-yellow-400/10 px-2 py-1 text-xs font-medium text-yellow-400 ring-1 ring-inset ring-yellow-400/20">WARNING</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <span className="text-yellow-400 font-bold">52%</span>
                                <div className="w-16 bg-slate-800 rounded-full h-1.5">
                                  <div className="bg-yellow-500 h-1.5 rounded-full w-[52%]"></div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right text-slate-400">$64.00</td>
                            <td className="px-6 py-4 text-right">
                              <button className="text-primary hover:text-emerald-300 text-xs font-bold uppercase tracking-wide">Optimize</button>
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

        {/* Stats Bar */}
        <section className="border-y border-border-dark bg-surface-darker/50 py-10 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 text-center sm:grid-cols-3">
              <div className="flex flex-col items-center justify-center gap-1">
                <dt className="text-sm font-medium leading-6 text-slate-400">Assets Processed</dt>
                <dd className="text-3xl font-bold tracking-tight text-white">50,000+</dd>
              </div>
              <div className="flex flex-col items-center justify-center gap-1">
                <dt className="text-sm font-medium leading-6 text-slate-400">Avg. Revenue Lift</dt>
                <dd className="text-3xl font-bold tracking-tight text-primary drop-shadow-[0_0_8px_rgba(16,183,127,0.5)]">20%</dd>
              </div>
              <div className="flex flex-col items-center justify-center gap-1">
                <dt className="text-sm font-medium leading-6 text-slate-400">Stores Optimized</dt>
                <dd className="text-3xl font-bold tracking-tight text-white">500+</dd>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 relative overflow-hidden" id="process">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>
          <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
            <div className="text-center mb-20">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">How It Works</h2>
              <p className="mt-4 text-lg text-slate-400">From chaos to clarity in three automated steps.</p>
            </div>
            <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-0">
              <div className="flex flex-col items-center text-center max-w-xs group">
                <div className="w-20 h-20 rounded-2xl bg-surface-dark border border-border-dark flex items-center justify-center shadow-lg group-hover:border-primary/50 group-hover:shadow-[0_0_20px_rgba(16,183,127,0.15)] transition-all duration-300 relative">
                  <span className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-surface-darker border border-border-dark flex items-center justify-center text-xs font-bold text-slate-400">1</span>
                  <span className="material-symbols-outlined text-4xl text-white group-hover:text-primary transition-colors">query_stats</span>
                </div>
                <h3 className="mt-6 text-xl font-bold text-white leading-tight">Audit</h3>
                <p className="mt-2 text-sm text-slate-400">AI scans your entire catalog for missing data and conversion errors.</p>
              </div>
              <div className="hidden lg:flex w-32 h-[2px] bg-border-dark relative mx-4"></div>
              <div className="flex flex-col items-center text-center max-w-xs group">
                <div className="w-20 h-20 rounded-2xl bg-surface-dark border border-border-dark flex items-center justify-center shadow-lg group-hover:border-primary/50 group-hover:shadow-[0_0_20px_rgba(16,183,127,0.15)] transition-all duration-300 relative">
                  <span className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-surface-darker border border-border-dark flex items-center justify-center text-xs font-bold text-slate-400">2</span>
                  <span className="material-symbols-outlined text-4xl text-white group-hover:text-primary transition-colors">auto_fix_high</span>
                </div>
                <h3 className="mt-6 text-xl font-bold text-white leading-tight">Optimize</h3>
                <p className="mt-2 text-sm text-slate-400">Neural networks regenerate titles, fix images, and prioritize by revenue impact.</p>
              </div>
              <div className="hidden lg:flex w-32 h-[2px] bg-border-dark relative mx-4"></div>
              <div className="flex flex-col items-center text-center max-w-xs group">
                <div className="w-20 h-20 rounded-2xl bg-surface-dark border border-border-dark flex items-center justify-center shadow-lg group-hover:border-primary/50 group-hover:shadow-[0_0_20px_rgba(16,183,127,0.15)] transition-all duration-300 relative">
                  <span className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-surface-darker border border-border-dark flex items-center justify-center text-xs font-bold text-slate-400">3</span>
                  <span className="material-symbols-outlined text-4xl text-white group-hover:text-primary transition-colors">sync_saved_locally</span>
                </div>
                <h3 className="mt-6 text-xl font-bold text-white leading-tight">Sync</h3>
                <p className="mt-2 text-sm text-slate-400">Updates are pushed to Shopify instantly with zero downtime.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Bento */}
        <section className="py-24 sm:py-32 bg-surface-darker/30" id="features">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Core Capabilities</h2>
              <p className="mt-4 text-lg text-slate-400">Unlock the hidden potential of your catalog with our advanced processing engine.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">

              {/* Feature 1 */}
              <div className="group relative overflow-hidden glass-card p-8 hover:border-primary/50 transition-all duration-300 flex flex-col h-full">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl transition-opacity duration-500 group-hover:opacity-100"></div>
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-surface-darker border border-border-dark text-primary shadow-inner">
                  <span className="material-symbols-outlined text-2xl">health_metrics</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 leading-tight">Inventory Health Check</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-8">Deep-scan visualization of your catalog health identifying which products need immediate attention. Ranked by SEO impact and data completeness.</p>
                <div className="mt-auto flex flex-col items-center justify-center py-6 bg-slate-900/40 rounded-xl border border-border-dark/50">
                  <div className="relative flex items-center justify-center">
                    <svg className="h-28 w-28 transform -rotate-90">
                      <circle className="text-slate-800" cx="56" cy="56" fill="transparent" r="48" stroke="currentColor" strokeWidth="8"></circle>
                      <circle className="text-primary drop-shadow-[0_0_12px_#10b77f]" cx="56" cy="56" fill="transparent" r="48" stroke="currentColor" strokeDasharray="301.59" strokeDashoffset="54.28" strokeWidth="8"></circle>
                    </svg>
                    <span className="absolute text-2xl font-black text-white">82%</span>
                    <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl -z-10"></div>
                  </div>
                  <div className="mt-4 flex flex-col items-center">
                    <span className="text-xs font-bold text-red-400 flex items-center gap-1 uppercase tracking-wider">
                      <span className="material-symbols-outlined text-[14px]">warning</span> 32 Products at Risk
                    </span>
                  </div>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="group relative overflow-hidden glass-card p-8 hover:border-primary/50 transition-all duration-300 flex flex-col h-full">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl transition-opacity duration-500 group-hover:opacity-100"></div>
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-surface-darker border border-border-dark text-primary shadow-inner">
                  <span className="material-symbols-outlined text-2xl">history_edu</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 leading-tight">AI Content Writing</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-8">Generates SEO titles and conversion-optimized descriptions. Our AI analyzes your Shopify data to create copy that ranks and sells.</p>
                <div className="mt-auto space-y-4">
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-border-dark">
                    <span className="text-[10px] uppercase tracking-[0.15em] text-slate-500 font-bold block mb-2">Current Listing</span>
                    <span className="text-sm text-slate-500 font-medium italic">Blue cotton t-shirt size L</span>
                  </div>
                  <div className="relative p-4 rounded-xl bg-primary/5 border border-primary/20 shadow-[0_0_20px_rgba(16,183,127,0.05)] overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5 blur-xl pointer-events-none"></div>
                    <span className="text-[10px] uppercase tracking-[0.15em] text-primary font-bold block mb-2 relative z-10">AI Optimization</span>
                    <span className="text-sm text-white font-bold leading-tight relative z-10 block">Premium Navy Cotton Tee - Athletics Fit (Large)</span>
                  </div>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="group relative overflow-hidden glass-card p-8 hover:border-red-500/30 transition-all duration-300 flex flex-col h-full">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-red-500/10 blur-3xl transition-opacity duration-500 group-hover:opacity-100"></div>
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-surface-darker border border-border-dark text-red-500 shadow-inner">
                  <span className="material-symbols-outlined text-2xl">monitoring</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 leading-tight">Revenue at Risk Radar</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-8">Don't optimize blindly. Our AI calculates the monetary value of each improvement, letting you prioritize changes that actually move the needle on your monthly revenue.</p>
                <div className="mt-auto relative rounded-2xl bg-black/60 border border-border-dark/60 p-6 backdrop-blur-2xl shadow-xl overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-24 h-24 bg-red-500/20 blur-3xl rounded-full"></div>
                  <div className="relative z-10 flex flex-col items-start gap-4">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Est. Monthly Loss</span>
                    <div className="flex items-end gap-3 w-full">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 text-red-500 shrink-0">
                        <span className="material-symbols-outlined text-xl">trending_down</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-4xl font-extrabold text-white tracking-tight drop-shadow-[0_0_15px_rgba(239,68,68,0.2)]">$1,240.00</span>
                      </div>
                    </div>
                    <div className="w-full h-px bg-gradient-to-r from-red-500/30 via-transparent to-transparent my-1"></div>
                    <div className="flex items-center justify-between w-full">
                      <span className="inline-flex items-center rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-bold text-red-500 border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]">
                        HIGH RISK
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        32 critical unoptimized assets
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="group relative overflow-hidden glass-card p-8 hover:border-primary/50 transition-all duration-300 md:col-span-2">
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-[80px] pointer-events-none"></div>
                <div className="flex flex-col md:flex-row md:items-center gap-8">
                  <div className="flex-shrink-0 flex h-14 w-14 items-center justify-center rounded-xl bg-surface-darker border border-border-dark text-primary shadow-inner">
                    <span className="material-symbols-outlined text-3xl">analytics</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2 leading-tight">Global Health Metric</h3>
                    <p className="text-slate-400 text-sm max-w-lg mb-6 leading-relaxed">We analyze the integrity of your metadata, tag quality, and visual consistency to generate an actionable real-time diagnosis.</p>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                        <span className="text-slate-500">Catalog Optimization</span>
                        <span className="text-primary">82% Excellent</span>
                      </div>
                      <div className="h-3 w-full bg-slate-900 rounded-full border border-border-dark overflow-hidden p-0.5">
                        <div className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(16,183,127,0.6)]" style={{ width: "82%" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature 5 */}
              <div className="group relative overflow-hidden glass-card p-8 hover:border-primary/50 transition-all duration-300 flex flex-col h-full">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl transition-opacity duration-500 group-hover:opacity-100"></div>
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-surface-darker border border-border-dark text-primary shadow-inner">
                  <span className="material-symbols-outlined text-2xl">sync_alt</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 leading-tight">Total Synchronization</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-8">Seamless integration with Shopify. Live changes in seconds with a single click.</p>
                <div className="mt-auto flex justify-between items-center bg-slate-900/40 p-4 rounded-xl border border-border-dark/50">
                  <div className="h-10 w-10 rounded-lg bg-slate-800 border border-border-dark flex items-center justify-center">
                    <span className="material-symbols-outlined text-slate-300 text-sm">shopping_bag</span>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent mx-3 relative">
                    <div className="absolute inset-0 bg-primary/20 blur-sm"></div>
                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 material-symbols-outlined text-primary text-xs bg-surface-dark px-1">bolt</span>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-sm">auto_awesome</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-24 relative z-10" id="pricing">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Clear Pricing Plans</h2>
              <p className="mt-4 text-lg text-slate-400">Choose the plan that fits your catalog size.</p>
            </div>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-8 items-start">

              <div className="rounded-3xl border border-border-dark bg-surface-dark/40 p-8 backdrop-blur-md transition-transform hover:-translate-y-1">
                <h3 className="text-lg font-semibold leading-8 text-white">Starter</h3>
                <p className="mt-4 text-sm leading-6 text-slate-400">Ideal for small stores just starting optimization.</p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold tracking-tight text-white">$29</span>
                  <span className="text-sm font-semibold leading-6 text-slate-400">/month</span>
                </p>
                <Link className="mt-6 block rounded-md border border-border-dark bg-white/5 py-2 px-3 text-center text-sm font-semibold leading-6 text-white hover:bg-white/10" href="/login">Get Started</Link>
                <ul className="mt-8 space-y-3 text-sm leading-6 text-slate-300">
                  <li className="flex gap-x-3"><span className="material-symbols-outlined text-primary text-sm">check</span> Up to 1,000 products</li>
                  <li className="flex gap-x-3"><span className="material-symbols-outlined text-primary text-sm">check</span> Basic Visual Audit</li>
                  <li className="flex gap-x-3"><span className="material-symbols-outlined text-primary text-sm">check</span> Weekly sync</li>
                </ul>
              </div>

              <div className="relative rounded-3xl border-2 border-primary bg-surface-dark/80 p-8 shadow-[0_0_40px_rgba(16,183,127,0.15)] backdrop-blur-xl transition-transform hover:-translate-y-1 lg:-mt-4 lg:mb-4 lg:p-10 pricing-glow">
                <div className="absolute -top-5 left-0 right-0 mx-auto w-32 rounded-full bg-primary px-3 py-1 text-center text-xs font-semibold text-background-dark shadow-lg">Most Popular</div>
                <h3 className="text-lg font-semibold leading-8 text-white">Pro</h3>
                <p className="mt-4 text-sm leading-6 text-slate-400">For growing brands needing full automation.</p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-5xl font-bold tracking-tight text-white">$79</span>
                  <span className="text-sm font-semibold leading-6 text-slate-400">/month</span>
                </p>
                <Link className="mt-6 block rounded-md bg-primary py-2.5 px-3 text-center text-sm font-semibold leading-6 text-background-dark shadow-sm hover:bg-emerald-400" href="/login">Free Trial</Link>
                <ul className="mt-8 space-y-3 text-sm leading-6 text-slate-300">
                  <li className="flex gap-x-3"><span className="material-symbols-outlined text-primary text-sm">check</span> Up to 10,000 products</li>
                  <li className="flex gap-x-3"><span className="material-symbols-outlined text-primary text-sm">check</span> Unlimited AI Writing</li>
                  <li className="flex gap-x-3"><span className="material-symbols-outlined text-primary text-sm">check</span> Revenue at Risk Dashboard</li>
                  <li className="flex gap-x-3"><span className="material-symbols-outlined text-primary text-sm">check</span> Daily auto-sync</li>
                </ul>
              </div>

              <div className="rounded-3xl border border-border-dark bg-surface-dark/40 p-8 backdrop-blur-md transition-transform hover:-translate-y-1">
                <h3 className="text-lg font-semibold leading-8 text-white">Enterprise</h3>
                <p className="mt-4 text-sm leading-6 text-slate-400">Custom solutions for high-volume merchants.</p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold tracking-tight text-white">$199</span>
                  <span className="text-sm font-semibold leading-6 text-slate-400">/month</span>
                </p>
                <Link className="mt-6 block rounded-md border border-border-dark bg-white/5 py-2 px-3 text-center text-sm font-semibold leading-6 text-white hover:bg-white/10" href="/login">Contact Sales</Link>
                <ul className="mt-8 space-y-3 text-sm leading-6 text-slate-300">
                  <li className="flex gap-x-3"><span className="material-symbols-outlined text-primary text-sm">check</span> Unlimited products</li>
                  <li className="flex gap-x-3"><span className="material-symbols-outlined text-primary text-sm">check</span> Custom AI models</li>
                  <li className="flex gap-x-3"><span className="material-symbols-outlined text-primary text-sm">check</span> Dedicated success manager</li>
                  <li className="flex gap-x-3"><span className="material-symbols-outlined text-primary text-sm">check</span> API Access</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-24 border-t border-border-dark bg-surface-darker/30" id="faq">
          <div className="mx-auto max-w-3xl px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tight text-white text-center mb-12">Intelligence, Demystified.</h2>
            <div className="space-y-4">
              <details className="group rounded-xl bg-surface-dark border border-border-dark px-4 py-3 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between text-white">
                  <h3 className="font-medium text-sm">Does Katalog AI modify my live store directly?</h3>
                  <span className="ml-1.5 flex-shrink-0 rounded-full bg-white/5 p-1 text-white sm:p-1.5 group-open:bg-primary/20 group-open:text-primary transition-colors">
                    <span className="material-symbols-outlined group-open:hidden text-lg">add</span>
                    <span className="material-symbols-outlined hidden group-open:block text-lg">remove</span>
                  </span>
                </summary>
                <p className="mt-2 leading-relaxed text-slate-400 text-sm">
                  Not immediately. Katalog AI creates a staging version of your changes. You can review all proposed optimizations in our dashboard before syncing them to your live Shopify store with one click.
                </p>
              </details>
              <details className="group rounded-xl bg-surface-dark border border-border-dark px-4 py-3 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between text-white">
                  <h3 className="font-medium text-sm">How does the AI know my brand voice?</h3>
                  <span className="ml-1.5 flex-shrink-0 rounded-full bg-white/5 p-1 text-white sm:p-1.5 group-open:bg-primary/20 group-open:text-primary transition-colors">
                    <span className="material-symbols-outlined group-open:hidden text-lg">add</span>
                    <span className="material-symbols-outlined hidden group-open:block text-lg">remove</span>
                  </span>
                </summary>
                <p className="mt-2 leading-relaxed text-slate-400 text-sm">
                  During onboarding, you can upload style guides. Our engine analyzes this data to adjust the tone, structure, and vocabulary in the automatically generated content.
                </p>
              </details>
              <details className="group rounded-xl bg-surface-dark border border-border-dark px-4 py-3 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between text-white">
                  <h3 className="font-medium text-sm">Is it compatible with all Shopify themes?</h3>
                  <span className="ml-1.5 flex-shrink-0 rounded-full bg-white/5 p-1 text-white sm:p-1.5 group-open:bg-primary/20 group-open:text-primary transition-colors">
                    <span className="material-symbols-outlined group-open:hidden text-lg">add</span>
                    <span className="material-symbols-outlined hidden group-open:block text-lg">remove</span>
                  </span>
                </summary>
                <p className="mt-2 leading-relaxed text-slate-400 text-sm">
                  Yes, Katalog AI works at the product data level, not the theme. Changes in titles, descriptions, and tags are reflected perfectly regardless of the visual template you use.
                </p>
              </details>
              <details className="group rounded-xl bg-surface-dark border border-border-dark px-4 py-3 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between text-white">
                  <h3 className="font-medium text-sm">How long does it take to optimize my entire catalog?</h3>
                  <span className="ml-1.5 flex-shrink-0 rounded-full bg-white/5 p-1 text-white sm:p-1.5 group-open:bg-primary/20 group-open:text-primary transition-colors">
                    <span className="material-symbols-outlined group-open:hidden text-lg">add</span>
                    <span className="material-symbols-outlined hidden group-open:block text-lg">remove</span>
                  </span>
                </summary>
                <p className="mt-2 leading-relaxed text-slate-400 text-sm">
                  The initial scan takes just a few minutes for stores up to 10,000 products. AI optimizations are generated in batches and are usually ready for review in under an hour.
                </p>
              </details>
            </div>
          </div>
        </section>

        {/* Action Footer */}
        <section className="relative py-24 px-6 lg:px-8">
          <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none"></div>
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl bg-surface-dark border border-border-dark px-6 py-16 text-center shadow-2xl sm:px-16 lg:py-20">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/20 blur-[100px] rounded-full pointer-events-none"></div>
            <h2 className="relative z-10 text-3xl font-bold tracking-tight text-white sm:text-4xl">Ready to fix your catalog?</h2>
            <p className="relative z-10 mx-auto mt-6 max-w-xl text-lg text-slate-300">Join hundreds of Shopify merchants optimizing their revenue with honesty and precision.</p>
            <div className="relative z-10 mt-10 flex justify-center">
              <Link href="/login">
                <button className="flex h-14 min-w-[200px] items-center justify-center rounded-xl bg-primary px-8 text-lg font-bold text-background-dark shadow-[0_0_40px_rgba(16,183,127,0.4)] transition-all hover:scale-105 hover:bg-emerald-400">
                  Free Trial
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border-dark bg-background-dark py-12">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/20 text-primary">
                <span className="material-symbols-outlined text-sm">auto_awesome</span>
              </div>
              <span className="text-sm font-semibold text-white">Katalog AI</span>
            </div>
            <div className="flex gap-8">
              <Link className="text-sm text-slate-500 hover:text-white transition-colors" href="/features">Capacidades</Link>
              <Link className="text-sm text-slate-500 hover:text-white transition-colors" href="/integrations">Integraciones</Link>
              <Link className="text-sm text-slate-500 hover:text-white transition-colors" href="/pricing">Precios</Link>
              <Link className="text-sm text-slate-500 hover:text-white transition-colors" href="/faq">FAQ</Link>
            </div>
            <p className="text-sm text-slate-600">© 2024 Katalog AI. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
