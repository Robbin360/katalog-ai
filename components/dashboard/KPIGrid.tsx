"use client"

import React, { useState, useEffect, useRef } from 'react'
import { supabase } from "@/lib/supabase"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useI18n } from "@/lib/i18n-context"
import { TrendingDown, Activity, Zap, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import type { LucideIcon } from "lucide-react"

// --- ANIMATED NUMBER HOOK ---
// Smoothly transitions between old and new numeric values
function useAnimatedNumber(target: number, duration = 600): number {
    const [display, setDisplay] = useState(target)
    const rafRef = useRef<number>(0)
    const startRef = useRef<number>(0)
    const fromRef = useRef<number>(target)

    useEffect(() => {
        const from = fromRef.current
        const delta = target - from
        if (delta === 0) return

        const startTime = performance.now()
        startRef.current = startTime

        const animate = (now: number) => {
            const elapsed = now - startTime
            const progress = Math.min(elapsed / duration, 1)
            // Ease-out cubic for a satisfying deceleration
            const eased = 1 - Math.pow(1 - progress, 3)
            const current = from + delta * eased

            setDisplay(Math.round(current))

            if (progress < 1) {
                rafRef.current = requestAnimationFrame(animate)
            } else {
                fromRef.current = target
            }
        }

        rafRef.current = requestAnimationFrame(animate)

        return () => {
            cancelAnimationFrame(rafRef.current)
            fromRef.current = target
        }
    }, [target, duration])

    return display
}

// --- KPI DATA TYPES ---
interface KPIData {
    revenue_at_risk: number
    health_score_avg: number
    items_in_queue: number
}

interface KPIRealtimeRow {
    revenue_at_risk: string | number | null
    health_score_avg: string | number | null
    items_in_queue: number | null
}

const DEFAULTS: KPIData = {
    revenue_at_risk: 0,
    health_score_avg: 0,
    items_in_queue: 0,
}

const KPI_QUERY_KEY = (userId: string) => ['user_kpis', userId] as const

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value)

const toNumber = (value: string | number | null | undefined): number => {
    const parsed = Number(value ?? 0)
    return Number.isFinite(parsed) ? parsed : 0
}

const normalizeKpis = (row?: KPIRealtimeRow | null): KPIData => ({
    revenue_at_risk: toNumber(row?.revenue_at_risk),
    health_score_avg: toNumber(row?.health_score_avg),
    items_in_queue: toNumber(row?.items_in_queue),
})

// --- MAIN COMPONENT ---
interface KPIGridProps {
    userId: string
}

