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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Sparkles, BrainCircuit, Loader2, UploadCloud, CheckCircle2, AlertCircle, Clock } from "lucide-react"
import DOMPurify from "isomorphic-dompurify"
import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { useFoundryStore } from "@/store/useFoundryStore"

const StatusBadge = ({ status }: { status: string }) => {
    if (status === 'OPTIMIZED') return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-2 py-0.5"><CheckCircle2 className="h-3 w-3 mr-1" /> Optimized</Badge>
    if (status === 'NEEDS_REVIEW') return <Badge variant="outline" className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20 px-2 py-0.5"><AlertCircle className="h-3 w-3 mr-1" /> Needs Review</Badge>
    return <Badge variant="outline" className="bg-zinc-500/10 text-zinc-400 border-zinc-500/20 px-2 py-0.5"><Clock className="h-3 w-3 mr-1" /> Pending Audit</Badge>
};

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export default function ProductSheet() {
    const { isSheetOpen, selectedProductId, closeProduct } = useFoundryStore()
    const queryClient = useQueryClient();
    
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);

    // Fetch product details lazily when the sheet opens
    const { data: productDetail, isLoading: isLoadingDetail } = useQuery({
        queryKey: ['product-detail', selectedProductId],
        queryFn: async () => {
            if (!selectedProductId) return null;
            const { data, error } = await supabase
                .from('shopify_products')
                .select('*')
                .eq('id', selectedProductId)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!selectedProductId && isSheetOpen,
        staleTime: 1000 * 60 * 5, // 5 minutos de cache para evitar el spam del auth-lock en Strict Mode
        gcTime: 1000 * 60 * 10 // Mantener en memoria 10 minutos
    });

    const handleOptimize = async () => {
        if (!selectedProductId) return;
        setIsOptimizing(true);
        try {
            const response = await fetch(`${BACKEND_URL}/api/optimize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product_id: selectedProductId }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                toast.error(data.error || 'AI Engine: Connection failed');
                return;
            }

            toast.success('AI Engine: Optimization Complete');
            queryClient.invalidateQueries({ queryKey: ['product-detail', selectedProductId] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-full'] });
        } catch (err: any) {
            toast.error('AI Engine: Connection failed');
        } finally {
            setIsOptimizing(false);
        }
    };

    const handlePublishToShopify = async () => {
        if (!selectedProductId) return;
        setIsPublishing(true);
        try {
            const response = await fetch('/api/shopify/publish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: selectedProductId }),
            });
            const data = await response.json();
            if (!response.ok) {
                toast.error(data.error || 'Failed to publish to Shopify.');
                return;
            }
            toast.success('Successfully published to Shopify!');
            queryClient.invalidateQueries({ queryKey: ['dashboard-full'] });
            queryClient.invalidateQueries({ queryKey: ['shopify-inventory'] });
            closeProduct();
        } catch (err: any) {
            toast.error(err.message || 'An unexpected error occurred.');
        } finally {
            setIsPublishing(false);
        }
    };

    if (!selectedProductId) return null;

    return (
        <Sheet open={isSheetOpen} onOpenChange={(open) => !open && closeProduct()}>
            <SheetContent className="bg-card border-border text-foreground sm:max-w-3xl overflow-y-auto flex flex-col px-8">
                <SheetHeader className="space-y-4">
                    <div className="flex justify-between items-start">
                        {productDetail?.audit_status && <StatusBadge status={productDetail.audit_status} />}
                        {productDetail?.shopify_id && <Badge variant="outline" className="text-muted-foreground border-border mr-8">REF: {productDetail.shopify_id}</Badge>}
                    </div>
                    <SheetTitle className="text-xl font-bold text-foreground">
                        {isLoadingDetail ? <Skeleton className="h-8 w-3/4" /> : productDetail?.current_title}
                    </SheetTitle>
                    <SheetDescription className="sr-only">
                        Review AI optimization proposals and publish to Shopify.
                    </SheetDescription>
                    <div className="h-48 w-full bg-background rounded-xl overflow-hidden border border-border flex items-center justify-center">
                        {isLoadingDetail ? <Skeleton className="h-full w-full" /> : productDetail?.image_url && <img src={productDetail.image_url} className="h-full object-contain" alt="preview" referrerPolicy="no-referrer" />}
                    </div>
                </SheetHeader>
                
                <div className="mt-8 space-y-6 flex-1">
                    <Tabs defaultValue="optimization" className="w-full">
                        <TabsList className="w-full bg-muted border-border">
                            <TabsTrigger value="optimization" className="flex-1">Before & After (AI)</TabsTrigger>
                            <TabsTrigger value="json" className="flex-1">Metadata</TabsTrigger>
                        </TabsList>
                        <TabsContent value="optimization" className="mt-4 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* BEFORE */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-500"></div>
                                        Current State
                                    </h4>
                                    <div className="p-4 rounded-xl border border-border bg-muted/20 min-h-[200px] flex flex-col">
                                        {isLoadingDetail ? (
                                            <div className="flex-1 flex flex-col gap-2">
                                                <Skeleton className="h-4 w-full" />
                                                <Skeleton className="h-4 w-3/4" />
                                                <Skeleton className="h-4 w-5/6" />
                                            </div>
                                        ) : (
                                            <div className="prose prose-sm dark:prose-invert max-w-none text-xs text-muted-foreground font-light leading-relaxed">
                                                <div dangerouslySetInnerHTML={{ 
                                                    __html: productDetail?.current_body_html 
                                                        ? DOMPurify.sanitize(productDetail.current_body_html) 
                                                        : "<p>No description available.</p>" 
                                                }} />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* AFTER (AI PROPOSAL) */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-500 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                                        AI Proposal
                                    </h4>
                                    <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/5 min-h-[200px] relative overflow-hidden group">
                                        {isLoadingDetail ? (
                                            <div className="flex-1 flex flex-col gap-2">
                                                <Skeleton className="h-4 w-full" />
                                                <Skeleton className="h-4 w-3/4" />
                                                <Skeleton className="h-4 w-5/6" />
                                            </div>
                                        ) : productDetail?.audit_status === 'OPTIMIZED' || productDetail?.ai_proposal?.new_title ? (
                                            <div className="space-y-4">
                                                {/* AI AUDIT INSIGHTS */}
                                                {(() => {
                                                    const auditReasons = productDetail?.ai_proposal?.audit_log || productDetail?.ai_proposal?.registro_de_auditoria || [];
                                                    if (auditReasons.length > 0) {
                                                        return (
                                                            <div className="space-y-2 mb-4 p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                                                                <p className="text-[10px] text-indigo-700 dark:text-indigo-400 font-bold flex items-center gap-1.5">
                                                                    <Sparkles className="w-3 h-3" /> AI AUDIT INSIGHTS
                                                                </p>
                                                                <ul className="space-y-1">
                                                                    {auditReasons.map((reason: string, i: number) => (
                                                                        <li key={i} className="text-[11px] text-indigo-800 dark:text-indigo-300/80 flex items-start gap-1.5">
                                                                            <span className="text-indigo-700 dark:text-indigo-400 mt-0.5">•</span>
                                                                            <span>{reason}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                })()}

                                                <div className="space-y-1">
                                                    <p className="text-[10px] text-indigo-700 dark:text-indigo-400 font-bold">NEW TITLE</p>
                                                    <p className="text-sm text-foreground font-semibold leading-tight">{productDetail?.ai_proposal?.new_title}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] text-indigo-700 dark:text-indigo-400 font-bold">OPTIMIZED CONTENT</p>
                                                    <div className="prose prose-sm dark:prose-invert max-w-none text-xs text-zinc-700 dark:text-zinc-300 font-light leading-relaxed">
                                                        <div dangerouslySetInnerHTML={{ 
                                                            __html: productDetail?.ai_proposal?.new_body_html 
                                                                ? DOMPurify.sanitize(productDetail.ai_proposal.new_body_html) 
                                                                : "<p>Generating proposal...</p>" 
                                                        }} />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center min-h-[160px] text-center space-y-3">
                                                <BrainCircuit className="w-8 h-8 text-indigo-500/50" />
                                                <p className="text-xs text-muted-foreground">Pending bulk optimization.</p>
                                                <Button 
                                                    size="sm" 
                                                    className="bg-indigo-600 text-white hover:bg-indigo-700 font-bold shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all"
                                                    onClick={handleOptimize}
                                                    disabled={isOptimizing}
                                                >
                                                    {isOptimizing ? (
                                                        <span className="flex items-center"><Loader2 className="w-3 h-3 mr-2 animate-spin" /> Optimizing...</span>
                                                    ) : (
                                                        <span className="flex items-center"><Sparkles className="w-3 h-3 mr-2" /> Optimize Now</span>
                                                    )}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="json">
                            <pre className="text-[10px] text-muted-foreground p-4 bg-background rounded-lg overflow-x-auto border border-border">
                                {JSON.stringify(productDetail?.ai_proposal, null, 2)}
                            </pre>
                        </TabsContent>
                    </Tabs>
                </div>
                
                <SheetFooter className="mt-10 sticky bottom-0 bg-card pt-4 pb-2 border-t border-border -mx-6 px-6">
                    {isOptimizing ? (
                        <Button disabled className="w-full bg-muted text-muted-foreground flex items-center gap-2 font-bold h-11">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Processing...
                        </Button>
                    ) : (productDetail?.audit_status === 'OPTIMIZED' || productDetail?.audit_status === 'NEEDS_REVIEW') && productDetail?.ai_proposal?.new_body_html ? (
                        <Button 
                            className="w-full bg-indigo-600 text-white hover:bg-indigo-700 font-bold h-11 shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all flex items-center justify-center gap-2" 
                            onClick={handlePublishToShopify}
                            disabled={isPublishing}
                        >
                            {isPublishing ? (
                                <><Loader2 className="h-4 w-4 animate-spin" /> Publishing...</>
                            ) : (
                                <><UploadCloud className="h-4 w-4" /> Publish to Shopify</>
                            )}
                        </Button>
                    ) : (
                        <Button variant="outline" disabled className="w-full bg-transparent text-muted-foreground border-border flex items-center justify-center gap-2 font-bold h-11">
                            <UploadCloud className="h-4 w-4" />
                            Publish to Shopify
                        </Button>
                    )}
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
