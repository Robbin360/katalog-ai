"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Brand } from "@/components/ui/brand"
import { BrandBrainTab } from "@/components/account/BrandBrain"
import { PricingCard } from "@/components/pricing-card"
import { PLANS } from "@/lib/pricing-config"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
    User, BrainCircuit, Store, CreditCard, ArrowLeft,
    Save, Loader2, ExternalLink, LogOut, Calendar, Sun, Moon, Laptop, Eye, EyeOff
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { signout } from "@/app/(auth)/actions"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog"

import { useSearchParams, useRouter } from "next/navigation"
import { useI18n } from "@/lib/i18n-context"
import { ShopifyCard } from "@/components/dashboard/integrations/ShopifyCard"
import { AutoScaleCard } from "@/components/billing/AutoScaleCard"

export default function AccountPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { t, Trans } = useI18n()
    const activeTab = searchParams.get("tab") || "brain"

    const setActiveTab = (tab: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("tab", tab)
        router.push(`/account?${params.toString()}`)
    }

    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    const queryClient = useQueryClient()

    // Solo mostrar UI de tema tras montado para evitar errores de hidratación
    useEffect(() => setMounted(true), [])

    // Estados de Carga
    const [loadingCheckout, setLoadingCheckout] = useState(false)
    const [loadingPortal, setLoadingPortal] = useState(false)
    const [isAnnual, setIsAnnual] = useState(false)

    // 1. FETCH DATOS GLOBAL
    const { data: accountData, isLoading, isError } = useQuery({
        queryKey: ['account-data-full'],
        retry: 1,
        staleTime: 1000 * 60 * 5, // Previene refetch agresivo al volver con el botón "Atrás"
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("No user")

            const [profileReq, rulesReq, integrationReq] = await Promise.all([
                supabase.from('profiles')
                    .select('id, plan_tier, onboarding_dismissed, auto_pilot_enabled, full_name, email')
                    .eq('id', user.id)
                    .maybeSingle(),
                
                supabase.from('brand_rules')
                    .select('id, tone_voice, target_audience, language, forbidden_words')
                    .eq('user_id', user.id)
                    .maybeSingle(),
                
                supabase.from('integrations_safe')
                    .select('id, provider, shop_url')
                    .eq('user_id', user.id)
                    .eq('provider', 'shopify')
                    .maybeSingle()
            ])

            return {
                user,
                profile: profileReq.data,
                rules: rulesReq.data,
                integration: integrationReq.data
            }
        }
    })

    // --- ACCIONES ---

    const handleUpgrade = async (priceId: string) => {
        setLoadingCheckout(true)
        try {
            const response = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priceId })
            })
            const data = await response.json()

            if (!response.ok) {
                toast.error(data.error || t('account.alerts.payment_error'))
                return
            }

            if (data.url) {
                // Redirigimos al Checkout de Stripe
                window.location.href = data.url
            } else {
                toast.error(t('account.alerts.payment_error'))
            }
        } catch (error) {
            toast.error(t('account.alerts.connection_error'))
        } finally {
            setLoadingCheckout(false)
        }
    }

    const handlePortal = async () => {
        setLoadingPortal(true)
        try {
            const response = await fetch('/api/portal', { method: 'POST' })
            const data = await response.json()
            if (data.url) {
                // Abrimos Stripe en nueva pestaña para no destruir el router de Next.js
                window.open(data.url, '_blank', 'noopener,noreferrer')
            } else {
                alert(t('account.alerts.no_subscription'))
            }
        } catch (error) {
            alert(t('account.alerts.portal_error'))
        } finally {
            setLoadingPortal(false)
        }
    }

    // --- ACCIÓN: CAMBIAR TEMA (COOKIE + DB + LOCAL) ---
    const handleThemeChange = async (newTheme: string) => {
        // 1. Visual Instantáneo
        setTheme(newTheme)

        // 2. Cookie (Zero Flicker)
        document.cookie = `theme=${newTheme}; path=/; max-age=31536000; SameSite=Lax`

        // 3. DB (Persistencia Multi-dispositivo)
        if (accountData?.user?.id) {
            const { error } = await supabase
                .from('profiles')
                .update({ interface_theme: newTheme })
                .eq('id', accountData.user.id)

            if (error) console.error("Error syncing theme:", error)
        }
    }

    if (isLoading) return <div className="h-screen bg-background flex items-center justify-center text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin" /></div>
    if (isError) return <div className="h-screen bg-background flex flex-col items-center justify-center space-y-4 text-muted-foreground"><p>Error connecting to database.</p><Button onClick={() => window.location.reload()} variant="outline">Refresh Page</Button></div>

    const { user, profile } = accountData || {}
    const plan = profile?.plan_tier || 'starter'

    // Helpers para Profile
    const joinDate = user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'
    const userInitials = user?.user_metadata?.full_name
        ?.split(' ')
        .filter(Boolean)
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2) || user?.email?.substring(0, 2).toUpperCase() || "U"

    return (
        <div className="min-h-screen bg-transparent text-foreground font-sans">
            <main className="p-8 md:p-12 max-w-7xl mx-auto">

                {/* --- PESTAÑA: BRAND BRAIN --- */}
                {activeTab === "brain" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground mb-1">{t('account.brain.title')}</h1>
                            <p className="text-muted-foreground text-sm">{t('account.brain.subtitle')}</p>
                        </div>

                        <BrandBrainTab />
                    </div>
                )}

                {/* --- PESTAÑA: INTEGRACIONES --- */}
                {activeTab === "integrations" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground mb-1">{t('account.store.title')}</h1>
                            <p className="text-muted-foreground text-sm">{t('account.store.subtitle')}</p>
                        </div>
                        
                        {accountData?.user?.id ? (
                            <ShopifyCard userId={accountData.user.id} />
                        ) : (
                            <div className="flex items-center justify-center p-8 border border-border rounded-xl">
                                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                            </div>
                        )}
                    </div>
                )}

                {/* --- PESTAÑA: BILLING (RESTAURADA) --- */}
                {activeTab === "billing" && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-bold text-foreground mb-1">{t('account.billing.title')}</h1>
                                <p className="text-muted-foreground text-sm">{t('account.billing.subtitle')}</p>
                            </div>
                            {plan !== 'starter' && (
                                <Button onClick={handlePortal} disabled={loadingPortal} variant="outline" className="border-border text-muted-foreground hover:text-foreground">
                                    {loadingPortal ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ExternalLink className="w-4 h-4 mr-2" />}
                                    {t('account.billing.manage_btn')}
                                </Button>
                            )}
                        </div>

                        {/* Billing toggle monthly/annual */}
                        <div className="flex items-center gap-4 bg-muted/40 p-1.5 rounded-lg w-fit border border-border">
                            <Button
                                variant={!isAnnual ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => setIsAnnual(false)}
                                className={cn("h-8 px-4 font-semibold text-xs", !isAnnual && "bg-background shadow-sm")}
                            >
                                Monthly
                            </Button>
                            <Button
                                variant={isAnnual ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => setIsAnnual(true)}
                                className={cn("h-8 px-4 font-semibold text-xs", isAnnual && "bg-background shadow-sm")}
                            >
                                Annual <span className="ml-1 px-1.5 py-0.5 bg-emerald-500/15 text-primary rounded-full scale-90 origin-right">Save 17% (2 months free)</span>
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                            <PricingCard
                                id="free"
                                title="FREE"
                                description={t('landing.pricing.plans.starter.desc') || "Discover what's hurting your catalog. No credit card required."}
                                price="$0"
                                capacity={t('landing.pricing.plans.starter.capacity') || "15 Credits"}
                                renewal={t('landing.pricing.plans.starter.renewal') || "Renews every month."}
                                features={[
                                    { brand: null, text: t('landing.pricing.plans.starter.features.item1') || "15 AI credits per month" },
                                    { brand: null, text: t('landing.pricing.plans.starter.features.item2') || "SEO audit of your catalog" },
                                    { brand: null, text: t('landing.pricing.plans.starter.features.item3') || "Image and text search" },
                                    { brand: null, text: t('landing.pricing.plans.starter.features.item4') || "Up to 3 email reports" },
                                    { brand: null, text: t('landing.pricing.plans.starter.features.item5') || "No credit card required" },
                                ]}
                                current={plan === 'starter'}
                                actionLabel={t('landing.pricing.plans.starter.cta') || "Start for free"}
                                actionHref={plan !== 'starter' ? undefined : "/signup"}
                            />

                            <PricingCard
                                id="pro"
                                title="PRO"
                                description={t('landing.pricing.plans.pro.desc') || "AI-powered catalog optimization for your daily workflow."}
                                price={isAnnual ? "$490" : "$49"}
                                priceSuffix={isAnnual ? t('pricing.billing.suffix_year') : t('pricing.billing.suffix_month')}
                                monthlyPrice={PLANS[1].monthlyPrice}
                                annualPrice={PLANS[1].annualPrice}
                                billingCycle={isAnnual ? "annually" : "monthly"}
                                capacity={t('landing.pricing.plans.pro.capacity') || "250 Credits"}
                                renewal={t('landing.pricing.plans.pro.renewal') || "Renews every month."}
                                highlight={t('landing.pricing.plans.pro.includedFrom') || "↳ Everything in Free, plus:"}
                                features={[
                                    { brand: null, text: t('landing.pricing.plans.pro.features.item3') || "Auto-Pilot: continuously optimizes your catalog in the background, up to 5 products per cycle" },
                                    { brand: null, text: t('landing.pricing.plans.pro.features.item4') || "1 custom Brand Rule" },
                                    { brand: null, text: t('landing.pricing.plans.pro.features.item5') || "Email support" },
                                ]}
                                current={plan === 'pro'}
                                recommended={true}
                                badge={t('landing.pricing.plans.pro.badge') || "Recommended"}
                                actionLabel={t('landing.pricing.plans.pro.cta') || "Get Pro"}
                                onActionClick={() => handleUpgrade(
                                    isAnnual ? process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_ANNUAL! : process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO!
                                )}
                                isLoading={loadingCheckout}
                            />

                            <PricingCard
                                id="business"
                                title="BUSINESS"
                                description={t('landing.pricing.plans.enterprise.desc') || "High-volume optimization with priority processing."}
                                price={isAnnual ? "$1490" : "$149"}
                                priceSuffix={isAnnual ? t('pricing.billing.suffix_year') : t('pricing.billing.suffix_month')}
                                monthlyPrice={PLANS[2].monthlyPrice}
                                annualPrice={PLANS[2].annualPrice}
                                billingCycle={isAnnual ? "annually" : "monthly"}
                                capacity={t('landing.pricing.plans.enterprise.capacity') || "800 Credits"}
                                renewal={t('landing.pricing.plans.enterprise.renewal') || "Renews every month."}
                                highlight={t('landing.pricing.plans.enterprise.includedFrom') || "↳ Everything in Pro, plus:"}
                                badge={t('landing.pricing.plans.enterprise.badge') || "Lowest cost per credit"}
                                features={[
                                    { brand: null, text: t('landing.pricing.plans.enterprise.features.item3') || "Auto-Pilot (10 products per cycle)" },
                                    { brand: null, text: t('landing.pricing.plans.enterprise.features.item4') || "Unlimited Brand Rules" },
                                    { brand: null, text: t('landing.pricing.plans.enterprise.features.item5') || "Priority processing queue" },
                                    { brand: null, text: t('landing.pricing.plans.enterprise.features.item6') || "Priority support" },
                                ]}
                                current={plan === 'business'}
                                actionLabel={t('landing.pricing.plans.enterprise.cta') || "Get Business"}
                                onActionClick={() => handleUpgrade(
                                    isAnnual ? process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_BUSINESS_ANNUAL! : process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_BUSINESS!
                                )}
                                isLoading={loadingCheckout}
                            />
                        </div>

                        <div className="mt-12 mb-4">
                          <h3 className="text-lg font-semibold">Credits & Billing</h3>
                          <p className="text-sm text-muted-foreground">Manage your credit usage and automatic recharges.</p>
                        </div>

                        <div className="w-full">
                          <AutoScaleCard />
                        </div>
                    </div>
                )}

                {/* --- PESTAÑA: PROFILE (MEJORADA) --- */}
                {activeTab === "profile" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground mb-1">{t('account.profile.title')}</h1>
                            <p className="text-muted-foreground text-sm">{t('account.profile.subtitle')}</p>
                        </div>

                        <Card className="bg-card border-border">
                            <CardContent className="p-8">
                                <div className="flex items-center gap-6">
                                    <Avatar className="h-20 w-20 border-2 border-border">
                                        <AvatarImage src={user?.user_metadata?.avatar_url} />
                                        <AvatarFallback className="bg-primary text-2xl text-primary-foreground font-bold">{userInitials}</AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-1">
                                        <h2 className="text-2xl font-bold text-foreground">{user?.user_metadata?.full_name || user?.email}</h2>
                                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                            <User className="w-4 h-4" /> {user?.email}
                                        </div>
                                        <div className="flex items-center gap-2 text-zinc-500 text-xs mt-2">
                                            <Calendar className="w-3 h-3" /> Joined: {joinDate}
                                        </div>
                                    </div>
                                </div>

                                <Separator className="bg-border my-8" />

                                <div className="flex gap-4">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive hover:border-destructive/60 transition-all font-medium">
                                                <LogOut className="w-4 h-4 mr-2" /> {t('account.profile.logout_btn')}
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[425px]">
                                            <DialogHeader>
                                                <DialogTitle>{t('account.profile.logout_confirm_title')}</DialogTitle>
                                                <DialogDescription>
                                                    {t('account.profile.logout_confirm_desc')}
                                                </DialogDescription>
                                            </DialogHeader>
                                            <DialogFooter className="gap-2 sm:gap-0">
                                                <DialogClose asChild>
                                                    <Button variant="outline">Cancel</Button>
                                                </DialogClose>
                                                <Button variant="destructive" onClick={() => signout()}>
                                                    Log Out
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>

                                <Separator className="bg-border my-8" />

                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-lg font-medium text-foreground mb-1">{t('account.profile.theme_title')}</h3>
                                        <p className="text-muted-foreground text-sm text-balance">
                                            <Trans i18nKey="account.profile.theme_desc" />
                                        </p>
                                    </div>

                                    {mounted && (
                                        <div className="flex flex-wrap gap-3">
                                            <Button
                                                variant="outline"
                                                onClick={() => handleThemeChange("light")}
                                                className={cn(
                                                    "h-12 w-32 border-border bg-background transition-all",
                                                    theme === 'light' && "border-primary ring-1 ring-primary bg-primary/5 text-primary"
                                                )}
                                            >
                                                <Sun className="mr-2 h-4 w-4" /> Light
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => handleThemeChange("dark")}
                                                className={cn(
                                                    "h-12 w-32 border-border bg-background transition-all",
                                                    theme === 'dark' && "border-primary ring-1 ring-primary bg-primary/5 text-primary"
                                                )}
                                            >
                                                <Moon className="mr-2 h-4 w-4" /> Dark
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => handleThemeChange("system")}
                                                className={cn(
                                                    "h-12 w-36 border-border bg-background transition-all",
                                                    theme === 'system' && "border-primary ring-1 ring-primary bg-primary/5 text-primary"
                                                )}
                                            >
                                                <Laptop className="mr-2 h-4 w-4" /> System
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

            </main>
        </div>
    )
}

