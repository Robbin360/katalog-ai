"use client"

import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { useFoundryStore } from "@/store/useFoundryStore"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Sparkles, AlertCircle, CheckCircle2, Clock, PackageOpen, TrendingDown, ArrowRight } from "lucide-react"

export default function ProductTable() {
    const { openProduct } = useFoundryStore()

    // Fetch de Datos Reales desde shopify_products
    const { data: products, isLoading } = useQuery({
        queryKey: ['shopify_products'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return []

            const { data } = await supabase
                .from('shopify_products')
                .select('id, shopify_id, current_title, audit_status, audit_score, image_url, created_at, updated_at, inventory_quantity, sales_last_7_days')
                .eq('user_id', user.id)
                .order('updated_at', { ascending: false })
            return data
        }
    })

    if (isLoading) return <div className="p-10 text-zinc-500 text-sm">Synchronizing with Shopify...</div>

    return (
        <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/30">
            <Table>
                <TableHeader className="bg-zinc-900">
                    <TableRow className="border-zinc-800 hover:bg-zinc-900">
                        <TableHead className="w-[300px] text-zinc-400">Asset</TableHead>
                        <TableHead className="text-zinc-400">Status</TableHead>
                        <TableHead className="text-zinc-400">Health Score</TableHead>
                        <TableHead className="text-zinc-400">Stock</TableHead>
                        <TableHead className="text-zinc-400">Ventas (7d)</TableHead>
                        <TableHead className="text-right text-zinc-400">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {products?.map((item: any) => {
                        const title = item.current_title || "Producto Sin Nombre"
                        
                        // Score Logic
                        const score = item.audit_score || item.seo_score_initial || 0
                        const scoreColor = score >= 80 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-red-500"
                        const scoreTextColor = score >= 80 ? "text-emerald-400" : score >= 50 ? "text-amber-400" : "text-red-400"

                        // Financial/Inventory Logic
                        const stock = item.inventory_quantity || 0;
                        const sales = item.sales_last_7_days || 0;
                        // UX Tip: High stock but low sales implies urgency
                        const isUrgent = stock > 20 && sales < 5;

                        return (
                            <TableRow key={item.id} className="border-zinc-800 hover:bg-zinc-900/50 transition-colors group">
                                {/* 1. ASSET (IMAGEN + TÍTULO) */}
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-zinc-800 overflow-hidden border border-zinc-700 shrink-0">
                                            {item.image_url ? (
                                                <img src={item.image_url} className="h-full w-full object-contain" alt="img" referrerPolicy="no-referrer" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-xs text-zinc-600">Img</div>
                                            )}
                                        </div>
                                        <div className="flex flex-col max-w-[220px]">
                                            <span className="truncate text-zinc-200">{title}</span>
                                            <span className="text-[10px] text-zinc-500 font-mono">REF: {item.shopify_id || item.id}</span>
                                        </div>
                                    </div>
                                </TableCell>

                                {/* 2. STATUS */}
                                <TableCell>
                                    <StatusBadge status={item.audit_status || 'PENDING_AUDIT'} />
                                </TableCell>

                                {/* 3. HEALTH SCORE */}
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Progress value={score} className="h-2 w-24 bg-zinc-800" indicatorClassName={scoreColor} />
                                        <span className={`text-xs font-mono ${scoreTextColor}`}>
                                            {score}%
                                        </span>
                                    </div>
                                </TableCell>

                                {/* 4. STOCK */}
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <PackageOpen className={`w-4 h-4 ${isUrgent ? 'text-red-500' : 'text-zinc-500'}`} />
                                        <span className={`text-sm font-mono ${isUrgent ? 'text-red-400 font-bold' : 'text-zinc-300'}`}>
                                            {stock}
                                        </span>
                                    </div>
                                </TableCell>

                                {/* 5. VENTAS (7d) */}
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {isUrgent && <TrendingDown className="w-4 h-4 text-red-500 animate-pulse" />}
                                        <span className={`text-sm font-mono ${isUrgent ? 'text-red-400 font-bold' : 'text-zinc-300'}`}>
                                            {sales}
                                        </span>
                                    </div>
                                </TableCell>

                                {/* 6. ACTION */}
                                <TableCell className="text-right">
                                    <Button
                                        size="sm"
                                        variant={item.audit_status === 'OPTIMIZED' ? "default" : "outline"}
                                        className={item.audit_status === 'OPTIMIZED' ? "bg-white text-black hover:bg-zinc-200" : "border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500"}
                                        onClick={() => openProduct(item.id)}
                                    >
                                        {item.audit_status === 'OPTIMIZED' ?
                                            <><Sparkles className="w-3 h-3 mr-2" /> Publish</> :
                                            <><ArrowRight className="w-3 h-3 mr-2" /> Inspect</>
                                        }
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}

// Helper para el Badge
function StatusBadge({ status }: { status: string }) {
    if (status === 'OPTIMIZED') {
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20"><CheckCircle2 className="w-3 h-3 mr-1" /> Optimized</Badge>
    }
    if (status === 'NEEDS_REVIEW') {
        return <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20"><AlertCircle className="w-3 h-3 mr-1" /> Needs Review</Badge>
    }
    if (status === 'PENDING_AUDIT' || status === 'PENDING') {
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20"><Clock className="w-3 h-3 mr-1" /> Pending Audit</Badge>
    }
    return <Badge variant="outline" className="bg-zinc-500/10 text-zinc-400 border-zinc-500/20"><Clock className="w-3 h-3 mr-1" /> {status}</Badge>
}