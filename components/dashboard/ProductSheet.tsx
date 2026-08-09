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
import { Sparkles, BrainCircuit, Loader2, UploadCloud, CheckCircle2, AlertCircle, Clock, AlertTriangle, RefreshCw } from "lucide-react"
import DOMPurify from "isomorphic-dompurify"
import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { useFoundryStore } from "@/store/useFoundryStore"

const StatusBadge = ({ status }: { status: string }) => {
    if (status === 'ERROR') return <Badge variant="outline" className="bg-destructive/10 dark:bg-red-500/10 text-destructive dark:text-red-500 border-destructive/20 dark:border-red-500/20 px-2 py-0.5"><AlertTriangle className="h-3 w-3 mr-1" /> Error</Badge>
    if (status === 'OPTIMIZED') return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-2 py-0.5"><CheckCircle2 className="h-3 w-3 mr-1" /> Optimized</Badge>
    if (status === 'NEEDS_REVIEW') return <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 px-2 py-0.5"><AlertCircle className="h-3 w-3 mr-1" /> Needs Review</Badge>
    return <Badge variant="outline" className="bg-zinc-500/10 text-zinc-400 border-zinc-500/20 px-2 py-0.5"><Clock className="h-3 w-3 mr-1" /> Pending Audit</Badge>
};

