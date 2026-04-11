"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

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
            <div className="h-1 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                <div className={`strength-meter ${cls}`} style={cls ? undefined : { width }} />
            </div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#d4d4d8]/40 transition-colors duration-700">
                {label}
            </div>
        </div>
    )
}

export default function UpdatePasswordPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [password, setPassword] = useState("")
    const [confirmError, setConfirmError] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const confirmRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const pw  = formData.get("password") as string
        const cpw = formData.get("confirm_password") as string
        
        if (pw !== cpw) {
            setConfirmError(true)
            confirmRef.current?.focus()
            return
        }
        
        setConfirmError(false)
        setIsLoading(true)
        // Simulated network request
        await new Promise(resolve => setTimeout(resolve, 1500))
        setIsLoading(false)
        setIsSuccess(true)
    }

    return (
        <div
            className="w-full max-w-[520px] premium-glass rounded-3xl p-8 sm:p-12 shadow-2xl overflow-hidden animate-fade-in relative"
            style={{ animationDelay: "0.1s" }}
        >
            {/* Header */}
            <div className="mb-8 text-center pt-2">
                <h2 className="text-[32px] sm:text-4xl font-extrabold text-zinc-950 dark:text-white tracking-tight mb-3 transition-colors duration-700">
                    Set New Password
                </h2>
                <p className="text-slate-600 dark:text-[#d4d4d8] text-[17px] font-medium leading-relaxed transition-colors duration-700 mx-auto max-w-sm">
                    Please enter your new security credentials below.
                </p>
            </div>

            {/* Form */}
            {!isSuccess ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Password + Strength Meter */}
                    <div>
                        <label
                            htmlFor="password"
                            className="block text-[13px] font-bold tracking-widest uppercase mb-2 ml-1 text-slate-500 dark:text-[#d4d4d8] transition-colors duration-700"
                        >
                            New Password
                        </label>
                        <div className="relative group/pass">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full bg-black/40 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-5 py-4 pr-12 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-white/20 focus:ring-2 focus:ring-[#10b77f]/40 focus:border-[#10b77f]/50 outline-none transition-all duration-300 text-[17px] font-medium"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 flex items-center justify-center text-slate-400 dark:text-[#d4d4d8]/40 hover:text-[#10b77f] dark:hover:text-[#10b77f] transition-all duration-300 focus:outline-none pass-toggle"
                                aria-label="Toggle password visibility"
                            >
                                <span className="material-symbols-outlined text-[20px]">
                                    {showPassword ? "visibility_off" : "visibility"}
                                </span>
                            </button>
                        </div>
                        <PasswordStrength value={password} />
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label
                            htmlFor="confirm_password"
                            className="block text-[13px] font-bold tracking-widest uppercase mb-2 ml-1 text-slate-500 dark:text-[#d4d4d8] transition-colors duration-700"
                        >
                            Confirm Password
                        </label>
                        <div className="relative group/pass">
                            <input
                                id="confirm_password"
                                name="confirm_password"
                                type={showConfirm ? "text" : "password"}
                                placeholder="••••••••"
                                required
                                ref={confirmRef}
                                onChange={() => setConfirmError(false)}
                                className={`w-full bg-black/40 dark:bg-black/40 border rounded-xl px-5 py-4 pr-12 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-white/20 focus:ring-2 outline-none transition-all duration-300 text-[17px] font-medium ${
                                    confirmError
                                        ? "border-red-500/60 focus:ring-red-500/30"
                                        : "border-slate-200 dark:border-white/10 focus:ring-[#10b77f]/40 focus:border-[#10b77f]/50"
                                }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 flex items-center justify-center text-slate-400 dark:text-[#d4d4d8]/40 hover:text-[#10b77f] dark:hover:text-[#10b77f] transition-all duration-300 focus:outline-none pass-toggle"
                                aria-label="Toggle confirm password visibility"
                            >
                                <span className="material-symbols-outlined text-[20px]">
                                    {showConfirm ? "visibility_off" : "visibility"}
                                </span>
                            </button>
                        </div>
                        {confirmError && (
                            <p className="text-[12px] text-red-500 dark:text-red-400 font-bold mt-1 ml-1 tracking-wide">
                                Passwords do not match
                            </p>
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#10b77f] text-black font-extrabold py-4 rounded-xl mt-8 neural-glow-btn text-[18px] tracking-wider"
                    >
                        {isLoading ? "Updating…" : "Update Password"}
                    </button>
                    
                    {/* Back Link */}
                    <div className="mt-10 text-center">
                        <p className="text-[17px] text-slate-600 dark:text-[#d4d4d8] font-medium transition-colors duration-700">
                            <Link href="/login" className="text-[#10b77f] font-bold hover:underline transition-all">
                                Return to login
                            </Link>
                        </p>
                    </div>
                </form>
            ) : (
                <div className="text-center py-6 animate-fade-in">
                    <div className="w-16 h-16 bg-[#10b77f]/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                        <div className="absolute inset-0 bg-[#10b77f]/20 blur-md rounded-full animate-pulse" />
                        <span className="material-symbols-outlined text-[#10b77f] text-[32px] relative z-10">
                            lock_open
                        </span>
                    </div>
                    <h3 className="text-xl font-bold text-zinc-950 dark:text-white mb-2 transition-colors duration-700">Password Updated!</h3>
                    <p className="text-slate-600 dark:text-[#d4d4d8] text-[15px] leading-relaxed mb-10 transition-colors duration-700">
                        Your new credentials have been securely stored.
                    </p>
                    <Link
                        href="/login"
                        className="inline-block w-full text-center border border-slate-200 dark:border-white/10 text-zinc-900 dark:text-white font-bold py-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-[15px] tracking-wider"
                    >
                        Proceed to Login
                    </Link>
                </div>
            )}
        </div>
    )
}
