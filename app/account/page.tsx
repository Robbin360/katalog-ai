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

    // 1. CORRECCIÓN: Renombramos 'data' a 'accountData' para no chocar nombres
    const { data: accountData, isLoading } = useQuery({
        queryKey: ['user-profile'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("No user")

            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            // Devolvemos un objeto con dos llaves
            return { user, profile: data }
        }
    })

    if (isLoading) {
        return <div className="h-screen bg-zinc-950 flex items-center justify-center text-zinc-500"><Loader2 className="animate-spin w-6 h-6" /></div>
    }

    // 2. CORRECCIÓN: Desestructuración segura
    // Ahora sacamos 'user' y 'profile' de 'accountData' sin conflictos
    const user = accountData?.user
    const profile = accountData?.profile

    const plan = profile?.plan_tier || 'starter'
    const creditsUsed = profile?.credits_used || 0
    const creditsTotal = profile?.credits_total || 3
    const usagePercent = Math.min((creditsUsed / creditsTotal) * 100, 100)

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex">

            {/* SIDEBAR DE NAVEGACIÓN */}
            <aside className="w-64 border-r border-zinc-800 p-6 flex flex-col gap-6 hidden md:flex">
                <div className="flex items-center gap-2 mb-4">
                    <Link href="/" className="p-2 rounded-lg hover:bg-zinc-900 text-zinc-400 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <span className="font-bold text-lg tracking-tight">Mi Cuenta</span>
                </div>

                <nav className="space-y-1">
                    <button onClick={() => setActiveTab("general")} className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all", activeTab === "general" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20" : "text-zinc-400 hover:bg-zinc-900 hover:text-white")}>
                        <User className="w-4 h-4" /> General
                    </button>
                    <button onClick={() => setActiveTab("usage")} className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all", activeTab === "usage" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20" : "text-zinc-400 hover:bg-zinc-900 hover:text-white")}>
                        <BarChart3 className="w-4 h-4" /> Uso y Créditos
                    </button>
                    <button onClick={() => setActiveTab("billing")} className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all", activeTab === "billing" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20" : "text-zinc-400 hover:bg-zinc-900 hover:text-white")}>
                        <CreditCard className="w-4 h-4" /> Planes y Pagos
                    </button>
                </nav>
            </aside>

            {/* ÁREA DE CONTENIDO */}
            <main className="flex-1 p-6 md:p-12 overflow-y-auto">

                {/* Mobile Back Button */}
                <div className="md:hidden mb-6">
                    <Link href="/" className="flex items-center text-zinc-400">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Volver al Dashboard
                    </Link>
                </div>

                {/* VISTA 1: GENERAL */}
                {activeTab === "general" && (
                    <div className="max-w-xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                            <h2 className="text-2xl font-bold mb-1">Perfil</h2>
                            <p className="text-zinc-500 text-sm">Gestiona tu información personal.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-zinc-400">Email</Label>
                                <Input disabled value={user?.email || ""} className="bg-zinc-900 border-zinc-800 text-zinc-500 cursor-not-allowed" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-zinc-400">ID de Usuario</Label>
                                <Input disabled value={user?.id || ""} className="font-mono text-xs bg-zinc-900 border-zinc-800 text-zinc-500" />
                            </div>
                        </div>
                    </div>
                )}

                {/* VISTA 2: USO */}
                {activeTab === "usage" && (
                    <div className="max-w-xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                            <h2 className="text-2xl font-bold mb-1">Consumo de Créditos</h2>
                            <p className="text-zinc-500 text-sm">Monitorea tu uso de la IA este mes.</p>
                        </div>

                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-lg">Créditos Disponibles</CardTitle>
                                    <Badge variant={plan === 'starter' ? 'secondary' : 'default'} className="uppercase">
                                        Plan {plan}
                                    </Badge>
                                </div>
                                <CardDescription>Se renuevan el día 1 de cada mes.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between text-sm font-medium">
                                    <span>{creditsUsed} usados</span>
                                    <span className="text-zinc-400">{creditsTotal} total</span>
                                </div>

                                {/* 3. CORRECCIÓN: Quitamos 'indicatorClassName' que causaba error */}
                                {/* Usamos clases estándar de Tailwind en el className principal */}
                                <Progress value={usagePercent} className="h-3 bg-zinc-800" />

                                <p className="text-xs text-zinc-500 pt-2">
                                    Has usado el {usagePercent.toFixed(0)}% de tu capacidad mensual.
                                </p>
                            </CardContent>
                            {usagePercent >= 80 && (
                                <CardFooter>
                                    <Button onClick={() => setActiveTab("billing")} variant="outline" className="w-full border-indigo-500/50 text-indigo-400 hover:bg-indigo-950/30">
                                        Aumentar Límite
                                    </Button>
                                </CardFooter>
                            )}
                        </Card>
                    </div>
                )}

                {/* VISTA 3: FACTURACIÓN */}
                {activeTab === "billing" && (
                    <div className="max-w-5xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                            <h2 className="text-2xl font-bold mb-1">Planes de Suscripción</h2>
                            <p className="text-zinc-500 text-sm">Escala la producción de tu catálogo.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            <PricingCard
                                title="Starter"
                                price="$0"
                                features={["3 Productos / mes", "Tono de IA Estándar", "Exportación HTML", "Soporte Básico"]}
                                current={plan === 'starter'}
                                actionLabel="Plan Actual"
                            />

                            <PricingCard
                                title="Pro"
                                price="$29"
                                features={["50 Productos / mes", "Personalización de Marca", "Cola Prioritaria", "Imágenes HD"]}
                                current={plan === 'pro'}
                                recommended
                                actionLabel="Mejorar a Pro"
                            />

                            <PricingCard
                                title="Business"
                                price="$99"
                                features={["500 Productos / mes", "Acceso API", "Exportación CSV Masiva", "Soporte Dedicado"]}
                                current={plan === 'business'}
                                actionLabel="Contactar Ventas"
                            />
                        </div>
                    </div>
                )}

            </main>
        </div>
    )
}

// Componente auxiliar para las tarjetas de precio
function PricingCard({ title, price, features, current, recommended, actionLabel }: any) {
    return (
        <Card className={cn("bg-zinc-900 border-zinc-800 flex flex-col relative transition-all duration-300 hover:border-zinc-700", recommended && "border-indigo-500/50 bg-indigo-950/10")}>
            {recommended && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Recomendado</div>}
            <CardHeader>
                <CardTitle className="text-xl">{title}</CardTitle>
                <div className="mt-2">
                    <span className="text-3xl font-bold text-white">{price}</span>
                    <span className="text-zinc-500 text-sm"> / mes</span>
                </div>
            </CardHeader>
            <CardContent className="flex-1">
                <ul className="space-y-3">
                    {features.map((f: string, i: number) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                            <Check className="w-4 h-4 text-emerald-500 shrink-0" /> {f}
                        </li>
                    ))}
                </ul>
            </CardContent>
            <CardFooter>
                <Button
                    className={cn("w-full font-bold", recommended ? "bg-indigo-600 hover:bg-indigo-500" : "bg-zinc-800 hover:bg-zinc-700")}
                    disabled={current}
                    onClick={() => !current && alert("Próximamente: Integración con Stripe")}
                >
                    {current ? "Plan Activo" : actionLabel}
                </Button>
            </CardFooter>
        </Card>
    )
}