export default function ProductSheet() {
    const { isSheetOpen, selectedProductId, closeProduct } = useFoundryStore()
    const queryClient = useQueryClient();
    
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);

    // Fetch product details lazily when the sheet opens.
    // El RPC get_priority_products NO trae current_body_html (listado ligero):
    // aquí se carga puntual solo al abrir la ficha.
    const { data: productDetail, isLoading: isLoadingDetail, isError: isDetailError, refetch: refetchDetail } = useQuery({
        queryKey: ['product-detail', selectedProductId],
        queryFn: async () => {
            if (!selectedProductId) return null;
            const { data, error } = await supabase
                .from('shopify_products')
                .select('id, shopify_id, current_title, audit_status, image_url, error_log, ai_proposal, current_body_html, audit_log')
                .eq('id', selectedProductId)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!selectedProductId && isSheetOpen,
        staleTime: 1000 * 60 * 5, // 5 minutos de cache para evitar el spam del auth-lock en Strict Mode
        gcTime: 1000 * 60 * 10 // Mantener en memoria 10 minutos
    });

    // audit_log es jsonb y lo escribieron versiones distintas de código:
    // nunca asumir que es un array — si alguna fila trae string u objeto,
    // .filter() reventaría el sheet al abrirse.
    const auditLog: string[] = Array.isArray(productDetail?.audit_log)
        ? (productDetail.audit_log as unknown[]).filter((l): l is string => typeof l === "string")
        : [];
    const gateRejection = auditLog.filter((l) => l.startsWith("Gate RECHAZADO")).at(-1);

    const handleOptimize = async () => {
        if (!selectedProductId) return;
        setIsOptimizing(true);

        try {
            const response = await fetch('/api/optimize', {
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
                    {isDetailError ? (
                        <div className="bg-destructive/10 dark:bg-red-950/30 border border-destructive/20 dark:border-red-900/50 text-destructive dark:text-red-400 p-6 rounded-xl space-y-4">
                            <div className="flex items-center gap-2 font-bold text-lg">
                                <AlertTriangle className="w-5 h-5" />
                                <h3>Failed to load product</h3>
                            </div>
                            <p className="text-sm opacity-90">The product description could not be fetched. Please try again.</p>
                            <Button
                                variant="destructive"
                                onClick={() => refetchDetail()}
                                disabled={isLoadingDetail}
                                className="mt-2 bg-destructive dark:bg-red-950 hover:bg-destructive/90 dark:hover:bg-red-900 text-destructive-foreground dark:text-red-400 border border-transparent dark:border-red-900/50"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" /> Retry
                            </Button>
                        </div>
                    ) : productDetail?.audit_status === 'ERROR' ? (
                        <div className="bg-destructive/10 dark:bg-red-950/30 border border-destructive/20 dark:border-red-900/50 text-destructive dark:text-red-400 p-6 rounded-xl space-y-4">
                            <div className="flex items-center gap-2 font-bold text-lg">
                                <AlertTriangle className="w-5 h-5" />
                                <h3>Optimization Failed</h3>
                            </div>
                            <pre className="text-xs font-mono whitespace-pre-wrap bg-background/50 dark:bg-black/20 p-4 rounded-lg border border-destructive/10 dark:border-red-900/30">
                                {productDetail?.error_log || "An unknown error occurred during optimization."}
                            </pre>
                            <Button 
                                variant="destructive" 
                                onClick={handleOptimize} 
                                disabled={isOptimizing}
                                className="mt-2 bg-destructive dark:bg-red-950 hover:bg-destructive/90 dark:hover:bg-red-900 text-destructive-foreground dark:text-red-400 border border-transparent dark:border-red-900/50"
                            >
                                {isOptimizing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                                {isOptimizing ? "Retrying..." : "Retry Optimization ↻"}
                            </Button>
                        </div>
                    ) : (
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
                                                {/* GATE REJECTION — el escritor produjo texto, el gate lo rechazó.
                                                    No es un bug: es el control de calidad protegiendo la tienda. */}
                                                {['NEEDS_OPTIMIZATION', 'NEEDS_REVIEW'].includes(productDetail?.audit_status ?? '') && gateRejection && (
                                                    <div className="mb-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 space-y-1">
                                                        <p className="text-[10px] text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1.5 uppercase tracking-widest">
                                                            <AlertTriangle className="h-3 w-3" /> Quality Gate rejected this draft
                                                        </p>
                                                        <p className="text-[11px] text-amber-800 dark:text-amber-300/90 leading-relaxed">{gateRejection}</p>
                                                    </div>
                                                )}
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
                    )}
                </div>
                
                <SheetFooter className="mt-10 sticky bottom-0 bg-card pt-4 pb-2 border-t border-border -mx-6 px-6">
                    {(() => {
                        const status = productDetail?.audit_status;
                        
                        if (isOptimizing || status === 'PROCESSING') {
                            return (
                                <Button disabled className="w-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center gap-2 font-bold h-11 border border-cyan-500/20">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    ⚙️ AI Working...
                                </Button>
                            );
                        }

                        if (status === 'NEEDS_OPTIMIZATION') {
                            return (
                                <Button 
                                    className="w-full bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center gap-2 font-bold h-11 shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all"
                                    onClick={handleOptimize}
                                >
                                    ⚡ Run AI Optimizer
                                </Button>
                            );
                        }

                        if (status === 'READY_TO_PUBLISH') {
                            return (
                                <Button 
                                    className="w-full bg-indigo-600 text-white hover:bg-indigo-700 font-bold h-11 shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all flex items-center justify-center gap-2" 
                                    onClick={handlePublishToShopify}
                                    disabled={isPublishing}
                                >
                                    {isPublishing ? (
                                        <><Loader2 className="h-4 w-4 animate-spin" /> Publishing...</>
                                    ) : (
                                        <>🚀 Publish to Shopify</>
                                    )}
                                </Button>
                            );
                        }

                        if (status === 'ERROR') {
                            return (
                                <Button 
                                    className="w-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center gap-2 font-bold h-11 shadow-[0_0_15px_rgba(243,64,84,0.3)] transition-all"
                                    onClick={handleOptimize}
                                >
                                    ↻ Retry Optimization
                                </Button>
                            );
                        }

                        if (status === 'OUT_OF_CREDITS') {
                            return (
                                <Button 
                                    className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white flex items-center justify-center gap-2 font-bold h-11 shadow-[0_0_15px_rgba(192,38,211,0.3)] transition-all"
                                    // onClick could link to billing if needed
                                >
                                    🔒 Upgrade Plan
                                </Button>
                            );
                        }

                        if (status === 'OPTIMIZED') {
                            return (
                                <Button disabled className="w-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center gap-2 font-bold h-11">
                                    ✨ Already Optimized
                                </Button>
                            );
                        }

                        if (status === 'NEEDS_REVIEW') {
                            return (
                                <div className="w-full bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 text-center space-y-1">
                                    <p className="text-amber-600 dark:text-amber-400 font-bold text-sm flex items-center justify-center gap-1.5">
                                        <AlertTriangle className="h-4 w-4" />
                                        This product needs your review
                                    </p>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        AI tried 3 times and couldn't fix this listing. Edit it in Shopify and re-scan to try again.
                                    </p>
                                </div>
                            );
                        }

                        // PENDING_AUDIT & Default
                        return (
                            <Button variant="outline" disabled className="w-full bg-transparent text-muted-foreground border-border flex items-center justify-center gap-2 font-bold h-11">
                                Waiting for Scanner...
                            </Button>
                        );
                    })()}
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
