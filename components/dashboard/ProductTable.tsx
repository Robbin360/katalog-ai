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
import { Sparkles, AlertCircle, CheckCircle2, Clock, ArrowRight } from "lucide-react"

export default function ProductTable() {
    const { openProduct } = useFoundryStore()

    // Fetch de Datos Reales
    const { data: products, isLoading } = useQuery({
        queryKey: ['products-queue'],
        queryFn: async () => {
            const { data } = await supabase
                .from('products_queue')
                .select('*')
                .order('created_at', { ascending: false })
            return data
        }
    })

    if (isLoading) return <div className="p-10 text-zinc-500 text-sm">Cargando datos del radar...</div>

    return (
        <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/30">
            <Table>
                <TableHeader className="bg-zinc-900">
                    <TableRow className="border-zinc-800 hover:bg-zinc-900">
                        <TableHead className="w-[300px] text-zinc-400">Asset</TableHead>
                        <TableHead className="text-zinc-400">Status</TableHead>
                        <TableHead className="text-zinc-400">Health Score</TableHead>
                        <TableHead className="text-right text-zinc-400">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {products?.map((item) => {
                        // LÓGICA DE DATOS ROBUSTA
                        const ai = item.ai_output || {}
                        // Buscamos el título en todos los lugares posibles
                        const title = ai.product_title || ai.producto || item.raw_data?.title || "Producto Sin Nombre"

                        // Simulamos un Score basado en si está optimizado o no
                        const score = item.status === 'DONE' ? 95 : 45
                        const scoreColor = item.status === 'DONE' ? "bg-emerald-500" : "bg-red-500"

                        return (
                            <TableRow key={item.id} className="border-zinc-800 hover:bg-zinc-900/50 transition-colors group">
                                {/* 1. ASSET (IMAGEN + TÍTULO) */}
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-zinc-800 overflow-hidden border border-zinc-700 shrink-0">
                                            {item.original_image_url ? (
                                                <img src={item.original_image_url} className="h-full w-full object-cover" alt="img" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-xs text-zinc-600">Img</div>
                                            )}
                                        </div>
                                        <div className="flex flex-col max-w-[220px]">
                                            <span className="truncate text-zinc-200">{title}</span>
                                            <span className="text-[10px] text-zinc-500 font-mono">ID: {item.id}</span>
                                        </div>
                                    </div>
                                </TableCell>

                                {/* 2. STATUS */}
                                <TableCell>
                                    <StatusBadge status={item.status} />
                                </TableCell>

                                {/* 3. HEALTH SCORE */}
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Progress value={score} className="h-2 w-24 bg-zinc-800" indicatorClassName={scoreColor} />
                                        <span className={`text-xs font-mono ${item.status === 'DONE' ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {score}%
                                        </span>
                                    </div>
                                </TableCell>

                                {/* 4. ACTION */}
                                <TableCell className="text-right">
                                    <Button
                                        size="sm"
                                        variant={item.status === 'DONE' ? "default" : "outline"}
                                        className={item.status === 'DONE' ? "bg-white text-black hover:bg-zinc-200" : "border-zinc-700 text-zinc-400"}
                                        onClick={() => openProduct(item.id)}
                                    >
                                        {item.status === 'DONE' ?
                                            <><Sparkles className="w-3 h-3 mr-2" /> Optimize</> :
                                            <><Clock className="w-3 h-3 mr-2" /> Waiting</>
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
    if (status === 'DONE') {
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20"><CheckCircle2 className="w-3 h-3 mr-1" /> Optimized</Badge>
    }
    if (status === 'QUEUED' || status === 'PROCESSING') {
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20"><Clock className="w-3 h-3 mr-1" /> Processing</Badge>
    }
    return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20"><AlertCircle className="w-3 h-3 mr-1" /> Error</Badge>
}