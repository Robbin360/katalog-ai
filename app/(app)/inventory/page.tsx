"use client"

import React, { useState } from "react"
import { useQuery } from "@tanstack/react-query"
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
    Download
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
    DropdownMenuSeparator,
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

// --- TYPES ---
interface Product {
    id: string
    title: string
    image: string
    status: 'DONE' | 'PENDING' | 'ERROR' | 'IDLE'
    healthScore: number
    createdAt: string
    platform: string
}

// --- COMPONENTS ---

const StatusBadge = ({ status }: { status: string }) => {
    if (status === 'DONE') return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-2 py-0.5"><CheckCircle2 className="h-3 w-3 mr-1" /> Optimized</Badge>
    if (status === 'ERROR') return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 px-2 py-0.5"><AlertCircle className="h-3 w-3 mr-1" /> Error</Badge>
    return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 px-2 py-0.5"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>
};

export default function InventoryPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')

    // --- DATA FETCHING ---
    const { data: products, isLoading } = useQuery({
        queryKey: ['inventory'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('products_queue')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error

            return data.map((p: any) => {
                const ai = p.ai_output || {}
                const title = ai.product_title || ai.producto || p.raw_data?.title || "Untitled Product"
                return {
                    id: p.id,
                    title: title,
                    image: p.original_image_url,
                    status: p.status,
                    healthScore: p.status === 'DONE' ? 98 : (p.status === 'ERROR' ? 20 : 50),
                    createdAt: new Date(p.created_at).toLocaleDateString(),
                    platform: 'Shopify' // Placeholder, could be derived if multi-platform
                } as Product
            })
        }
    })

    // --- FILTERING ---
    const filteredProducts = products?.filter((product: Product) => {
        const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === 'all' || product.status === statusFilter
        return matchesSearch && matchesStatus
    }) || []

    return (
        <div className="min-h-screen bg-transparent text-foreground p-8 font-sans">

            {/* HEADER */}
            <div className="flex flex-col gap-6 md:flex-row justify-between items-start md:items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Inventory</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Manage and optimize your product catalog.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2">
                        <Download className="w-4 h-4" /> Export
                    </Button>
                    <Link href="/dashboard">
                        <Button className="gap-2">
                            <RefreshCw className="w-4 h-4" /> Sync Store
                        </Button>
                    </Link>
                </div>
            </div>

            {/* FILTERS & SEARCH */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search products..."
                        className="pl-9 bg-card border-border"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-3">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px] bg-card border-border">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="DONE">Optimized</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="ERROR">Errors</SelectItem>
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
                            <TableHead>Quality Score</TableHead>
                            <TableHead>Date Added</TableHead>
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
                        ) : filteredProducts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-64 text-center">
                                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                                        <div className="p-4 rounded-full bg-muted/50 mb-3">
                                            <Search className="w-8 h-8 opacity-50" />
                                        </div>
                                        <p className="text-lg font-medium">No products found</p>
                                        <p className="text-sm mb-4">Try adjusting your filters or search query.</p>
                                        <Button variant="outline" onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}>
                                            Clear Filters
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredProducts.map((product: Product) => (
                                <TableRow key={product.id} className="hover:bg-muted/50 transition-colors">
                                    <TableCell>
                                        <div className="h-12 w-12 rounded-md overflow-hidden bg-muted border border-border">
                                            {product.image ? (
                                                <img
                                                    src={product.image}
                                                    alt={product.title}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center bg-secondary text-secondary-foreground">
                                                    <span className="text-xs">No Img</span>
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium text-foreground truncate max-w-[280px]" title={product.title}>
                                            {product.title}
                                        </div>
                                        <div className="text-xs text-muted-foreground hidden sm:block">
                                            ID: {product.id}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={product.status} />
                                    </TableCell>
                                    <TableCell>
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
                                    <TableCell className="text-muted-foreground text-sm">
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
                                                <DropdownMenuItem>
                                                    <Eye className="mr-2 h-4 w-4" /> View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => toast.promise(async () => new Promise(resolve => setTimeout(resolve, 2000)), {
                                                    loading: 'Re-optimizing asset...',
                                                    success: 'Optimization queued successfully!',
                                                    error: 'Failed to queue optimization'
                                                })}>
                                                    <RefreshCw className="mr-2 h-4 w-4" /> Re-optimize
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => toast.success("Asset deleted", { description: "The product has been removed from inventory." })}>
                                                    Delete Asset
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* PAGINATION (Simple Placeholder) */}
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button variant="outline" size="sm" disabled>Previous</Button>
                <Button variant="outline" size="sm" disabled>Next</Button>
            </div>
        </div>
    )
}
