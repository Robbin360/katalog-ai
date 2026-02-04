"use client"

import { useState, useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
    User, BrainCircuit, Store, CreditCard, ArrowLeft,
    Save, Loader2, Check, ExternalLink, LogOut, Calendar
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { signout } from "@/app/login/actions"

export default function AccountPage() {
    const [activeTab, setActiveTab] = useState("brain")
    const queryClient = useQueryClient()

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
            alert("Brand Brain Updated")
            queryClient.invalidateQueries({ queryKey: ['account-data-full'] })
        } catch (error: any) {
            alert("Error: " + error.message)
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

            const { error } = await supabase.from('integrations').upsert({
                user_id: userId,
                provider: 'shopify',
                shop_url: cleanUrl,
                access_token: shopToken
            }, { onConflict: 'user_id, provider' })

            if (error) throw error
            alert("Shopify Connected!")
            queryClient.invalidateQueries({ queryKey: ['account-data-full'] })
        } catch (error: any) {
            alert("Error: " + error.message)
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
            else alert("Payment error")
        } catch (error) {
            alert("Connection error")
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
            else alert("No active subscription found.")
        } catch (error) {
            alert("Portal error")
        } finally {
            setLoadingPortal(false)
        }
    }

    if (isLoading) return <div className="h-screen bg-zinc-950 flex items-center justify-center text-zinc-500"><Loader2 className="w-6 h-6 animate-spin" /></div>

    const { user, profile } = accountData || {}
    const plan = profile?.plan_tier || 'starter'

    // Helpers para Profile
    const joinDate = user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'
    const userInitials = user?.email?.substring(0, 2).toUpperCase() || "U"

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex">

            {/* SIDEBAR */}
            <aside className="w-64 border-r border-zinc-800 p-6 hidden md:flex md:flex-col gap-8 fixed h-full bg-zinc-950">
                <div className="flex items-center gap-2">
                    <Link href="/dashboard" className="p-2 -ml-2 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <span className="font-bold text-lg tracking-tight text-white">Settings</span>
                </div>

                <nav className="space-y-1">
                    <NavButton active={activeTab === "brain"} onClick={() => setActiveTab("brain")} icon={<BrainCircuit className="w-4 h-4" />}>Brand Brain</NavButton>
                    <NavButton active={activeTab === "integrations"} onClick={() => setActiveTab("integrations")} icon={<Store className="w-4 h-4" />}>Integrations</NavButton>
                    <NavButton active={activeTab === "billing"} onClick={() => setActiveTab("billing")} icon={<CreditCard className="w-4 h-4" />}>Plans & Billing</NavButton>
                    <NavButton active={activeTab === "profile"} onClick={() => setActiveTab("profile")} icon={<User className="w-4 h-4" />}>Profile</NavButton>
                </nav>
            </aside>

            {/* CONTENIDO PRINCIPAL */}
            <main className="flex-1 md:ml-64 p-8 md:p-12 max-w-5xl">

                {/* --- PESTAÑA: BRAND BRAIN --- */}
                {activeTab === "brain" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-1">Brand Brain</h1>
                            <p className="text-zinc-400 text-sm">Configure how the AI speaks about your products.</p>
                        </div>

                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader>
                                <CardTitle className="text-base text-zinc-200">Voice & Tone</CardTitle>
                                <CardDescription>Define the personality of your copy.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-zinc-400">Tone</Label>
                                    <Input value={tone} onChange={(e) => setTone(e.target.value)} className="bg-zinc-950 border-zinc-800 text-white" placeholder="e.g. Professional, Witty..." />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-zinc-400">Language</Label>
                                        <Input value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-zinc-950 border-zinc-800 text-white" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-zinc-400">Target Audience</Label>
                                        <Input value={audience} onChange={(e) => setAudience(e.target.value)} className="bg-zinc-950 border-zinc-800 text-white" placeholder="e.g. Gen Z Gamers" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader>
                                <CardTitle className="text-base text-zinc-200">Safety & Constraints</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Label className="text-zinc-400">Forbidden Words (CSV)</Label>
                                    <Textarea
                                        value={forbidden}
                                        onChange={(e) => setForbidden(e.target.value)}
                                        className="bg-zinc-950 border-zinc-800 min-h-[100px] text-white"
                                        placeholder="cheap, discount, low quality..."
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="bg-zinc-950/50 border-t border-zinc-800 p-4 flex justify-end">
                                <Button onClick={handleSaveBrain} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-500 text-white">
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
                            <h1 className="text-2xl font-bold text-white mb-1">Integrations</h1>
                            <p className="text-zinc-400 text-sm">Connect your store to enable auto-sync.</p>
                        </div>

                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-green-900/20 rounded-xl border border-green-900/50">
                                            <Store className="w-6 h-6 text-green-500" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base text-zinc-200">Shopify</CardTitle>
                                            <CardDescription>Sync products and publish descriptions.</CardDescription>
                                        </div>
                                    </div>
                                    {accountData?.integration ? (
                                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Connected</Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-zinc-500 border-zinc-700">Not Connected</Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-zinc-400">Store URL</Label>
                                    <Input value={shopUrl} onChange={(e) => setShopUrl(e.target.value)} placeholder="my-store.myshopify.com" className="bg-zinc-950 border-zinc-800 text-white" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-zinc-400">Admin Access Token</Label>
                                    <Input type="password" value={shopToken} onChange={(e) => setShopToken(e.target.value)} placeholder="shpat_..." className="bg-zinc-950 border-zinc-800 text-white" />
                                </div>
                            </CardContent>
                            <CardFooter className="bg-zinc-950/50 border-t border-zinc-800 p-4 flex justify-end">
                                <Button onClick={handleSaveIntegration} disabled={isSaving} className="bg-white text-black hover:bg-zinc-200">
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Connect Store"}
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
                                <h1 className="text-2xl font-bold text-white mb-1">Plans & Billing</h1>
                                <p className="text-zinc-400 text-sm">Manage your subscription and credits.</p>
                            </div>
                            {plan !== 'starter' && (
                                <Button onClick={handlePortal} disabled={loadingPortal} variant="outline" className="border-zinc-700 text-zinc-300 hover:text-white">
                                    {loadingPortal ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ExternalLink className="w-4 h-4 mr-2" />}
                                    Manage Subscription
                                </Button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <PricingCard
                                title="Starter" price="$0"
                                features={["3 Products/mo", "Basic Support", "Standard AI Model"]}
                                current={plan === 'starter'}
                            />

                            <PricingCard
                                title="Pro" price="$29"
                                features={["50 Products/mo", "Priority Queue", "Advanced Brand Voice", "HD Image Processing"]}
                                current={plan === 'pro'} recommended
                                actionLabel="Upgrade to Pro"
                                priceId={process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO}
                                onCheckout={handleCheckout}
                                loading={loadingCheckout}
                            />

                            <PricingCard
                                title="Business" price="$99"
                                features={["500 Products/mo", "Bulk Export (CSV)", "API Access", "Dedicated Support"]}
                                current={plan === 'business'}
                                actionLabel="Upgrade to Business"
                                priceId={process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_BUSINESS}
                                onCheckout={handleCheckout}
                                loading={loadingCheckout}
                            />
                        </div>
                    </div>
                )}

                {/* --- PESTAÑA: PROFILE (MEJORADA) --- */}
                {activeTab === "profile" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-1">My Profile</h1>
                            <p className="text-zinc-400 text-sm">Personal account details.</p>
                        </div>

                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardContent className="p-8">
                                <div className="flex items-center gap-6">
                                    <Avatar className="h-20 w-20 border-2 border-zinc-700">
                                        <AvatarImage src={user?.user_metadata?.avatar_url} />
                                        <AvatarFallback className="bg-indigo-600 text-2xl text-white font-bold">{userInitials}</AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-1">
                                        <h2 className="text-2xl font-bold text-white">{user?.user_metadata?.full_name || user?.email}</h2>
                                        <div className="flex items-center gap-2 text-zinc-400 text-sm">
                                            <User className="w-4 h-4" /> {user?.email}
                                        </div>
                                        <div className="flex items-center gap-2 text-zinc-500 text-xs mt-2">
                                            <Calendar className="w-3 h-3" /> Joined: {joinDate}
                                        </div>
                                    </div>
                                </div>

                                <Separator className="bg-zinc-800 my-8" />

                                <div className="flex gap-4">
                                    <Button variant="destructive" onClick={() => signout()} className="bg-red-950/30 text-red-500 hover:bg-red-900/50 border border-red-900/50">
                                        <LogOut className="w-4 h-4 mr-2" /> Log Out
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

            </main>
        </div>
    )
}

// Componentes Auxiliares
function NavButton({ active, onClick, icon, children }: any) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                active
                    ? "bg-zinc-800 text-white shadow-sm ring-1 ring-zinc-700"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
            )}
        >
            {icon}
            {children}
        </button>
    )
}

