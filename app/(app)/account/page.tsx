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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
    User, BrainCircuit, Store, CreditCard, ArrowLeft,
    Save, Loader2, Check, ExternalLink, LogOut, Calendar, Sun, Moon, Laptop
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { signout } from "@/app/login/actions"
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

    // Estados del Formulario (Brand Brain)
    const [tone, setTone] = useState("")
    const [language, setLanguage] = useState("English")
    const [audience, setAudience] = useState("General")
    const [forbidden, setForbidden] = useState("")

    // Estados de Integración
    const [shopUrl, setShopUrl] = useState("")
    const [shopToken, setShopToken] = useState("")

    // 1. FETCH DATOS GLOBAL
    const { data: accountData, isLoading } = useQuery({
        queryKey: ['account-data-full'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("No user")

            const [profileReq, rulesReq, integrationReq] = await Promise.all([
                supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
                supabase.from('brand_rules').select('*').eq('user_id', user.id).maybeSingle(),
                supabase.from('integrations').select('*').eq('user_id', user.id).eq('provider', 'shopify').maybeSingle()
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
        if (accountData?.rules) {
            setTone(accountData.rules.tone_voice || "")
            setLanguage(accountData.rules.language || "English")
            setAudience(accountData.rules.target_audience || "")
            setForbidden(accountData.rules.forbidden_words?.join(", ") || "")
        }
        if (accountData?.integration) {
            setShopUrl(accountData.integration.shop_url || "")
        }
    }, [accountData])

    // --- ACCIONES ---

    const handleSaveBrain = async () => {
        setIsSaving(true)
        try {
            const userId = accountData?.user?.id
            if (!userId) return

            const forbiddenArray = forbidden.split(",").map(s => s.trim()).filter(s => s.length > 0)

            const { error } = await supabase.from('brand_rules').upsert({
                user_id: userId,
                tone_voice: tone,
                language: language,
                target_audience: audience,
                forbidden_words: forbiddenArray
            }, { onConflict: 'user_id' })

            if (error) throw error
            alert(t('account.alerts.brain_updated'))
            queryClient.invalidateQueries({ queryKey: ['account-data-full'] })
        } catch (error: any) {
            alert(t('account.alerts.error_prefix') + error.message)
        } finally {
            setIsSaving(false)
        }
    }

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
            alert(t('account.alerts.shopify_connected'))
            queryClient.invalidateQueries({ queryKey: ['account-data-full'] })
        } catch (error: any) {
            alert(t('account.alerts.error_prefix') + error.message)
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
            if (data.url) window.location.href = data.url
            else alert(t('account.alerts.payment_error'))
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
            if (data.url) window.location.href = data.url
            else alert(t('account.alerts.no_subscription'))
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

                        <Card className="bg-card border-border">
                            <CardHeader>
                                <CardTitle className="text-base text-card-foreground">{t('account.brain.voice_title')}</CardTitle>
                                <CardDescription>{t('account.brain.voice_desc')}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground">{t('account.brain.tone_label')}</Label>
                                    <Input value={tone} onChange={(e) => setTone(e.target.value)} className="bg-background border-border text-foreground" placeholder={t('account.brand.tone_placeholder')} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-muted-foreground">{t('account.brain.lang_label')}</Label>
                                        <Input value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-background border-border text-foreground" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-muted-foreground">{t('account.brain.audience_label')}</Label>
                                        <Input value={audience} onChange={(e) => setAudience(e.target.value)} className="bg-background border-border text-foreground" placeholder={t('account.brand.audience_placeholder')} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-card border-border">
                            <CardHeader>
                                <CardTitle className="text-base text-card-foreground">Safety & Constraints</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground">Forbidden Words (CSV)</Label>
                                    <Textarea
                                        value={forbidden}
                                        onChange={(e) => setForbidden(e.target.value)}
                                        className="bg-background border-border min-h-[100px] text-foreground"
                                        placeholder={t('account.brand.exclude_placeholder')}
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="bg-muted/50 border-t border-border p-4 flex justify-end">
                                <Button onClick={handleSaveBrain} disabled={isSaving} className="bg-primary text-primary-foreground hover:bg-primary/90">
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                    Save Configuration
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                )}

                {/* --- PESTAÑA: INTEGRACIONES --- */}
                {activeTab === "integrations" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground mb-1">{t('account.store.title')}</h1>
                            <p className="text-muted-foreground text-sm">{t('account.store.subtitle')}</p>
                        </div>

                        <Card className="bg-card border-border">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                            <Store className="w-6 h-6 text-emerald-500" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base text-card-foreground">Shopify</CardTitle>
                                            <CardDescription>{t('account.store.shopify_desc')}</CardDescription>
                                        </div>
                                    </div>
                                    {accountData?.integration ? (
                                        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Connected</Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-muted-foreground border-border">Not Connected</Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground">{t('account.store.url_label')}</Label>
                                    <Input value={shopUrl} onChange={(e) => setShopUrl(e.target.value)} placeholder={t('account.store.url_placeholder')} className="bg-background border-border text-foreground" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground">{t('account.store.token_label')}</Label>
                                    <Input type="password" value={shopToken} onChange={(e) => setShopToken(e.target.value)} placeholder={t('account.store.token_placeholder')} className="bg-background border-border text-foreground" />
                                </div>
                            </CardContent>
                            <CardFooter className="bg-muted/50 border-t border-border p-4 flex justify-end">
                                <Button onClick={handleSaveIntegration} disabled={isSaving} className="bg-primary text-primary-foreground hover:bg-primary/90">
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : t('account.store.connect_btn')}
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