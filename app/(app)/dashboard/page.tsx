"use client"

import React, { useState } from 'react';
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import DOMPurify from "isomorphic-dompurify"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
    TrendingDown, Activity, Zap, Search, Filter, ArrowUpRight,
    AlertCircle, CheckCircle2, Clock, Loader2, Copy,
    Store, Rocket, BrainCircuit, X, Check, RefreshCw,
    Settings, CreditCard, LogOut
} from 'lucide-react';
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n-context";
import { Brand } from "@/components/ui/brand";
import { AutoPilotToggle } from "@/components/dashboard/AutoPilotToggle";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Product, ProductStatus } from "@/types/inventory";

// --- COMPONENT: ONBOARDING DECK ---
function OnboardingDeck({ status, onDismiss }: {
    status: {
        hasShopify: boolean;
        hasProducts: boolean;
        isPro: boolean;
        dismissed: boolean;
    },
    onDismiss: () => void
}) {
    const { t } = useI18n();
    const steps = [
        {
            id: 'store',
            label: t('onboarding.steps.connect.title'),
            done: status.hasShopify,
            icon: Store,
            action: '/account',
            desc: t('onboarding.steps.connect.desc')
        },
        {
            id: 'ai',
            label: t('onboarding.steps.train.title'),
            done: status.hasProducts,
            icon: BrainCircuit,
            action: null,
            desc: t('onboarding.steps.train.desc')
        },
        {
            id: 'plan',
            label: t('onboarding.steps.autopilot.title'),
            done: status.isPro,
            icon: Rocket,
            action: '/account',
            desc: t('onboarding.steps.autopilot.desc')
        }
    ]

    const completed = steps.filter(s => s.done).length
    const progress = (completed / 3) * 100

    if (status.dismissed) return null

    return (
        <div className="mb-8 bg-linear-to-r from-card to-card/50 border border-border rounded-2xl p-6 relative overflow-hidden animate-in fade-in slide-in-from-top-4">
            <button
                onClick={onDismiss}
                className="absolute top-4 right-4 text-zinc-500 hover:text-foreground transition-colors"
                title="Dismiss onboarding"
                aria-label={t('common.aria.dismiss')}
            >
                <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                <div className="md:w-1/3 space-y-2">
                    <h2 className="text-xl font-bold text-foreground">{t('onboarding.setup_progress')}</h2>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-mono text-primary">{completed}/3</span> {t('onboarding.steps_completed')}
                    </div>
                    <Progress value={progress} className="h-2 bg-muted" indicatorClassName="bg-primary" />
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                    {steps.map((step) => (
                        <div
                            key={step.id}
                            className={`relative p-4 rounded-xl border transition-all ${step.done
                                ? "bg-emerald-500/10 border-emerald-500/50 opacity-80"
                                : "bg-card border-border hover:border-primary/50"
                                }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className={`p-2 rounded-lg ${step.done ? "bg-emerald-500/20 text-emerald-500" : "bg-muted text-muted-foreground"}`}>
                                    <step.icon className="w-4 h-4" />
                                </div>
                                {step.done && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                            </div>

                            <h3 className={`font-bold text-sm ${step.done ? "text-emerald-500/80 line-through" : "text-foreground"}`}>
                                {step.label}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">{step.desc}</p>

                            {!step.done && step.action && (
                                <Link href={step.action} className="absolute inset-0" />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

// --- AUXILIARY COMPONENTS (KPIs) ---
const KPICard = ({ title, value, icon: Icon, trend, glowColor, subtitle, loading }: {
    title: string,
    value: string | number,
    icon: any,
    trend?: { label: string, type: 'pos' | 'neg' },
    glowColor: string,
    subtitle: string,
    loading?: boolean
}) => (
    <Card className={`bg-card/50 backdrop-blur-sm border-border hover:bg-card transition-all duration-300 relative overflow-hidden group`}>
        {/* Glow Effect */}
        <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full blur-3xl opacity-20 transition-opacity group-hover:opacity-40`} style={{ backgroundColor: glowColor }}></div>

        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</CardTitle>
            <div className={`p-2 rounded-lg bg-background border border-border shadow-inner text-foreground`}>
                <Icon className="h-4 w-4" style={{ color: glowColor }} />
            </div>
        </CardHeader>
        <CardContent>
            <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold tracking-tight text-foreground">{loading ? "..." : value}</div>
                {trend && (
                    <Badge variant="outline" className={`text-[10px] font-bold px-1.5 py-0 rounded-full ${trend.type === 'pos' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                        }`}>
                        {trend.label}
                    </Badge>
                )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">{subtitle}</p>
        </CardContent>
    </Card>
);

const KPIGrid = ({ revenue, health, queue, loading }: { revenue: number, health: number, queue: number, loading: boolean }) => (
    <div className="grid gap-4 md:grid-cols-3 mb-8">
        <KPICard
            title="Revenue at Risk"
            value={`$${revenue.toLocaleString()}.00`}
            icon={TrendingDown}
            trend={{ label: "High Risk", type: "neg" }}
            glowColor="#ef4444"
            subtitle="Est. monthly loss due to unoptimized assets"
            loading={loading}
        />
        <KPICard
            title="Catalog Health"
            value={`${health}%`}
            icon={Activity}
            trend={{ label: health > 80 ? "Healthy" : "Needs Attention", type: health > 80 ? "pos" : "neg" }}
            glowColor="#eab308"
            subtitle="Overall quality score across all store products"
            loading={loading}
        />
        <KPICard
            title="Optimization Queue"
            value={queue}
            icon={Zap}
            glowColor="#3b82f6"
            subtitle="Assets analyzed and ready for AI processing"
            loading={loading}
        />
    </div>
);

// --- COMPONENT: CONNECT STORE BANNER ---
function ConnectStoreBanner() {
    return (
        <div className="mt-8 relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl"></div>

            <div className="flex items-center gap-6 relative z-10">
                <div className="h-16 w-16 rounded-xl bg-white flex items-center justify-center shadow-lg transform rotate-3">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/0/0e/Shopify_logo_2018.svg" alt="Shopify" className="h-10 w-10" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-foreground">Connect your Shopify store</h3>
                    <p className="text-sm text-muted-foreground max-w-md">Unlock the full power of <Brand className="text-foreground font-medium" /> by syncing your inventory. We'll automatically find and fix poor listings.</p>
                </div>
            </div>

            <Link href="/integrations" className="relative z-10 w-full md:w-auto">
                <Button className="w-full bg-emerald-500 text-white hover:bg-emerald-600 font-bold px-8 h-12 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                    Connect Store Now
                </Button>
            </Link>
        </div>
    );
}

const StatusBadge = ({ status }: { status: string }) => {
    if (status === 'OPTIMIZED') return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-2 py-0.5"><CheckCircle2 className="h-3 w-3 mr-1" /> Optimized</Badge>
    if (status === 'NEEDS_REVIEW') return <Badge variant="outline" className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20 px-2 py-0.5"><AlertCircle className="h-3 w-3 mr-1" /> Needs Review</Badge>
    return <Badge variant="outline" className="bg-zinc-500/10 text-zinc-400 border-zinc-500/20 px-2 py-0.5"><Clock className="h-3 w-3 mr-1" /> Pending Audit</Badge>
};

// --- MAIN PAGE ---

export default function DashboardPage() {
    const { t } = useI18n();
    const [searchTerm, setSearchTerm] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);
    const queryClient = useQueryClient();

    const { data: dashboardData, isLoading } = useQuery({
        queryKey: ['dashboard-full'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return null

            const { data: products } = await supabase.from('shopify_products').select('id, shopify_id, current_title, current_body_html, audit_status, audit_score, image_url, ai_proposal, created_at').order('created_at', { ascending: false })
            const { data: profile } = await supabase.from('profiles').select('plan_tier, onboarding_dismissed, auto_pilot_enabled').eq('id', user.id).single()
            const { count: shopifyCount } = await supabase.from('integrations').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('provider', 'shopify')
            const { count: integrationCount } = await supabase.from('integrations').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
            const { count: queuedCount } = await supabase.from('shopify_products').select('*', { count: 'exact', head: true }).eq('audit_status', 'PENDING_AUDIT')
            const { data: brandRules } = await supabase.from('brand_rules').select('tone_voice, forbidden_words').eq('user_id', user.id).maybeSingle()

            return {
                products: products || [],
                userStatus: {
                    dismissed: profile?.onboarding_dismissed || false,
                    isPro: profile?.plan_tier === 'pro' || profile?.plan_tier === 'business', // Added business plan check
                    hasShopify: (shopifyCount || 0) > 0,
                    hasProducts: (products?.length || 0) > 0
                },
                autoPilotData: {
                    enabled: profile?.auto_pilot_enabled || false,
                    integrationCount: integrationCount || 0,
                    queuedCount: queuedCount || 0,
                    brandRules: brandRules || { tone_voice: 'Professional and Persuasive', forbidden_words: [] },
                    plan: profile?.plan_tier || 'starter'
                }
            }
        },
        refetchInterval: 5000
    })

    const dismissOnboarding = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        queryClient.setQueryData(['dashboard-full'], (old: any) => ({
            ...old,
            userStatus: { ...old.userStatus, dismissed: true }
        }))

        await supabase.from('profiles').update({ onboarding_dismissed: true }).eq('id', user.id)
    }

    const products: any[] = dashboardData?.products?.map((p: any) => {
        const proposal = p.ai_proposal || {}
        return {
            id: p.id,
            shopifyId: p.shopify_id,
            title: p.current_title || "Untitled Product",
            image: p.image_url,
            status: p.audit_status,
            healthScore: p.audit_score || 0,
            revenueImpact: p.audit_score < 80 ? (80 - p.audit_score) : 0,
            currentBodyHtml: p.current_body_html,
            aiProposal: proposal,
            createdAt: new Date(p.created_at).toLocaleDateString(),
            platform: 'Shopify'
        }
    }) || []

    const unoptimizedProducts = products.filter((p) => p.status !== 'OPTIMIZED')

    // KPI Calculations
    const totalCount = products.length
    const unoptimizedCount = unoptimizedProducts.length
    const optimizedCount = totalCount - unoptimizedCount
    const healthPercentage = totalCount > 0 ? Math.round((optimizedCount / totalCount) * 100) : 0
    const revenueAtRisk = unoptimizedCount * 50

    const filteredProducts = unoptimizedProducts.filter((p) => p.title.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleSync = async () => {
        setIsSyncing(true);

        const syncPromise = async () => {
            const response = await fetch('/api/shopify/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.error) throw new Error(data.error);
                throw new Error('Sync failed');
            }

            queryClient.invalidateQueries({ queryKey: ['dashboard-full'] });
            return data; // Returns { success: true, count: X, message: '...' }
        };

        toast.promise(syncPromise(), {
            loading: t('dashboard.toasts.sync_loading'),
            success: (data: any) => {
                setIsSyncing(false);
                return t('dashboard.toasts.sync_success', { count: data.count || 0 });
            },
            error: (err: any) => {
                setIsSyncing(false);
                return err.message || t('dashboard.toasts.sync_error');
            }
        });
    };

    const handleOptimize = async (productId: string) => {
        toast.promise(
            async () => {
                const { error } = await supabase
                    .from('products_queue')
                    .update({ status: 'PENDING' })
                    .eq('id', productId);

                if (error) throw error;
                queryClient.invalidateQueries({ queryKey: ['dashboard-full'] });
            },
            {
                loading: t('dashboard.toasts.optimize_loading'),
                success: t('dashboard.toasts.optimize_success'),
                error: t('dashboard.toasts.optimize_error')
            }
        );
    };

    return (
        <div className="min-h-screen bg-background text-foreground p-8 font-sans selection:bg-primary/30">

            <div className="flex flex-col gap-4 md:flex-row justify-between items-start md:items-center mb-12">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">{t('dashboard.title')}</h1>
                    <p className="text-muted-foreground mt-2 text-base font-medium flex items-center gap-2">
                        {dashboardData?.autoPilotData?.enabled ? (
                            <>
                                <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.8)]"></span>
                                {t('dashboard.status.autopilot')}
                            </>
                        ) : (
                            <>
                                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                {t('dashboard.status.active')}
                            </>
                        )}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {dashboardData?.autoPilotData && (
                        <AutoPilotToggle data={dashboardData.autoPilotData} />
                    )}
                    <Button variant="outline" className="border-border hover:bg-accent text-sm font-semibold h-11" onClick={handleSync} disabled={isSyncing}>
                        {isSyncing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('dashboard.actions.syncing')}</> : <><RefreshCw className="mr-2 h-4 w-4" /> {t('dashboard.actions.refresh')}</>}
                    </Button>
                </div>
            </div>

            {dashboardData?.userStatus && (
                <OnboardingDeck status={dashboardData.userStatus} onDismiss={dismissOnboarding} />
            )}

            <KPIGrid revenue={revenueAtRisk} health={healthPercentage} queue={unoptimizedCount} loading={isLoading} />

            <Card className="bg-card/50 backdrop-blur-md border-border overflow-hidden shadow-2xl">
                <CardHeader className="border-b border-border/50 bg-muted/20 px-6 py-6 transition-colors">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="space-y-1">
                            <h2 className="text-xl font-bold text-foreground">{t('dashboard.actions.immediate_actions')}</h2>
                            <p className="text-sm text-muted-foreground">{t('dashboard.actions.assets_impact')}</p>
                        </div>
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={t('dashboard.actions.search_placeholder')}
                                className="pl-10 bg-background/50 border-border/50 focus:ring-primary/30 text-sm h-10 rounded-xl"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>

                <Table>
                    <TableHeader className="bg-muted/10">
                        <TableRow className="border-border/50 hover:bg-transparent">
                            <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground h-12">Asset</TableHead>
                            <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground h-12 text-center">Status</TableHead>
                            <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground h-12 hidden md:table-cell">Quality Score</TableHead>
                            <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground h-12 text-right hidden md:table-cell">Est. Loss</TableHead>
                            <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground h-12 text-right">Inspect</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <TableRow key={i} className="border-border">
                                    <TableCell className="py-4"><div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-md" /><div className="space-y-2"><Skeleton className="h-4 w-[150px]" /><Skeleton className="h-3 w-[80px]" /></div></div></TableCell>
                                    <TableCell><Skeleton className="h-5 w-[80px] rounded-full" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-4 w-[50px] ml-auto" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-md ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : filteredProducts.length === 0 ? (
                            <TableRow className="hover:bg-transparent border-none">
                                <TableCell colSpan={5} className="p-0 border-none">
                                    <div className="flex flex-col items-center justify-center min-h-[450px] w-full py-16 px-6">
                                        <div className="flex flex-col items-center text-center max-w-md w-full animate-in fade-in zoom-in-95 duration-500">
                                            <div className="relative mb-8">
                                                <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full scale-150 opacity-30 animate-pulse"></div>
                                                <Button
                                                    variant="outline"
                                                    size="lg"
                                                    onClick={handleSync}
                                                    disabled={isSyncing}
                                                    className="rounded-xl px-8 border-border hover:bg-accent hover:text-foreground transition-all duration-300 shadow-sm"
                                                >
                                                    {isSyncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                                                    Scan for Opportunities
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredProducts.map((product: any) => (
                            <TableRow key={product.id} className="border-border/50 hover:bg-muted/30 transition-all duration-300 group">
                                <TableCell className="py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-md overflow-hidden border border-border bg-muted shrink-0">
                                            {product.image ? <img src={product.image} alt={product.title} className="h-full w-full object-cover" /> : <div className="h-full w-full bg-muted" />}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-medium text-foreground truncate max-w-[200px]">{product.title}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[120px]">REF: {product.shopifyId}</span>
                                                <span className={`text-[10px] font-bold md:hidden ${product.healthScore >= 80 ? 'text-emerald-500' : 'text-red-500'}`}>{product.healthScore}% Score</span>
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell><StatusBadge status={product.status} /></TableCell>
                                <TableCell className="hidden md:table-cell">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm font-semibold ${product.healthScore >= 80 ? 'text-emerald-500' : 'text-amber-500'}`}>{product.healthScore}%</span>
                                        <Progress
                                            value={product.healthScore}
                                            className="w-16 h-1 bg-muted"
                                            indicatorClassName={product.healthScore >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}
                                        />
                                    </div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell font-mono text-zinc-300">{product.revenueImpact > 0 ? `-$${product.revenueImpact}` : '—'}</TableCell>
                                <TableCell className="text-right">
                                    <Sheet>
                                        <SheetTrigger asChild><Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-accent"><ArrowUpRight className="h-4 w-4" /></Button></SheetTrigger>
                                        <SheetContent className="bg-card border-border text-foreground sm:max-w-2xl overflow-y-auto">
                                            <SheetHeader className="space-y-4">
                                                <div className="flex justify-between items-start"><StatusBadge status={product.status} /><Badge variant="outline" className="text-muted-foreground border-border">REF: {product.shopifyId}</Badge></div>
                                                <SheetTitle className="text-xl font-bold text-foreground">{product.title}</SheetTitle>
                                                <div className="h-48 w-full bg-background rounded-xl overflow-hidden border border-border flex items-center justify-center">{product.image && <img src={product.image} className="h-full object-contain" alt="preview" />}</div>
                                            </SheetHeader>
                                            <div className="mt-8 space-y-6">
                                                <Tabs defaultValue="optimization" className="w-full">
                                                    <TabsList className="w-full bg-zinc-900 border-zinc-800"><TabsTrigger value="optimization" className="flex-1">Antes y Después (IA)</TabsTrigger><TabsTrigger value="json" className="flex-1">Metadata</TabsTrigger></TabsList>
                                                    <TabsContent value="optimization" className="mt-4 space-y-6">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            {/* ANTES */}
                                                            <div className="space-y-3">
                                                                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-500"></div>
                                                                    Estado Actual
                                                                </h4>
                                                                <div className="p-4 rounded-xl border border-border bg-muted/20 min-h-[200px]">
                                                                    <div className="prose prose-invert dark:prose-invert text-xs text-muted-foreground font-light leading-relaxed">
                                                                        <div dangerouslySetInnerHTML={{ 
                                                                            __html: product.currentBodyHtml 
                                                                                ? DOMPurify.sanitize(product.currentBodyHtml) 
                                                                                : "<p>Sin descripción.</p>" 
                                                                        }} />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* DESPUÉS */}
                                                            <div className="space-y-3">
                                                                <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-500 flex items-center gap-2">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                                                                    Propuesta IA
                                                                </h4>
                                                                <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/5 min-h-[200px] relative overflow-hidden group">
                                                                    {product.status === 'OPTIMIZED' || product.aiProposal?.new_title ? (
                                                                        <div className="space-y-4">
                                                                            <div className="space-y-1">
                                                                                <p className="text-[10px] text-indigo-400 font-bold">NUEVO TÍTULO</p>
                                                                                <p className="text-sm text-foreground font-semibold leading-tight">{product.aiProposal.new_title}</p>
                                                                            </div>
                                                                            <div className="space-y-1">
                                                                                <p className="text-[10px] text-indigo-400 font-bold">CONTENIDO OPTIMIZADO</p>
                                                                                <div className="prose prose-invert dark:prose-invert text-xs text-zinc-300 font-light leading-relaxed">
                                                                                    <div dangerouslySetInnerHTML={{ 
                                                                                        __html: product.aiProposal.new_body_html 
                                                                                            ? DOMPurify.sanitize(product.aiProposal.new_body_html) 
                                                                                            : "<p>Generando propuesta...</p>" 
                                                                                    }} />
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex flex-col items-center justify-center min-h-[160px] text-center space-y-3">
                                                                            <BrainCircuit className="w-8 h-8 text-indigo-500/50" />
                                                                            <p className="text-xs text-muted-foreground">Pendiente de optimización masiva.</p>
                                                                            <Button 
                                                                                size="sm" 
                                                                                variant="outline" 
                                                                                className="border-indigo-500/50 text-indigo-400 hover:bg-indigo-500 hover:text-white"
                                                                                onClick={() => handleOptimize(product.id)}
                                                                            >
                                                                                Optimizar Ahora
                                                                            </Button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TabsContent>
                                                    <TabsContent value="json"><pre className="text-[10px] text-muted-foreground p-4 bg-background rounded-lg overflow-x-auto border border-border">{JSON.stringify(product.aiProposal, null, 2)}</pre></TabsContent>
                                                </Tabs>
                                            </div>
                                            <SheetFooter className="mt-10">
                                                {product.status === 'OPTIMIZED' ? (
                                                    <Button className="w-full bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => { navigator.clipboard.writeText(product.aiProposal.new_body_html); toast.success("Copiado al portapapeles") }}>
                                                        <Check className="mr-2 h-4 w-4" /> Aplicar Cambios en Shopify
                                                    </Button>
                                                ) : product.status === 'PENDING_AUDIT' ? (
                                                    <Button disabled className="w-full bg-muted text-muted-foreground flex items-center gap-2">
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        Procesando...
                                                    </Button>
                                                ) : null}
                                            </SheetFooter>
                                        </SheetContent>
                                    </Sheet>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            {!isLoading && !dashboardData?.userStatus?.hasShopify && <ConnectStoreBanner />}
        </div>
    );
}

