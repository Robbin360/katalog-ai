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
import { useEffect, useRef, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { useFoundryStore } from "@/store/useFoundryStore"

// Polling del job asíncrono: el Brain responde 202 y el grafo corre en
// segundo plano; el estado se consulta hasta alcanzar un estado terminal.
const POLL_INTERVAL_MS = 3000
// Timeout de seguridad del cliente: 15 min. Si el grafo tarda más, se deja
// de sondear y se avisa — el job sigue corriendo en el Brain.
const POLL_TIMEOUT_MS = 15 * 60 * 1000
// Estados en los que el job terminó y el polling debe detenerse.
const TERMINAL_STATUSES = new Set([
  "READY_TO_PUBLISH", "ERROR", "OPTIMIZED", "NEEDS_OPTIMIZATION",
  "NEEDS_REVIEW", "OUT_OF_CREDITS",
  "STABLE_PERFORMING", "BENCHMARK", "MONITORING", "INVESTIGATE_CAUSE",
])

const StatusBadge = ({ status }: { status: string }) => {
    if (status === 'ERROR') return <Badge variant="outline" className="bg-destructive/10 dark:bg-red-500/10 text-destructive dark:text-red-500 border-destructive/20 dark:border-red-500/20 px-2 py-0.5"><AlertTriangle className="h-3 w-3 mr-1" /> Error</Badge>
    if (status === 'OPTIMIZED') return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-2 py-0.5"><CheckCircle2 className="h-3 w-3 mr-1" /> Optimized</Badge>
    if (status === 'NEEDS_REVIEW') return <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 px-2 py-0.5"><AlertCircle className="h-3 w-3 mr-1" /> Needs Review</Badge>
    if (status === "READY_TO_PUBLISH") {
        return (
            <Badge
                variant="outline"
                className="bg-blue-500/10 text-blue-500 border-blue-500/20 px-2 py-0.5"
            >
                <UploadCloud className="h-3 w-3 mr-1" />
                Ready to Publish
            </Badge>
        )
    }
    if (status === 'STABLE_PERFORMING') {
        return (
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border-emerald-500/20 px-2 py-0.5">
                <CheckCircle2 className="h-3 w-3 mr-1" /> Stable
            </Badge>
        )
    }
    if (status === 'BENCHMARK') {
        return (
            <Badge variant="outline" className="bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20 px-2 py-0.5">
                <CheckCircle2 className="h-3 w-3 mr-1" /> Benchmark
            </Badge>
        )
    }
    if (status === 'MONITORING') {
        return (
            <Badge variant="outline" className="bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20 px-2 py-0.5">
                <Clock className="h-3 w-3 mr-1" /> Monitoring
            </Badge>
        )
    }
    if (status === 'INVESTIGATE_CAUSE') {
        return (
            <Badge variant="outline" className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20 px-2 py-0.5">
                <AlertCircle className="h-3 w-3 mr-1" /> Investigating
            </Badge>
        )
    }
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
                .select('id, shopify_id, current_title, audit_status, image_url, error_log, ai_proposal, current_body_html, audit_log, publish_attempts, publish_next_retry_at, publish_error_code, publish_error_stage, publish_error_retryable, publish_error_at, publish_error_details')
                .eq('id', selectedProductId)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!selectedProductId && isSheetOpen,
        // Mientras haya un job en vuelo, sondear el estado cada 3s.
        // El refetchInterval ignora staleTime: fuerza el refetch.
        refetchInterval: isOptimizing ? POLL_INTERVAL_MS : false,
        staleTime: 1000 * 60 * 5, // 5 minutos de cache para evitar el spam del auth-lock en Strict Mode
        gcTime: 1000 * 60 * 10 // Mantener en memoria 10 minutos
    });

    // Detener el polling al alcanzar un estado terminal y avisar al usuario.
    // Cuidado: NEEDS_OPTIMIZATION es a la vez estado pre-run y resultado de
    // un job (gate rechazado). Solo se trata como terminal tras haber visto
    // PROCESSING — de lo contrario el dato cacheado cortaría el ciclo al
    // clickear "Optimize" antes de que el refetch traiga el estado real.
    const sawProcessingRef = useRef(false);
    useEffect(() => {
        if (!isOptimizing) return;
        const status = productDetail?.audit_status;
        if (status === 'PROCESSING') {
            sawProcessingRef.current = true;
            return;
        }
        if (!status || !sawProcessingRef.current || !TERMINAL_STATUSES.has(status)) return;

        setIsOptimizing(false);

        if (status === 'READY_TO_PUBLISH' || status === 'OPTIMIZED') {
            toast.success('AI Engine: Optimization Complete');
        } else if (status === 'ERROR' || status === 'OUT_OF_CREDITS') {
            toast.error(productDetail?.error_log || `AI Engine: Optimization ${status === 'ERROR' ? 'failed' : 'out of credits'}`);
        } else {
            toast.info('AI Engine: Optimization finished. Review the proposal.');
        }

        queryClient.invalidateQueries({ queryKey: ['product-detail', selectedProductId] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-full'] });
    }, [productDetail?.audit_status, isOptimizing, productDetail?.error_log, selectedProductId, queryClient]);

    // Timeout de seguridad del cliente: 15 min sin estado terminal.
    useEffect(() => {
        if (!isOptimizing) return;
        const timeout = setTimeout(() => {
            setIsOptimizing(false);
            // Invalidar para que una reapertura de la ficha traiga el estado
            // real en vez del PROCESSING cacheado.
            queryClient.invalidateQueries({ queryKey: ['product-detail', selectedProductId] });
            toast.error('AI Engine: Optimization is taking longer than 15 minutes. It keeps running in the background — reopen this sheet to check the result.');
        }, POLL_TIMEOUT_MS);
        return () => clearTimeout(timeout);
    }, [isOptimizing, selectedProductId, queryClient]);

    // audit_log es jsonb y lo escribieron versiones distintas de código:
    // nunca asumir que es un array — si alguna fila trae string u objeto,
    // .filter() reventaría el sheet al abrirse.
    const auditLog: string[] = Array.isArray(productDetail?.audit_log)
        ? (productDetail.audit_log as unknown[]).filter((l): l is string => typeof l === "string")
        : [];
    const gateRejection = auditLog.filter((l) => l.startsWith("Gate RECHAZADO")).at(-1);

    // Helpers de publicación recuperable — no usar solo audit_status === "ERROR"
    const publishErrorCode = (productDetail as unknown as Record<string, unknown> | null)?.publish_error_code as string | null ?? null
    const publishErrorStage = (productDetail as unknown as Record<string, unknown> | null)?.publish_error_stage as string | null ?? null
    const publishErrorRetryable = (productDetail as unknown as Record<string, unknown> | null)?.publish_error_retryable === true
    const publishErrorDetails = productDetail?.publish_error_details as Record<string, unknown> | null | undefined
    const publishNextRetryAt = (productDetail as unknown as Record<string, unknown> | null)?.publish_next_retry_at as string | null ?? null

    const codeUpper = publishErrorCode ? String(publishErrorCode).toUpperCase() : null
    const stageUpper = publishErrorStage ? String(publishErrorStage).toUpperCase() : null

    const isLocalFinalizePending =
        codeUpper === "LOCAL_FINALIZE_ERROR" &&
        publishErrorStage === "local_finalize" &&
        publishErrorRetryable

    const isPermanentPublishError =
        Boolean(publishErrorCode) &&
        !publishErrorRetryable &&
        !isLocalFinalizePending

    const isTransientPublishError =
        publishErrorRetryable &&
        !isLocalFinalizePending

    // Clasificación fina para banners
    const INTEGRATION_CODES = new Set([
        "NO_INTEGRATION", "MISSING_TOKEN", "INVALID_TOKEN", "SHOP_NOT_ACTIVE", "PERMISSION_DENIED",
        "INTEGRATION_MISSING", "INVALID_SHOP_URL", "SHOP_NOT_ACTIVE", "MISSING_TOKEN", "SHOP_INACTIVE"
    ])
    const isIntegrationError = isPermanentPublishError && codeUpper !== null && INTEGRATION_CODES.has(codeUpper)

    const PROPOSAL_CODES = new Set([
        "PRODUCT_NOT_FOUND", "PROPOSAL_INVALID", "PROPOSAL_MISMATCH", "SHOPIFY_VALIDATION_ERROR",
        "PROPOSAL_MISSING", "SHOPIFY_USER_ERROR", "PRODUCT_NOT_FOUND", "PROPOSAL_MISSING"
    ])
    // También considerar códigos de validación genéricos cuando stage es preflight/shopify_verify y no retryable
    const isProposalError = isPermanentPublishError && (
        (codeUpper !== null && PROPOSAL_CODES.has(codeUpper)) ||
        (!isIntegrationError && !isLocalFinalizePending && isPermanentPublishError)
    )
    // Para distinguir: si es integración, prioriza ese; si no, propuesta
    const isProposalErrorFinal = isProposalError && !isIntegrationError

    const TRANSIENT_CODES = new Set([
        "TIMEOUT", "NETWORK_ERROR", "SHOPIFY_429", "SHOPIFY_500", "SHOPIFY_502", "SHOPIFY_503", "SHOPIFY_504",
        "RATE_LIMITED", "SHOPIFY_5XX", "SHOPIFY_HTTP_ERROR", "TIMEOUT", "NETWORK_ERROR"
    ])
    const isTransientCode = codeUpper !== null && TRANSIENT_CODES.has(codeUpper)
    // Transient real es retryable y no local finalize; si el código no está en lista pero es retryable, también se considera transitorio genérico
    const showTransientBanner = isTransientPublishError && (isTransientCode || (!isIntegrationError && !isProposalErrorFinal))

    const hasPublishError = Boolean(publishErrorCode)

    const handleOptimize = async () => {
        if (!selectedProductId) return;
        setIsOptimizing(true);
        sawProcessingRef.current = false;

        try {
            const response = await fetch('/api/optimize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product_id: selectedProductId }),
            });
            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                setIsOptimizing(false);
                toast.error(data.error || 'AI Engine: Connection failed');
                return;
            }

            // 202 Accepted: el job está en cola. El polling (refetchInterval
            // + efectos de arriba) lo sigue hasta un estado terminal.
            toast.success('AI Engine: Optimization queued. Monitoring progress...');
            void refetchDetail();
        } catch (err: unknown) {
            setIsOptimizing(false);
            toast.error('AI Engine: Connection failed');
        }
    };

    const handlePublishToShopify = async () => {
        if (!selectedProductId) return;
        if (isPublishing) return;
        setIsPublishing(true);
        try {
            const response = await fetch('/api/shopify/publish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: selectedProductId }),
            });
            const data = await response.json().catch(() => ({})) as Record<string, unknown>;
            if (!response.ok) {
                // No cerrar la ficha; invalidar para que los campos persistidos determinen el banner correcto
                await queryClient.invalidateQueries({
                    queryKey: ["product-detail", selectedProductId],
                })
                // Mostrar mensaje seguro devuelto por la API, no "Connection failed" genérico
                const safeMessage = (data.error as string) || (data.message as string) || 'Failed to publish to Shopify.'
                toast.error(safeMessage);
                return;
            }
            // Éxito: invalida las queries, espera, muestra éxito y cierra después de refrescar
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ["product-detail", selectedProductId],
                }),
                queryClient.invalidateQueries({
                    queryKey: ["dashboard-full"],
                }),
                queryClient.invalidateQueries({
                    queryKey: ["inventory"],
                }),
            ])

            toast.success("Published to Shopify successfully")

            setTimeout(() => {
                closeProduct()
            }, 250)
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'An unexpected error occurred.'
            toast.error(message);
            await queryClient.invalidateQueries({
                queryKey: ["product-detail", selectedProductId],
            })
        } finally {
            setIsPublishing(false);
        }
    };

    const handleReconnectShopify = () => {
        // Usar ruta existente de reconexión si existe; no inventar URL
        // La ruta de auth de Shopify existe en /api/shopify/auth
        if (typeof window !== "undefined") {
            window.location.href = "/api/shopify/auth"
        }
    }

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
                    ) : isLocalFinalizePending ? (
                        <div className="bg-blue-500/10 dark:bg-blue-950/30 border border-blue-500/30 dark:border-blue-900/50 text-blue-700 dark:text-blue-300 p-6 rounded-xl space-y-4">
                            <div className="flex items-center gap-2 font-bold text-lg">
                                <AlertCircle className="w-5 h-5" />
                                <h3>Shopify was updated. We are finishing the local record.</h3>
                            </div>
                            <p className="text-sm opacity-90">
                                Shopify already applied the change. We just need to finish the local record. You can retry safely — it will not publish twice.
                            </p>
                            {productDetail?.error_log && (
                                <p className="text-xs opacity-75">{productDetail.error_log}</p>
                            )}
                            <Button
                                onClick={handlePublishToShopify}
                                disabled={isPublishing}
                                className="mt-2 bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {isPublishing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publishing...</> : <>Finish publishing</>}
                            </Button>
                        </div>
                    ) : isIntegrationError ? (
                        <div className="bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/30 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 p-6 rounded-xl space-y-4">
                            <div className="flex items-center gap-2 font-bold text-lg">
                                <AlertTriangle className="w-5 h-5" />
                                <h3>Your Shopify connection needs attention.</h3>
                            </div>
                            <p className="text-sm opacity-90">
                                {(productDetail?.error_log as string) || (publishErrorDetails as unknown as string) || "Please reconnect Shopify to continue publishing."}
                            </p>
                            {publishErrorCode && (
                                <p className="text-xs opacity-60">Code: {publishErrorCode} {publishErrorStage ? `• Stage: ${publishErrorStage}` : ""}</p>
                            )}
                            <Button
                                onClick={handleReconnectShopify}
                                className="mt-2 bg-amber-600 hover:bg-amber-700 text-white"
                            >
                                Reconnect Shopify
                            </Button>
                        </div>
                    ) : isProposalErrorFinal ? (
                        <div className="bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/30 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 p-6 rounded-xl space-y-4">
                            <div className="flex items-center gap-2 font-bold text-lg">
                                <AlertCircle className="w-5 h-5" />
                                <h3>This product or proposal needs attention.</h3>
                            </div>
                            <p className="text-sm opacity-90">
                                {(productDetail?.error_log as string) || "The proposal is invalid or the product no longer exists. Please regenerate the proposal."}
                            </p>
                            {publishErrorCode && (
                                <p className="text-xs opacity-60">Code: {publishErrorCode}</p>
                            )}
                            <Button
                                disabled
                                className="mt-2 bg-zinc-500 text-white opacity-60 cursor-not-allowed"
                                title="Regenerate proposal from dashboard"
                            >
                                Regenerate Proposal
                            </Button>
                        </div>
                    ) : showTransientBanner ? (
                        <div className="bg-sky-500/10 dark:bg-sky-950/30 border border-sky-500/30 dark:border-sky-900/50 text-sky-700 dark:text-sky-300 p-6 rounded-xl space-y-4">
                            <div className="flex items-center gap-2 font-bold text-lg">
                                <AlertTriangle className="w-5 h-5" />
                                <h3>Shopify did not respond. You can retry.</h3>
                            </div>
                            <p className="text-sm opacity-90">
                                {(productDetail?.error_log as string) || "Shopify is temporarily unavailable. Please try again."}
                            </p>
                            {publishNextRetryAt && (
                                <p className="text-xs opacity-60">Next retry: {new Date(publishNextRetryAt).toLocaleString()}</p>
                            )}
                            <Button
                                onClick={handlePublishToShopify}
                                disabled={isPublishing}
                                className="mt-2 bg-sky-600 hover:bg-sky-700 text-white"
                            >
                                {isPublishing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publishing...</> : <>Retry publishing</>}
                            </Button>
                        </div>
                    ) : hasPublishError ? (
                        <div className="bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/30 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 p-6 rounded-xl space-y-4">
                            <div className="flex items-center gap-2 font-bold text-lg">
                                <AlertTriangle className="w-5 h-5" />
                                <h3>We couldn&apos;t finish publishing. Please try again or reconnect Shopify.</h3>
                            </div>
                            <p className="text-sm opacity-90">
                                {(productDetail?.error_log as string) || "An error occurred while publishing."}
                            </p>
                            {publishErrorCode && (
                                <p className="text-xs opacity-60">Code: {publishErrorCode} • Stage: {publishErrorStage ?? "unknown"}</p>
                            )}
                            {publishErrorRetryable ? (
                                <Button
                                    onClick={handlePublishToShopify}
                                    disabled={isPublishing}
                                    className="mt-2 bg-amber-600 hover:bg-amber-700 text-white"
                                >
                                    {isPublishing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publishing...</> : <>Retry publishing</>}
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleReconnectShopify}
                                    className="mt-2 bg-amber-600 hover:bg-amber-700 text-white"
                                >
                                    Reconnect Shopify
                                </Button>
                            )}
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
                                                    <div className="mb-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 space-y-1.5">
                                                        <p className="text-[10px] text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1.5 uppercase tracking-widest">
                                                            <AlertTriangle className="h-3 w-3" /> Quality Gate rejected this draft
                                                        </p>
                                                        {/* El gate concatena sus razones con " | ". Separarlas en una
                                                            lista mantiene legible un mensaje que puede traer tres
                                                            motivos, incluyendo citas textuales del inspector. */}
                                                        <ul className="space-y-1">
                                                            {gateRejection
                                                                .replace(/^Gate RECHAZADO:\s*/, "")
                                                                .split(" | ")
                                                                .filter((reason) => reason.trim().length > 0)
                                                                .map((reason, i) => (
                                                                    <li
                                                                        key={i}
                                                                        className="text-[11px] text-amber-800 dark:text-amber-300/90 leading-relaxed flex items-start gap-1.5"
                                                                    >
                                                                        <span className="mt-0.5 text-amber-700 dark:text-amber-400">•</span>
                                                                        <span>{reason}</span>
                                                                    </li>
                                                                ))}
                                                        </ul>
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

                        // Prioridad visual: isPublishing > LOCAL_FINALIZE > permanente > transitorio > READY etc.
                        if (isPublishing) {
                            return (
                                <Button disabled className="w-full bg-indigo-600/80 text-white flex items-center justify-center gap-2 font-bold h-11">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Publishing...
                                </Button>
                            );
                        }

                        if (isLocalFinalizePending) {
                            return (
                                <Button
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 font-bold h-11 shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all"
                                    onClick={handlePublishToShopify}
                                    disabled={isPublishing}
                                >
                                    Finish publishing
                                </Button>
                            );
                        }

                        if (isIntegrationError) {
                            return (
                                <Button
                                    className="w-full bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center gap-2 font-bold h-11"
                                    onClick={handleReconnectShopify}
                                >
                                    Reconnect Shopify
                                </Button>
                            );
                        }

                        if (isProposalErrorFinal) {
                            return (
                                <Button
                                    disabled
                                    className="w-full bg-zinc-500/20 text-zinc-500 border border-zinc-300 flex items-center justify-center gap-2 font-bold h-11 cursor-not-allowed"
                                >
                                    Regenerate Proposal
                                </Button>
                            );
                        }

                        if (showTransientBanner) {
                            return (
                                <Button
                                    className="w-full bg-sky-600 hover:bg-sky-700 text-white flex items-center justify-center gap-2 font-bold h-11"
                                    onClick={handlePublishToShopify}
                                    disabled={isPublishing}
                                >
                                    Retry publishing
                                </Button>
                            );
                        }

                        if (hasPublishError) {
                            // Genérico
                            if (publishErrorRetryable) {
                                return (
                                    <Button
                                        className="w-full bg-sky-600 hover:bg-sky-700 text-white flex items-center justify-center gap-2 font-bold h-11"
                                        onClick={handlePublishToShopify}
                                        disabled={isPublishing}
                                    >
                                        Retry publishing
                                    </Button>
                                );
                            }
                            return (
                                <Button
                                    className="w-full bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center gap-2 font-bold h-11"
                                    onClick={handleReconnectShopify}
                                >
                                    Reconnect Shopify
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
                                    🚀 Publish to Shopify
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

                        if (['STABLE_PERFORMING', 'BENCHMARK', 'MONITORING', 'INVESTIGATE_CAUSE'].includes(status ?? '')) {
                            // Cuadrantes que asigna el orquestador. No ofrecen accion
                            // porque optimizar aqui gastaria cuota sin un problema de
                            // copy identificado. El texto describe el estado sin
                            // prometer nada que el sistema no haga hoy.
                            const quadrantCopy: Record<string, string> = {
                                STABLE_PERFORMING: "This listing performs well. No optimization queued.",
                                BENCHMARK: "Used as a quality reference for your catalog.",
                                MONITORING: "Under observation. No action needed right now.",
                                INVESTIGATE_CAUSE: "Sales don't match the listing quality. The cause may be price, stock or images, not the copy.",
                            }
                            return (
                                <div className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-center">
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        {quadrantCopy[status as string]}
                                    </p>
                                </div>
                            )
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
