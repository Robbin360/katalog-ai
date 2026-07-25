// Server Component — NO "use client"
import Link from "next/link"
import { AuthThemeToggle } from "@/components/auth/theme-toggle"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <style>{`
                :root { --transition-speed: 0.5s; }

                body {
                    background-color: #09090b;
                    color: #ffffff;
                    font-family: "Inter", sans-serif;
                    overflow-x: hidden;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                    transition: background-color var(--transition-speed) cubic-bezier(0.4, 0, 0.2, 1),
                                color var(--transition-speed) cubic-bezier(0.4, 0, 0.2, 1);
                }

                /* ── Dark mode (default) ── */
                .nebula {
                    background: radial-gradient(circle at 50% 50%, #121214 0%, #09090b 100%);
                    position: fixed; inset: 0; z-index: -1;
                    transition: background var(--transition-speed) ease;
                }
                .nebula-glow {
                    position: absolute; width: 800px; height: 800px;
                    background: radial-gradient(circle, rgba(16,183,127,0.05) 0%, transparent 70%);
                    filter: blur(80px); border-radius: 50%; pointer-events: none;
                    transition: background var(--transition-speed) ease;
                }

                /* ── Light mode overrides ── */
                html:not(.dark) body { background-color: #f8fafc; color: #020617; -webkit-font-smoothing: subpixel-antialiased; }
                html:not(.dark) .nebula { background: radial-gradient(circle at 50% 50%, #ffffff 0%, #f1f5f9 100%); }
                html:not(.dark) .nebula-glow { background: radial-gradient(circle, rgba(16,183,127,0.12) 0%, transparent 70%); }
                html:not(.dark) .logo-container { background-color: #ffffff !important; border-color: rgba(16,183,127,0.15) !important; box-shadow: 0 20px 40px -10px rgba(15,23,42,0.1), 0 0 0 1px rgba(16,183,127,0.08) !important; }
                html:not(.dark) .logo-glow { background: radial-gradient(circle, rgba(16,183,127,0.18) 0%, transparent 70%) !important; opacity: 0.9 !important; filter: blur(15px) !important; }

                /* ── Glassmorphism card ── */
                .premium-glass {
                    background: rgba(18,18,20,0.8);
                    backdrop-filter: blur(40px); -webkit-backdrop-filter: blur(40px);
                    border: 1px solid rgba(255,255,255,0.05);
                    position: relative;
                    transition: background var(--transition-speed) ease, border-color var(--transition-speed) ease, box-shadow var(--transition-speed) ease;
                }
                .premium-glass::before {
                    content: ''; position: absolute; inset: 0; border-radius: inherit; padding: 1px;
                    background: linear-gradient(135deg, rgba(16,183,127,0.25) 0%, transparent 40%, transparent 100%);
                    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                    -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none;
                }
                html:not(.dark) .premium-glass {
                    background: rgba(255,255,255,0.95);
                    border: 1px solid rgba(15,23,42,0.08);
                    box-shadow: 0 25px 50px -12px rgba(15,23,42,0.08), 0 0 1px rgba(15,23,42,0.05);
                }

                /* ── Inputs ── */
                html:not(.dark) input { background: #ffffff !important; border: 1px solid #e2e8f0 !important; color: #0f172a !important; font-weight: 600; }
                html:not(.dark) input::placeholder { color: #94a3b8; }
                html:not(.dark) label { color: #0f172a !important; font-weight: 700 !important; }

                /* ── CTA Button ── */
                .neural-glow-btn {
                    box-shadow: 0 0 20px rgba(16,183,127,0.2);
                    transition: all 0.4s cubic-bezier(0.25,1,0.5,1);
                    position: relative; overflow: hidden;
                }
                .neural-glow-btn:hover { box-shadow: 0 0 35px rgba(16,183,127,0.45); transform: translateY(-2px); }
                .neural-glow-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
                html:not(.dark) .neural-glow-btn { box-shadow: 0 4px 6px -1px rgba(16,183,127,0.15), 0 2px 4px -1px rgba(16,183,127,0.1); }
                html:not(.dark) .neural-glow-btn:hover { box-shadow: 0 0 30px rgba(16,183,127,0.4), 0 10px 20px -5px rgba(16,183,127,0.2); }

                /* ── Social buttons (login style) ── */
                .social-btn {
                    background: rgba(255,255,255,0.03); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
                    border: 1px solid rgba(255,255,255,0.08);
                    transition: all 0.5s cubic-bezier(0.2,1,0.3,1); position: relative; overflow: hidden;
                }
                .social-btn:hover { transform: translateY(-3px); background: rgba(255,255,255,0.08); border-color: rgba(16,183,127,0.4); box-shadow: 0 10px 25px -5px rgba(16,183,127,0.35); }
                html:not(.dark) .social-btn { background: #ffffff; border-color: #e2e8f0; }
                html:not(.dark) .social-btn:hover { border-color: #10b77f; box-shadow: 0 12px 30px -4px rgba(16,183,127,0.5); background: #ffffff; }

                /* ── Social buttons (signup / premium style) ── */
                .social-btn-premium {
                    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05);
                    transition: all 0.4s cubic-bezier(0.25,1,0.5,1); position: relative; z-index: 1;
                }
                .social-btn-premium:hover { transform: scale(1.05); border-color: rgba(16,183,127,0.5); box-shadow: 0 0 25px rgba(16,183,127,0.35); background: rgba(16,183,127,0.08); }
                html:not(.dark) .social-btn-premium { background: #ffffff; border: 1px solid rgba(15,23,42,0.08); box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
                html:not(.dark) .social-btn-premium:hover { box-shadow: 0 10px 25px -5px rgba(16,183,127,0.4); background: rgba(16,183,127,0.08); border-color: rgba(16,183,127,0.4); }

                /* ── Pass toggle ── */
                .pass-toggle:active span { text-shadow: 0 0 8px rgba(16,183,127,0.8); transform: scale(0.9); }
                html:not(.dark) .pass-toggle { color: #475569; }
                html:not(.dark) .pass-toggle:hover { color: #10b77f; }

                /* ── Password strength ── */
                .strength-meter { height: 3px; transition: all 0.3s ease; }
                .strength-weak   { width: 33%;  background-color: #ef4444; }
                .strength-medium { width: 66%;  background-color: #eab308; }
                .strength-strong { width: 100%; background-color: #10b77f; }
            `}</style>

            {/* Animated theme toggle (client component) */}
            <AuthThemeToggle />

            {/* Premium Background */}
            <div className="nebula">
                <div className="nebula-glow" style={{ top: "-20%", left: "-10%" }} />
                <div className="nebula-glow" style={{ bottom: "-20%", right: "-10%", opacity: 0.5 }} />
            </div>

            {/* Page Shell */}
            <main className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">

                {/* Branding */}
                <div className="flex flex-col items-center mb-10 animate-fade-in">
                    <div className="logo-container w-16 h-16 bg-[#121214] flex items-center justify-center mb-6 rounded-2xl border border-white/10 shadow-2xl relative animate-float transition-all duration-700">
                        <div className="logo-glow absolute inset-0 bg-[#10b77f]/20 blur-xl rounded-full transition-all duration-700" />
                        <img 
                            src="/logo-dark.svg" 
                            alt="Katalog AI Logo" 
                            className="w-10 h-10 relative z-10 hidden dark:block object-contain" 
                        />
                        <img 
                            src="/logo-light.svg" 
                            alt="Katalog AI Logo" 
                            className="w-10 h-10 relative z-10 block dark:hidden object-contain" 
                        />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-white mb-2 transition-colors duration-700">
                        Katalog AI
                    </h1>
                    <p className="text-xs tracking-[0.25em] uppercase font-bold text-[#10b77f]">
                        Catalog optimization for Shopify
                    </p>
                </div>

                {/* Auth form injected here */}
                {children}

                {/* Footer */}
                <footer className="mt-12 flex flex-col items-center gap-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                    <div className="flex flex-wrap justify-center gap-8">
                        {([
                            { label: "Privacy",  href: "/privacy"  },
                            { label: "Terms",    href: "/terms"    },
                        ] as const).map(({ label, href }) => (
                            <Link
                                key={href}
                                href={href}
                                className="text-xs font-bold tracking-[0.1em] uppercase text-zinc-500 hover:text-[#10b77f] transition-colors"
                            >
                                {label}
                            </Link>
                        ))}
                    </div>
                    <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-white/20 transition-colors duration-700">
                        © {new Date().getFullYear()} <span className="notranslate">Katalog AI</span>. Secure Infrastructure.
                    </p>
                </footer>
            </main>
        </>
    )
}
