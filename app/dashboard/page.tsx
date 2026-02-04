"use client"

import React, { useState } from 'react';
import { toast } from "sonner"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
    TrendingDown, Activity, Zap, Search, Filter, ArrowUpRight,
    AlertCircle, CheckCircle2, Clock, Loader2, Copy,
    Store, Rocket, BrainCircuit, X, Check,
    Settings, CreditCard, LogOut
} from 'lucide-react';
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

// --- COMPONENTE: ONBOARDING DECK (El Panel Inteligente) ---
function OnboardingDeck({ status, onDismiss }: { status: any, onDismiss: () => void }) {
    const steps = [
        {
            id: 'store',
            label: 'Connect Store',
            done: status.hasShopify,
            icon: Store,
            action: '/account',
            desc: 'Sync inventory automatically'
        },
        {
            id: 'ai',
            label: 'Generate Asset',
            done: status.hasProducts,
            icon: BrainCircuit,
            action: null,
            desc: 'Create your first optimization'
        },
        {
            id: 'plan',
            label: 'Upgrade Plan',
            done: status.isPro,
            icon: Rocket,
            action: '/account',
            desc: 'Unlock full power'
        }
    ]

    const completed = steps.filter(s => s.done).length
    const progress = (completed / 3) * 100

    if (status.dismissed) return null

    return (
        <div className="mb-8 bg-linear-to-r from-zinc-900 to-zinc-900/50 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden animate-in fade-in slide-in-from-top-4">
            <button
                onClick={onDismiss}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                title="Dismiss onboarding"
                aria-label="Dismiss onboarding"
            >
                <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                <div className="md:w-1/3 space-y-2">
                    <h2 className="text-xl font-bold text-white">Setup Progress</h2>
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <span className="font-mono text-indigo-400">{completed}/3</span> Steps Completed
                    </div>
                    <Progress value={progress} className="h-2 bg-zinc-800" indicatorClassName="bg-indigo-500" />
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                    {steps.map((step) => (
                        <div
                            key={step.id}
                            className={`relative p-4 rounded-xl border transition-all ${step.done
                                ? "bg-emerald-900/10 border-emerald-900/50 opacity-80"
                                : "bg-zinc-950 border-zinc-800 hover:border-zinc-700"
                                }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className={`p-2 rounded-lg ${step.done ? "bg-emerald-500/20 text-emerald-500" : "bg-zinc-800 text-zinc-400"}`}>
                                    <step.icon className="w-4 h-4" />
                                </div>
                                {step.done && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                            </div>

                            <h3 className={`font-bold text-sm ${step.done ? "text-emerald-400 line-through" : "text-zinc-200"}`}>
                                {step.label}
                            </h3>
                            <p className="text-xs text-zinc-500 mt-1">{step.desc}</p>

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

// --- Componentes Auxiliares (KPIs) ---
const KPIGrid = ({ count, loading }: { count: number, loading: boolean }) => (
    <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card className="bg-zinc-950 border-zinc-800 border-l-4 border-l-red-500 hover:bg-zinc-900/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400">Revenue at Risk</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-white">${(count * 50).toLocaleString()}.00</div>
                <p className="text-xs text-zinc-500 mt-1"><span className="text-red-500 font-medium">Est. monthly loss</span> (Unoptimized assets)</p>
            </CardContent>
        </Card>
        <Card className="bg-zinc-950 border-zinc-800 hover:bg-zinc-900/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400">Catalog Health</CardTitle>
                <Activity className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-white">64%</div>
                <Progress value={64} className="h-1 mt-3 bg-zinc-800" />
            </CardContent>
        </Card>
        <Card className="bg-zinc-950 border-zinc-800 hover:bg-zinc-900/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400">Optimization Queue</CardTitle>
                <Zap className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-white">{loading ? "..." : count}</div>
                <p className="text-xs text-zinc-500 mt-1">Assets ready for AI</p>
            </CardContent>
        </Card>
    </div>
);

const StatusBadge = ({ status }: { status: string }) => {
    if (status === 'DONE') return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-2 py-0.5"><CheckCircle2 className="h-3 w-3 mr-1" /> Optimized</Badge>
    if (status === 'ERROR') return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 px-2 py-0.5"><AlertCircle className="h-3 w-3 mr-1" /> At Risk</Badge>
    return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 px-2 py-0.5"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>
};

// --- PÁGINA PRINCIPAL ---

export default function DashboardPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);
    const queryClient = useQueryClient();

    const { data: dashboardData, isLoading } = useQuery({
        queryKey: ['dashboard-full'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return null

            const { data: products } = await supabase.from('products_queue').select('*').order('created_at', { ascending: false })
            const { data: profile } = await supabase.from('profiles').select('plan_tier, onboarding_dismissed').eq('id', user.id).single()
            const { count: shopifyCount } = await supabase.from('integrations').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('provider', 'shopify')

            return {
                products: products || [],
                userStatus: {
                    dismissed: profile?.onboarding_dismissed || false,
                    isPro: profile?.plan_tier !== 'starter',
                    hasShopify: (shopifyCount || 0) > 0,
                    hasProducts: (products?.length || 0) > 0
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

    const products = dashboardData?.products?.map((p: any) => {
        const ai = p.ai_output || {}
        const title = ai.product_title || ai.producto || p.raw_data?.title || "Untitled Product"
        return {
            id: p.id,
            title: title,
            image: p.original_image_url,
            status: p.status,
            healthScore: p.status === 'DONE' ? 98 : (p.status === 'ERROR' ? 20 : 50),
            revenueImpact: p.status === 'DONE' ? 0 : 50,
            fullData: ai
        }
    }) || []

    const filteredProducts = products.filter((p: any) => p.title.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const response = await fetch('/api/shopify/sync', { method: 'POST' })
            const result = await response.json()
            if (!response.ok) throw new Error(result.error)
            toast.success("Sync Complete", { description: `${result.count} products imported.` });
            queryClient.invalidateQueries({ queryKey: ['dashboard-full'] })
        } catch (error: any) {
            toast.error("Sync Failed", { description: error.message });
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-zinc-100 p-8 font-sans selection:bg-blue-500/30">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Opportunity Radar</h1>
                    <p className="text-zinc-500 mt-1">Real-time optimization engine.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button className="bg-white text-black hover:bg-zinc-200 font-semibold min-w-[140px]" onClick={handleSync} disabled={isSyncing}>
                        {isSyncing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Syncing...</> : <><Zap className="mr-2 h-4 w-4 fill-current" /> Refresh Data</>}
                    </Button>
                    <UserMenu />
                </div>
            </div>

            {dashboardData?.userStatus && (
                <OnboardingDeck status={dashboardData.userStatus} onDismiss={dismissOnboarding} />
            )}

            <KPIGrid count={products.length} loading={isLoading} />

            <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
                <CardHeader className="border-b border-zinc-900 bg-zinc-950/50 px-6 py-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                            <Input placeholder="Search inventory..." className="pl-10 bg-zinc-900 border-zinc-800 focus:ring-zinc-700 text-zinc-200" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    </div>
                </CardHeader>

                <Table>
                    <TableHeader className="bg-zinc-900/30">
                        <TableRow className="border-zinc-900 hover:bg-transparent">
                            <TableHead className="text-zinc-500 font-medium">Asset</TableHead>
                            <TableHead className="text-zinc-500 font-medium">Status</TableHead>
                            <TableHead className="text-zinc-500 font-medium">Quality Score</TableHead>
                            <TableHead className="text-zinc-500 font-medium text-right">Est. Loss</TableHead>
                            <TableHead className="text-zinc-500 font-medium text-right">Inspect</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={5} className="h-24 text-center text-zinc-500">Connecting...</TableCell></TableRow>
                        ) : filteredProducts.length === 0 ? (
                            <TableRow><TableCell colSpan={5} className="h-32 text-center text-zinc-500">
                                <div className="flex flex-col items-center justify-center w-full">
                                    <span className="mb-2">No assets found.</span>
                                    <span className="text-xs opacity-50">Upload or Sync to start.</span>
                                </div>
                            </TableCell></TableRow>
                        ) : filteredProducts.map((product: any) => (
                            <TableRow key={product.id} className="border-zinc-900 hover:bg-zinc-900/40 transition-colors group">
                                <TableCell className="py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-md overflow-hidden border border-zinc-800 bg-zinc-900 shrink-0">
                                            {product.image ? <img src={product.image} alt={product.title} className="h-full w-full object-cover" /> : <div className="h-full w-full bg-zinc-800" />}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-medium text-zinc-200 truncate max-w-[200px]">{product.title}</span>
                                            <span className="text-xs text-zinc-500 font-mono">ID: {product.id}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell><StatusBadge status={product.status} /></TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm font-semibold ${product.healthScore > 80 ? 'text-emerald-500' : 'text-red-500'}`}>{product.healthScore}%</span>
                                        <Progress
                                            value={product.healthScore}
                                            className="w-16 h-1 bg-zinc-800"
                                            indicatorClassName={product.healthScore > 80 ? 'bg-emerald-500' : 'bg-red-500'}
                                        />
                                    </div>
                                </TableCell>
                                <TableCell className="text-right font-mono text-zinc-300">{product.revenueImpact > 0 ? `-$${product.revenueImpact}` : '—'}</TableCell>
                                <TableCell className="text-right">
                                    <Sheet>
                                        <SheetTrigger asChild><Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-zinc-800"><ArrowUpRight className="h-4 w-4" /></Button></SheetTrigger>
                                        <SheetContent className="bg-zinc-950 border-zinc-800 text-zinc-100 sm:max-w-xl overflow-y-auto">
                                            <SheetHeader className="space-y-4">
                                                <div className="flex justify-between items-start"><StatusBadge status={product.status} /><Badge variant="outline" className="text-zinc-500 border-zinc-800">ID: {product.id}</Badge></div>
                                                <SheetTitle className="text-xl font-bold text-white">{product.title}</SheetTitle>
                                                <div className="h-48 w-full bg-black/50 rounded-xl overflow-hidden border border-zinc-800 flex items-center justify-center">{product.image && <img src={product.image} className="h-full object-contain" alt="preview" />}</div>
                                            </SheetHeader>
                                            <div className="mt-8 space-y-6">
                                                <Tabs defaultValue="optimization" className="w-full">
                                                    <TabsList className="w-full bg-zinc-900 border-zinc-800"><TabsTrigger value="optimization" className="flex-1">AI Optimization</TabsTrigger><TabsTrigger value="json" className="flex-1">Raw Data</TabsTrigger></TabsList>
                                                    <TabsContent value="optimization" className="mt-4 space-y-4">
                                                        {product.status === 'DONE' ? (
                                                            <div className="space-y-4">
                                                                <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20"><p className="text-xs text-emerald-400 font-bold mb-2">SEO TITLE</p><p className="text-sm text-zinc-200 font-medium">{product.fullData.product_title}</p></div>
                                                                <div className="prose prose-invert text-sm text-zinc-400"><div dangerouslySetInnerHTML={{ __html: product.fullData.description_html || "<p>No data.</p>" }} /></div>
                                                            </div>
                                                        ) : (<div className="p-6 text-center text-zinc-500 border border-dashed border-zinc-800 rounded-lg">Waiting for Neural Processing...</div>)}
                                                    </TabsContent>
                                                    <TabsContent value="json"><pre className="text-[10px] text-zinc-500 p-4 bg-black rounded-lg overflow-x-auto">{JSON.stringify(product.fullData, null, 2)}</pre></TabsContent>
                                                </Tabs>
                                            </div>
                                            <SheetFooter className="mt-10">
                                                {product.status === 'DONE' && (
                                                    <Button className="w-full bg-white text-black hover:bg-zinc-200" onClick={() => { navigator.clipboard.writeText(product.fullData.description_html); toast.success("HTML Copied") }}>
                                                        <Copy className="mr-2 h-4 w-4" /> Copy HTML
                                                    </Button>
                                                )}
                                            </SheetFooter>
                                        </SheetContent>
                                    </Sheet>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}

function UserMenu() {
    const router = useRouter();
    const { data: user } = useQuery({ queryKey: ['current-user'], queryFn: async () => { const { data } = await supabase.auth.getUser(); return data.user } });
    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User"
    const initials = displayName.substring(0, 2).toUpperCase() || "U";

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-zinc-800 hover:bg-zinc-900">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={user?.user_metadata?.avatar_url} />
                        <AvatarFallback className="bg-indigo-600 text-white">{initials}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-zinc-950 border-zinc-800 text-zinc-200" align="end">
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{displayName}</p>
                        <p className="text-xs leading-none text-zinc-500 truncate">{user?.email}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem onClick={() => router.push('/account')} className="cursor-pointer focus:bg-zinc-900 focus:text-white">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/account')} className="cursor-pointer focus:bg-zinc-900 focus:text-white">
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Billing</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem
                    onClick={async () => {
                        await supabase.auth.signOut();
                        router.push('/login');
                    }}
                    className="text-red-400 focus:text-red-400 focus:bg-red-950/20 cursor-pointer"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}