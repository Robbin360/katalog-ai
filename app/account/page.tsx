"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import {
    User, BrainCircuit, Store, CreditCard, ArrowLeft,
    Save, Loader2, CheckCircle2, AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner" // Usamos Sonner para feedback elegante

export default function AccountPage() {
    const [activeTab, setActiveTab] = useState("brain") // Por defecto vamos al Cerebro
    const queryClient = useQueryClient()
    const [isSaving, setIsSaving] = useState(false)

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
        queryKey: ['account-data'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("No user")

            // Cargar todo en paralelo para velocidad
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

    // Sincronizar estado local cuando llegan los datos
    useEffect(() => {
        if (accountData?.rules) {
            setTone(accountData.rules.tone_voice || "")
            setLanguage(accountData.rules.language || "English")
            setAudience(accountData.rules.target_audience || "")
            setForbidden(accountData.rules.forbidden_words?.join(", ") || "")
        }
        if (accountData?.integration) {
            setShopUrl(accountData.integration.shop_url || "")
            // No cargamos el token por seguridad visual
        }
    }, [accountData])

    // --- ACCIÓN: GUARDAR CEREBRO ---
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

            toast.success("Brand Brain Updated", { description: "Your AI agents are now synced with these rules." })
            queryClient.invalidateQueries({ queryKey: ['account-data'] })
        } catch (error: any) {
            toast.error("Error saving rules", { description: error.message })
        } finally {
            setIsSaving(false)
        }
    }

    // --- ACCIÓN: GUARDAR SHOPIFY ---
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
                access_token: shopToken // Solo si se editó
            }, { onConflict: 'user_id, provider' })

            if (error) throw error

            toast.success("Shopify Connected", { description: "Ready to sync inventory." })
            queryClient.invalidateQueries({ queryKey: ['account-data'] })
        } catch (error: any) {
            toast.error("Integration Failed", { description: error.message })
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) return <div className="h-screen bg-zinc-950 flex items-center justify-center text-zinc-500"><Loader2 className="w-6 h-6 animate-spin" /></div>

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex">

            {/* SIDEBAR DE NAVEGACIÓN */}
            <aside className="w-64 border-r border-zinc-800 p-6 hidden md:flex flex-col gap-8 fixed h-full">
                <div className="flex items-center gap-2">
                    <Link href="/dashboard" className="p-2 -ml-2 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <span className="font-bold text-lg tracking-tight">Settings</span>
                </div>

                <nav className="space-y-1">
                    <NavButton active={activeTab === "brain"} onClick={() => setActiveTab("brain")} icon={<BrainCircuit className="w-4 h-4" />}>Brand Brain</NavButton>
                    <NavButton active={activeTab === "integrations"} onClick={() => setActiveTab("integrations")} icon={<Store className="w-4 h-4" />}>Integrations</NavButton>
                    <NavButton active={activeTab === "general"} onClick={() => setActiveTab("general")} icon={<User className="w-4 h-4" />}>Profile</NavButton>
                    <NavButton active={activeTab === "billing"} onClick={() => setActiveTab("billing")} icon={<CreditCard className="w-4 h-4" />}>Billing</NavButton>
                </nav>
            </aside>

            {/* CONTENIDO PRINCIPAL */}
            <main className="flex-1 md:ml-64 p-8 md:p-12 max-w-4xl">

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
                                    <Label>Tone</Label>
                                    <Input value={tone} onChange={(e) => setTone(e.target.value)} className="bg-zinc-950 border-zinc-800" placeholder="e.g. Professional, Witty, Luxury..." />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Language</Label>
                                        <Input value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-zinc-950 border-zinc-800" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Target Audience</Label>
                                        <Input value={audience} onChange={(e) => setAudience(e.target.value)} className="bg-zinc-950 border-zinc-800" placeholder="e.g. Gen Z Gamers" />
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
                                    <Label>Forbidden Words (CSV)</Label>
                                    <Textarea
                                        value={forbidden}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForbidden(e.target.value)}
                                        className="bg-zinc-950 border-zinc-800 min-h-[100px]"
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
                                        <Badge className="text-zinc-500">Not Connected</Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Store URL</Label>
                                    <Input value={shopUrl} onChange={(e) => setShopUrl(e.target.value)} placeholder="my-store.myshopify.com" className="bg-zinc-950 border-zinc-800" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Admin Access Token</Label>
                                    <Input type="password" value={shopToken} onChange={(e) => setShopToken(e.target.value)} placeholder="shpat_..." className="bg-zinc-950 border-zinc-800" />
                                    <p className="text-xs text-zinc-500">Only needed to update the connection.</p>
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

                {/* --- PESTAÑA: BILLING (Placeholder) --- */}
                {activeTab === "billing" && (
                    <div className="text-center py-20">
                        <CreditCard className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                        <h3 className="text-zinc-400">Billing Management via Stripe</h3>
                        <p className="text-zinc-600 text-sm mt-2">Manage your subscription in the portal.</p>
                    </div>
                )}

                {/* --- PESTAÑA: GENERAL (Placeholder) --- */}
                {activeTab === "general" && (
                    <div className="space-y-6">
                        <h1 className="text-2xl font-bold">Profile</h1>
                        <div className="p-4 border border-zinc-800 rounded-lg bg-zinc-900/50 text-zinc-400">
                            Logged in as: <span className="text-white">{accountData?.user?.email}</span>
                        </div>
                    </div>
                )}

            </main>
        </div>
    )
}

function NavButton({ active, onClick, icon, children }: { active: boolean, onClick: () => void, icon: React.ReactNode, children: React.ReactNode }) {
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

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
    return <span className={cn("px-2 py-0.5 rounded text-xs font-medium border", className)}>{children}</span>
}