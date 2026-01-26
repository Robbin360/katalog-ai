"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2, DollarSign, Globe, Layers, BarChart3, Clock, UploadCloud, Copy, Layout, Play, Check, Tag, Mic, Users, Sliders, Info, ShieldAlert, ChevronDown, Camera } from "lucide-react"
import { cn } from "@/lib/utils" // Assuming cn utility is available

export default function LandingPage() {
  // --- DEMO ANIMATION LOGIC ---
  const [demoState, setDemoState] = useState<'idle' | 'analyzing' | 'success' | 'published'>('idle')

  const runDemo = () => {
    if (demoState !== 'idle') return

    setDemoState('analyzing')

    // Step 1: Analyze (2s)
    setTimeout(() => {
      setDemoState('success')
    }, 2500)
  }

  const publishDemo = () => {
    if (demoState !== 'success') return
    setDemoState('published')
    setTimeout(() => setDemoState('idle'), 4000) // Reset after showing success
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden">

      {/* BACKGROUND DECORATION */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Animated Mesh Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/10 blur-[130px] rounded-full animate-pulse duration-[10s]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse duration-[15s] delay-1000" />
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-indigo-600/5 blur-[100px] rounded-full animate-pulse duration-[8s] delay-500" />

        {/* SVG Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.15] bg-grid-pattern" />

        {/* Top Gradient Beam */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-indigo-500/5 blur-[120px] rounded-full" />
      </div>

      {/* NAV */}
      <nav className="border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="relative w-8 h-8">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white notranslate">
                Katalog<span className="text-zinc-500 font-medium">.ai</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Log in</Link>
            <Link href="/login">
              <Button className="bg-white text-black hover:bg-zinc-200 font-bold px-5 h-9 rounded-full text-xs transition-all hover:scale-105 active:scale-95">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-24 pb-32 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-bold tracking-widest text-indigo-400 uppercase">
            <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
            Now with 1-Click Shopify Integration
          </div>

          <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] text-white">
            Scale your store <br />
            <span className="bg-linear-to-b from-white to-zinc-500 bg-clip-text text-transparent">10x faster with AI.</span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed font-medium">
            Upload a photo, let the AI analyze it visually, and publish professional listings to <span className="text-white font-bold">Shopify</span> in seconds. Perfect for Amazon, eBay, and more.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/login">
              <Button className="h-14 px-10 text-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-2xl shadow-indigo-900/40 rounded-full transition-all hover:scale-105 group">
                Start Free Trial <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button
              onClick={runDemo}
              variant="outline"
              className="h-14 px-10 text-lg border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 text-white rounded-full transition-all active:scale-95"
            >
              <Play className="mr-2 w-4 h-4 fill-current" /> {demoState === 'idle' ? 'View Demo' : 'Replay Demo'}
            </Button>
          </div>
        </div>

        {/* HOW IT WORKS STEPS (Idea 1) */}
        <div className="max-w-5xl mx-auto mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-linear-to-r from-transparent via-zinc-800 to-transparent hidden md:block -z-10" />
          <StepCard
            number="01"
            icon={<Camera className="w-8 h-8" />}
            title="Capture & Specify"
            description="Upload an image and provide detailed technical specs (materials, exact weight, dimensions) to guide the AI."
          />
          <StepCard
            number="02"
            icon={<Layers className="w-8 h-8" />}
            title="AI SEO Engine"
            description="Our AI synthesizes your technical data with visual analysis to build a complete SEO listing instantly."
          />
          <StepCard
            number="03"
            icon={<UploadCloud className="w-8 h-8" />}
            title="Sync"
            description="Publish directly to your Shopify store with a single click."
          />
        </div>

        {/* VISUAL MOCKUP (INTERACTIVE DEMO) */}
        <div className="mt-20 max-w-6xl mx-auto relative group notranslate" translate="no">
          <div className="absolute inset-0 bg-indigo-500/10 blur-[80px] rounded-full transition-opacity group-hover:opacity-100 opacity-50" />

          <div className="relative bg-[#020202] border border-zinc-800/80 rounded-2xl shadow-2xl overflow-hidden group-hover:border-zinc-700 transition-colors flex h-[600px]">

            {/* SIDEBAR MOCKUP (Full app feel) */}
            <aside className="w-64 border-r border-zinc-800 bg-zinc-950 hidden md:flex flex-col shrink-0">
              <div className="h-14 flex items-center px-4 border-b border-zinc-800 gap-2">
                <div className="w-6 h-6">
                  <img src="/logo.png" alt="Katalog" className="w-full h-full object-contain" />
                </div>
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-widest">Collection</span>
              </div>
              <div className="p-3 border-b border-zinc-800 bg-zinc-900/50">
                <div className="h-8 w-full bg-zinc-900 border border-zinc-800 rounded-lg flex items-center px-3 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Inventory (4)</div>
              </div>
              <div className="flex-1 p-2 space-y-1 overflow-hidden">
                <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-zinc-800 shrink-0" />
                  <div className="flex-1 space-y-1">
                    <div className="h-2 w-16 bg-zinc-700 rounded" />
                    <div className="h-1.5 w-12 bg-zinc-800 rounded" />
                  </div>
                </div>
                {[1, 2, 3].map(i => (
                  <div key={i} className="p-2 opacity-30 flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-zinc-900 border border-zinc-800 shrink-0" />
                    <div className="flex-1 space-y-1">
                      <div className="h-2 w-20 bg-zinc-800 rounded" />
                      <div className="h-1.5 w-10 bg-zinc-900 rounded" />
                    </div>
                  </div>
                ))}
              </div>
              {/* NOTE: No settings/billing at the bottom left as requested */}
            </aside>

            {/* MAIN CONTENT MOCKUP */}
            <main className="flex-1 flex flex-col min-w-0 bg-[#060606]">
              {/* Simplified Example Disclaimer */}
              <div className="bg-indigo-500/10 border-b border-indigo-500/20 py-1.5 px-4 flex items-center justify-center gap-2">
                <Info className="w-3 h-3 text-indigo-400" />
                <span className="text-[9px] font-bold text-indigo-300 uppercase tracking-widest">
                  Limited Demo • Simplified example of the real tool
                </span>
              </div>
              {/* Fake App Header */}
              <header className="h-14 border-b border-zinc-800 flex items-center justify-between px-6 shrink-0 bg-zinc-950/50">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/30" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/30" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/30" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">
                    {demoState === 'analyzing' ? (
                      <div key="status-analyzing" className="flex items-center gap-2">
                        <UploadCloud className="w-3 h-3 text-indigo-500 animate-bounce" /> Analyzing...
                      </div>
                    ) : (
                      <div key="status-idle" className="flex items-center gap-2">
                        <Layout className="w-3 h-3" /> Workbench
                      </div>
                    )}
                  </div>
                  {demoState === 'success' && (
                    <div key="badge-ready" className="px-3 py-1 bg-green-500/10 text-green-500 rounded text-[10px] font-bold border border-green-500/20 animate-in fade-in zoom-in">READY TO PUBLISH</div>
                  )}
                  {demoState === 'published' && (
                    <div key="badge-success" className="px-3 py-1 bg-indigo-500 text-white rounded text-[10px] font-bold animate-in zoom-in">PUBLISHED</div>
                  )}
                </div>
              </header>

              <div className="flex-1 overflow-y-auto p-6 md:p-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Image Area (Col 1-4) */}
                  <div className="lg:col-span-4 space-y-4">
                    <div className="aspect-square bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-center relative shadow-inner group/img overflow-hidden">
                      {demoState === 'idle' ? (
                        <div key="img-idle" className="text-zinc-800 flex flex-col items-center gap-4">
                          <UploadCloud className="w-16 h-16 opacity-10" />
                          <span className="text-[10px] font-bold opacity-20 uppercase tracking-[0.2em]">Awaiting Input</span>
                        </div>
                      ) : (
                        <img
                          key="img-product"
                          src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop"
                          alt="Product"
                          className="w-full h-full object-cover animate-in fade-in duration-1000"
                        />
                      )}
                      {demoState === 'analyzing' && (
                        <div key="img-loader" className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                          <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin shadow-lg" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-20 bg-zinc-900 border border-zinc-800 rounded flex items-center justify-center text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Product ID</div>
                        <div className="h-4 w-32 bg-zinc-900 border border-zinc-800 rounded flex items-center justify-center text-[8px] font-bold text-zinc-700 font-mono">#DEMO-SH-270</div>
                      </div>
                      <div className="space-y-1.5 pt-2 border-t border-zinc-900 mt-2">
                        <div className="text-[7px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Technical Specifications</div>
                        <div className="bg-zinc-900/50 p-2 rounded border border-zinc-800/50">
                          <p className="text-[8px] text-zinc-400 font-medium">
                            {demoState === 'idle' ? 'e.g. 500g, 100% Aerospace Titanium, Sapphire Crystal...' : (
                              <span className="text-zinc-300">Spec: React Foam Midsole, Dual-density Mesh, Reflective Heel Tab.</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Middle Area (Title / Desc / Results) (Col 5-9) */}
                  <div className="lg:col-span-5 space-y-6 border-r border-zinc-900/50 pr-8 overflow-y-auto">
                    <div className="space-y-4">
                      <div className="space-y-3">
                        {demoState === 'success' || demoState === 'published' ? (
                          <div className="space-y-6 animate-in fade-in duration-700">
                            <div className="space-y-1">
                              <h3 key="title-real" className="text-xl font-black text-white italic leading-tight">Nike Air Max 270 React</h3>
                              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">SEO Title (H1)</p>
                            </div>

                            <div className="space-y-2">
                              <p key="desc-real" className="text-[11px] leading-relaxed text-zinc-400 font-medium">
                                Elevate your performance with the Nike Air Max 270 React. Engineered with <span className="text-zinc-200">100% breathable mesh</span> and revolutionary <span className="text-zinc-200">React Foam technology</span> for unmatched cushioning. Features <span className="text-zinc-200">reflective accents</span> and a structured heel support system.
                              </p>
                              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">SEO Description</p>
                            </div>

                            <div className="space-y-2">
                              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 text-[9px] text-zinc-500 leading-relaxed font-mono">
                                &lt;div class="product-info"&gt;<br />
                                &nbsp;&lt;h2&gt;Premium Comfort&lt;/h2&gt;<br />
                                &nbsp;&lt;p&gt;Step into the future...&lt;/p&gt;<br />
                                &lt;/div&gt;
                              </div>
                              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Generated HTML</p>
                            </div>

                            <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-4 space-y-3">
                              <div className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                <Layers className="w-3 h-3 text-emerald-500" /> Key Features
                              </div>
                              <ul className="space-y-1.5">
                                <li className="text-[10px] text-zinc-400 flex items-center gap-2">
                                  <div className="w-1 h-1 rounded-full bg-emerald-500" /> React foam midsole
                                </li>
                                <li className="text-[10px] text-zinc-400 flex items-center gap-2">
                                  <div className="w-1 h-1 rounded-full bg-emerald-500" /> 270 Max Air unit
                                </li>
                                <li className="text-[10px] text-zinc-400 flex items-center gap-2">
                                  <div className="w-1 h-1 rounded-full bg-emerald-500" /> Breathable mesh upper
                                </li>
                              </ul>
                            </div>

                            <div className="space-y-2 pb-6">
                              <div className="flex flex-wrap gap-1.5">
                                <div className="px-2 py-0.5 bg-zinc-800 text-[8px] text-zinc-400 rounded border border-zinc-700">Sneakers</div>
                                <div className="px-2 py-0.5 bg-zinc-800 text-[8px] text-zinc-400 rounded border border-zinc-700">Nike Air</div>
                                <div className="px-2 py-0.5 bg-zinc-800 text-[8px] text-zinc-400 rounded border border-zinc-700">Athletic</div>
                              </div>
                              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">SEO Keywords</p>
                            </div>
                          </div>
                        ) : (
                          <div key="content-skeleton" className="space-y-6">
                            <div className="space-y-2">
                              <div className="h-6 w-full bg-zinc-900/50 rounded animate-pulse" />
                              <div className="h-2 w-20 bg-zinc-900 rounded" />
                            </div>
                            <div className="space-y-2">
                              <div className="h-3 w-full bg-zinc-900/20 rounded" />
                              <div className="h-3 w-3/4 bg-zinc-900/20 rounded" />
                              <div className="h-2 w-24 bg-zinc-900 rounded" />
                            </div>
                            <div className="h-24 w-full bg-zinc-900/10 border border-zinc-800/50 rounded-lg animate-pulse" />
                            <div className="h-20 w-full bg-zinc-900/10 border border-zinc-800/50 rounded-lg" />
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3 pt-6 sticky bottom-0 bg-[#060606] py-4 border-t border-zinc-800/30">
                        <button
                          key="btn-publish"
                          onClick={publishDemo}
                          disabled={demoState !== 'success'}
                          className={cn(
                            "flex-1 h-11 rounded-xl flex items-center justify-center text-[10px] font-black uppercase tracking-widest gap-2 transition-all duration-500",
                            demoState === 'success' ? "bg-green-600 hover:bg-green-500 text-white cursor-pointer shadow-xl shadow-green-900/20" :
                              demoState === 'published' ? "bg-indigo-600 text-white shadow-xl shadow-indigo-900/20 scale-95" : "bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-800"
                          )}
                        >
                          {demoState === 'published' ? <><Check className="w-4 h-4" /> Pushed</> : <><UploadCloud className="w-4 h-4" /> Publish to Shopify</>}
                        </button>
                        <div key="btn-copy" className="w-11 h-11 bg-zinc-900/50 border border-zinc-800 rounded-xl flex items-center justify-center">
                          <Copy className="w-4 h-4 text-zinc-600" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Area (AI Config) (Col 10-12) */}
                  <div className="lg:col-span-3 space-y-6">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                      <div className="p-3 border-b border-zinc-800 bg-zinc-900/50 flex items-center gap-2">
                        <Sliders className="w-3 h-3 text-indigo-500" />
                        <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">AI Brain</span>
                      </div>

                      <div className="p-4 space-y-5">
                        {/* VOICE TONE */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-[9px] font-bold text-zinc-500 uppercase tracking-tighter">
                            <Mic className="w-2.5 h-2.5" /> Voice Tone
                          </div>
                          <div className="h-8 w-full bg-zinc-950 border border-zinc-800 rounded flex items-center px-3 text-[10px] text-zinc-300">
                            {demoState === 'success' || demoState === 'published' ? 'Luxury & Premium' : '...'}
                          </div>
                        </div>

                        {/* TARGET AUDIENCE */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-[9px] font-bold text-zinc-500 uppercase tracking-tighter">
                            <Users className="w-2.5 h-2.5" /> Audience
                          </div>
                          <div className="h-8 w-full bg-zinc-950 border border-zinc-800 rounded flex items-center px-3 text-[10px] text-zinc-300">
                            {demoState === 'success' || demoState === 'published' ? 'Gen Z (Sneakerheads)' : '...'}
                          </div>
                        </div>

                        {/* LANGUAGE */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-[9px] font-bold text-zinc-500 uppercase tracking-tighter">
                            <Globe className="w-2.5 h-2.5" /> Language
                          </div>
                          <div className="h-8 w-full bg-zinc-950 border border-zinc-800 rounded flex items-center px-3 text-[10px] text-zinc-300">
                            {demoState === 'success' || demoState === 'published' ? 'English (US)' : '...'}
                          </div>
                        </div>

                        {/* BEHAVIOR / FORBIDDEN */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-[9px] font-bold text-zinc-500 uppercase tracking-tighter">
                            <ShieldAlert className="w-2.5 h-2.5" /> Forbidden Words
                          </div>
                          <div className="h-8 w-full bg-zinc-950 border border-zinc-800 rounded flex items-center px-3 text-[10px] text-zinc-600 italic">
                            {demoState === 'success' || demoState === 'published' ? 'cheap, bargain, budget' : 'e.g. cheap, limited...'}
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <p className="mt-4 text-center text-[10px] text-zinc-700 font-bold uppercase tracking-widest">
          Interactive Showcase • Feature Focus Mode
        </p>
      </section>

      {/* PLATFORMS STRIP (Point 2) */}
      <section className="py-20 border-t border-zinc-900 bg-zinc-950/50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] mb-12">Universal Content Optimization</p>
          <div className="flex flex-wrap items-center justify-center gap-12 md:gap-20 opacity-40 hover:opacity-60 transition-opacity grayscale hover:grayscale-0 duration-500">
            <span className="text-xl font-bold tracking-tighter text-white">Shopify</span>
            <span className="text-xl font-bold tracking-tighter text-white">Amazon</span>
            <span className="text-xl font-bold tracking-tighter text-white">eBay</span>
            <span className="text-xl font-bold tracking-tighter text-white">MercadoLibre</span>
            <span className="text-xl font-bold tracking-tighter text-white">Etsy</span>
            <span className="text-xl font-bold tracking-tighter text-white">WooCommerce</span>
          </div>
          <p className="mt-12 text-sm text-zinc-500 max-w-xl mx-auto italic">
            "We generate perfectly formatted content ready to copy-paste for any listing or marketplace."
          </p>
        </div>
      </section>

      {/* VALUE PROP SECTIONS */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <ValueProp
            icon={<Layers className="w-6 h-6 text-indigo-400" />}
            title="Visual Intelligence"
            description="Our AI doesn't just read data; it looks at your product. It detects complex patterns, materials, and silhouettes directly from the image."
          />
          <ValueProp
            icon={<Globe className="w-6 h-6 text-emerald-400" />}
            title="Conversion-First SEO"
            description="Built-in expertise for search ranking. We generate H1 tags, alt-text, and metadata that actually move the needle on product page traffic."
          />
          <ValueProp
            icon={<DollarSign className="w-6 h-6 text-amber-400" />}
            title="Revenue Driven Copy"
            description="We write to sell. Our models are trained on high-converting listings to highlight benefits over features, closing sales automatically."
          />
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="py-24 bg-linear-to-b from-zinc-950 to-indigo-950/20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          <Stat number="10x" text="Listing Speed" />
          <Stat number="3s" text="AI Generation" />
          <Stat number="24/7" text="AI Availability" />
          <Stat number="0" text="Overhead Costs" />
        </div>
      </section>

      {/* FAQ SECTION (Idea 5) */}
      <section className="py-32 px-6">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-black tracking-tightest italic">Frequently Asked Questions</h2>
            <p className="text-zinc-500 font-medium">Everything you need to know to scale your store today.</p>
          </div>

          <div className="space-y-4">
            <FAQItem
              question="How can I improve the AI results?"
              answer="Data equals quality. While our AI perfectly identifies product types, providing detailed technical specs (like 'Aerospace-grade Aluminum', 'Waterproof IP68', or '250g weight') allows the engine to create descriptions with 10x more authority. The AI builds your SEO title and content using these facts to ensure your listing ranks higher and converts better."
            />
            <FAQItem
              question="Is it really 1-click?"
              answer="Yes. After your initial Shopify connection, simply click 'Publish' and Katalog.ai instantly creates a draft listing with high-converting descriptions, optimized images, and full SEO metadata."
            />
            <FAQItem
              question="Does it work with any product category?"
              answer="Katalog.ai is cross-trained on millions of e-commerce listings. It excels in moda/fashion, electronics, home decor, high-end jewelry, and collectibles."
            />
            <FAQItem
              question="What if my product photo is unproffesional?"
              answer="Our vision models are architected to extract silhouettes and textures even from low-light or mobile shots. For maximum conversion, higher quality photos allow the AI to detect intricate technical details automatically."
            />
            <FAQItem
              question="Do I maintain control over the generated content?"
              answer="Always. Every listing stays in the Workbench until you are satisfied. You can edit the HTML, refine use of forbidden words, or tweak the tone of voice before it ever hits your live store."
            />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-20 border-t border-zinc-900 bg-zinc-950 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8">
              <img src="/logo.png" alt="Katalog Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-white tracking-tighter">Katalog.ai</span>
          </div>
          <div className="flex gap-10 text-xs text-zinc-500 font-bold uppercase tracking-widest">
            <Link href="#" className="hover:text-white">Privacy</Link>
            <Link href="#" className="hover:text-white">Terms</Link>
            <Link href="#" className="hover:text-white">Contact</Link>
          </div>
          <p className="text-xs text-zinc-600">© 2026 Katalog AI. Engineered for e-commerce growth.</p>
        </div>
      </footer>
    </div>
  )
}

function ValueProp({ icon, title, description }: any) {
  return (
    <div className="p-8 rounded-3xl bg-zinc-900/30 border border-zinc-800/50 hover:border-zinc-700 transition-all duration-300 group">
      <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-4 italic tracking-tight">{title}</h3>
      <p className="text-zinc-400 leading-relaxed text-sm">{description}</p>
    </div>
  )
}

function Stat({ number, text }: any) {
  return (
    <div className="space-y-1">
      <div className="text-5xl md:text-6xl font-black text-white tracking-tighter">{number}</div>
      <div className="text-[10px] uppercase font-black text-indigo-500 tracking-widest">{text}</div>
    </div>
  )
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="border border-zinc-900 bg-zinc-900/20 rounded-2xl overflow-hidden transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 flex justify-between items-center text-left hover:bg-zinc-900/40 transition-colors"
      >
        <span className="font-bold text-lg text-zinc-200">{question}</span>
        <ChevronDown className={cn("w-5 h-5 text-zinc-500 transition-transform duration-300", isOpen && "rotate-180")} />
      </button>
      <div className={cn(
        "px-6 overflow-hidden transition-all duration-500 ease-in-out",
        isOpen ? "max-h-40 pb-6 opacity-100" : "max-h-0 opacity-0"
      )}>
        <p className="text-zinc-400 leading-relaxed text-sm">{answer}</p>
      </div>
    </div>
  )
}

function StepCard({ number, icon, title, description }: any) {
  return (
    <div className="relative p-8 rounded-3xl bg-zinc-900/20 border border-zinc-800/50 flex flex-col items-center text-center space-y-4 hover:border-indigo-500/30 transition-all group">
      <div className="absolute -top-3 -left-3 w-8 h-8 bg-zinc-950 border border-zinc-800 rounded-full flex items-center justify-center text-xs font-black text-indigo-500 shadow-xl">
        {number}
      </div>
      <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform duration-500 shadow-inner">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
      <p className="text-zinc-500 text-xs leading-relaxed">{description}</p>
    </div>
  )
}
