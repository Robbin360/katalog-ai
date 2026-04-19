"use client"

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useFoundryStore } from "@/store/useFoundryStore"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { Loader2, UploadCloud, PackageOpen, TrendingDown, Clock, ShieldAlert } from "lucide-react"

export default function ProductSheet() {
    const { isSheetOpen, selectedProductId, closeProduct } = useFoundryStore()

    // Fetch single product details from shopify_products
    const { data: product, isLoading } = useQuery({
        queryKey: ["product", selectedProductId],
        queryFn: async () => {
            if (!selectedProductId) return null
            const { data, error } = await supabase
                .from("shopify_products")
                .select("*")
                .eq("id", selectedProductId)
                .single()

            if (error) throw error
            return data
        },
        enabled: !!selectedProductId, // Only fetch if ID exists
    })

    const title = product?.current_title || "Untitled Product";
    const bodyHtml = product?.ai_proposal?.new_body_html || product?.current_body_html || "// No HTML content available.";
    const image = product?.image_url;
    
    // Metrics
    const stock = product?.inventory_quantity || 0;
    const sales = product?.sales_last_7_days || 0;
    const isUrgent = stock > 20 && sales < 5;

    return (
        <Sheet open={isSheetOpen} onOpenChange={(open) => !open && closeProduct()}>
            <SheetContent className="w-[400px] sm:w-[540px] bg-zinc-950 border-l-zinc-800 text-zinc-100 overflow-y-auto">

                <SheetHeader className="mb-6">
                    <SheetTitle className="text-xl font-bold text-zinc-100">
                        {isLoading ? (
                            "Loading Product..."
                        ) : product ? (
                            <>product_inspector <span className="text-zinc-600 font-mono">#{product.shopify_id || product.id}</span></>
                        ) : (
                            "Product Not Found"
                        )}
                    </SheetTitle>
                    <SheetDescription className="text-zinc-500">
                        {product ? "Review AI generated content and business metrics before publishing." : "Please select a valid product."}
                    </SheetDescription>
                </SheetHeader>

                {isLoading ? (
                    <div className="h-full flex items-center justify-center pb-20">
                        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
                    </div>
                ) : product ? (
                    <>
                        {/* --- CONTENT --- */}
                        <div className="space-y-6 pb-20">

                            {/* Financial / Business KPIs */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className={`p-4 rounded-xl border ${isUrgent ? 'bg-red-500/10 border-red-500/30' : 'bg-zinc-900/50 border-zinc-800'} flex items-center justify-between`}>
                                    <div>
                                        <p className="text-xs text-zinc-500 uppercase font-semibold mb-1">Available Stock</p>
                                        <p className={`text-2xl font-bold font-mono ${isUrgent ? 'text-red-400' : 'text-zinc-100'}`}>{stock}</p>
                                    </div>
                                    <PackageOpen className={`h-8 w-8 ${isUrgent ? 'text-red-500/50' : 'text-zinc-700'}`} />
                                </div>
                                
                                <div className="p-4 rounded-xl border bg-zinc-900/50 border-zinc-800 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-zinc-500 uppercase font-semibold mb-1">Sales (Last 7d)</p>
                                        <p className="text-2xl font-bold font-mono text-zinc-100">{sales}</p>
                                    </div>
                                    <TrendingDown className="h-8 w-8 text-zinc-700" />
                                </div>
                            </div>

                            {/* Urgency Alert */}
                            {isUrgent && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex gap-3 items-start">
                                    <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-red-400">High Priority Optimization</p>
                                        <p className="text-xs text-red-400/80 mt-1">This product has high stock but very low sales in the last week. An updated title and description could help move inventory.</p>
                                    </div>
                                </div>
                            )}

                            {/* Main Image */}
                            <div className="aspect-square w-full rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden relative group flex items-center justify-center">
                                {image ? (
                                    <img
                                        src={image}
                                        alt="Product"
                                        className="object-cover h-full w-full"
                                        referrerPolicy="no-referrer"
                                    />
                                ) : (
                                    <div className="text-zinc-700">No Image</div>
                                )}
                            </div>

                            {/* Title */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Current / Optimized Title</label>
                                <h1 className="text-xl font-bold leading-tight text-emerald-400">{product.ai_proposal?.new_title || title}</h1>
                            </div>

                            {/* Description HTML Preview */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">HTML Description</label>
                                <div className="p-4 rounded border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-300 font-mono text-wrap break-words h-64 overflow-y-auto">
                                    {bodyHtml}
                                </div>
                            </div>

                        </div>

                        {/* --- FOOTER ACTIONS --- */}
                        <SheetFooter className="absolute bottom-0 left-0 w-full p-6 bg-zinc-950 border-t border-zinc-900">
                            {product.audit_status === 'OPTIMIZED' ? (
                                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                                    <UploadCloud className="mr-2 h-4 w-4" />
                                    PUBLISH TO SHOPIFY
                                </Button>
                            ) : (
                                <Button variant="outline" className="w-full border-zinc-700 text-zinc-400 bg-zinc-900" disabled>
                                    <Clock className="mr-2 h-4 w-4" />
                                    Pending AI Optimization
                                </Button>
                            )}
                        </SheetFooter>
                    </>
                ) : (
                    <div className="h-full flex items-center justify-center text-zinc-500 pb-20">
                        Product information unavailable.
                    </div>
                )}

            </SheetContent>
        </Sheet>
    )
}
