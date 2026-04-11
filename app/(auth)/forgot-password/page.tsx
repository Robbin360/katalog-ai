"use client"

import { useState } from "react"
import Link from "next/link"

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [isSent, setIsSent] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsLoading(true)
        // Simulation of link sending
        await new Promise(resolve => setTimeout(resolve, 1500))
        setIsLoading(false)
        setIsSent(true)
    }

    return (
        <div
            className="w-full max-w-[520px] premium-glass rounded-3xl p-8 sm:p-12 shadow-2xl overflow-hidden animate-fade-in relative"
            style={{ animationDelay: "0.1s" }}
        >
            {/* Header */}
            <div className="mb-8 text-center pt-2">
                <h2 className="text-[32px] sm:text-[36px] font-extrabold tracking-tight mb-3 text-zinc-950 dark:text-white transition-colors duration-700">
                    Reset Password
                </h2>
                <p className="text-slate-600 dark:text-[#d4d4d8] text-[17px] font-medium leading-relaxed max-w-sm mx-auto transition-colors duration-700">
                    Enter your work email to receive a secure link.
                </p>
            </div>

            {/* Form */}
            {!isSent ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Work Email */}
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-[13px] font-bold tracking-widest uppercase mb-1.5 ml-1 text-slate-500 dark:text-[#d4d4d8] transition-colors duration-700"
                        >
                            Work Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="name@company.com"
                            required
                            className="w-full bg-black/40 dark:bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-[17px] text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-white/20 focus:ring-2 focus:ring-[#10b77f]/40 focus:border-[#10b77f]/50 outline-none transition-all duration-300 font-medium"
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#10b77f] text-black font-extrabold py-4 rounded-xl mt-6 neural-glow-btn text-[18px] tracking-wider"
                    >
                        {isLoading ? "Sending Link…" : "Send Secure Link"}
                    </button>
                    
                    {/* Back Link */}
                    <div className="mt-8 text-center">
                        <p className="text-[17px] text-slate-600 dark:text-[#d4d4d8] font-medium transition-colors duration-700">
                            <Link href="/login" className="text-[#10b77f] font-bold hover:underline transition-all">
                                Back to sign in
                            </Link>
                        </p>
                    </div>
                </form>
            ) : (
                <div className="text-center py-6 animate-fade-in">
                    <div className="w-16 h-16 bg-[#10b77f]/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                        <div className="absolute inset-0 bg-[#10b77f]/20 blur-md rounded-full animate-pulse" />
                        <span className="material-symbols-outlined text-[#10b77f] text-[32px] relative z-10">
                            mark_email_read
                        </span>
                    </div>
                    <h3 className="text-xl font-bold text-zinc-950 dark:text-white mb-2 transition-colors duration-700">Check your inbox</h3>
                    <p className="text-slate-600 dark:text-[#d4d4d8] text-[15px] leading-relaxed mb-10 transition-colors duration-700">
                        We've sent recovery instructions to your email address.
                    </p>
                    <Link
                        href="/login"
                        className="inline-block w-full text-center border border-slate-200 dark:border-white/10 text-zinc-900 dark:text-white font-bold py-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-[15px] tracking-wider"
                    >
                        Return to Login
                    </Link>
                </div>
            )}
        </div>
    )
}
