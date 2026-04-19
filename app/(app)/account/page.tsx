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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
    User, BrainCircuit, Store, CreditCard, ArrowLeft,
    Save, Loader2, Check, ExternalLink, LogOut, Calendar, Sun, Moon, Laptop, Eye, EyeOff
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
    const [isSaving, setIsSaving] = useState(false)
    const [loadingCheckout, setLoadingCheckout] = useState(false)
    const [loadingPortal, setLoadingPortal] = useState(false)

    // Estados de Integración
    const [shopUrl, setShopUrl] = useState("")
    const [shopToken, setShopToken] = useState("")
    const [showToken, setShowToken] = useState(true) // Visible por defecto para verificar al pegar

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
                
                supabase.from('integrations')
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

    // Sincronizar estado local
    useEffect(() => {
        if (accountData?.integration) {
            setShopUrl(accountData.integration.shop_url || "")
        }
    }, [accountData])

    // --- ACCIONES ---

    const handleSaveIntegration = async () => {
        setIsSaving(true)
        try {
            const userId = accountData?.user?.id
            if (!userId) return

            const cleanUrl = shopUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')
            
            // Validación de seguridad para prevenir SSRF
            const shopUrlPattern = /^[a-zA-Z0-9][-a-zA-Z0-9]*\.myshopify\.com$/;
            if (!shopUrlPattern.test(cleanUrl)) {
                throw new Error(t('account.alerts.invalid_shopify_url'));
            }

            const { error } = await supabase.from('integrations').upsert({
                user_id: userId,
                provider: 'shopify',
                shop_url: cleanUrl,
                access_token: shopToken
            }, { onConflict: 'user_id, provider' })

            if (error) throw error
            toast.success("Tienda Conectada exitosamente", { description: "Tus productos e inventario ahora están listos para ser sincronizados." })
            queryClient.invalidateQueries({ queryKey: ['account-data-full'] })
        } catch (error: any) {
            toast.error("Error al conectar la tienda", { description: error.message })
        } finally {
            setIsSaving(false)
        }
    }

    const handleCheckout = async (priceId: string) => {
        setLoadingCheckout(true)
        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priceId })
            })
            const data = await response.json()
            if (data.url) {
                // Abrimos Stripe en nueva pestaña para no destruir el router de Next.js
                window.open(data.url, '_blank', 'noopener,noreferrer')
            } else {
                alert(t('account.alerts.payment_error'))
            }
        } catch (error) {
            alert(t('account.alerts.connection_error'))
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
    const userInitials = user?.email?.substring(0, 2).toUpperCase() || "U"

    return (
        <div className="min-h-screen bg-transparent text-foreground font-sans">
            <main className="p-8 md:p-12 max-w-5xl mx-auto">

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

                        <Card className="bg-card border-border shadow-2xl overflow-hidden relative">
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
                            <CardHeader className="border-b border-border bg-muted/30 pb-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-muted rounded-xl border border-border shadow-inner relative flex items-center justify-center">
                                            {/* White background pill to fill the transparent 'S' cut-out of the SVG */}
                                            <div className="absolute w-[10px] h-[14px] bg-white dark:bg-white rounded-full mt-2 z-0" />
                                            <img src="https://cdn.simpleicons.org/shopify/95BF47" alt="Shopify Logo" className="w-6 h-6 object-contain select-none relative z-10" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl text-foreground font-bold tracking-tight">Shopify Integration</CardTitle>
                                            <CardDescription className="text-muted-foreground mt-1">Connect your store via Admin API to sync products and inventory.</CardDescription>
                                        </div>
                                    </div>
                                    {accountData?.integration ? (
                                        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 px-3 py-1 font-medium tracking-wide">Connected</Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-muted-foreground border-border bg-muted/50 px-3 py-1 font-medium tracking-wide">Not Connected</Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="space-y-3">
                                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Store URL</Label>
                                    <div className="flex items-center rounded-lg border border-border bg-muted/50 overflow-hidden focus-within:ring-1 focus-within:ring-ring focus-within:border-ring transition-all">
                                        <div className="bg-muted px-3 flex items-center justify-center h-11 border-r border-border pointer-events-none select-none">
                                            <span className="text-muted-foreground font-mono text-sm leading-none">https://</span>
                                        </div>
                                        <Input value={shopUrl} onChange={(e) => setShopUrl(e.target.value)} placeholder="mi-tienda.myshopify.com" className="bg-transparent border-0 text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:ring-offset-0 px-3 h-11 shadow-none w-full rounded-none font-mono text-sm" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Admin API Access Token</Label>
                                    <div className="flex items-center rounded-lg border border-border bg-muted/50 overflow-hidden focus-within:ring-1 focus-within:ring-ring focus-within:border-ring transition-all">
                                        <Input type={showToken ? "text" : "password"} value={shopToken} onChange={(e) => setShopToken(e.target.value)} placeholder="shpat_....................." className="bg-transparent border-0 text-foreground placeholder:text-muted-foreground/50 font-mono focus-visible:ring-0 focus-visible:ring-offset-0 px-3 h-11 shadow-none w-full rounded-none" />
                                        <button
                                            type="button"
                                            onClick={() => setShowToken(!showToken)}
                                            className="px-3 h-11 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                                            aria-label={showToken ? "Hide token" : "Show token"}
                                        >
                                            {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground font-medium tracking-wide">
                                        Ensure token has read/write permissions for <span className="text-foreground/70 font-mono">Products</span> and <span className="text-foreground/70 font-mono">Inventory</span>.
                                    </p>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-muted/40 border-t border-border p-6 flex justify-end">
                                <Button onClick={handleSaveIntegration} disabled={isSaving} className="bg-[#95bf47] text-white hover:bg-[#7a9d36] font-bold px-8 h-11 shadow-[0_0_15px_rgba(149,191,71,0.2)] transition-all">
                                    {isSaving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Connecting...</> : "Connect Store"}
                                </Button>
                            </CardFooter>
                        </Card>
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

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <PricingCard
                                title="Starter" price="$0"
                                features={["3 Products/mo", "Basic Support", "Standard AI Model"]}
                                current={plan === 'starter'}
                                t={t}
                            />

                            <PricingCard
                                title="Pro" price="$29"
                                features={["50 Products/mo", "Priority Queue", "Advanced Brand Voice", "HD Image Processing"]}
                                current={plan === 'pro'} recommended
                                actionLabel={t('account.billing.upgrade_pro')}
                                priceId={process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO}
                                onCheckout={handleCheckout}
                                loading={loadingCheckout}
                                t={t}
                            />

                            <PricingCard
                                title="Business" price="$99"
                                features={["500 Products/mo", "Bulk Export (CSV)", "API Access", "Dedicated Support"]}
                                current={plan === 'business'}
                                actionLabel={t('account.billing.upgrade_business')}
                                priceId={process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_BUSINESS}
                                onCheckout={handleCheckout}
                                loading={loadingCheckout}
                                t={t}
                            />
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


function PricingCard({ title, price, features, current, recommended, actionLabel, priceId, onCheckout, loading, t }: any) {
    return (
        <Card className={cn(
            "flex flex-col relative transition-all duration-200",
            recommended ? "bg-card border-primary shadow-2xl shadow-primary/10 border-2" : "bg-card border-border border"
        )}>
            {recommended && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">Recommended</div>}

            <CardHeader>
                <CardTitle className="text-xl text-foreground font-bold">{title}</CardTitle>
                <div className="mt-2">
                    <span className="text-4xl font-bold text-foreground">{price}</span>
                    <span className="text-muted-foreground text-sm"> / mo</span>
                </div>
            </CardHeader>

            <CardContent className="flex-1">
                <ul className="space-y-4">
                    {features.map((f: string, i: number) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                            <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{f}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>

            <CardFooter>
                <Button
                    className={cn("w-full font-bold h-11", recommended ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-foreground text-background hover:bg-foreground/90")}
                    disabled={current || loading || !priceId}
                    onClick={() => priceId && onCheckout(priceId)}
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (current ? t('account.billing.current_plan') : actionLabel || t('account.billing.free_plan'))}
                </Button>
            </CardFooter>
        </Card>
    )
}