"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import { ThemeProvider } from "next-themes"
import { I18nProvider } from "@/lib/i18n-context"
import { Toaster } from "sonner" // Notificaciones bonitas

export default function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient())

    return (
        <QueryClientProvider client={queryClient}>
            <I18nProvider>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                    {children}
                    <Toaster position="bottom-right" theme="dark" />
                </ThemeProvider>
            </I18nProvider>
        </QueryClientProvider>
    )
}
