"use client"

import React, { useState, useEffect, useRef } from 'react'
import { supabase } from "@/lib/supabase"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { TrendingDown, Activity, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

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

const DEFAULTS: KPIData = {
    revenue_at_risk: 0,
    health_score_avg: 0,
    items_in_queue: 0,
}

// --- MAIN COMPONENT ---
interface KPIGridProps {
    userId: string
}

export default function KPIGrid({ userId }: KPIGridProps) {
    const queryClient = useQueryClient()

    // --- INITIAL FETCH VIA REACT QUERY ---
    // Automáticamente maneja la latencia de sesión (auth) con retries
    const { data: kpis = DEFAULTS, isLoading } = useQuery({
        queryKey: ['user_kpis', userId],
        queryFn: async () => {
            if (!userId) return DEFAULTS

            const { data, error } = await supabase
                .from('user_kpis')
                .select('revenue_at_risk, health_score_avg, items_in_queue')
                .eq('user_id', userId)
                .single()

            if (error) {
                console.warn("Supabase fetch error (might retry):", error)
                throw error
            }

            return {
                revenue_at_risk: Number(data.revenue_at_risk) || 0,
                health_score_avg: Number(data.health_score_avg) || 0,
                items_in_queue: Number(data.items_in_queue) || 0,
            }
        },
        enabled: !!userId,
        retry: 3,
        staleTime: Infinity, // Dependemos del WebSocket para frescura
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
                    const row = payload.new as any
                    if (row) {
                        // Actualizamos directamente el caché de React Query
                        queryClient.setQueryData(['user_kpis', userId], {
                            revenue_at_risk: Number(row.revenue_at_risk) || 0,
                            health_score_avg: Number(row.health_score_avg) || 0,
                            items_in_queue: Number(row.items_in_queue) || 0,
                        })
                    }
                }
            )
            .subscribe()

        // Cleanup: destroy channel on unmount to prevent memory leaks
        return () => {
            supabase.removeChannel(channel)
        }
    }, [userId, queryClient])

    return (
        <div className="grid gap-4 md:grid-cols-3 mb-8">
            <KPICard
                title="Revenue at Risk"
                value={`$${animatedRevenue.toLocaleString()}.00`}
                icon={TrendingDown}
                trend={{ label: animatedRevenue > 0 ? "High Risk" : "Clear", type: animatedRevenue > 0 ? "neg" : "pos" }}
                glowColor="#ef4444"
                subtitle="Est. monthly loss due to unoptimized assets"
                loading={isLoading}
            />
            <KPICard
                title="Catalog Health"
                value={`${animatedHealth}%`}
                icon={Activity}
                trend={{ label: animatedHealth > 80 ? "Healthy" : "Needs Attention", type: animatedHealth > 80 ? "pos" : "neg" }}
                glowColor="#eab308"
                subtitle="Overall quality score across all store products"
                loading={isLoading}
            />
            <KPICard
                title="Optimization Queue"
                value={animatedQueue}
                icon={Zap}
                glowColor="#3b82f6"
                subtitle="Assets analyzed and ready for AI processing"
                loading={isLoading}
            />
        </div>
    )
}

// --- KPI CARD (visual, no logic) ---
const KPICard = ({ title, value, icon: Icon, trend, glowColor, subtitle, loading }: {
    title: string,
    value: string | number,
    icon: any,
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
