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
    Settings, CreditCard, LogOut
} from 'lucide-react';
import {
    Card, CardContent, CardHeader, CardTitle
} from "@/components/ui/card";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter,
} from "@/components/ui/sheet";
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

// --- Componentes Auxiliares ---

const KPIGrid = ({ count, loading }: { count: number, loading: boolean }) => (
    <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card className="bg-zinc-950 border-zinc-800 border-l-4 border-l-red-500 hover:bg-zinc-900/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400">Revenue at Risk</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-white">${(count * 150).toLocaleString()}.00</div>
                <p className="text-xs text-zinc-500 mt-1">
                    <span className="text-red-500 font-medium">Estimated loss</span> due to poor SEO
                </p>
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
                <p className="text-xs text-zinc-500 mt-1">Products active in pipeline</p>
            </CardContent>
        </Card>
    </div>
);

const StatusBadge = ({ status }: { status: string }) => {
    if (status === 'DONE') {
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 flex items-center gap-1 px-2 py-0.5"><CheckCircle2 className="h-3 w-3" /> Optimized</Badge>
    }
    if (status === 'ERROR') {
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 flex items-center gap-1 px-2 py-0.5"><AlertCircle className="h-3 w-3" /> At Risk</Badge>
    }
    return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 flex items-center gap-1 px-2 py-0.5"><Clock className="h-3 w-3" /> Pending</Badge>
};

// --- Componente Principal ---

