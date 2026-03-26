"use client"

import { useState } from "react"
import { login, signup, signInWithGoogle, resetPassword } from "./actions"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

/* ─── SVG Icons (Stitch original) ─── */
function GoogleIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
    )
}
function LinkedInIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="#0077b5" viewBox="0 0 24 24">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
    )
}
function FacebookIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="#1877f2" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
    )
}

/* ─── Social Buttons Grid (3 cols, icon-only, Stitch design) ─── */
function SocialButtonsGrid({ loginMode }: { loginMode: boolean }) {
    return (
        <div className="grid grid-cols-3 gap-3">
            <form action={signInWithGoogle}>
                <button className="social-btn flex items-center justify-center py-3.5 rounded-xl text-white w-full" type="submit" title={loginMode ? "Continuar con Google" : "Registrarse con Google"}>
                    <GoogleIcon className="w-5 h-5 relative z-10" />
                </button>
            </form>
            <button className="social-btn flex items-center justify-center py-3.5 rounded-xl text-white" title={loginMode ? "Continuar con LinkedIn" : "Registrarse con LinkedIn"} type="button">
                <LinkedInIcon className="w-5 h-5 relative z-10" />
            </button>
            <button className="social-btn flex items-center justify-center py-3.5 rounded-xl text-white" title={loginMode ? "Continuar con Facebook" : "Registrarse con Facebook"} type="button">
                <FacebookIcon className="w-5 h-5 relative z-10" />
            </button>
        </div>
    )
}

/* ─── Alerts ─── */
function AlertBanner() {
    const searchParams = useSearchParams()
    const error = searchParams.get("error")
    const success = searchParams.get("success")

    if (error === "auth-failed") return <div className="w-full max-w-[460px] mb-4 text-center text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl py-3 px-4">Credenciales incorrectas. Verifica tu email y contraseña.</div>
    if (error === "signup-failed") return <div className="w-full max-w-[460px] mb-4 text-center text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl py-3 px-4">Error al crear la cuenta. El email podría estar en uso.</div>
    if (error === "oauth-failed") return <div className="w-full max-w-[460px] mb-4 text-center text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl py-3 px-4">Error al conectar con el proveedor. Intenta nuevamente.</div>
    if (error === "reset-failed") return <div className="w-full max-w-[460px] mb-4 text-center text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl py-3 px-4">No se pudo enviar el enlace. Verifica tu email.</div>
    if (success === "check-email") return <div className="w-full max-w-[460px] mb-4 text-center text-sm font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl py-3 px-4">✓ Revisa tu bandeja para confirmar tu cuenta.</div>
    if (success === "reset-sent") return <div className="w-full max-w-[460px] mb-4 text-center text-sm font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl py-3 px-4">✓ Se ha enviado un enlace de recuperación a tu correo.</div>
    return null
}

