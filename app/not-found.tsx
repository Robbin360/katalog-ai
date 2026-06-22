import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export default function NotFound() {
  return (
    <div className="bg-background-dark font-display text-slate-100 min-h-screen selection:bg-primary/30 antialiased flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="text-center max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-9xl font-extrabold text-primary mb-4">404</h1>
            <h2 className="text-4xl font-bold mb-4">Page Not Found</h2>
            <p className="text-xl text-slate-400 leading-relaxed">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/"
              className="inline-block bg-primary hover:bg-[#0da371] text-background-dark font-black px-8 py-3 rounded-xl transition-all shadow-xl shadow-primary/30"
            >
              Go Home
            </Link>
            <Link 
              href="/contact"
              className="inline-block bg-white/5 hover:bg-white/10 text-white font-bold px-8 py-3 rounded-xl transition-all border border-white/10"
            >
              Contact Support
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            <div className="glass-card rounded-2xl p-6">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-primary text-2xl">home</span>
              </div>
              <h3 className="font-bold mb-2">Home</h3>
              <p className="text-sm text-slate-500">Return to our homepage</p>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-primary text-2xl">integration_instructions</span>
              </div>
              <h3 className="font-bold mb-2">
                <Link href="/integrations" className="hover:text-primary transition-colors">
                  Integrations
                </Link>
              </h3>
              <p className="text-sm text-slate-500">Connect your e-commerce platform</p>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-primary text-2xl">help</span>
              </div>
              <h3 className="font-bold mb-2">
                <Link href="/faq" className="hover:text-primary transition-colors">
                  FAQ
                </Link>
              </h3>
              <p className="text-sm text-slate-500">Find answers to common questions</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
