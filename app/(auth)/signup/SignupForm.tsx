"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { Eye, EyeOff } from 'lucide-react'
import { signup, signInWithGoogle, signInWithSlack, signInWithX } from "../actions"

function PasswordStrength({ value }: { value: string }) {
    let label = "Enter password"
    let cls = ""
    let width = "0%"

    if (value.length > 0 && value.length < 6) {
        label = "Weak"; cls = "strength-weak"; width = "33%"
    } else if (value.length >= 6 && value.length < 10) {
        label = "Medium"; cls = "strength-medium"; width = "66%"
    } else if (value.length >= 10) {
        label = "Strong"; cls = "strength-strong"; width = "100%"
    }

    return (
        <div className="mt-2 space-y-1">
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div className={`strength-meter ${cls}`} style={cls ? undefined : { width }} />
            </div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-[#d4d4d8]/40">
                {label}
            </div>
        </div>
    )
}

export default function SignupForm() {
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [password, setPassword] = useState("")
    const [confirmError, setConfirmError] = useState(false)
    const confirmRef = useRef<HTMLInputElement>(null)

    async function handleSubmit(formData: FormData) {
        const pw  = formData.get("password") as string
        const cpw = formData.get("confirm_password") as string
        if (pw !== cpw) {
            setConfirmError(true)
            confirmRef.current?.focus()
            return
        }
        setConfirmError(false)
        setIsLoading(true)
        await signup(formData)
        setIsLoading(false)
    }

    return (
        <div
            className="w-full max-w-[520px] premium-glass rounded-3xl p-8 sm:p-12 shadow-2xl overflow-hidden animate-fade-in"
            style={{ animationDelay: "0.1s" }}
        >
            <div className="mb-8 text-center">
                <h2 className="text-[32px] sm:text-[36px] font-extrabold tracking-tight mb-3 text-zinc-950 dark:text-white transition-colors duration-700">
                    Initialize Account
                </h2>
                <p className="text-slate-600 dark:text-[#d4d4d8] text-[17px] font-medium leading-relaxed max-w-sm mx-auto transition-colors duration-700">
                    Join the leading platform for AI-driven workflow optimization.
                </p>
            </div>

            <form action={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="fullname" className="block text-[13px] font-bold tracking-widest uppercase mb-1.5 ml-1 text-[#d4d4d8]">Full Name</label>
                    <input id="fullname" name="fullname" type="text" placeholder="John Doe" required
                        className="w-full bg-black/40 dark:bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-[17px] text-white placeholder:text-white/20 focus:ring-2 focus:ring-[#10b77f]/40 focus:border-[#10b77f]/50 outline-none transition-all duration-300 font-medium" />
                </div>

                <div>
                    <label htmlFor="email" className="block text-[13px] font-bold tracking-widest uppercase mb-1.5 ml-1 text-[#d4d4d8]">Work Email</label>
                    <input id="email" name="email" type="email" placeholder="name@company.com" required
                        className="w-full bg-black/40 dark:bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-[17px] text-white placeholder:text-white/20 focus:ring-2 focus:ring-[#10b77f]/40 focus:border-[#10b77f]/50 outline-none transition-all duration-300 font-medium" />
                </div>

                <div>
                    <label htmlFor="password" className="block text-[13px] font-bold tracking-widest uppercase mb-1.5 ml-1 text-[#d4d4d8]">Password</label>
                    <div className="relative group/pass">
                        <input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" required
                            value={password} onChange={e => setPassword(e.target.value)}
                            className="w-full bg-black/40 dark:bg-black/40 border border-white/10 rounded-xl px-5 py-4 pr-12 text-[17px] text-white placeholder:text-white/20 focus:ring-2 focus:ring-[#10b77f]/40 focus:border-[#10b77f]/50 outline-none transition-all duration-300 font-medium" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 flex items-center justify-center text-[#d4d4d8]/40 hover:text-[#10b77f] transition-all duration-300 focus:outline-none pass-toggle"
                            aria-label="Toggle password visibility">
                            {showPassword ? <EyeOff className="text-[20px] notranslate" /> : <Eye className="text-[20px] notranslate" />}
                        </button>
                    </div>
                    <PasswordStrength value={password} />
                </div>

                <div>
                    <label htmlFor="confirm_password" className="block text-[13px] font-bold tracking-widest uppercase mb-1.5 ml-1 text-[#d4d4d8]">Confirm Password</label>
                    <div className="relative group/pass">
                        <input id="confirm_password" name="confirm_password" type={showConfirm ? "text" : "password"} placeholder="••••••••" required
                            ref={confirmRef} onChange={() => setConfirmError(false)}
                            className={`w-full bg-black/40 dark:bg-black/40 border rounded-xl px-5 py-4 pr-12 text-[17px] text-white placeholder:text-white/20 focus:ring-2 outline-none transition-all duration-300 font-medium ${
                                confirmError ? "border-red-500/60 focus:ring-red-500/30" : "border-white/10 focus:ring-[#10b77f]/40 focus:border-[#10b77f]/50"
                            }`} />
                        <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 flex items-center justify-center text-[#d4d4d8]/40 hover:text-[#10b77f] transition-all duration-300 focus:outline-none pass-toggle"
                            aria-label="Toggle confirm password visibility">
                            {showConfirm ? <EyeOff className="text-[20px] notranslate" /> : <Eye className="text-[20px] notranslate" />}
                        </button>
                    </div>
                    {confirmError && <p className="text-[12px] text-red-400 font-bold mt-1 ml-1 tracking-wide">Passwords do not match</p>}
                </div>

                <button type="submit" disabled={isLoading}
                    className="w-full bg-[#10b77f] text-black font-extrabold py-4 rounded-xl mt-4 neural-glow-btn text-[18px] tracking-wider">
                    {isLoading ? "Creating Account…" : "Create Account"}
                </button>
            </form>

            <div className="relative my-8">
                <div aria-hidden="true" className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-white/5" />
                </div>
                <div className="relative flex justify-center text-[12px] uppercase tracking-[0.2em] font-bold">
                    <span className="px-4 bg-white dark:bg-[#121214]/50 backdrop-blur-sm text-slate-400 dark:text-[#d4d4d8]/40 transition-colors duration-700">Or continue with</span>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-2">
                <form action={signInWithGoogle}>
                    <button type="submit" aria-label="Sign up with Google" className="social-btn w-full flex items-center justify-center py-3.5 rounded-xl">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                    </button>
                </form>
                <form action={signInWithSlack}>
                    <button type="submit" aria-label="Sign up with Slack" className="social-btn w-full flex items-center justify-center py-3.5 rounded-xl">
                        <svg className="w-5 h-5" viewBox="0 0 122.8 122.8">
                            <path d="M25.8 77.6c0 7.1-5.8 12.9-12.9 12.9S0 84.7 0 77.6s5.8-12.9 12.9-12.9h12.9v12.9zm6.4 0c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v32.3c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V77.6z" fill="#36C5F0" />
                            <path d="M45.2 25.8c-7.1 0-12.9-5.8-12.9-12.9S38.1 0 45.2 0s12.9 5.8 12.9 12.9v12.9H45.2zm0 6.4c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H12.9C5.8 58.1 0 52.3 0 45.2s5.8-12.9 12.9-12.9h32.3z" fill="#2EB67D" />
                            <path d="M97 45.2c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9-5.8 12.9-12.9 12.9H97V45.2zm-6.4 0c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V12.9C77.6 5.8 83.4 0 90.5 0s12.9 5.8 12.9 12.9v32.3z" fill="#E01E5A" />
                            <path d="M77.6 97c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9-12.9-5.8-12.9-12.9V97h12.9zm0-6.4c-7.1 0-12.9-5.8-12.9-12.9s5.8-12.9 12.9-12.9h32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H77.6z" fill="#ECB22E" />
                        </svg>
                    </button>
                </form>
                <form action={signInWithX}>
                    <button type="submit" aria-label="Sign up with X" className="social-btn w-full flex items-center justify-center py-3.5 rounded-xl text-zinc-950 dark:text-white">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                    </button>
                </form>
            </div>

            <div className="mt-8 text-center">
                <p className="text-[17px] text-slate-600 dark:text-[#d4d4d8] font-medium transition-colors duration-700">
                    Already have an account?{" "}
                    <Link href="/login" className="text-[#10b77f] font-bold hover:underline transition-all">Sign In</Link>
                </p>
            </div>
        </div>
    )
}
