"use client"

import { useState, useEffect, Suspense } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { User, CreditCard, BarChart3, Check, Loader2, ArrowLeft, ExternalLink, Store } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

function AccountContent() {
    const searchParams = useSearchParams()
    const queryClient = useQueryClient()
    const [activeTab, setActiveTab] = useState("general")

    // Sincronizar URL con Tabs
    useEffect(() => {
        const tab = searchParams.get("tab")
        if (tab && ["general", "usage", "billing", "integrations"].includes(tab)) {
            setActiveTab(tab)
        }
    }, [searchParams])

    const [loadingCheckout, setLoadingCheckout] = useState(false)
    const [loadingPortal, setLoadingPortal] = useState(false) // Nuevo estado para el portal

    // Estados para Shopify
    const [shopUrl, setShopUrl] = useState("")
    const [shopToken, setShopToken] = useState("")
    const [isSavingShop, setIsSavingShop] = useState(false)

    const { data: accountData, isLoading } = useQuery({
        queryKey: ['user-profile'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("No user")
            const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
            return { user, profile: data }
        }
    })

    // Guardar Shopify
    const handleSaveShopify = async () => {
        if (!accountData?.user) return
        setIsSavingShop(true)
        try {
            // 1. Limpiar y Validar URL
            const cleanUrl = shopUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')
            if (!cleanUrl.includes('.')) throw new Error("Invalid Store URL format")

            // 2. Verificar Credenciales (Llamada al Backend)
            const verifyRes = await fetch('/api/shopify/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ shopUrl: cleanUrl, accessToken: shopToken })
            })

            const verifyData = await verifyRes.json()
            if (!verifyRes.ok) throw new Error(verifyData.error || "Connection failed")

            // 3. Guardar en Base de Datos (Solo si es válido)
            const { error } = await supabase.from('profiles').update({
                shopify_domain: cleanUrl,
                shopify_access_token: shopToken
            }).eq('id', accountData.user.id)

            if (error) throw error
            alert(`✅ Connected to ${verifyData.shop} successfully!`)
            queryClient.invalidateQueries({ queryKey: ['user-profile'] })
        } catch (e: any) {
            alert("❌ Error: " + e.message)
        } finally {
            setIsSavingShop(false)
        }
    }

    // Función para Pago (Upgrade)
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

    // Función para Portal de Cliente (Cancelar/Cambiar)
    const handlePortal = async () => {
        setLoadingPortal(true)
        try {
            const response = await fetch('/api/portal', { method: 'POST' })
            const data = await response.json()
            if (data.url) window.location.href = data.url
            else alert("No active subscription found to manage.")
        } catch (error) {
            alert("Error connecting to billing portal")
        } finally {
            setLoadingPortal(false)
        }
    }

    if (isLoading) return <div className="h-screen bg-zinc-950 flex items-center justify-center text-zinc-500"><Loader2 className="animate-spin w-6 h-6" /></div>

    const user = accountData?.user
    const profile = accountData?.profile
    const plan = profile?.plan_tier || 'starter'
    const creditsUsed = profile?.credits_used || 0
    const creditsTotal = profile?.credits_total || 3
    const usagePercent = Math.min((creditsUsed / creditsTotal) * 100, 100)

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex">
            <aside className="w-64 border-r border-zinc-800 p-6 flex-col gap-6 hidden md:flex">
                <div className="flex items-center gap-2 mb-4">
                    <Link href="/" className="p-2 rounded-lg hover:bg-zinc-900 text-zinc-400 transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
                    <span className="font-bold text-lg tracking-tight text-white">My Account</span>
                </div>
                <nav className="space-y-1">
                    <button onClick={() => setActiveTab("general")} className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all", activeTab === "general" ? "bg-indigo-600 text-white" : "text-zinc-400 hover:bg-zinc-900 hover:text-white")}>
                        <User className="w-4 h-4" /> General
                    </button>
                    <button onClick={() => setActiveTab("integrations")} className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all", activeTab === "integrations" ? "bg-indigo-600 text-white" : "text-zinc-400 hover:bg-zinc-900 hover:text-white")}>
                        <Store className="w-4 h-4" /> Integrations
                    </button>
                    <button onClick={() => setActiveTab("usage")} className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all", activeTab === "usage" ? "bg-indigo-600 text-white" : "text-zinc-400 hover:bg-zinc-900 hover:text-white")}>
                        <BarChart3 className="w-4 h-4" /> Usage & Credits
                    </button>
                    <button onClick={() => setActiveTab("billing")} className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all", activeTab === "billing" ? "bg-indigo-600 text-white" : "text-zinc-400 hover:bg-zinc-900 hover:text-white")}>
                        <CreditCard className="w-4 h-4" /> Plans & Billing
                    </button>
                </nav>
            </aside>

            <main className="flex-1 p-6 md:p-12 overflow-y-auto">

                {/* VISTA GENERAL */}
                {activeTab === "general" && (
                    <div className="max-w-xl space-y-8 animate-in fade-in slide-in-from-bottom-2">
                        <h2 className="text-2xl font-bold text-white">Profile</h2>
                        <div className="space-y-4">
                            <div className="space-y-2"><Label className="text-zinc-400">Email</Label><Input disabled value={user?.email || ""} className="bg-zinc-900 border-zinc-800 text-white" /></div>
                            <div className="space-y-2"><Label className="text-zinc-400">User ID</Label><Input disabled value={user?.id || ""} className="font-mono text-xs bg-zinc-900 border-zinc-800 text-zinc-500" /></div>
                        </div>
                    </div>
                )}

                {/* VISTA INTEGRACIONES (NUEVA) */}
                {activeTab === "integrations" && (
                    <div className="max-w-xl space-y-8 animate-in fade-in slide-in-from-bottom-2">
                        <div>
                            <h2 className="text-2xl font-bold text-white">Integrations</h2>
                            <p className="text-zinc-500 text-sm">Connect your store to publish products directly.</p>
                        </div>

                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-900/20 rounded-lg"><Store className="w-6 h-6 text-green-500" /></div>
                                    <CardTitle className="text-lg text-white">Shopify Connection</CardTitle>
                                </div>
                                <CardDescription>Requires an Admin Access Token (Custom App).</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-zinc-300">Store URL</Label>
                                    <Input
                                        placeholder="my-store.myshopify.com"
                                        className="bg-zinc-950 border-zinc-800 text-white"
                                        value={shopUrl}
                                        onChange={(e) => setShopUrl(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-zinc-300">Admin Access Token</Label>
                                    <Input
                                        type="password"
                                        placeholder="shpat_xxxxxxxxxxxxxxxx"
                                        className="bg-zinc-950 border-zinc-800 text-white"
                                        value={shopToken}
                                        onChange={(e) => setShopToken(e.target.value)}
                                    />
                                    <p className="text-[10px] text-zinc-500">Found in Settings {'>'} Apps {'>'} Develop apps</p>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    onClick={handleSaveShopify}
                                    disabled={isSavingShop}
                                    className="w-full bg-green-600 hover:bg-green-500 text-white font-bold"
                                >
                                    {isSavingShop ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Connection"}
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                )}

                {/* VISTA USO */}
                {activeTab === "usage" && (
                    <div className="max-w-xl space-y-8 animate-in fade-in slide-in-from-bottom-2">
                        <h2 className="text-2xl font-bold text-white">Credit Usage</h2>
                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-white">Available Credits</CardTitle>
                                    <Badge variant={plan === 'starter' ? 'secondary' : 'default'} className="uppercase">
                                        {plan} Plan
                                    </Badge>
                                </div>
                                <CardDescription>Credits renew on the 1st of every month.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between text-sm font-medium text-white"><span>{creditsUsed} used</span><span className="text-zinc-400">{creditsTotal} total</span></div>
                                <Progress value={usagePercent} className="h-3 bg-zinc-800" />
                                <p className="text-xs text-zinc-500 pt-2">You have used {usagePercent.toFixed(0)}% of your monthly capacity.</p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* VISTA FACTURACIÓN */}
                {activeTab === "billing" && (
                    <div className="max-w-5xl space-y-8 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <h2 className="text-2xl font-bold text-white">Subscription Plans</h2>

                            {/* BOTÓN DE GESTIÓN (Solo visible si ya pagó) */}
                            {plan !== 'starter' && (
                                <Button onClick={handlePortal} disabled={loadingPortal} variant="outline" className="bg-transparent border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800">
                                    {loadingPortal ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ExternalLink className="w-4 h-4 mr-2" />}
                                    Manage Subscription / Cancel
                                </Button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <PricingCard title="Starter" price="$0" features={["3 Products/mo", "Basic Support", "Standard AI Model"]} current={plan === 'starter'} />

                            <PricingCard
                                title="Pro" price="$29" features={["50 Products/mo", "Priority Queue", "Advanced Brand Voice", "HD Image Processing"]}
                                current={plan === 'pro'} recommended
                                actionLabel="Upgrade to Pro"
                                priceId={process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO}
                                onCheckout={handleCheckout}
                                loading={loadingCheckout}
                            />

                            <PricingCard
                                title="Business" price="$99" features={["500 Products/mo", "Bulk Export (CSV)", "API Access", "Dedicated Support"]}
                                current={plan === 'business'}
                                actionLabel="Upgrade to Business"
                                priceId={process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_BUSINESS}
                                onCheckout={handleCheckout}
                                loading={loadingCheckout}
                            />
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}

export default function AccountPage() {
    return (
        <Suspense fallback={<div className="h-screen bg-zinc-950 flex items-center justify-center text-zinc-500"><Loader2 className="animate-spin w-6 h-6" /></div>}>
            <AccountContent />
        </Suspense>
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