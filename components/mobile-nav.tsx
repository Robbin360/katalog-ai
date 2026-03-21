"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useSearchParams } from 'next/navigation'
import { useTheme } from "next-themes"
import {
    LayoutDashboard,
    Package,
    BrainCircuit,
    Settings,
    CreditCard,
    Zap,
    Menu,
    Sun,
    Moon
} from 'lucide-react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { useI18n } from '@/lib/i18n-context'
import { Brand } from '@/components/ui/brand'

interface MobileNavProps {
    user: any
}

export function MobileNav({ user }: MobileNavProps) {
    const { t } = useI18n()
    const [open, setOpen] = useState(false)
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => setMounted(true), [])

    const navItems = [
        { name: t('nav.dashboard'), icon: LayoutDashboard, href: '/dashboard' },
        { name: t('nav.inventory'), icon: Package, href: '/inventory' },
        { name: t('nav.brain'), icon: BrainCircuit, href: '/account?tab=brain' },
        { name: t('nav.integrations'), icon: Zap, href: '/account?tab=integrations' },
    ]

    const footerItems = [
        { name: t('nav.billing'), icon: CreditCard, href: '/account?tab=billing' },
        { name: t('nav.settings'), icon: Settings, href: '/account?tab=profile' },
    ]

    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User"
    const initials = displayName.substring(0, 2).toUpperCase()

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground hover:text-foreground -ml-2">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">{t('nav.open_menu')}</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 flex flex-col bg-card border-r border-border">
                <SheetHeader className="p-6 border-b border-border text-left">
                    <SheetTitle className="flex items-center gap-2">
                        {mounted && (
                            <Image
                                src={theme === 'dark' ? '/logo-dark.svg' : '/logo-light.svg'}
                                alt="Katalog AI"
                                width={32}
                                height={32}
                                className="w-8 h-8 object-contain"
                            />
                        )}
                        <Brand className="font-bold text-foreground" />
                    </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-auto py-4 px-4 flex flex-col gap-1">
                    {navItems.map((item) => {
                        const itemUrl = new URL(item.href, 'http://localhost')
                        const itemTab = itemUrl.searchParams.get('tab')
                        const currentTab = searchParams.get('tab')
                        const isTabMatch = itemTab ? currentTab === itemTab : !currentTab && pathname === item.href
                        const isActive = pathname === itemUrl.pathname && isTabMatch

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-sm font-medium",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                )}
                            >
                                <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground")} />
                                {item.name}
                            </Link>
                        )
                    })}

                    <div className="my-4 h-px bg-border mx-2" />

                    {footerItems.map((item) => {
                        const itemUrl = new URL(item.href, 'http://localhost')
                        const itemTab = itemUrl.searchParams.get('tab')
                        const currentTab = searchParams.get('tab')
                        const isTabMatch = itemTab === currentTab
                        const isActive = pathname === itemUrl.pathname && isTabMatch

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-sm font-medium",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                )}
                            >
                                <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground")} />
                                {item.name}
                            </Link>
                        )
                    })}
                </div>

                <div className="p-4 border-t border-border mt-auto space-y-2 bg-muted/30">
                    {mounted && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="w-full justify-start gap-3 px-3 py-2 h-auto text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl"
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5" />}
                            <span>{t('nav.appearance')}</span>
                        </Button>
                    )}

                    <div className="flex items-center gap-3 p-2 rounded-xl bg-accent/50 border border-border/50">
                        <Avatar className="h-9 w-9 shrink-0">
                            <AvatarImage src={user?.user_metadata?.avatar_url} />
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium text-foreground truncate">{displayName}</span>
                            <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
