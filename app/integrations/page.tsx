import Link from 'next/link';
import Image from 'next/image';

export default function IntegrationsPage() {
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
                @keyframes scroll {
                    from { transform: translateX(0); }
                    to { transform: translateX(-50%); }
                }
                .animate-scroll {
                    animation: scroll 20s linear infinite;
                }
                @keyframes flow-inbound {
                    0% { right: -50px; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { right: calc(100% + 50px); opacity: 0; }
                }
                @keyframes flow-outbound {
                    0% { left: -50px; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { left: calc(100% + 50px); opacity: 0; }
                }
                .animate-flow-inbound { animation: flow-inbound 3s linear infinite; }
                .animate-flow-outbound { animation: flow-outbound 3s linear infinite; animation-delay: 1.5s; }
                .pulse-trail-inbox {
                    background: linear-gradient(-90deg, transparent 0%, rgba(16, 183, 127, 0.2) 20%, rgba(16, 183, 127, 1) 80%, #fff 100%);
                    filter: drop-shadow(0 0 12px rgba(16, 183, 127, 0.8));
                    width: 180px; height: 3px; position: absolute;
                    top: 50%; transform: translateY(-50%);
                    border-radius: 9999px; z-index: 5;
                }
                .pulse-trail-outbox {
                    background: linear-gradient(90deg, transparent 0%, rgba(16, 183, 127, 0.1) 20%, #2dd4bf 80%, #fff 100%);
                    filter: drop-shadow(0 0 12px rgba(45, 212, 191, 0.8));
                    width: 180px; height: 3px; position: absolute;
                    top: 50%; transform: translateY(-50%);
                    border-radius: 9999px; z-index: 5;
                }
                .pulse-head {
                    position: absolute; right: 0; top: 50%; transform: translateY(-50%);
                    width: 8px; height: 3px; background: #fff;
                    border-radius: 2px; box-shadow: 0 0 15px #fff, 0 0 30px #10b77f;
                }
                .pulse-head-out {
                    position: absolute; right: 0; top: 50%; transform: translateY(-50%);
                    width: 8px; height: 3px; background: #fff;
                    border-radius: 2px; box-shadow: 0 0 15px #fff, 0 0 30px #2dd4bf;
                }
            `}} />

            <nav className="sticky top-0 z-50 w-full bg-background-dark/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex-1 flex justify-start">
                        <Link href="/" className="flex items-center gap-2.5">
                            <div className="relative flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-3xl font-light">account_tree</span>
                                <div className="absolute -top-1 -right-1 size-2 bg-primary rounded-full"></div>
                            </div>
                            <span className="font-bold tracking-tight text-xl text-white">Katalog AI</span>
                        </Link>
                    </div>

                    <div className="hidden md:flex flex-1 justify-center items-center gap-8">
                        <Link className="text-sm font-medium text-slate-400 hover:text-primary transition-colors" href="/features">Capacidades</Link>
                        <Link className="text-sm font-medium text-primary" href="/integrations">Integraciones</Link>
                        <Link className="text-sm font-medium text-slate-400 hover:text-primary transition-colors" href="/pricing">Precios</Link>
                        <Link className="text-sm font-medium text-slate-400 hover:text-primary transition-colors" href="/faq">FAQ</Link>
                    </div>

                    <div className="flex-1 flex justify-end items-center gap-4">
                        <Link href="/login" className="bg-primary hover:bg-[#0da371] text-background-dark font-bold px-6 py-2.5 rounded-lg transition-all shadow-lg shadow-primary/20 text-sm">
                            Connect Store
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="relative overflow-hidden">
                <div className="neural-glow absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] pointer-events-none opacity-60"></div>
                <div className="neural-glow absolute bottom-0 right-0 size-[600px] pointer-events-none opacity-30"></div>

                <section className="max-w-7xl mx-auto px-6 pt-24 pb-16 relative">
                    <div className="flex flex-col items-center text-center max-w-3xl mx-auto gap-6">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-2">
                            <span className="size-2 rounded-full bg-primary emerald-pulse"></span>
                            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-primary">Neural Connect Engine</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black leading-[1.1] tracking-tight text-white uppercase italic">
                            Integraciones <br /> <span className="text-primary tracking-tighter not-italic">Nativas de IA</span>
                        </h1>
                        <p className="text-slate-400 text-lg md:text-xl leading-relaxed">
                            Sincroniza tu tienda en segundos. Nuestra IA se conecta directamente con tu inventario para una optimización autónoma y en tiempo real.
                        </p>
                        <div className="mt-4">
                            <Link href="/login" className="bg-white text-black font-extrabold px-10 py-4 rounded-xl hover:bg-slate-100 transition-all shadow-xl shadow-white/10 scale-100 hover:scale-105 active:scale-95">
                                Prueba Gratis
                            </Link>
                        </div>
                    </div>

                    <div className="mt-24 relative flex items-center justify-center py-20">
                        <div className="relative z-10 flex items-center justify-between w-full max-w-5xl gap-10">
                            {/* Left Side: Katalog Icon */}
                            <div className="relative group shrink-0">
                                <div className="absolute -inset-8 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-all"></div>
                                <div className="size-32 glass-card rounded-3xl flex items-center justify-center shadow-2xl relative z-10 border-primary/20 bg-background-dark/50 backdrop-blur-xl">
                                    <span className="material-symbols-outlined text-primary text-6xl">account_tree</span>
                                </div>
                            </div>

                            {/* Center: Improved Data Highway Connection */}
                            <div className="relative flex-1 h-[2px] bg-white/10 self-center mx-4 overflow-hidden rounded-full">
                                {/* Gradient Background for the line */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-50"></div>

                                {/* Inbound Pulse: Store -> Katalog (Sync) */}
                                <div className="animate-flow-inbound absolute top-0 h-full w-full">
                                    <div className="pulse-trail-inbox">
                                        <div className="pulse-head"></div>
                                    </div>
                                </div>

                                {/* Outbound Pulse: Katalog -> Store (Optimize) */}
                                <div className="animate-flow-outbound absolute top-0 h-full w-full">
                                    <div className="pulse-trail-outbox">
                                        <div className="pulse-head-out"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Integrations Carousel */}
                            <div className="relative group w-64 h-32 overflow-hidden glass-card rounded-3xl flex items-center shrink-0 border-primary/10 bg-background-dark/50 backdrop-blur-xl">
                                <div className="absolute inset-0 bg-gradient-to-r from-background-dark/80 via-transparent to-background-dark/80 z-20 pointer-events-none"></div>
                                <div className="flex gap-10 animate-scroll items-center whitespace-nowrap px-6">
                                    <span className="material-symbols-outlined text-primary text-4xl mx-4">storefront</span>
                                    <span className="material-symbols-outlined text-slate-400 text-4xl mx-4">shopping_cart</span>
                                    <span className="material-symbols-outlined text-primary text-4xl mx-4">storefront</span>
                                    <span className="material-symbols-outlined text-slate-400 text-4xl mx-4">deployed_code</span>
                                    <span className="material-symbols-outlined text-slate-400 text-4xl mx-4">hub</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-16 flex justify-center">
                        <Link href="/login" className="px-10 py-5 bg-primary hover:bg-[#0da371] text-background-dark font-black text-lg rounded-2xl shadow-2xl shadow-primary/30 flex items-center gap-3 transition-transform hover:-translate-y-1">
                            Configurar Integración
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </Link>
                    </div>
                </section >

                <section className="max-w-7xl mx-auto px-6 py-20 border-t border-white/5">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Conexión en 3 Pasos</h2>
                        <p className="text-slate-400">Implementación inmediata sin necesidad de desarrollo técnico.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="flex flex-col items-center text-center gap-6">
                            <div className="size-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center relative">
                                <span className="material-symbols-outlined text-primary text-3xl">add_link</span>
                                <div className="absolute -right-2 top-0 size-6 bg-primary text-background-dark text-xs font-black rounded-full flex items-center justify-center">1</div>
                            </div>
                            <h3 className="text-xl font-bold">Selecciona Plataforma</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">Elige tu CMS actual de nuestra lista de conectores nativos verificados.</p>
                        </div>
                        <div className="flex flex-col items-center text-center gap-6">
                            <div className="size-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center relative">
                                <span className="material-symbols-outlined text-primary text-3xl">vpn_key</span>
                                <div className="absolute -right-2 top-0 size-6 bg-primary text-background-dark text-xs font-black rounded-full flex items-center justify-center">2</div>
                            </div>
                            <h3 className="text-xl font-bold">Autoriza Acceso</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">Otorga permisos de lectura de catálogo mediante OAuth2 seguro en un solo clic.</p>
                        </div>
                        <div className="flex flex-col items-center text-center gap-6">
                            <div className="size-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center relative">
                                <span className="material-symbols-outlined text-primary text-3xl">auto_awesome</span>
                                <div className="absolute -right-2 top-0 size-6 bg-primary text-background-dark text-xs font-black rounded-full flex items-center justify-center">3</div>
                            </div>
                            <h3 className="text-xl font-bold">IA Sincronizada</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">Katalog AI procesa tus productos y optimiza los datos automáticamente.</p>
                        </div>
                    </div>
                </section>

                <section className="max-w-7xl mx-auto px-6 py-20">
                    <div className="flex items-center justify-between mb-12">
                        <h2 className="text-3xl font-bold">
                            Plataformas <span className="text-slate-500 font-normal">Soportadas</span>
                        </h2>
                        <div className="h-px flex-1 bg-white/5 mx-8"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="md:col-span-2 glass-card rounded-3xl p-8 relative overflow-hidden group hover:border-primary/40 transition-all">
                            <div className="absolute top-0 right-0 p-6">
                                <span className="px-3 py-1.5 rounded-lg bg-primary/20 text-primary text-xs font-black tracking-widest uppercase">Nativo</span>
                            </div>
                            <div className="flex flex-col gap-6 h-full justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="size-16 rounded-2xl bg-white/5 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-3xl text-primary">storefront</span>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold">Shopify</h3>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="size-2.5 rounded-full bg-primary emerald-pulse"></span>
                                            <span className="text-sm text-primary font-semibold">Conectado y Sincronizando</span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-slate-400 max-w-md">Acceso completo a inventario, pedidos y perfiles de clientes con actualización en tiempo real.</p>
                            </div>
                        </div>

                        <div className="glass-card rounded-3xl p-8 flex flex-col gap-6 group relative overflow-hidden">
                            <div className="absolute inset-0 bg-background-dark/60 backdrop-blur-[6px] flex items-center justify-center z-20">
                                <span className="text-[10px] font-black tracking-[0.3em] text-slate-300 -rotate-12 border border-slate-700/50 px-3 py-1.5 bg-background-dark/95">PRÓXIMAMENTE</span>
                            </div>
                            <div className="absolute top-0 right-0 p-4 z-10">
                                <span className="px-2 py-1 rounded-lg bg-white/5 text-slate-500 text-[10px] font-black tracking-widest uppercase">Próximamente</span>
                            </div>
                            <div className="size-14 rounded-2xl bg-white/5 flex items-center justify-center text-slate-600 transition-colors">
                                <span className="material-symbols-outlined text-3xl">hub</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-500">BigCommerce</h3>
                                <p className="text-xs text-slate-600 mt-2 leading-relaxed">Infraestructura de API robusta diseñada para B2B complejas.</p>
                            </div>
                        </div>

                        <div className="grid grid-rows-2 gap-6">
                            <div className="glass-card rounded-3xl p-6 flex flex-col justify-center relative group overflow-hidden">
                                <div className="absolute inset-0 bg-background-dark/60 backdrop-blur-[6px] flex items-center justify-center opacity-100 z-10">
                                    <span className="text-[10px] font-black tracking-[0.3em] text-slate-300 -rotate-12 border border-slate-700/50 px-3 py-1.5 bg-background-dark/95">PRÓXIMAMENTE</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-700">
                                        <span className="material-symbols-outlined text-2xl">shopping_cart</span>
                                    </div>
                                    <h3 className="font-bold text-slate-500">WooCommerce</h3>
                                </div>
                            </div>
                            <div className="glass-card rounded-3xl p-6 flex flex-col justify-center relative group overflow-hidden">
                                <div className="absolute inset-0 bg-background-dark/60 backdrop-blur-[6px] flex items-center justify-center opacity-100 z-10">
                                    <span className="text-[10px] font-black tracking-[0.3em] text-slate-300 -rotate-12 border border-slate-700/50 px-3 py-1.5 bg-background-dark/95">PRÓXIMAMENTE</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-700">
                                        <span className="material-symbols-outlined text-2xl">deployed_code</span>
                                    </div>
                                    <h3 className="font-bold text-slate-500">Magento / Adobe</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="max-w-7xl mx-auto px-6 py-20 border-t border-white/5">
                    <h3 className="text-xl font-bold mb-12 text-center text-slate-300">Beneficios de la Integración Nativa</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="glass-card rounded-2xl p-6 flex items-start gap-5">
                            <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-primary">sync</span>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold mb-2">Sincronización en Tiempo Real</h4>
                                <p className="text-sm text-slate-500 leading-relaxed">Infraestructura de baja latencia con actualizaciones cada 15ms para una precisión total del catálogo.</p>
                            </div>
                        </div>
                        <div className="glass-card rounded-2xl p-6 flex items-start gap-5">
                            <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-primary">verified_user</span>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold mb-2">Seguridad de Datos SOC2</h4>
                                <p className="text-sm text-slate-500 leading-relaxed">Encriptación AES-256 de extremo a extremo y cumplimiento estricto de normativas globales.</p>
                            </div>
                        </div>
                        <div className="glass-card rounded-2xl p-6 flex items-start gap-5">
                            <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-primary">analytics</span>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold mb-2">Mapping Inteligente</h4>
                                <p className="text-sm text-slate-500 leading-relaxed">Normalización automática de atributos y taxonomías mediante modelos LLM especializados.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main >

            <footer className="bg-background-dark border-t border-white/5 py-12 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-2xl">account_tree</span>
                        <span className="font-bold tracking-tight text-lg">Katalog AI</span>
                    </div>
                    <div className="flex gap-8 text-sm text-slate-500 font-medium">
                        <Link className="hover:text-primary transition-colors" href="/features">Capacidades</Link>
                        <Link className="hover:text-primary transition-colors" href="/integrations">Integraciones</Link>
                        <Link className="hover:text-primary transition-colors" href="/pricing">Precios</Link>
                        <Link className="hover:text-primary transition-colors" href="/faq">FAQ</Link>
                    </div>
                    <p className="text-slate-600 text-sm">© 2024 Katalog AI Optimization SaaS.</p>
                </div>
            </footer>
        </div >
    );
}