function PricingCard({ title, price, features, current, recommended, actionLabel, priceId, onCheckout, loading }: any) {
    return (
        <Card className={cn(
            "flex flex-col relative transition-all duration-200",
            recommended ? "bg-zinc-900 border-indigo-500 shadow-2xl shadow-indigo-900/20 border-2" : "bg-zinc-900 border-zinc-800 border"
        )}>
            {recommended && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">Recommended</div>}

            <CardHeader>
                <CardTitle className="text-xl text-white font-bold">{title}</CardTitle>
                <div className="mt-2">
                    <span className="text-4xl font-bold text-white">{price}</span>
                    <span className="text-zinc-500 text-sm"> / mo</span>
                </div>
            </CardHeader>

            <CardContent className="flex-1">
                <ul className="space-y-4">
                    {features.map((f: string, i: number) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                            <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{f}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>

            <CardFooter>
                <Button
                    className={cn("w-full font-bold h-11", recommended ? "bg-indigo-600 hover:bg-indigo-500 text-white" : "bg-white text-black hover:bg-zinc-200")}
                    disabled={current || loading || !priceId}
                    onClick={() => priceId && onCheckout(priceId)}
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (current ? "Current Plan" : actionLabel || "Free Plan")}
                </Button>
            </CardFooter>
        </Card>
    )
}