/* ─── Main Page ─── */
export default function LoginPage() {
    const [mode, setMode] = useState<"login" | "signup" | "forgot">("login")
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true)
        try {
            if (mode === "login") await login(formData)
            else if (mode === "signup") await signup(formData)
            else await resetPassword(formData)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            {/* ── Stitch Premium Styles ── */}
            <style>{`
                .nebula {
                    background: radial-gradient(circle at 50% 50%, #0b0b0d 0%, #050505 100%);
                    position: fixed; inset: 0; z-index: -1;
                }
                .nebula-glow {
                    position: absolute; width: 800px; height: 800px;
                    background: radial-gradient(circle, rgba(16,183,127,0.07) 0%, transparent 70%);
                    filter: blur(80px); border-radius: 50%; pointer-events: none;
                }
                .premium-glass {
                    background: rgba(11,11,13,0.85);
                    backdrop-filter: blur(40px); -webkit-backdrop-filter: blur(40px);
                    border: 1px solid rgba(255,255,255,0.03);
                    position: relative;
                }
                .premium-glass::before {
                    content: ''; position: absolute; inset: 0; border-radius: inherit; padding: 1px;
                    background: linear-gradient(135deg, rgba(16,183,127,0.3) 0%, transparent 40%, transparent 100%);
                    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                    -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none;
                }
                .neural-glow-btn { box-shadow: 0 0 20px rgba(16,183,127,0.15); }
                .neural-glow-btn:hover { box-shadow: 0 0 30px rgba(16,183,127,0.25); }
                .social-btn {
                    background: rgba(255,255,255,0.03); backdrop-filter: blur(10px);
                    border: 1px solid rgba(255,255,255,0.05);
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    position: relative; overflow: hidden; cursor: pointer;
                }
                .social-btn:hover {
                    transform: translateY(-2px) scale(1.02);
                    background: rgba(255,255,255,0.06);
                    border-color: rgba(16,183,127,0.4);
                    box-shadow: 0 10px 20px -10px rgba(16,183,127,0.3), 0 0 0 1px rgba(16,183,127,0.2);
                }
                .social-btn::after {
                    content: ''; position: absolute; inset: 0;
                    background: radial-gradient(circle at center, rgba(16,183,127,0.1) 0%, transparent 70%);
                    opacity: 0; transition: opacity 0.4s ease;
                }
                .social-btn:hover::after { opacity: 1; }
            `}</style>

            {/* ── Nebula Background ── */}
            <div className="nebula">
                <div className="nebula-glow" style={{ top: "-20%", left: "-10%" }} />
                <div className="nebula-glow" style={{ bottom: "-20%", right: "-10%", opacity: 0.5 }} />
            </div>

            {/* ── Main Content ── */}
            <main className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6 font-sans antialiased selection:bg-emerald-500/30">

                {/* ── Branding ── */}
                <div className="flex flex-col items-center mb-10">
                    <div className="w-14 h-14 bg-[#0b0b0d] flex items-center justify-center mb-6 rounded-2xl border border-white/5 shadow-2xl relative">
                        <div className="absolute inset-0 bg-emerald-500/10 blur-xl rounded-full" />
                        <svg className="w-7 h-7 text-emerald-400 relative" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2" style={{ letterSpacing: "0.02em" }}>
                        Katalog AI
                    </h1>
                    <p className="text-[10px] uppercase font-bold text-emerald-400/80" style={{ letterSpacing: "0.15em" }}>
                        Revenue Optimizer
                    </p>
                </div>

                {/* ── Alerts ── */}
                <Suspense>
                    <AlertBanner />
                </Suspense>

                {/* ── Unified Auth Card ── */}
                <div className="w-full max-w-[460px] premium-glass rounded-2xl p-8 sm:p-10 shadow-2xl overflow-hidden">

                    {/* ════════ LOGIN SECTION ════════ */}
                    {mode === "login" && (
                        <div className="animate-in fade-in duration-300">
                            <div className="mb-8 text-center">
                                <h2 className="text-2xl font-semibold text-white tracking-tight mb-2">Bienvenido de nuevo</h2>
                                <p className="text-zinc-500 text-sm font-light leading-relaxed">Accede a tu panel neuronal y modelos de IA.</p>
                            </div>

                            <form className="space-y-5">
                                <div>
                                    <label htmlFor="email" className="block text-[10px] font-bold tracking-widest text-zinc-500/60 uppercase mb-2 ml-1">Email Corporativo</label>
                                    <input className="w-full bg-black/40 border border-white/[0.05] rounded-xl px-4 py-3.5 text-white placeholder:text-zinc-600/30 focus:ring-1 focus:ring-emerald-500/40 focus:border-emerald-500/50 focus:bg-black/60 outline-none transition-all duration-300 text-sm" id="email" name="email" placeholder="nombre@empresa.com" type="email" required />
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-2 ml-1">
                                        <label htmlFor="password" className="block text-[10px] font-bold tracking-widest text-zinc-500/60 uppercase">Contraseña</label>
                                        <button className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase hover:text-emerald-300 transition-colors" type="button" onClick={() => setMode("forgot")}>¿Olvidaste la clave?</button>
                                    </div>
                                    <input className="w-full bg-black/40 border border-white/[0.05] rounded-xl px-4 py-3.5 text-white placeholder:text-zinc-600/30 focus:ring-1 focus:ring-emerald-500/40 focus:border-emerald-500/50 focus:bg-black/60 outline-none transition-all duration-300 text-sm" id="password" name="password" placeholder="••••••••" type="password" required />
                                </div>
                                <button formAction={handleSubmit} disabled={isLoading} className="w-full bg-emerald-500 text-white font-bold py-4 rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 neural-glow-btn text-sm shadow-lg shadow-emerald-500/20 disabled:opacity-50" style={{ letterSpacing: "0.02em" }} type="submit">
                                    {isLoading ? "Cargando..." : "Iniciar Sesión"}
                                </button>
                            </form>

                            {/* Divider */}
                            <div className="relative flex items-center my-8">
                                <div className="flex-grow border-t border-white/[0.05]" />
                                <span className="flex-shrink mx-4 text-[10px] font-bold tracking-widest text-zinc-500/40 uppercase">O</span>
                                <div className="flex-grow border-t border-white/[0.05]" />
                            </div>

                            {/* Social — 3 columnas: Google · LinkedIn · Facebook */}
                            <SocialButtonsGrid loginMode={true} />

                            {/* Switch to Signup */}
                            <div className="mt-8 text-center">
                                <p className="text-sm text-zinc-500 font-light">
                                    ¿No tienes una cuenta?{" "}
                                    <button className="text-emerald-400 font-bold hover:underline transition-all" onClick={() => setMode("signup")} type="button">Regístrate gratis</button>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ════════ SIGNUP SECTION ════════ */}
                    {mode === "signup" && (
                        <div className="animate-in fade-in duration-300">
                            <div className="mb-8 text-center">
                                <h2 className="text-2xl font-semibold text-white tracking-tight mb-2">Crea tu cuenta</h2>
                                <p className="text-zinc-500 text-sm font-light leading-relaxed">Únete a la vanguardia de la IA corporativa.</p>
                            </div>

                            <form className="space-y-4">
                                <div>
                                    <label htmlFor="signup-name" className="block text-[10px] font-bold tracking-widest text-zinc-500/60 uppercase mb-1.5 ml-1">Nombre Completo</label>
                                    <input className="w-full bg-black/40 border border-white/[0.05] rounded-xl px-4 py-3.5 text-white placeholder:text-zinc-600/30 focus:ring-1 focus:ring-emerald-500/40 focus:border-emerald-500/50 focus:bg-black/60 outline-none transition-all duration-300 text-sm" id="signup-name" placeholder="John Doe" type="text" />
                                </div>
                                <div>
                                    <label htmlFor="signup-email" className="block text-[10px] font-bold tracking-widest text-zinc-500/60 uppercase mb-1.5 ml-1">Email Corporativo</label>
                                    <input className="w-full bg-black/40 border border-white/[0.05] rounded-xl px-4 py-3.5 text-white placeholder:text-zinc-600/30 focus:ring-1 focus:ring-emerald-500/40 focus:border-emerald-500/50 focus:bg-black/60 outline-none transition-all duration-300 text-sm" id="signup-email" name="email" placeholder="nombre@empresa.com" type="email" required />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="signup-password" className="block text-[10px] font-bold tracking-widest text-zinc-500/60 uppercase mb-1.5 ml-1">Contraseña</label>
                                        <input className="w-full bg-black/40 border border-white/[0.05] rounded-xl px-4 py-3.5 text-white placeholder:text-zinc-600/30 focus:ring-1 focus:ring-emerald-500/40 focus:border-emerald-500/50 focus:bg-black/60 outline-none transition-all duration-300 text-sm" id="signup-password" name="password" placeholder="••••••••" type="password" required />
                                    </div>
                                    <div>
                                        <label htmlFor="signup-confirm" className="block text-[10px] font-bold tracking-widest text-zinc-500/60 uppercase mb-1.5 ml-1">Confirmar</label>
                                        <input className="w-full bg-black/40 border border-white/[0.05] rounded-xl px-4 py-3.5 text-white placeholder:text-zinc-600/30 focus:ring-1 focus:ring-emerald-500/40 focus:border-emerald-500/50 focus:bg-black/60 outline-none transition-all duration-300 text-sm" id="signup-confirm" placeholder="••••••••" type="password" required />
                                    </div>
                                </div>
                                <button formAction={handleSubmit} disabled={isLoading} className="w-full bg-emerald-500 text-white font-bold py-4 rounded-xl mt-2 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 neural-glow-btn text-sm shadow-lg shadow-emerald-500/20 disabled:opacity-50" style={{ letterSpacing: "0.02em" }} type="submit">
                                    {isLoading ? "Creando..." : "Crear Cuenta"}
                                </button>
                            </form>

                            {/* Divider */}
                            <div className="relative flex items-center my-8">
                                <div className="flex-grow border-t border-white/[0.05]" />
                                <span className="flex-shrink mx-4 text-[10px] font-bold tracking-widest text-zinc-500/40 uppercase">O</span>
                                <div className="flex-grow border-t border-white/[0.05]" />
                            </div>

                            {/* Social — 3 columnas: Google · LinkedIn · Facebook */}
                            <SocialButtonsGrid loginMode={false} />

                            {/* Switch to Login */}
                            <div className="mt-8 text-center">
                                <p className="text-sm text-zinc-500 font-light">
                                    ¿Ya tienes una cuenta?{" "}
                                    <button className="text-emerald-400 font-bold hover:underline transition-all" onClick={() => setMode("login")} type="button">Inicia sesión</button>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ════════ FORGOT PASSWORD SECTION ════════ */}
                    {mode === "forgot" && (
                        <div className="animate-in fade-in duration-300">
                            <div className="mb-8 text-center">
                                <h2 className="text-2xl font-semibold text-white tracking-tight mb-2">Recuperar Acceso</h2>
                                <p className="text-zinc-500 text-sm font-light leading-relaxed">Introduce tu correo corporativo para recibir un enlace seguro.</p>
                            </div>

                            <form className="space-y-6">
                                <div>
                                    <label htmlFor="forgot-email" className="block text-[10px] font-bold tracking-widest text-zinc-500/60 uppercase mb-2 ml-1">Email Corporativo</label>
                                    <input className="w-full bg-black/40 border border-white/[0.05] rounded-xl px-4 py-3.5 text-white placeholder:text-zinc-600/30 focus:ring-1 focus:ring-emerald-500/40 focus:border-emerald-500/50 focus:bg-black/60 outline-none transition-all duration-300 text-sm" id="forgot-email" name="email" placeholder="nombre@empresa.com" type="email" required />
                                </div>
                                <button formAction={handleSubmit} disabled={isLoading} className="w-full bg-emerald-500 text-white font-bold py-4 rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 neural-glow-btn text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50" style={{ letterSpacing: "0.02em" }} type="submit">
                                    <span>{isLoading ? "Enviando..." : "Enviar Enlace"}</span>
                                    {!isLoading && (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                        </svg>
                                    )}
                                </button>
                            </form>

                            {/* Back to Login */}
                            <div className="mt-10 text-center">
                                <button className="text-[10px] font-bold tracking-widest text-zinc-500/60 uppercase hover:text-emerald-400 transition-colors flex items-center justify-center gap-2 mx-auto" onClick={() => setMode("login")} type="button">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                                    </svg>
                                    Volver al inicio de sesión
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Footer ── */}
                <footer className="mt-12 flex flex-col items-center gap-8">
                    <div className="flex flex-wrap justify-center gap-8">
                        <a className="text-[10px] font-bold tracking-[0.1em] text-zinc-500/40 uppercase hover:text-emerald-400 transition-colors" href="#">Privacidad</a>
                        <a className="text-[10px] font-bold tracking-[0.1em] text-zinc-500/40 uppercase hover:text-emerald-400 transition-colors" href="#">Términos</a>
                        <a className="text-[10px] font-bold tracking-[0.1em] text-zinc-500/40 uppercase hover:text-emerald-400 transition-colors" href="#">Seguridad</a>
                    </div>
                    <p className="text-[9px] font-medium tracking-[0.2em] text-white/10 uppercase">© 2024 Katalog AI. Infraestructura Segura.</p>
                </footer>
            </main>
        </>
    )
}
