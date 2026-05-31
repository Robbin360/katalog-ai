"use client"

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { ShieldCheck, Lock, RefreshCw, Trash2, Pencil, Eye, EyeOff, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n-context";

interface ShopifyCardProps {
    userId: string;
}

export function ShopifyCard({ userId }: ShopifyCardProps) {
    const { t } = useI18n();
    const queryClient = useQueryClient();

    // Local form states
    const [shopUrl, setShopUrl] = useState("");
    const [shopToken, setShopToken] = useState("");
    const [showToken, setShowToken] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Fetch integration
    const { data: integration, isLoading } = useQuery({
        queryKey: ['integration-shopify', userId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('integrations')
                .select('id, provider, shop_url')
                .eq('user_id', userId)
                .eq('provider', 'shopify')
                .maybeSingle();

            if (error) throw error;
            return data;
        },
        enabled: !!userId
    });

    // Sync form state when data loads or editing changes
    useEffect(() => {
        if (integration && !isEditing) {
            setShopUrl(integration.shop_url || "");
            setShopToken("shpat_••••••••••••••••"); // Static masking
        } else if (!integration && !isEditing) {
            setShopUrl("");
            setShopToken("");
        }
    }, [integration, isEditing]);

    // Save Mutation
    const { mutate: saveIntegration, isPending: isSaving } = useMutation({
        mutationFn: async () => {
            const cleanUrl = shopUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
            const shopUrlPattern = /^[a-zA-Z0-9][-a-zA-Z0-9]*\.myshopify\.com$/;
            
            if (!shopUrlPattern.test(cleanUrl)) {
                throw new Error("Invalid Shopify URL. Must end with .myshopify.com");
            }
            
            const isConnected = !!integration;

            if (!isConnected && (!shopToken || shopToken === "shpat_••••••••••••••••")) {
                throw new Error("Please enter a valid Admin API Token.");
            }

            if (isConnected) {
                // Partial Update: Only send token if explicitly typed
                const payload: any = { shop_url: cleanUrl };
                if (shopToken && shopToken.trim() !== "") {
                    payload.access_token = shopToken;
                }
                const { error } = await supabase
                    .from('integrations')
                    .update(payload)
                    .eq('user_id', userId)
                    .eq('provider', 'shopify');
                if (error) throw error;
            } else {
                // New Connection: Upsert all
                const { error } = await supabase.from('integrations').upsert({
                    user_id: userId,
                    provider: 'shopify',
                    shop_url: cleanUrl,
                    access_token: shopToken
                }, { onConflict: 'user_id, provider' });
                if (error) throw error;
            }
        },
        onSuccess: () => {
            toast.success("Shopify Connection Updated", {
                description: "Your store has been successfully linked.",
                icon: <ShieldCheck className="text-emerald-500" />
            });
            setIsEditing(false);
            queryClient.invalidateQueries({ queryKey: ['integration-shopify'] });
            // Invalidate global dashboard data to refresh products/inventory stats if needed
            queryClient.invalidateQueries({ queryKey: ['account-data-full'] }); 
        },
        onError: (error: any) => {
            toast.error("Connection Failed", { description: error.message });
        }
    });

    // Disconnect Mutation
    const { mutate: disconnectStore, isPending: isDisconnecting } = useMutation({
        mutationFn: async () => {
            const { error } = await supabase
                .from('integrations')
                .delete()
                .eq('user_id', userId)
                .eq('provider', 'shopify');

            if (error) throw error;
        },
        onSuccess: () => {
            toast.success("Store Disconnected", {
                description: "Shopify integration has been completely removed."
            });
            setShopUrl("");
            setShopToken("");
            setIsEditing(false);
            queryClient.invalidateQueries({ queryKey: ['integration-shopify'] });
            queryClient.invalidateQueries({ queryKey: ['account-data-full'] }); 
        },
        onError: (error: any) => {
            toast.error("Error disconnecting store", { description: error.message });
        }
    });

    const handleSave = () => {
        saveIntegration();
    };

    const handleCancel = () => {
        setIsEditing(false);
        if (integration) {
            setShopUrl(integration.shop_url || "");
            setShopToken("shpat_••••••••••••••••");
        } else {
            setShopUrl("");
            setShopToken("");
        }
    };

    if (isLoading) {
        return (
            <Card className="bg-card dark:bg-zinc-900/50 border-border dark:border-zinc-800 p-8 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </Card>
        );
    }

    const isConnected = !!integration;
    const isReadOnly = isConnected && !isEditing;

    return (
        <Card className="bg-card dark:bg-zinc-900/50 border-border dark:border-zinc-800 shadow-2xl overflow-hidden relative">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border dark:via-zinc-700 to-transparent"></div>
            
            <CardHeader className="border-b border-border dark:border-zinc-800/50 bg-muted/30 dark:bg-black/20 pb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-background dark:bg-zinc-800/50 rounded-xl border border-border dark:border-zinc-700/50 shadow-sm dark:shadow-inner relative flex items-center justify-center">
                            <img src="/shopify-glyph.svg" alt="Shopify Logo" className="w-6 h-6 object-contain select-none" />
                        </div>
                        <div>
                            <CardTitle className="text-xl text-foreground dark:text-zinc-100 font-bold tracking-tight">Shopify Integration</CardTitle>
                            <CardDescription className="text-muted-foreground dark:text-zinc-400 mt-1">Connect your store via Admin API to sync products and inventory.</CardDescription>
                        </div>
                    </div>
                    {isReadOnly ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 px-3 py-1 font-medium tracking-wide flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5" /> Connected & Secure
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="text-muted-foreground dark:text-zinc-500 border-border dark:border-zinc-800 bg-muted/50 dark:bg-zinc-900/50 px-3 py-1 font-medium tracking-wide">
                            {isEditing ? "Editing Configuration" : "Not Connected"}
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
                <div className="space-y-3">
                    <Label className="text-xs font-bold text-muted-foreground dark:text-zinc-400 uppercase tracking-wider">Store URL</Label>
                    <div className={`flex items-center rounded-lg border overflow-hidden transition-all ${isReadOnly ? 'border-border bg-muted/50 dark:border-zinc-800 dark:bg-zinc-900/50 opacity-80' : 'border-border dark:border-zinc-700 bg-background dark:bg-zinc-800/50 focus-within:ring-1 focus-within:ring-ring dark:focus-within:ring-zinc-600 focus-within:border-ring dark:focus-within:border-zinc-600'}`}>
                        <div className={`px-3 flex items-center justify-center h-11 border-r pointer-events-none select-none ${isReadOnly ? 'bg-muted/70 border-border text-muted-foreground/70 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-600' : 'bg-muted border-border text-muted-foreground dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400'}`}>
                            <span className="font-mono text-sm leading-none">https://</span>
                        </div>
                        <Input 
                            value={shopUrl} 
                            onChange={(e) => setShopUrl(e.target.value)} 
                            placeholder="mi-tienda.myshopify.com" 
                            disabled={isReadOnly}
                            className="bg-transparent border-0 text-foreground dark:text-zinc-200 placeholder:text-muted-foreground/50 dark:placeholder:text-zinc-600 focus-visible:ring-0 focus-visible:ring-offset-0 px-3 h-11 shadow-none w-full rounded-none font-mono text-sm disabled:cursor-default disabled:opacity-100" 
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <Label className="text-xs font-bold text-muted-foreground dark:text-zinc-400 uppercase tracking-wider">Admin API Access Token</Label>
                    <div className={`flex items-center rounded-lg border overflow-hidden transition-all ${isReadOnly ? 'border-border bg-muted/50 dark:border-zinc-800 dark:bg-zinc-900/50 opacity-80' : 'border-border dark:border-zinc-700 bg-background dark:bg-zinc-800/50 focus-within:ring-1 focus-within:ring-ring dark:focus-within:ring-zinc-600 focus-within:border-ring dark:focus-within:border-zinc-600'}`}>
                        {isReadOnly && <div className="pl-3 text-muted-foreground/70 dark:text-zinc-600"><Lock className="w-4 h-4" /></div>}
                        <Input 
                            type={showToken && !isReadOnly ? "text" : "password"} 
                            value={shopToken} 
                            onChange={(e) => setShopToken(e.target.value)} 
                            placeholder={isConnected ? "shpat_••••••••••••••••••••" : "shpat_....................."} 
                            disabled={isReadOnly}
                            required={!isConnected}
                            className={`bg-transparent border-0 text-foreground dark:text-zinc-200 placeholder:text-muted-foreground/50 dark:placeholder:text-zinc-600 font-mono focus-visible:ring-0 focus-visible:ring-offset-0 px-3 h-11 shadow-none w-full rounded-none disabled:cursor-default disabled:opacity-100 ${isReadOnly ? 'text-muted-foreground/70 dark:text-zinc-500' : ''}`} 
                        />
                        {!isReadOnly && (
                            <button
                                type="button"
                                onClick={() => setShowToken(!showToken)}
                                className="px-3 h-11 flex items-center justify-center text-muted-foreground dark:text-zinc-500 hover:text-foreground dark:hover:text-zinc-300 transition-colors"
                            >
                                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        )}
                    </div>
                    {!isReadOnly && (
                        <div className="flex flex-col gap-1 mt-1">
                            <p className="text-[11px] text-muted-foreground dark:text-zinc-500 font-medium tracking-wide">
                                Ensure token has read/write permissions for <span className="text-foreground/70 dark:text-zinc-300 font-mono">Products</span> and <span className="text-foreground/70 dark:text-zinc-300 font-mono">Inventory</span>.
                            </p>
                            {isConnected && (
                                <p className="text-[10px] text-muted-foreground dark:text-zinc-500 flex items-center gap-1">
                                    <Lock className='w-3 h-3'/> Your token is securely encrypted. Leave blank to keep the current token.
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>

            <CardFooter className="bg-muted/30 dark:bg-black/20 border-t border-border dark:border-zinc-800/50 p-6 flex justify-end gap-3">
                {isReadOnly ? (
                    <>
                        <Button 
                            variant="destructive" 
                            onClick={() => disconnectStore()} 
                            disabled={isDisconnecting}
                            className="bg-destructive/10 dark:bg-red-950/50 text-destructive dark:text-red-400 hover:bg-destructive/20 dark:hover:bg-red-900/50 border border-destructive/20 dark:border-red-900/50"
                        >
                            {isDisconnecting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />} Disconnect
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={() => {
                                setIsEditing(true);
                                setShopToken(""); // Clear dummy token for actual edit
                            }}
                            className="bg-background dark:bg-zinc-800 text-foreground dark:text-zinc-200 hover:bg-muted dark:hover:bg-zinc-700 border-border dark:border-zinc-700"
                        >
                            <Pencil className="w-4 h-4 mr-2" /> Edit Configuration
                        </Button>
                    </>
                ) : (
                    <>
                        {isConnected && (
                            <Button 
                                variant="ghost" 
                                onClick={handleCancel}
                                className="text-muted-foreground dark:text-zinc-400 hover:text-foreground dark:hover:text-zinc-200 hover:bg-muted dark:hover:bg-zinc-800"
                            >
                                Cancel
                            </Button>
                        )}
                        <Button 
                            onClick={handleSave} 
                            disabled={isSaving} 
                            className="bg-[#95bf47] text-white hover:bg-[#7a9d36] font-bold px-8 shadow-[0_0_15px_rgba(149,191,71,0.2)] transition-all"
                        >
                            {isSaving ? <><RefreshCw className="w-4 h-4 animate-spin mr-2" /> Saving...</> : (isConnected ? "Save Changes" : "Connect Store")}
                        </Button>
                    </>
                )}
            </CardFooter>
        </Card>
    );
}
