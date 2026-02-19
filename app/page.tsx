import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-background-dark text-slate-100 font-display antialiased overflow-x-hidden selection:bg-primary/30 selection:text-white">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b border-border-dark/50 bg-background-dark/70 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/20 text-primary">
              <span className="material-symbols-outlined text-xl font-bold">auto_awesome</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-white">Katalog AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a className="text-sm font-medium text-slate-400 transition-colors hover:text-white cursor-pointer" href="#features">Features</a>
            <a className="text-sm font-medium text-slate-400 transition-colors hover:text-white cursor-pointer" href="#process">Process</a>
            <a className="text-sm font-medium text-slate-400 transition-colors hover:text-white cursor-pointer" href="#pricing">Pricing</a>
            <a className="text-sm font-medium text-slate-400 transition-colors hover:text-white cursor-pointer" href="#faq">FAQ</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <button className="group relative flex h-9 items-center justify-center overflow-hidden rounded-lg bg-primary px-4 text-sm font-medium text-background-dark transition-all hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,183,127,0.4)]">
                <span className="relative z-10 flex items-center gap-2">
                  Launch App
                  <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-0.5">arrow_forward</span>
                </span>
              </button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative pt-16">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0 bg-neural-glow pointer-events-none min-h-screen"></div>
        <div className="absolute inset-0 z-0 opacity-[0.03] bg-grid-pattern bg-grid pointer-events-none min-h-screen"></div>

        {/* Hero Section */}
        <section className="relative z-10 px-4 pt-20 pb-16 sm:px-6 lg:px-8 lg:pt-32 lg:pb-24">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center rounded-full border border-border-dark bg-surface-dark px-3 py-1 text-xs font-medium text-primary shadow-[0_0_10px_rgba(16,183,127,0.1)]">
              <span className="flex h-1.5 w-1.5 rounded-full bg-primary mr-2 animate-pulse"></span>
              v2.0 Neural Engine Live
            </div>
            <h1 className="bg-gradient-to-b from-white to-slate-400 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-6xl lg:text-7xl leading-tight">
              Your Shopify Catalog,<br />
              Optimized by Intelligence.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
              Katalog AI audits your store, fixes low-quality listings, and unlocks hidden revenue using advanced neural processing. Stop guessing, start scaling.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/login" className="w-full sm:w-auto">
                <button className="group flex h-12 w-full min-w-[160px] items-center justify-center rounded-lg bg-primary px-6 text-base font-semibold text-background-dark transition-all hover:bg-emerald-400 hover:shadow-[0_0_30px_rgba(16,183,127,0.3)]">
                  Connect Store
                </button>
              </Link>
              <button className="group flex h-12 w-full min-w-[160px] items-center justify-center gap-2 rounded-lg border border-border-dark bg-surface-dark/50 px-6 text-base font-semibold text-white backdrop-blur-sm transition-all hover:border-slate-500 hover:bg-surface-dark sm:w-auto">
                <span className="material-symbols-outlined text-[20px]">play_circle</span>
                Watch Demo
              </button>
            </div>

            {/* Visual Neural Radar */}
            <div className="mt-20 relative mx-auto max-w-5xl rounded-2xl border border-white/5 bg-white/5 p-2 shadow-2xl backdrop-blur-xl">
              <div className="relative overflow-hidden rounded-xl bg-surface-darker aspect-[16/9] flex items-center justify-center group border border-white/5">
                <div className="absolute inset-0 z-0">
                  <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/40 rounded-full animate-pulse-slow"></div>
                  <div className="absolute top-3/4 right-1/3 w-1.5 h-1.5 bg-primary/30 rounded-full animate-pulse delay-700"></div>
                  <div className="absolute top-1/2 left-2/3 w-1 h-1 bg-white/20 rounded-full animate-pulse delay-1000"></div>
                </div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent animate-pulse-glow z-0"></div>
                <div
                  className="relative w-full h-full flex items-center justify-center bg-cover bg-center z-10 transition-transform duration-700 group-hover:scale-[1.02]"
                  style={{
                    backgroundImage: `linear-gradient(rgba(18, 18, 20, 0.7), rgba(18, 18, 20, 0.3)), url('https://lh3.googleusercontent.com/aida-public/AB6AXuBa0LyKD9GxL4BW1ESj_uBcyS7Y404adXqpms_CLmMxWISkxEvsWdfesAr9VnSckYG-CRgmiQDYFmKMVYfzgZ0Lta1CgguF9dN4Zz782_xIlvLEeEtRlJYpFFb2a8C-Y-ARllF3pQA2VcDofF7jorIFoHXdYR0d7CR5kQRPkaksdi1Tgj_6zjUU36lrMjcvHDzSIN66LkadvhjJThCm_zaALBRNkgmh8sdwBexkIiMZxVCuklJy48uiqTWyBN6eX9BBYrEmjT-7vGI2')`
                  }}
                >
                  <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,rgba(16,183,127,0.1)_60deg,transparent_60deg)] animate-[spin_4s_linear_infinite] opacity-30 pointer-events-none rounded-full scale-[1.5]"></div>
                  <div className="text-center z-20 backdrop-blur-sm bg-black/20 p-8 rounded-2xl border border-white/5">
                    <div className="relative inline-block">
                      <span className="material-symbols-outlined text-6xl text-primary mb-4 animate-float relative z-10 font-bold">radar</span>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-primary/20 blur-xl rounded-full animate-pulse"></div>
                    </div>
                    <p className="text-slate-300 text-sm font-mono tracking-[0.2em] mt-2 text-shadow-sm uppercase">Neural Scan Active</p>
                    <div className="flex justify-center gap-1 mt-2">
                      <span className="w-1 h-1 bg-primary rounded-full animate-bounce"></span>
                      <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:75ms]"></span>
                      <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:150ms]"></span>
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
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl leading-tight">How It Works</h2>
              <p className="mt-4 text-lg text-slate-400">From chaos to clarity in three automated steps.</p>
            </div>
            <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-0">
              <div className="flex flex-col items-center text-center max-w-xs group">
                <div className="w-20 h-20 rounded-2xl bg-surface-dark border border-border-dark flex items-center justify-center shadow-lg group-hover:border-primary/50 group-hover:shadow-[0_0_20px_rgba(16,183,127,0.15)] transition-all duration-300 relative">
                  <span className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-surface-darker border border-border-dark flex items-center justify-center text-xs font-bold text-slate-400">1</span>
                  <span className="material-symbols-outlined text-4xl text-white group-hover:text-primary transition-colors">query_stats</span>
                </div>
                <h3 className="mt-6 text-xl font-bold text-white">Audit</h3>
                <p className="mt-2 text-sm text-slate-400">AI scans your entire catalog for missing data and errors.</p>
              </div>
              <div className="hidden lg:flex w-32 h-[2px] bg-border-dark relative mx-4">
                <div className="absolute top-0 left-0 h-full w-1/3 bg-primary animate-shimmer opacity-70"></div>
              </div>
              <div className="lg:hidden h-16 w-[2px] bg-border-dark relative my-2">
                <div className="absolute top-0 left-0 w-full h-1/3 bg-primary animate-shimmer-vertical opacity-70"></div>
              </div>
              <div className="flex flex-col items-center text-center max-w-xs group">
                <div className="w-20 h-20 rounded-2xl bg-surface-dark border border-border-dark flex items-center justify-center shadow-lg group-hover:border-primary/50 group-hover:shadow-[0_0_20px_rgba(16,183,127,0.15)] transition-all duration-300 relative">
                  <span className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-surface-darker border border-border-dark flex items-center justify-center text-xs font-bold text-slate-400">2</span>
                  <span className="material-symbols-outlined text-4xl text-white group-hover:text-primary transition-colors">auto_fix_high</span>
                </div>
                <h3 className="mt-6 text-xl font-bold text-white">Optimize</h3>
                <p className="mt-2 text-sm text-slate-400">Neural networks regenerate titles, fix images, and enrich tags.</p>
              </div>
              <div className="hidden lg:flex w-32 h-[2px] bg-border-dark relative mx-4">
                <div className="absolute top-0 left-0 h-full w-1/3 bg-primary animate-shimmer opacity-70 [animation-delay:1s]"></div>
              </div>
              <div className="lg:hidden h-16 w-[2px] bg-border-dark relative my-2">
                <div className="absolute top-0 left-0 w-full h-1/3 bg-primary animate-shimmer-vertical opacity-70 [animation-delay:1s]"></div>
              </div>
              <div className="flex flex-col items-center text-center max-w-xs group">
                <div className="w-20 h-20 rounded-2xl bg-surface-dark border border-border-dark flex items-center justify-center shadow-lg group-hover:border-primary/50 group-hover:shadow-[0_0_20px_rgba(16,183,127,0.15)] transition-all duration-300 relative">
                  <span className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-surface-darker border border-border-dark flex items-center justify-center text-xs font-bold text-slate-400">3</span>
                  <span className="material-symbols-outlined text-4xl text-white group-hover:text-primary transition-colors">sync_saved_locally</span>
                </div>
                <h3 className="mt-6 text-xl font-bold text-white">Sync</h3>
                <p className="mt-2 text-sm text-slate-400">Updates are pushed live to Shopify instantly with zero downtime.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Bento features */}
        <section className="py-24 sm:py-32 bg-surface-darker/30" id="features">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl leading-tight">Core Capabilities</h2>
              <p className="mt-4 text-lg text-slate-400">Unlock the hidden potential of your catalog with our advanced processing engine.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              <div className="group relative overflow-hidden rounded-2xl border border-border-dark bg-surface-dark p-8 hover:border-primary/50 transition-colors duration-300 md:col-span-1">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl transition-opacity duration-500 group-hover:opacity-100"></div>
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-surface-darker border border-border-dark text-primary shadow-inner">
                  <span className="material-symbols-outlined text-2xl font-bold">health_metrics</span>
                </div>
                <h3 className="text-xl font-bold text-white">Instant Health Score</h3>
                <p className="mt-2 text-slate-400 text-sm">Deep-scan visualization of your catalog health identifying missing attributes and poor images.</p>
                <div className="mt-6 h-32 w-full rounded-lg bg-surface-darker border border-border-dark overflow-hidden relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-20 h-20">
                      <svg className="transform -rotate-90 w-20 h-20">
                        <circle className="text-slate-800" cx="40" cy="40" fill="transparent" r="36" stroke="currentColor" strokeWidth="8"></circle>
                        <circle className="text-primary transition-all duration-1000" cx="40" cy="40" fill="transparent" r="36" stroke="currentColor" strokeDasharray="226" strokeDashoffset="40" strokeWidth="8"></circle>
                      </svg>
                      <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white font-bold text-sm">82%</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="group relative overflow-hidden rounded-2xl border border-border-dark bg-surface-dark p-8 hover:border-primary/50 transition-colors duration-300 md:col-span-1">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl transition-opacity duration-500 group-hover:opacity-100"></div>
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-surface-darker border border-border-dark text-primary shadow-inner">
                  <span className="material-symbols-outlined text-2xl font-bold">trending_up</span>
                </div>
                <h3 className="text-xl font-bold text-white">AI SEO Titles</h3>
                <p className="mt-2 text-slate-400 text-sm">Rank and conversion improvements automatically applied to thousands of SKUs instantly.</p>
                <div className="mt-6 h-32 w-full rounded-lg bg-surface-darker border border-border-dark p-4 flex flex-col justify-center gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500 line-through">
                    <span className="material-symbols-outlined text-sm">close</span>
                    <span>Blue Cotton T-Shirt L</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-primary font-medium bg-primary/10 p-2 rounded">
                    <span className="material-symbols-outlined text-sm">check</span>
                    <span>Premium Cotton Tee - Navy - L</span>
                  </div>
                </div>
              </div>
              <div className="group relative overflow-hidden rounded-2xl border border-border-dark bg-surface-dark p-8 hover:border-primary/50 transition-colors duration-300 md:col-span-1">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl transition-opacity duration-500 group-hover:opacity-100"></div>
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-surface-darker border border-border-dark text-primary shadow-inner">
                  <span className="material-symbols-outlined text-2xl font-bold">image</span>
                </div>
                <h3 className="text-xl font-bold text-white">Image Optimization</h3>
                <p className="mt-2 text-slate-400 text-sm">Auto-background removal and AI-generated alt text for accessibility and search.</p>
                <div className="mt-6 h-32 w-full rounded-lg bg-surface-darker border border-border-dark relative overflow-hidden group-hover:bg-grid-pattern">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-16 h-16 bg-slate-800 rounded-md overflow-hidden border border-slate-700">
                      <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="material-symbols-outlined text-white font-bold">auto_fix_normal</span>
                      </div>
                      <div className="w-full h-full bg-slate-700"></div>
                    </div>
                    <div className="absolute -bottom-2 right-4 text-[10px] bg-black/80 px-1.5 py-0.5 rounded text-primary font-mono border border-primary/20">ALT: Generated</div>
                  </div>
                </div>
              </div>
              <div className="group relative overflow-hidden rounded-2xl border border-border-dark bg-surface-dark p-8 hover:border-primary/50 transition-colors duration-300 md:col-span-2 lg:col-span-2">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl transition-opacity duration-500 group-hover:opacity-100"></div>
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-lg bg-surface-darker border border-border-dark text-primary shadow-inner">
                    <span className="material-symbols-outlined text-2xl font-bold">label</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Smart Data Enrichment</h3>
                    <p className="mt-2 text-slate-400 text-sm max-w-md">Our neural engine automatically tags products, assigns categories, and fills in missing attributes like color, material, and size.</p>
                    <div className="mt-6 flex flex-wrap gap-2">
                      <span className="px-2 py-1 rounded bg-slate-800 text-xs text-slate-400 border border-slate-700">Unisex</span>
                      <span className="material-symbols-outlined text-slate-600 text-sm pt-1">arrow_right_alt</span>
                      <span className="px-2 py-1 rounded bg-primary/10 text-xs text-primary border border-primary/20">Gender: Unisex</span>
                      <span className="px-2 py-1 rounded bg-primary/10 text-xs text-primary border border-primary/20">Material: 100% Cotton</span>
                      <span className="px-2 py-1 rounded bg-primary/10 text-xs text-primary border border-primary/20">Style: Minimalist</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="group relative overflow-hidden rounded-2xl border border-border-dark bg-surface-dark p-8 hover:border-primary/50 transition-colors duration-300 md:col-span-2 lg:col-span-1">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl transition-opacity duration-500 group-hover:opacity-100"></div>
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-surface-darker border border-border-dark text-primary shadow-inner">
                  <span className="material-symbols-outlined text-2xl font-bold">sync_alt</span>
                </div>
                <h3 className="text-xl font-bold text-white">One-Click Sync</h3>
                <p className="mt-2 text-slate-400 text-sm">Seamless Shopify integration with zero downtime. Changes live in seconds.</p>
                <div className="mt-6 h-32 w-full rounded-lg bg-surface-darker border border-border-dark flex items-center justify-center relative overflow-hidden">
                  <div className="flex items-center gap-6">
                    <div className="w-10 h-10 rounded bg-[#95BF47] flex items-center justify-center text-black font-bold text-xs shadow-lg z-10">
                      <span className="material-symbols-outlined text-xl font-bold">shopping_bag</span>
                    </div>
                    <div className="flex-1 h-[2px] w-20 bg-slate-700 relative overflow-hidden">
                      <div className="absolute top-0 left-0 h-full w-1/2 bg-primary animate-shimmer"></div>
                    </div>
                    <div className="w-10 h-10 rounded bg-surface-dark border border-primary flex items-center justify-center text-primary font-bold text-xs shadow-[0_0_15px_rgba(16,183,127,0.3)] z-10">
                      <span className="material-symbols-outlined text-xl font-bold">smart_toy</span>
                    </div>
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
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl leading-tight">Simple, Transparent Pricing</h2>
              <p className="mt-4 text-lg text-slate-400">Choose the plan that fits your catalog size.</p>
            </div>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-8 items-start">
              {/* Starter */}
              <div className="rounded-3xl border border-border-dark bg-surface-dark/40 p-8 backdrop-blur-md transition-transform hover:-translate-y-1">
                <h3 className="text-lg font-semibold leading-8 text-white">Starter</h3>
                <p className="mt-4 text-sm leading-6 text-slate-400">Perfect for small stores just starting optimization.</p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold tracking-tight text-white">$29</span>
                  <span className="text-sm font-semibold leading-6 text-slate-400">/month</span>
                </p>
                <Link href="/login" className="mt-6 block rounded-md border border-border-dark bg-white/5 py-2 px-3 text-center text-sm font-semibold leading-6 text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors">
                  Get started
                </Link>
                <ul className="mt-8 space-y-3 text-sm leading-6 text-slate-300" role="list">
                  <li className="flex gap-x-3"><span className="material-symbols-outlined text-primary text-sm font-bold">check</span> Up to 1,000 products</li>
                  <li className="flex gap-x-3"><span className="material-symbols-outlined text-primary text-sm font-bold">check</span> Basic SEO titles</li>
                  <li className="flex gap-x-3"><span className="material-symbols-outlined text-primary text-sm font-bold">check</span> Weekly sync</li>
                </ul>
              </div>

              {/* Pro */}
              <div className="relative rounded-3xl border-2 border-primary bg-surface-dark/80 p-8 shadow-[0_0_40px_rgba(16,183,127,0.15)] backdrop-blur-xl transition-transform hover:-translate-y-1 lg:-mt-4 lg:mb-4 lg:p-10 pricing-glow">
                <div className="absolute -top-5 left-0 right-0 mx-auto w-32 rounded-full bg-primary px-3 py-1 text-center text-xs font-semibold text-background-dark shadow-lg">Most Popular</div>
                <h3 className="text-lg font-semibold leading-8 text-white">Pro</h3>
                <p className="mt-4 text-sm leading-6 text-slate-400">For growing brands needing full automation.</p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-5xl font-bold tracking-tight text-white">$79</span>
                  <span className="text-sm font-semibold leading-6 text-slate-400">/month</span>
                </p>
                <Link href="/login" className="mt-6 block rounded-md bg-primary py-2.5 px-3 text-center text-sm font-semibold leading-6 text-background-dark shadow-sm hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all">
                  Get started
                </Link>
                <ul className="mt-8 space-y-3 text-sm leading-6 text-slate-300" role="list">
                  <li className="flex gap-x-3"><span className="material-symbols-outlined text-primary text-sm font-bold">check</span> Up to 10,000 products</li>
                  <li className="flex gap-x-3"><span className="material-symbols-outlined text-primary text-sm font-bold">check</span> Advanced SEO & Description AI</li>
                  <li className="flex gap-x-3"><span className="material-symbols-outlined text-primary text-sm font-bold">check</span> Image optimization</li>
                  <li className="flex gap-x-3"><span className="material-symbols-outlined text-primary text-sm font-bold">check</span> Daily auto-sync</li>
                </ul>
              </div>

              {/* Enterprise */}
              <div className="rounded-3xl border border-border-dark bg-surface-dark/40 p-8 backdrop-blur-md transition-transform hover:-translate-y-1">
                <h3 className="text-lg font-semibold leading-8 text-white">Enterprise</h3>
                <p className="mt-4 text-sm leading-6 text-slate-400">Custom solutions for high-volume merchants.</p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold tracking-tight text-white">$199</span>
                  <span className="text-sm font-semibold leading-6 text-slate-400">/month</span>
                </p>
                <Link href="/login" className="mt-6 block rounded-md border border-border-dark bg-white/5 py-2 px-3 text-center text-sm font-semibold leading-6 text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors">
                  Contact sales
                </Link>
                <ul className="mt-8 space-y-3 text-sm leading-6 text-slate-300" role="list">
                  <li className="flex gap-x-3"><span className="material-symbols-outlined text-primary text-sm font-bold">check</span> Unlimited products</li>
                  <li className="flex gap-x-3"><span className="material-symbols-outlined text-primary text-sm font-bold">check</span> Custom AI models</li>
                  <li className="flex gap-x-3"><span className="material-symbols-outlined text-primary text-sm font-bold">check</span> Dedicated success manager</li>
                  <li className="flex gap-x-3"><span className="material-symbols-outlined text-primary text-sm font-bold">check</span> API Access</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-24 border-t border-border-dark bg-surface-darker/30" id="faq">
          <div className="mx-auto max-w-3xl px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tight text-white text-center mb-12 sm:text-4xl leading-tight">Intelligence, Demystified.</h2>
            <div className="space-y-4">
              <details className="group rounded-xl bg-surface-dark border border-border-dark p-6 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between text-white">
                  <h3 className="font-medium text-lg">Does Katalog AI modify my live store directly?</h3>
                  <span className="ml-1.5 flex-shrink-0 rounded-full bg-white/5 p-1.5 text-white sm:p-3 group-open:bg-primary/20 group-open:text-primary transition-all duration-300">
                    <span className="material-symbols-outlined group-open:hidden font-bold">add</span>
                    <span className="material-symbols-outlined hidden group-open:block font-bold">remove</span>
                  </span>
                </summary>
                <p className="mt-4 leading-relaxed text-slate-400 text-sm">
                  Not immediately. Katalog AI creates a staging version of your changes. You can review all proposed optimizations in our dashboard before syncing them to your live Shopify store with one click.
                </p>
              </details>
              <details className="group rounded-xl bg-surface-dark border border-border-dark p-6 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between text-white">
                  <h3 className="font-medium text-lg">How does the AI know my brand voice?</h3>
                  <span className="ml-1.5 flex-shrink-0 rounded-full bg-white/5 p-1.5 text-white sm:p-3 group-open:bg-primary/20 group-open:text-primary transition-all duration-300">
                    <span className="material-symbols-outlined group-open:hidden font-bold">add</span>
                    <span className="material-symbols-outlined hidden group-open:block font-bold">remove</span>
                  </span>
                </summary>
                <p className="mt-4 leading-relaxed text-slate-400 text-sm">
                  During onboarding, you can upload style guides or examples of your best product descriptions. Our neural engine analyzes these to fine-tune the tone, structure, and vocabulary used in generated content.
                </p>
              </details>
              <details className="group rounded-xl bg-surface-dark border border-border-dark p-6 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between text-white">
                  <h3 className="font-medium text-lg">Can I revert changes if I don't like them?</h3>
                  <span className="ml-1.5 flex-shrink-0 rounded-full bg-white/5 p-1.5 text-white sm:p-3 group-open:bg-primary/20 group-open:text-primary transition-all duration-300">
                    <span className="material-symbols-outlined group-open:hidden font-bold">add</span>
                    <span className="material-symbols-outlined hidden group-open:block font-bold">remove</span>
                  </span>
                </summary>
                <p className="mt-4 leading-relaxed text-slate-400 text-sm">
                  Absolutely. Katalog AI maintains a version history of your products. You can roll back to any previous version of a product listing instantly through our dashboard.
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
            <h2 className="relative z-10 text-3xl font-bold tracking-tight text-white sm:text-4xl leading-tight">Ready to fix your catalog?</h2>
            <p className="relative z-10 mx-auto mt-6 max-w-xl text-lg text-slate-300">Join hundreds of Shopify merchants optimizing their revenue today with just a few clicks.</p>
            <div className="relative z-10 mt-10 flex justify-center">
              <Link href="/login">
                <button className="flex h-14 min-w-[200px] items-center justify-center rounded-xl bg-primary px-8 text-lg font-bold text-background-dark shadow-[0_0_40px_rgba(16,183,127,0.4)] transition-all hover:scale-105 hover:bg-emerald-400 hover:shadow-[0_0_60px_rgba(16,183,127,0.6)]">
                  Start Free Trial
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer info */}
        <footer className="border-t border-border-dark bg-background-dark py-12">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/20 text-primary">
                <span className="material-symbols-outlined text-sm font-bold">auto_awesome</span>
              </div>
              <span className="text-sm font-semibold text-white">Katalog AI</span>
            </div>
            <div className="flex gap-8">
              <a className="text-sm text-slate-500 hover:text-white transition-colors" href="#">Privacy</a>
              <a className="text-sm text-slate-500 hover:text-white transition-colors" href="#">Terms</a>
              <a className="text-sm text-slate-500 hover:text-white transition-colors" href="#">Twitter</a>
            </div>
            <p className="text-sm text-slate-600">© 2024 Katalog AI Inc.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
