"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Package,
    BrainCircuit,
    Settings,
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    CreditCard,
    HelpCircle,
    LogOut,
    Zap,
    Sun,
    Moon
} from 'lucide-react'
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface SidebarProps {
    initialCollapsed?: boolean
    user: any
}

export default function Sidebar({ initialCollapsed = false, user }: SidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(initialCollapsed)
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const { theme, resolvedTheme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => setMounted(true), [])

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
        { name: 'Inventory', icon: Package, href: '/inventory' }, // Separate route to avoid highlight collision
        { name: 'Brand Brain', icon: BrainCircuit, href: '/account?tab=brain' },
        { name: 'Integrations', icon: Zap, href: '/account?tab=integrations' },
    ]

    const footerItems = [
        { name: 'Billing', icon: CreditCard, href: '/account?tab=billing' },
        { name: 'Settings', icon: Settings, href: '/account?tab=profile' },
    ]

    const toggleSidebar = () => {
        const newState = !isCollapsed
        setIsCollapsed(newState)
        document.cookie = `sidebar_collapsed=${newState}; path=/; max-age=31536000; SameSite=Lax`
    }

    // Keyboard shortcut: Cmd + \
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
                e.preventDefault()
                toggleSidebar()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isCollapsed])

    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User"
    const initials = displayName.substring(0, 2).toUpperCase()

    return (
        <TooltipProvider delayDuration={0}>
            <aside
                className={cn(
                    "hidden md:flex h-screen sticky top-0 bg-card border-r border-border transition-all duration-300 flex-col z-50",
                    isCollapsed ? "w-[70px]" : "w-64"
                )}
            >
                {/* BRANDING */}
                <div className="px-4 pt-6 pb-4 flex flex-col">
                    <div className="flex items-center justify-between">
                        {!isCollapsed && (
                            <Link href="/dashboard" className="flex items-center gap-3 flex-1 min-w-0">
                                {mounted ? (
                                    <>
                                        <Image
                                            src={resolvedTheme === 'dark' ? '/logo-dark.svg' : '/logo-light.svg'}
                                            alt="Katalog AI"
                                            width={40}
                                            height={40}
                                            className="h-10 w-10 object-contain shrink-0 transition-all"
                                            priority
                                        />
                                        <span className="text-lg font-bold tracking-tight text-foreground truncate">
                                            Katalog AI
                                        </span>
                                    </>
                                ) : (
                                    <div className="h-10 w-full animate-pulse bg-muted rounded-lg" />
                                )}
                            </Link>
                        )}
                        {isCollapsed && (
                            <div className="mx-auto">
                                {mounted ? (
                                    <Image
                                        src={resolvedTheme === 'dark' ? '/logo-dark.svg' : '/logo-light.svg'}
                                        alt="Logo"
                                        width={48}
                                        height={48}
                                        className="w-12 h-12 object-contain transition-all"
                                        priority
                                    />
                                ) : (
                                    <div className="w-12 h-12 animate-pulse bg-muted rounded-lg" />
                                )}
                            </div>
                        )}

                        {!isCollapsed && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleSidebar}
                                className="text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-all duration-200 hidden md:flex rounded-full border border-border w-9 h-9 items-center justify-center shrink-0 ml-2"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Floating expand button when collapsed */}
                {isCollapsed && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleSidebar}
                        className="absolute -right-4 top-7 bg-card border border-border rounded-full w-9 h-9 z-50 shadow-lg text-muted-foreground hover:text-foreground hover:bg-accent hover:scale-110 transition-all duration-200 hidden md:flex items-center justify-center"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                )}

                <nav className="flex-1 px-3 py-4 space-y-1">
                    {navItems.map((item) => {
                        const itemUrl = new URL(item.href, 'http://localhost')
                        const itemTab = itemUrl.searchParams.get('tab')
                        const currentTab = searchParams.get('tab')

                        const isTabMatch = itemTab ? currentTab === itemTab : !currentTab && pathname === item.href
                        const isActive = pathname === itemUrl.pathname && isTabMatch

                        return (
                            <NavItem
                                key={`${item.name}-${item.href}`}
                                item={item}
                                isCollapsed={isCollapsed}
                                isActive={isActive}
                            />
                        )
                    })}

                    <div className="pt-4 pb-2">
                        <div className={cn("h-px bg-border", isCollapsed ? "mx-2" : "mx-4")} />
                    </div>

                    {footerItems.map((item) => {
                        const itemUrl = new URL(item.href, 'http://localhost')
                        const itemTab = itemUrl.searchParams.get('tab')
                        const currentTab = searchParams.get('tab')

                        const isTabMatch = itemTab === currentTab
                        const isActive = pathname === itemUrl.pathname && isTabMatch

                        return (
                            <NavItem
                                key={`${item.name}-${item.href}`}
                                item={item}
                                isCollapsed={isCollapsed}
                                isActive={isActive}
                            />
                        )
                    })}
                </nav>

                {/* THEME TOGGLE & PROFILE */}
                <div className="p-3 mt-auto space-y-2 border-t border-border">
                    {mounted && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent",
                                isCollapsed && "justify-center px-0"
                            )}
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5" />}
                            {!isCollapsed && <span className="text-sm">Appearance</span>}
                        </Button>
                    )}

                    <div className={cn(
                        "flex items-center gap-3 p-2 rounded-xl transition-colors hover:bg-accent group cursor-pointer",
                        isCollapsed && "justify-center"
                    )}>
                        <Avatar className="h-9 w-9 shrink-0">
                            <AvatarImage src={user?.user_metadata?.avatar_url} />
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">{initials}</AvatarFallback>
                        </Avatar>
                        {!isCollapsed && (
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-medium truncate">{displayName}</span>
                                <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        </TooltipProvider>
    )
}

function NavItem({ item, isCollapsed, isActive }: { item: any, isCollapsed: boolean, isActive: boolean }) {
    const content = (
        <Link
            href={item.href}
            className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group relative",
                isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
        >
            <item.icon className={cn(
                "w-5 h-5 shrink-0 transition-transform group-hover:scale-110",
                isActive ? "text-primary" : "text-muted-foreground"
            )} />
            {!isCollapsed && <span className="text-sm truncate">{item.name}</span>}
            {isActive && !isCollapsed && (
                <div className="absolute left-0 w-1 h-4 bg-primary rounded-r-full" />
            )}
        </Link>
    )

    if (isCollapsed) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    {content}
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-foreground text-background border-none">
                    {item.name}
                </TooltipContent>
            </Tooltip>
        )
    }

    return content
}