export default function DashboardPage() {
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);
    const queryClient = useQueryClient();

    // 1. FETCH USUARIO (Para el Avatar)
    const { data: user } = useQuery({
        queryKey: ['current-user'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser()
            return user
        }
    })

    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User"
    const initials = displayName.substring(0, 2).toUpperCase()

    // 2. FETCH DATOS REALES
    const { data: rawProducts, isLoading } = useQuery({
        queryKey: ['products-dashboard'],
        queryFn: async () => {
            const { data } = await supabase
                .from('products_queue')
                .select('*')
                .order('created_at', { ascending: false })
            return data
        },
        refetchInterval: 5000
    })

    // Transformación
    const products = rawProducts?.map(p => {
        const ai = p.ai_output || {}
        const title = ai.product_title || ai.producto || p.raw_data?.title || "Untitled Product"
        return {
            id: p.id,
            title: title,
            image: p.original_image_url,
            status: p.status,
            healthScore: p.status === 'DONE' ? 98 : (p.status === 'ERROR' ? 20 : 50),
            revenueImpact: p.status === 'DONE' ? 0 : 450,
            lastUpdated: new Date(p.created_at).toLocaleDateString(),
            fullData: ai
        }
    }) || []

    const filteredProducts = products.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const response = await fetch('/api/shopify/sync', { method: 'POST' })
            const result = await response.json()

            if (!response.ok) throw new Error(result.error)

            toast.success("Sync Complete", {
                description: `${result.count} products imported from Shopify.`
            });
            queryClient.invalidateQueries({ queryKey: ['products-dashboard'] })

        } catch (error: any) {
            toast.error("Sync Failed", {
                description: error.message
            });
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-zinc-100 p-8 font-sans selection:bg-blue-500/30">

            {/* HEADER PRINCIPAL */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Opportunity Radar</h1>
                    <p className="text-zinc-500 mt-1">Real-time optimization engine.</p>
                </div>

                <div className="flex items-center gap-3">

                    {/* BOTÓN DE SINCRONIZACIÓN */}
                    <Button
                        className="bg-white text-black hover:bg-zinc-200 font-semibold"
                        onClick={handleSync}
                        disabled={isSyncing}
                    >
                        {isSyncing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Syncing...</> : <><Zap className="mr-2 h-4 w-4 fill-current" /> Refresh Data</>}
                    </Button>

                    {/* --- AQUÍ ESTÁ EL NUEVO MENÚ DE USUARIO --- */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-zinc-800 hover:bg-zinc-900">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                                    <AvatarFallback className="bg-indigo-600 text-white">{initials}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 bg-zinc-950 border-zinc-800 text-zinc-200" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{displayName}</p>
                                    <p className="text-xs leading-none text-zinc-500 truncate">{user?.email}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-zinc-800" />

                            {/* ENLACES A SETTINGS */}
                            <DropdownMenuItem onClick={() => router.push('/account')} className="cursor-pointer focus:bg-zinc-900 focus:text-white">
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Settings & Integrations</span>
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
                    {/* ------------------------------------------ */}

                </div>
            </div>

            <KPIGrid count={products.length} loading={isLoading} />

            <Card className="bg-zinc-950 border-zinc-800 overflow-hidden">
                <CardHeader className="border-b border-zinc-900 bg-zinc-950/50 px-6 py-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                            <Input
                                placeholder="Search inventory..."
                                className="pl-10 bg-zinc-900 border-zinc-800 focus:ring-zinc-700 text-zinc-200"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <span className="text-xs text-zinc-500">Showing {filteredProducts.length} assets</span>
                            <Button onClick={() => router.push('/account')} variant="outline" size="sm" className="bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white">
                                <Settings className="mr-2 h-3 w-3" /> Configure AI
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                {/* TABLA DE PRODUCTOS (El resto del código igual) */}
                <Table>
                    <TableHeader className="bg-zinc-900/30">
                        <TableRow className="border-zinc-900 hover:bg-transparent">
                            <TableHead className="text-zinc-500 font-medium">Asset</TableHead>
                            <TableHead className="text-zinc-500 font-medium">AI Status</TableHead>
                            <TableHead className="text-zinc-500 font-medium">Quality Score</TableHead>
                            <TableHead className="text-zinc-500 font-medium text-right">Est. Loss</TableHead>
                            <TableHead className="text-zinc-500 font-medium text-right">Inspect</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={5} className="h-24 text-center text-zinc-500">Connecting to Neural Network...</TableCell></TableRow>
                        ) : filteredProducts.length === 0 ? (
                            <TableRow><TableCell colSpan={5} className="h-24 text-center text-zinc-500">No assets found. Upload one!</TableCell></TableRow>
                        ) : filteredProducts.map((product) => (
                            <TableRow key={product.id} className="border-zinc-900 hover:bg-zinc-900/40 transition-colors group">
                                {/* 1. PRODUCTO */}
                                <TableCell className="py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-md overflow-hidden border border-zinc-800 bg-zinc-900 shrink-0">
                                            {product.image ? (
                                                <img src={product.image} alt={product.title} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full bg-zinc-800" />
                                            )}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-medium text-zinc-200 truncate max-w-[200px]">{product.title}</span>
                                            <span className="text-xs text-zinc-500 font-mono">ID: {product.id}</span>
                                        </div>
                                    </div>
                                </TableCell>

                                {/* 2. ESTADO */}
                                <TableCell>
                                    <StatusBadge status={product.status} />
                                </TableCell>

                                {/* 3. SCORE */}
                                <TableCell>
                                    <Progress
                                        value={product.healthScore}
                                        className="w-16 h-1 bg-zinc-800"
                                        indicatorClassName={product.healthScore > 80 ? 'bg-emerald-500' : 'bg-red-500'}
                                    />
                                </TableCell>

                                {/* 4. IMPACTO */}
                                <TableCell className="text-right font-mono text-zinc-300">
                                    {product.revenueImpact > 0 ? `-$${product.revenueImpact}` : '—'}
                                </TableCell>

                                {/* 5. ACCIÓN (PANEL LATERAL REAL) */}
                                <TableCell className="text-right">
                                    <Sheet>
                                        <SheetTrigger asChild>
                                            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                                                <ArrowUpRight className="h-4 w-4" />
                                            </Button>
                                        </SheetTrigger>
                                        <SheetContent className="bg-zinc-950 border-zinc-800 text-zinc-100 sm:max-w-xl overflow-y-auto">
                                            <SheetHeader className="space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <StatusBadge status={product.status} />
                                                    <Badge variant="outline" className="text-zinc-500 border-zinc-800">ID: {product.id}</Badge>
                                                </div>
                                                <SheetTitle className="text-xl font-bold text-white">{product.title}</SheetTitle>
                                                <div className="h-48 w-full bg-black/50 rounded-xl overflow-hidden border border-zinc-800 flex items-center justify-center">
                                                    {product.image && <img src={product.image} className="h-full object-contain" alt="preview" />}
                                                </div>
                                            </SheetHeader>

                                            <div className="mt-8 space-y-6">
                                                <Tabs defaultValue="optimization" className="w-full">
                                                    <TabsList className="w-full bg-zinc-900 border-zinc-800">
                                                        <TabsTrigger value="optimization" className="flex-1">AI Optimization</TabsTrigger>
                                                        <TabsTrigger value="json" className="flex-1">Raw Data</TabsTrigger>
                                                    </TabsList>

                                                    <TabsContent value="optimization" className="mt-4 space-y-4">
                                                        {product.status === 'DONE' ? (
                                                            <div className="space-y-4">
                                                                <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                                                                    <p className="text-xs text-emerald-400 font-bold mb-2">SEO TITLE GENERATED</p>
                                                                    <p className="text-sm text-zinc-200 font-medium">{product.fullData.product_title}</p>
                                                                </div>
                                                                <div className="prose prose-invert text-sm text-zinc-400">
                                                                    <div dangerouslySetInnerHTML={{ __html: product.fullData.description_html || "<p>No description generated.</p>" }} />
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="p-6 text-center text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
                                                                Waiting for Neural Processing...
                                                            </div>
                                                        )}
                                                    </TabsContent>

                                                    <TabsContent value="json">
                                                        <pre className="text-[10px] text-zinc-500 p-4 bg-black rounded-lg overflow-x-auto">
                                                            {JSON.stringify(product.fullData, null, 2)}
                                                        </pre>
                                                    </TabsContent>
                                                </Tabs>
                                            </div>

                                            <SheetFooter className="mt-10">
                                                {product.status === 'DONE' && (
                                                    <Button className="w-full bg-white text-black hover:bg-zinc-200" onClick={() => {
                                                        navigator.clipboard.writeText(product.fullData.description_html)
                                                        toast.success("HTML Copied to Clipboard")
                                                    }}>
                                                        <Copy className="mr-2 h-4 w-4" /> Copy Optimized HTML
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