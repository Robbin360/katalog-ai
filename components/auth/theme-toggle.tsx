"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function AuthThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    useEffect(() => setMounted(true), [])
    if (!mounted) return null

    const isDark = resolvedTheme === "dark"
    return (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
            <button
                aria-label="Change theme"
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className="relative notranslate flex items-center w-[72px] h-9 bg-black/10 dark:bg-white/[0.05] backdrop-blur-md border border-black/10 dark:border-white/10 rounded-full transition-all duration-500 cursor-pointer shadow-lg p-1 overflow-hidden"
            >
                {/* Sliding Knob */}
                <div
                    className="absolute w-7 h-7 bg-[#10b77f] rounded-full shadow-lg shadow-[#10b77f]/30 transition-all duration-500 z-10"
                    style={{ left: "4px", transform: isDark ? "translateX(0)" : "translateX(36px)" }}
                />
                {/* Icons */}
                <div className="flex justify-between items-center w-full px-1.5 relative z-20">
                    <span
                        className={`material-symbols-outlined text-[18px] transition-all duration-500 ${isDark ? "text-white" : "text-zinc-400"}`}
                        style={{ fontVariationSettings: isDark ? "'FILL' 1, 'wght' 500" : "'FILL' 0, 'wght' 500" }}
                    >
                        dark_mode
                    </span>
                    <span
                        className={`material-symbols-outlined text-[18px] transition-all duration-500 ${!isDark ? "text-white" : "text-zinc-600"}`}
                        style={{ fontVariationSettings: !isDark ? "'FILL' 1, 'wght' 500" : "'FILL' 0, 'wght' 500" }}
                    >
                        light_mode
                    </span>
                </div>
            </button>
        </div>
    )
}