export default function KPIGrid({ userId }: KPIGridProps) {
    const queryClient = useQueryClient()
    const { t } = useI18n()

    // --- INITIAL FETCH VIA REACT QUERY ---
    // Automáticamente maneja la latencia de sesión (auth) con retries
    const { data: kpis = DEFAULTS, isLoading, isError } = useQuery({
        queryKey: KPI_QUERY_KEY(userId),
        queryFn: async () => {
            if (!userId) return DEFAULTS

            // Esperar activamente a que la sesión esté lista en el cliente para evitar RLS blocks
            const { data: sessionData } = await supabase.auth.getSession()
            if (!sessionData.session) {
                throw new Error("Session not hydrated yet")
            }

            const { data, error } = await supabase
                .from('user_kpis')
                .select('revenue_at_risk, health_score_avg, items_in_queue')
                .eq('user_id', userId)
                .single()

            if (error) {
                // Si la fila simplemente no existe aún, retornamos ceros sin fallar ni reintentar
                if (error.code === 'PGRST116') {
                    return DEFAULTS;
                }
                console.warn("Supabase fetch error (might retry):", error)
                throw error
            }

            return normalizeKpis(data)
        },
        enabled: !!userId,
        retry: (failureCount, error) => {
            if (isRecord(error) && error.code === 'PGRST116') return false; // Don't retry if row doesn't exist
            return failureCount < 5; // Retry up to 5 times for auth hydration
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff
        staleTime: 0,
        refetchOnMount: 'always',
        refetchOnWindowFocus: true,
    })

    // Animated display values
    const animatedRevenue = useAnimatedNumber(kpis.revenue_at_risk)
    const animatedHealth = useAnimatedNumber(kpis.health_score_avg)
    const animatedQueue = useAnimatedNumber(kpis.items_in_queue)

    // --- REALTIME SUBSCRIPTION ---
    useEffect(() => {
        if (!userId) return

        const channel = supabase
            .channel(`kpi-updates-${userId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'user_kpis',
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    if (payload.eventType === 'DELETE') {
                        queryClient.setQueryData(KPI_QUERY_KEY(userId), DEFAULTS)
                        return
                    }

                    queryClient.setQueryData(
                        KPI_QUERY_KEY(userId),
                        normalizeKpis(payload.new as KPIRealtimeRow)
                    )
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    queryClient.invalidateQueries({ queryKey: KPI_QUERY_KEY(userId) })
                }
            })

        // Cleanup: destroy channel on unmount to prevent memory leaks
        return () => {
            supabase.removeChannel(channel)
        }
    }, [userId, queryClient])

    // Un fallo real de red no puede parecerse a "catalogo perfecto".
    // Antes, tras agotar los 5 reintentos, data caia a DEFAULTS y el
    // usuario veia ceros como si fueran datos buenos.
    if (isError) {
        return (
            <div className="grid gap-4 md:grid-cols-3 mb-8">
                <Card className="md:col-span-3 border-amber-500/30 bg-amber-500/5">
                    <CardContent className="flex items-center gap-3 py-6">
                        <AlertCircle className="h-5 w-5 shrink-0 text-amber-500" />
                        <div>
                            <p className="text-sm font-semibold text-foreground">
                                No pudimos cargar tus metricas
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Recarga la pagina. Los numeros que verias podrian no ser reales.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-3 mb-8">
            <KPICard
                title={t('dashboard.kpis.revenue_at_risk.title')}
                value={`$${animatedRevenue.toLocaleString()}.00`}
                icon={TrendingDown}
                trend={{
                    label: kpis.revenue_at_risk > 0
                        ? t('dashboard.kpis.revenue_at_risk.trend_high')
                        : t('dashboard.kpis.revenue_at_risk.trend_none'),
                    type: kpis.revenue_at_risk > 0 ? "neg" : "pos",
                }}
                glowColor="#ef4444"
                subtitle={t('dashboard.kpis.revenue_at_risk.subtitle')}
                loading={isLoading}
            />
            <KPICard
                title={t('dashboard.kpis.catalog_health.title')}
                value={`${animatedHealth}%`}
                icon={Activity}
                trend={{
                    // Cero NO es "sin datos": un catalogo con 0% de salud es
                    // el peor caso posible y antes se pintaba en verde con el
                    // texto "Conecta una tienda". La ausencia de datos ya la
                    // cubre el estado loading.
                    label: kpis.health_score_avg > 80
                        ? t('dashboard.kpis.catalog_health.trend_healthy')
                        : t('dashboard.kpis.catalog_health.trend_attention'),
                    type: kpis.health_score_avg > 80 ? "pos" : "neg",
                }}
                glowColor="#eab308"
                subtitle={t('dashboard.kpis.catalog_health.subtitle')}
                loading={isLoading}
            />
            <KPICard
                title={t('dashboard.kpis.optimization_queue.title')}
                value={animatedQueue}
                icon={Zap}
                glowColor="#3b82f6"
                subtitle={t('dashboard.kpis.optimization_queue.subtitle')}
                loading={isLoading}
            />
        </div>
    )
}

// --- KPI CARD (visual, no logic) ---
const KPICard = ({ title, value, icon: Icon, trend, glowColor, subtitle, loading }: {
    title: string,
    value: string | number,
    icon: LucideIcon,
    trend?: { label: string, type: 'pos' | 'neg' },
    glowColor: string,
    subtitle: string,
    loading?: boolean
}) => (
    <Card className="bg-card/50 backdrop-blur-sm border-border hover:bg-card transition-all duration-300 relative overflow-hidden group">
        {/* Glow Effect */}
        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full blur-3xl opacity-20 transition-opacity group-hover:opacity-40" style={{ backgroundColor: glowColor }}></div>

        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</CardTitle>
            <div className="p-2 rounded-lg bg-background border border-border shadow-inner text-foreground">
                <Icon className="h-4 w-4" style={{ color: glowColor }} />
            </div>
        </CardHeader>
        <CardContent>
            <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold tracking-tight text-foreground tabular-nums">
                    {loading ? <Skeleton className="h-9 w-24" /> : value}
                </div>
                {!loading && trend && (
                    <Badge variant="outline" className={`text-[10px] font-bold px-1.5 py-0 rounded-full ${trend.type === 'pos' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                        }`}>
                        {trend.label}
                    </Badge>
                )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">{subtitle}</p>
        </CardContent>
    </Card>
)
