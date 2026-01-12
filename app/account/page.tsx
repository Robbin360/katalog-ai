"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { User, CreditCard, BarChart3, Check, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function AccountPage() {
    const [activeTab, setActiveTab] = useState("general")
    const [loadingCheckout, setLoadingCheckout] = useState(false)

    // 1. Obtener Datos
    const { data: accountData, isLoading } = useQuery({
        queryKey: ['user-profile'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("No user")
            const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
            return { user, profile: data }
        }
    })

    // Función para disparar el pago
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
                window.location.href = data.url // Redirigir a Stripe
            } else {
                alert("Error al iniciar pago")
            }
        } catch (error) {
            alert("Error de conexión")
        } finally {
            setLoadingCheckout(false)
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
            <aside className="w-64 border-r border-zinc-800 p-6 flex flex-col gap-6 hidden md:flex">
                <div className="flex items-center gap-2 mb-4">
                    <Link href="/" className="p-2 rounded-lg hover:bg-zinc-900 text-zinc-400 transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
                    <span className="font-bold text-lg tracking-tight">Mi Cuenta</span>
                </div>
                <nav className="space-y-1">
                    <button onClick={() => setActiveTab("general")} className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all", activeTab === "general" ? "bg-indigo-600 text-white" : "text-zinc-400 hover:bg-zinc-900")}>
                        <User className="w-4 h-4" /> General
                    </button>
                    <button onClick={() => setActiveTab("usage")} className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all", activeTab === "usage" ? "bg-indigo-600 text-white" : "text-zinc-400 hover:bg-zinc-900")}>
                        <BarChart3 className="w-4 h-4" /> Uso y Créditos
                    </button>
                    <button onClick={() => setActiveTab("billing")} className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all", activeTab === "billing" ? "bg-indigo-600 text-white" : "text-zinc-400 hover:bg-zinc-900")}>
                        <CreditCard className="w-4 h-4" /> Planes y Pagos
                    </button>
                </nav>
            </aside>

            <main className="flex-1 p-6 md:p-12 overflow-y-auto">
                {/* VISTA GENERAL */}
                {activeTab === "general" && (
                    <div className="max-w-xl space-y-8">
                        <h2 className="text-2xl font-bold">Perfil</h2>
                        <div className="space-y-4">
                            <div className="space-y-2"><Label className="text-zinc-400">Email</Label><Input disabled value={user?.email || ""} className="bg-zinc-900 border-zinc-800" /></div>
                            <div className="space-y-2"><Label className="text-zinc-400">ID de Usuario</Label><Input disabled value={user?.id || ""} className="font-mono text-xs bg-zinc-900 border-zinc-800" /></div>
                        </div>
                    </div>
                )}

                {/* VISTA USO */}
                {activeTab === "usage" && (
                    <div className="max-w-xl space-y-8">
                        <h2 className="text-2xl font-bold">Consumo de Créditos</h2>
                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader><CardTitle>Créditos Disponibles</CardTitle><CardDescription>Se renuevan mensualmente.</CardDescription></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between text-sm font-medium"><span>{creditsUsed} usados</span><span className="text-zinc-400">{creditsTotal} total</span></div>
                                <Progress value={usagePercent} className="h-3 bg-zinc-800" />
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* VISTA FACTURACIÓN */}
                {activeTab === "billing" && (
                    <div className="max-w-5xl space-y-8">
                        <h2 className="text-2xl font-bold">Planes de Suscripción</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <PricingCard title="Starter" price="$0" features={["3 Productos/mes", "Soporte Básico"]} current={plan === 'starter'} />

                            <PricingCard
                                title="Pro" price="$29" features={["50 Productos/mes", "Cola Prioritaria"]}
                                current={plan === 'pro'} recommended
                                actionLabel="Mejorar a Pro"
                                priceId={process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO} // ID REAL
                                onCheckout={handleCheckout}
                                loading={loadingCheckout}
                            />

                            <PricingCard
                                title="Business" price="$99" features={["500 Productos/mes", "Exportación CSV"]}
                                current={plan === 'business'}
                                actionLabel="Mejorar a Business"
                                priceId={process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_BUSINESS} // ID REAL
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

function PricingCard({ title, price, features, current, recommended, actionLabel, priceId, onCheckout, loading }: any) {
    return (
        <Card className={cn("bg-zinc-900 border-zinc-800 flex flex-col relative", recommended && "border-indigo-500/50 bg-indigo-950/10")}>
            {recommended && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase">Recomendado</div>}
            <CardHeader><CardTitle className="text-xl">{title}</CardTitle><div className="mt-2"><span className="text-3xl font-bold text-white">{price}</span><span className="text-zinc-500 text-sm">/mo</span></div></CardHeader>
            <CardContent className="flex-1"><ul className="space-y-3">{features.map((f: string, i: number) => <li key={i} className="flex items-center gap-2 text-sm text-zinc-300"><Check className="w-4 h-4 text-emerald-500" />{f}</li>)}</ul></CardContent>
            <CardFooter>
                <Button
                    className={cn("w-full font-bold", recommended ? "bg-indigo-600 hover:bg-indigo-500" : "bg-zinc-800 hover:bg-zinc-700")}
                    disabled={current || loading || !priceId}
                    onClick={() => priceId && onCheckout(priceId)}
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (current ? "Plan Activo" : actionLabel || "Gratis")}
                </Button>
            </CardFooter>
        </Card>
    )
}