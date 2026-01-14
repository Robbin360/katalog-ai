import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Zap, CheckCircle2, DollarSign, Globe, Layers, BarChart3, Clock } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-indigo-500/30">
      
      {/* NAV */}
      <nav className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Marca protegida de traducción */}
          <span className="text-xl font-black tracking-tighter notranslate">
            Katalog<span className="text-indigo-500">.ai</span>
          </span>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-zinc-400 hover:text-white text-sm">
                <span>Log in</span>
              </Button>
            </Link>
            <Link href="/login">
              <Button className="bg-white text-black hover:bg-zinc-200 font-bold text-sm">
                <span>Get Started</span>
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-mono text-indigo-400 mb-8">
          <Zap className="w-3 h-3" /> 
          <span>AI-POWERED COMMERCE</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
          <span>Stop Writing.</span><br/>
          <span>Start Selling.</span>
        </h1>
        
        <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          <span>Transform raw product photos into professional Shopify listings in seconds. Our AI analyzes your image visually and writes technical, SEO-optimized copy automatically.</span>
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login">
            <Button className="h-14 px-8 text-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-900/20 rounded-full transition-all hover:scale-105">
              <span>Try for Free</span> <ArrowRight className="ml-2 w-5 h-5"/>
            </Button>
          </Link>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 bg-zinc-900/30 border-y border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
          
          <Feature 
            icon={<Layers className="w-6 h-6 text-yellow-400"/>}
            title="Visual Intelligence"
            desc="Detects materials, colors, and product types directly from your image pixels without manual input."
          />
          
          <Feature 
            icon={<Globe className="w-6 h-6 text-emerald-400"/>}
            title="Native SEO"
            desc="Generates H1 titles, Meta descriptions, and Keywords strictly following Google & Shopify best practices."
          />
          
          <Feature 
            icon={<DollarSign className="w-6 h-6 text-indigo-400"/>}
            title="Conversion Copy"
            desc="Writes descriptions that focus on benefits and technical accuracy to close sales faster."
          />
        </div>
      </section>

      {/* STATS (Ajustado a los Grandes Mercados) */}
      <section className="py-20 px-6 text-center">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <Stat number="10x" label="Faster Listing" />
          <Stat number="10+" label="Major Languages" />
          <Stat number="1-Click" label="Generation" />
          <Stat number="24/7" label="Uptime" />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 text-center text-zinc-600 text-sm border-t border-zinc-900 bg-zinc-950">
        <p>
          <span>© 2026</span> <span className="notranslate font-bold text-zinc-500">Katalog AI</span>. <span>Engineered for Global Scale.</span>
        </p>
      </footer>
    </div>
  )
}

// Componentes Auxiliares (Limpios y Modulares)
function Feature({icon, title, desc}: any) {
  return (
    <div className="space-y-4 p-6 rounded-2xl bg-zinc-950/50 border border-zinc-800/50 hover:border-zinc-700 transition-colors group">
      <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-zinc-600 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white"><span>{title}</span></h3>
      <p className="text-zinc-400 leading-relaxed"><span>{desc}</span></p>
    </div>
  )
}

function Stat({number, label}: any) {
  return (
    <div className="space-y-1">
      <div className="text-3xl md:text-4xl font-black text-white"><span>{number}</span></div>
      <div className="text-xs uppercase tracking-widest text-zinc-500 font-bold"><span>{label}</span></div>
    </div>
  )
}