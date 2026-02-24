import Link from 'next/link';

export default function FeaturesPage() {
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

            <nav className="sticky top-0 z-50 w-full bg-background-dark/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex-1 flex justify-start">
                        <div className="flex items-center gap-2.5">
                            <div className="relative flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-3xl font-light">account_tree</span>
                                <div className="absolute -top-1 -right-1 size-2 bg-primary rounded-full"></div>
                            </div>
                            <span className="font-bold tracking-tight text-xl text-white">Katalog AI</span>
                        </div>
                    </div>

                    <div className="hidden md:flex flex-1 justify-center items-center gap-8">
                        <Link className="text-sm font-medium text-primary" href="/features">Capacidades</Link>
                        <Link className="text-sm font-medium text-slate-400 hover:text-primary transition-colors" href="/integrations">Integraciones</Link>
                        <Link className="text-sm font-medium text-slate-400 hover:text-primary transition-colors" href="/pricing">Precios</Link>
                        <Link className="text-sm font-medium text-slate-400 hover:text-primary transition-colors" href="/faq">FAQ</Link>
                    </div>

                    <div className="flex-1 flex justify-end items-center gap-4">
                        <button className="bg-primary hover:bg-[#0da371] text-background-dark font-bold px-6 py-2.5 rounded-lg transition-all shadow-lg shadow-primary/20 text-sm">
                            Connect Store
                        </button>
                    </div>
                </div>
            </nav>

            <main className="relative">
                {/* HERO SECTION */}
                <section className="relative pt-16 pb-20 overflow-hidden">
                    <div className="neural-glow absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] pointer-events-none"></div>
                    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="relative z-10 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6">
                                <span className="size-2 rounded-full bg-primary animate-pulse"></span>
                                <span className="text-[10px] font-bold tracking-widest uppercase text-primary">IA Generativa Avanzada</span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.1] mb-6">
                                Agentes de IA: <br />
                                <span className="text-primary">Aprendizaje Continuo</span>
                            </h1>
                            <p className="text-slate-400 text-lg md:text-xl leading-relaxed max-w-xl mx-auto lg:mx-0">
                                Nuestra IA no solo procesa datos; aprende de cada resultado para optimizar tu catálogo a largo plazo de forma autónoma.
                            </p>
                            <div className="mt-10 flex justify-center lg:justify-start">
                                <button className="bg-white text-black font-extrabold px-10 py-4 rounded-xl hover:bg-slate-100 transition-all shadow-xl shadow-white/10 scale-100 hover:scale-105 active:scale-95">
                                    Prueba Gratis
                                </button>
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
                <section className="py-24 bg-white/[0.01] border-y border-white/5">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-white mb-4">Panel de Control de Alta Fidelidad</h2>
                            <p className="text-slate-400 text-lg">Datos que impulsan decisiones estratégicas en milisegundos.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            {/* Widget 1: Revenue at Risk */}
                            <div className="glass-card bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 hover:border-primary/30 transition-all">
                                <div className="flex justify-between items-start mb-6">
                                    <span className="text-slate-400 text-sm font-medium">Revenue at Risk</span>
                                    <span className="material-symbols-outlined text-primary">trending_up</span>
                                </div>
                                <div className="text-4xl font-bold text-white mb-2">$42.8k</div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary w-3/4"></div>
                                </div>
                                <p className="text-xs text-slate-500 mt-4 italic">Optimización sugerida para 12 productos</p>
                            </div>

                            {/* Widget 2: Salud del Catálogo */}
                            <div className="glass-card bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 border-primary/20">
                                <div className="flex justify-between items-start mb-6">
                                    <span className="text-slate-400 text-sm font-medium">Salud del Catálogo</span>
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

                            {/* Widget 3: Cola de Optimización (Replaced Conversión IA) */}
                            <div className="glass-card bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 hover:border-white/20 transition-all flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl font-bold tracking-tight text-slate-100">Cola de Optimización</h3>
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
                                            <span className="text-primary font-bold text-lg">1,248 Optimizados</span>
                                        </div>
                                        <div className="size-2.5 rounded-full bg-primary animate-pulse"></div>
                                    </div>
                                    <div className="flex items-center justify-between bg-blue-500/10 border border-blue-500/20 px-5 py-4 rounded-full transition-all hover:bg-blue-500/15">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center size-8 rounded-full bg-blue-500/20 text-blue-500">
                                                <span className="material-symbols-outlined text-xl">query_stats</span>
                                            </div>
                                            <span className="text-blue-500 font-bold text-lg">15 En Progreso</span>
                                        </div>
                                        <span className="material-symbols-outlined text-blue-500 text-xl animate-spin">sync</span>
                                    </div>
                                    <div className="flex items-center justify-between bg-red-500/10 border border-red-500/20 px-5 py-4 rounded-full transition-all hover:bg-red-500/15">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center size-8 rounded-full bg-red-500/20 text-red-500">
                                                <span className="material-symbols-outlined text-xl">error</span>
                                            </div>
                                            <span className="text-red-500 font-bold text-lg">84 Críticos</span>
                                        </div>
                                        <span className="material-symbols-outlined text-red-500 text-xl">warning</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                {/* AUTONOMOUS MODE SECTION */}
                <section className="py-24 relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="command-gradient border border-white/10 rounded-[40px] p-8 md:p-16 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[100px] pointer-events-none"></div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                                <div>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/5 border border-white/10 mb-6">
                                        <span className="text-[10px] font-black tracking-widest uppercase text-slate-400">Próximamente / Beta</span>
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Modo Autónomo</h2>
                                    <p className="text-slate-400 text-lg leading-relaxed mb-8">
                                        El futuro de la gestión de e-commerce. Nuestro agente de IA mejora autónomamente tus productos basándose en datos reales de rendimiento, sin necesidad de aprobaciones manuales tediosas.
                                    </p>

                                    <ul className="space-y-4">
                                        <li className="flex items-center gap-3 text-sm text-slate-300">
                                            <span className="material-symbols-outlined text-primary text-lg">verified</span>
                                            Ajustes de SEO dinámicos por hora
                                        </li>
                                        <li className="flex items-center gap-3 text-sm text-slate-300">
                                            <span className="material-symbols-outlined text-primary text-lg">verified</span>
                                            A/B Testing de imágenes automático
                                        </li>
                                        <li className="flex items-center gap-3 text-sm text-slate-300">
                                            <span className="material-symbols-outlined text-primary text-lg">verified</span>
                                            Optimización de precios basada en demanda
                                        </li>
                                    </ul>
                                </div>

                                <div className="glass-card bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4 border-white/20 shadow-2xl">
                                    <div className="bg-black/40 rounded-xl p-6 font-mono text-xs text-primary/80 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <span className="size-2 rounded-full bg-red-500/50"></span>
                                            <span className="size-2 rounded-full bg-yellow-500/50"></span>
                                            <span className="size-2 rounded-full bg-green-500/50"></span>
                                            <span className="ml-2 text-slate-500">Agent-Runtime v2.0.1</span>
                                        </div>
                                        <div className="border-t border-white/5 pt-3">
                                            <p>&gt; Analizando SKU: 8849-TX...</p>
                                            <p>&gt; Baja conversión detectada (0.8%)</p>
                                            <p className="text-white">&gt; Ejecutando optimización de título...</p>
                                            <p>&gt; Nuevo título: "Zapatillas Ultra-Light Pro Max"</p>
                                            <p className="text-emerald-400">&gt; Cambio aplicado exitosamente.</p>

                                            <div className="mt-4 flex items-center gap-2 bg-primary/10 p-2 rounded border border-primary/20">
                                                <span className="material-symbols-outlined text-sm">auto_mode</span>
                                                <span className="font-bold">MODO AUTÓNOMO ACTIVO</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-24 max-w-7xl mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">¿Listo para evolucionar tu catálogo?</h2>
                    <button className="bg-primary hover:bg-[#0da371] text-background-dark font-black px-10 py-5 rounded-2xl text-xl shadow-2xl shadow-primary/20 transition-transform hover:-translate-y-1">
                        Empezar Gratis Ahora
                    </button>
                </section>
            </main>

            <footer className="bg-background-dark border-t border-white/5 py-12 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-2xl">account_tree</span>
                        <span className="font-bold tracking-tight text-lg">Katalog AI</span>
                    </div>
                    <div className="flex gap-8 text-sm text-slate-500 font-medium">
                        <Link className="hover:text-primary transition-colors" href="#">Privacy Policy</Link>
                        <Link className="hover:text-primary transition-colors" href="#">Terms of Service</Link>
                        <Link className="hover:text-primary transition-colors" href="#">Contact Support</Link>
                    </div>
                    <p className="text-slate-600 text-sm">© 2024 Katalog AI Optimization SaaS.</p>
                </div>
            </footer>
        </div>
    );
}
