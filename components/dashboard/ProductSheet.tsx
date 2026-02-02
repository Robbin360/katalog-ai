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
import { Loader2, UploadCloud } from "lucide-react"
import Image from "next/image"

export default function ProductSheet() {
    const { isSheetOpen, selectedProductId, closeProduct } = useFoundryStore()

    // Fetch single product details when ID changes
    const { data: product, isLoading } = useQuery({
        queryKey: ["product", selectedProductId],
        queryFn: async () => {
            if (!selectedProductId) return null
            const { data, error } = await supabase
                .from("products_queue")
                .select("*")
                .eq("id", selectedProductId)
                .single()

            if (error) throw error
            return data
        },
        enabled: !!selectedProductId, // Only fetch if ID exists
    })

    return (
        <Sheet open={isSheetOpen} onOpenChange={(open) => !open && closeProduct()}>
            <SheetContent className="w-[400px] sm:w-[540px] bg-zinc-950 border-l-zinc-800 text-zinc-100 overflow-y-auto">

                <SheetHeader className="mb-6">
                    <SheetTitle className="text-xl font-bold text-zinc-100">
                        {isLoading ? (
                            "Loading Product..."
                        ) : product ? (
                            <>product_inspector <span className="text-zinc-600 font-mono">#{product.id}</span></>
                        ) : (
                            "Product Not Found"
                        )}
                    </SheetTitle>
                    <SheetDescription className="text-zinc-500">
                        {product ? "Review AI generated content before publishing." : "Please select a valid product."}
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

                            {/* Main Image */}
                            <div className="aspect-square w-full rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden relative group">
                                {product.image_url ? (
                                    <Image
                                        src={product.image_url}
                                        alt="Product"
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-700">No Image</div>
                                )}
                            </div>

                            {/* Title */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Optimized Title</label>
                                <h1 className="text-2xl font-bold leading-tight">{product.title || "Generating title..."}</h1>
                            </div>

                            {/* Description HTML Preview */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">HTML Description</label>
                                <div className="p-4 rounded border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-300 font-mono text-wrap break-all h-64 overflow-y-auto">
                                    {product.body_html || "// No HTML content generated yet."}
                                </div>
                            </div>

                        </div>

                        {/* --- FOOTER ACTIONS --- */}
                        <SheetFooter className="absolute bottom-0 left-0 w-full p-6 bg-zinc-950 border-t border-zinc-800">
                            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                                <UploadCloud className="mr-2 h-4 w-4" />
                                PUBLISH TO SHOPIFY
                            </Button>
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
