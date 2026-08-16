"use client"

import React, { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Search,
    Filter,
    MoreHorizontal,
    ArrowUpDown,
    CheckCircle2,
    AlertCircle,
    Clock,
    Eye,
    RefreshCw,
    Download,
    Loader2
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useI18n } from "@/lib/i18n-context"

import { Product, InventoryResponse, ShopifyProductRow } from "@/types/inventory"
import { StatusBadge } from "@/components/ui/status-badge"
import { useFoundryStore } from "@/store/useFoundryStore"
import ProductSheet from "@/components/dashboard/ProductSheet"

const PAGE_SIZE = 10;

// --- COMPONENTS ---

// StatusBadge has been centralized to @/components/ui/status-badge
export default function InventoryPage() {
    const { t } = useI18n()
    const { openProduct } = useFoundryStore()
    const queryClient = useQueryClient()
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [page, setPage] = useState(1)
    const [isSyncing, setIsSyncing] = useState(false)

    // Sync job status polling
    const { data: syncJob } = useQuery({
        queryKey: ['sync-job-inventory'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return null
            const { data } = await supabase
                .from('sync_jobs')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single()
            return data
        },
        refetchInterval: (data: any) => data?.status === 'syncing' ? 5000 : false,
    })

    const isSyncInterrupted = syncJob?.status === 'syncing' && syncJob?.started_at
        ? (Date.now() - new Date(syncJob.started_at).getTime()) > 10 * 60 * 1000
        : false

    const handleSync = async () => {
        setIsSyncing(true)
        try {
            const res = await fetch('/api/shopify/sync', { method: 'POST' })
            if (!res.ok) {
                throw new Error("Sync failed. Check your Shopify credentials in Settings.")
            }
            toast.success("Store synced successfully!")
            queryClient.invalidateQueries({ queryKey: ['inventory'] })
            queryClient.invalidateQueries({ queryKey: ['sync-job-inventory'] })
        } catch (error: any) {
            toast.error(error.message || "An unexpected error occurred.")
        } finally {
            setIsSyncing(false)
        }
    }

    // --- DATA FETCHING ---
    const { data, isLoading } = useQuery<InventoryResponse>({
        queryKey: ['inventory', page, statusFilter, searchTerm],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return { products: [], totalCount: 0 }

            let query = supabase
                .from('shopify_products')
                .select('id, shopify_id, current_title, audit_status, audit_score, image_url, created_at', { count: 'exact' })
                .eq('user_id', user.id)

            if (statusFilter !== 'all') {
                query = query.eq('audit_status', statusFilter)
            }

            if (searchTerm) {
                query = query.ilike('current_title', `%${searchTerm}%`)
            }

            const from = (page - 1) * PAGE_SIZE
            const to = from + PAGE_SIZE - 1

            const { data, error, count } = await query
                .order('created_at', { ascending: false })
                .range(from, to)

            if (error) throw error

            const products: Product[] = (data ?? []).map((p) => {
        const row = p as ShopifyProductRow
        return {
          id: row.id,
          shopifyId: row.shopify_id,
          current_title: row.current_title || "Untitled Product",
          image: row.image_url,
          status: row.audit_status ?? "PENDING_AUDIT",
          healthScore: row.audit_score ?? 0,
          createdAt: new Date(row.created_at).toLocaleDateString(),
          platform: "Shopify",
        }
      })

            return {
                products,
                totalCount: count || 0
            }
        }
    })

    const products = data?.products || []
    const totalCount = data?.totalCount || 0
    const totalPages = Math.ceil(totalCount / PAGE_SIZE)

    // Reset page when filters change
    const handleFilterChange = (val: string) => {
        setStatusFilter(val)
        setPage(1)
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
        setPage(1)
    }

    // El filtrado y la paginacion los hace el servidor en queryFn
    // (query.eq + query.ilike + .range). No se vuelve a filtrar en el
    // cliente: hacerlo sobre una pagina de PAGE_SIZE filas rompia el
    // contador "Showing X of Y" y el estado vacio, porque ilike de
    // Postgres y includes de JavaScript no coinciden exactamente con
    // acentos y mayusculas.

    return (
        <div className="min-h-screen bg-transparent text-foreground p-8 font-sans">

            {/* HEADER */}
            <div className="flex flex-col gap-6 md:flex-row justify-between items-start md:items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Inventory</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Manage and optimize your product catalog.</p>
                </div>
                <div className="flex gap-3">
                    {/* Sync Status */}
                    {syncJob?.status === 'syncing' && !isSyncInterrupted && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Syncing {syncJob.products_synced ?? 0}{syncJob.products_total ? ` / ${syncJob.products_total}` : ''}
                        </div>
                    )}
                    {syncJob?.status === 'completed' && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold">
                            <CheckCircle2 className="w-3 h-3" />
                            {syncJob.products_synced ?? 0} synced
                        </div>
                    )}
                    {isSyncInterrupted && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
                            <AlertCircle className="w-3 h-3" />
                            Interrupted
                        </div>
                    )}
                    {syncJob?.status === 'failed' && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                            <AlertCircle className="w-3 h-3" />
                            Failed
                        </div>
                    )}
                    <Button variant="outline" className="gap-2">
                        <Download className="w-4 h-4" /> Export
                    </Button>
                    <Button onClick={handleSync} disabled={isSyncing} className="gap-2">
                        {isSyncing ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Syncing...</>
                        ) : (
                            <><RefreshCw className="w-4 h-4" /> Sync Store</>
                        )}
                    </Button>
                </div>
            </div>

            {/* FILTERS & SEARCH */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t('common.placeholders.search')}
                        className="pl-9 bg-card border-border"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>
                <div className="flex gap-3">
                    <Select value={statusFilter} onValueChange={handleFilterChange}>
                        <SelectTrigger className="w-[180px] bg-card border-border">
                            <SelectValue placeholder={t('common.placeholders.filter')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('All Catalog')}</SelectItem>
                            <SelectItem value="PENDING_AUDIT">{t('Pending Audit')}</SelectItem>
                            <SelectItem value="NEEDS_OPTIMIZATION">{t('Needs Optimization')}</SelectItem>
                            <SelectItem value="PROCESSING">{t('AI Processing')}</SelectItem>
                            <SelectItem value="READY_TO_PUBLISH">{t('Ready to Publish')}</SelectItem>
                            <SelectItem value="OPTIMIZED">{t('Optimized')}</SelectItem>
                            <SelectItem value="ERROR">{t('Error')}</SelectItem>
                            <SelectItem value="OUT_OF_CREDITS">{t('Upgrade Plan')}</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon" className="shrink-0">
                        <Filter className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* TABLE */}
            <div className="rounded-md border border-border bg-card overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-[80px]">Image</TableHead>
                            <TableHead className="w-[300px]">Product</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="hidden md:table-cell">Quality Score</TableHead>
                            <TableHead className="hidden md:table-cell">Date Added</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-12 w-12 rounded-md" /></TableCell>
                                    <TableCell>
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-[200px]" />
                                            <Skeleton className="h-3 w-[100px]" />
                                        </div>
                                    </TableCell>
                                    <TableCell><Skeleton className="h-5 w-[80px] rounded-full" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-md ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : products.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-64 text-center">
                                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                                        <div className="p-4 rounded-full bg-muted/50 mb-3">
                                            <Search className="w-8 h-8 opacity-50" />
                                        </div>
                                        <p className="text-lg font-medium">No products found</p>
                                        <p className="text-sm mb-4">Try adjusting your filters or search query.</p>
                                        <Button variant="outline" onClick={() => { setSearchTerm(''); setStatusFilter('all'); setPage(1); }}>
                                            Clear Filters
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            products.map((product: Product) => (
                                <TableRow key={product.id} className="hover:bg-muted/50 transition-colors">
                                    <TableCell>
                                        <div className="h-12 w-12 rounded-md overflow-hidden bg-muted border border-border">
                                            {product.image ? (
                                                <img
                                                    src={product.image}
                                                    alt={product.current_title}
                                                    className="h-full w-full object-contain"
                                                    referrerPolicy="no-referrer"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center bg-secondary text-secondary-foreground">
                                                    <span className="text-xs">No Img</span>
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium text-foreground truncate max-w-[280px]" title={product.current_title}>
                                            {product.current_title}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                                                REF: {product.shopifyId}
                                            </div>
                                            <div className={`text-[10px] font-bold md:hidden ${product.healthScore >= 90 ? 'text-emerald-500' :
                                                product.healthScore >= 50 ? 'text-yellow-500' : 'text-red-500'
                                                }`}>
                                                {product.healthScore}% Score
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={product.status} />
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        <div className="flex items-center gap-2">
                                            <span className={`font-bold ${product.healthScore >= 90 ? 'text-emerald-500' :
                                                product.healthScore >= 50 ? 'text-yellow-500' : 'text-red-500'
                                                }`}>
                                                {product.healthScore}%
                                            </span>
                                            <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${product.healthScore >= 90 ? 'bg-emerald-500' :
                                                        product.healthScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                                        }`}
                                                    style={{ width: `${product.healthScore}%` }}
                                                />
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                                        {product.createdAt}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                             <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => openProduct(product.id)}>
                                                    <Eye className="mr-2 h-4 w-4" /> View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={async () => {
                                                    toast.promise(async () => {
                                                        const { error } = await supabase
                                                            .from('shopify_products')
                                                            .update({ audit_status: 'PENDING_AUDIT' })
                                                            .eq('id', product.id);

                                                        if (error) throw error;
                                                        // Note: Tanstack Query will refetch based on queryKey
                                                    }, {
                                                        loading: 'Re-optimizing asset...',
                                                        success: 'Optimization queued successfully!',
                                                        error: 'Failed to queue optimization'
                                                    });
                                                }}>
                                                    <RefreshCw className="mr-2 h-4 w-4" /> Re-optimize
                                                </DropdownMenuItem>
                                                {/*
                                                  "Delete Asset" se retiro a proposito.
                                                  Antes era un toast que decia "Asset deleted" sin
                                                  borrar nada: el usuario creia que habia eliminado
                                                  un producto y seguia ahi.

                                                  No se reemplazo por un DELETE real porque
                                                  optimizations y product_metrics tienen CASCADE
                                                  (se perderia el historial de publicaciones y las
                                                  metricas), credit_compensations tiene NO ACTION
                                                  (el DELETE fallaria en algunos productos), y el
                                                  proximo sync de Shopify lo reinsertaria igual.

                                                  La solucion correcta es ocultar el producto del
                                                  catalogo sin borrarlo, y eso requiere una columna
                                                  nueva mas ajustar el filtro de inventory, el RPC
                                                  get_priority_products, refresh_user_kpis, los
                                                  triggers de auditoria y el autopilot.

                                                  Si se implementa, debe llevar confirmacion
                                                  explicita con AlertDialog: un DropdownMenuItem
                                                  que dispara una accion destructiva sin dialogo es
                                                  un accidente esperando.
                                                */}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* PAGINATION */}
            <div className="flex items-center justify-between py-4">
                <div className="text-sm text-muted-foreground font-medium">
                    Showing <span className="text-foreground">{products.length}</span> of <span className="text-foreground">{totalCount}</span> assets
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground mr-2">Page {page} of {totalPages || 1}</span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1 || isLoading}
                        className="bg-card border-border hover:bg-accent"
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => p + 1)}
                        disabled={page >= totalPages || isLoading}
                        className="bg-card border-border hover:bg-accent"
                    >
                        Next
                    </Button>
                </div>
            </div>
            <ProductSheet />
        </div>
    )
}
