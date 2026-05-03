"use client"

import React, { useState, useRef } from 'react';
import { motion, useAnimation } from "framer-motion";
import { Zap, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useI18n } from "@/lib/i18n-context";
import { useQueryClient } from "@tanstack/react-query";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Tipos actualizados: brandRules eliminado, hasTrainedBrain booleano en su lugar
interface AutoPilotData {
    enabled: boolean;
    integrationCount: number;
    queuedCount: number;
    hasTrainedBrain: boolean;
    plan: string;
}

interface AutoPilotToggleProps {
    data: AutoPilotData;
    userId: string;
}

export function AutoPilotToggle({ data, userId }: AutoPilotToggleProps) {
    const { t } = useI18n();
    const [isUpdating, setIsUpdating] = useState(false);
    // Estado local optimista: refleja la posición visual del toggle
    const [optimisticEnabled, setOptimisticEnabled] = useState(data.enabled);
    // AlertDialog controlado para el warning de créditos
    const [showCreditWarning, setShowCreditWarning] = useState(false);
    const controls = useAnimation();
    const queryClient = useQueryClient();

    // Sincronizar estado optimista cuando el padre recibe datos frescos de React Query
    const prevEnabled = useRef(data.enabled);
    if (prevEnabled.current !== data.enabled) {
        prevEnabled.current = data.enabled;
        setOptimisticEnabled(data.enabled);
    }

    // Animación de Error (Shake)
    const triggerShake = async () => {
        await controls.start({
            x: [0, -5, 5, -5, 5, 0],
            transition: { duration: 0.4 }
        });
    };

    // Mutación real contra Supabase
    const executeToggle = async (newState: boolean) => {
        // UI Optimista: mover el switch al instante
        setOptimisticEnabled(newState);
        setIsUpdating(true);

        try {
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ auto_pilot_enabled: newState })
                .eq('id', userId);

            if (updateError) throw updateError;

            // Toast de éxito
            toast.success(newState ? t('autopilot.toasts.activated') : t('autopilot.toasts.paused'));

            // Refrescar los datos del dashboard
            queryClient.invalidateQueries({ queryKey: ['dashboard-full'] });

        } catch (error) {
            // Revertir estado optimista al valor anterior
            setOptimisticEnabled(!newState);
            console.error(error);
            toast.error(t('autopilot.toasts.error'));
            triggerShake();
        } finally {
            setIsUpdating(false);
        }
    };

    const handleToggle = async () => {
        if (isUpdating) return;

        const isTurningOn = !optimisticEnabled;

        // Validaciones estrictas solo al intentar ENCENDER
        if (isTurningOn) {
            // Candado 1: Plan (Peaje)
            if (data.plan !== 'pro' && data.plan !== 'business') {
                toast.error(t('autopilot.toasts.locks.plan'));
                triggerShake();
                return;
            }

            // Candado 2: Integración (Agnóstica)
            if (data.integrationCount === 0) {
                toast.error(t('autopilot.toasts.locks.integration'));
                triggerShake();
                return;
            }

            // Candado 3: Cerebro Entrenado — booleano del padre, sin hardcoding
            if (!data.hasTrainedBrain) {
                toast.error(t('autopilot.toasts.locks.brand'));
                triggerShake();
                return;
            }

            // Candado 4: Seguro de Créditos — AlertDialog elegante en vez de window.confirm
            if (data.queuedCount > 50) {
                setShowCreditWarning(true);
                return; // El flujo continúa en onConfirmCreditWarning
            }
        }

        // Si pasó todas las validaciones o está apagando, ejecutar
        await executeToggle(isTurningOn);
    };

    // Callback cuando el usuario confirma el AlertDialog de créditos
    const onConfirmCreditWarning = async () => {
        setShowCreditWarning(false);
        await executeToggle(true);
    };

    return (
        <>
            <motion.div animate={controls} className="flex items-center gap-3 bg-secondary/80 dark:bg-zinc-900/50 px-3 py-1.5 rounded-full border border-border/50 shadow-sm">
                <span className="text-sm font-bold tracking-tight text-foreground dark:text-white hidden md:block select-none">
                    {t('autopilot.label')}
                </span>
                <button
                    onClick={handleToggle}
                    disabled={isUpdating}
                    className={`relative flex h-8 w-14 items-center rounded-full p-1 transition-all duration-300 outline-none ${optimisticEnabled
                        ? "bg-gradient-to-r from-indigo-600 to-cyan-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] border-transparent"
                        : "bg-black/10 dark:bg-zinc-800 border border-border/80 hover:bg-black/20 dark:hover:bg-zinc-700"
                        } ${isUpdating ? "opacity-50 cursor-wait" : "cursor-pointer"}`}
                    aria-label={t('common.aria.toggle_autopilot')}
                >
                    {/* Thumb/Slider */}
                    <motion.div
                        layout
                        transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30
                        }}
                        className={`flex h-6 w-6 items-center justify-center rounded-full shadow-md z-10 ${optimisticEnabled
                            ? "mx-0 bg-white ml-auto"
                            : "mx-0 bg-white dark:bg-zinc-400/90 ml-0 shadow-sm"
                            }`}
                    >
                        <Zap className={`h-3.5 w-3.5 ${optimisticEnabled ? "fill-current text-indigo-500" : "text-muted-foreground dark:text-zinc-800"}`} />
                    </motion.div>

                    {/* Fondo de carga (si está actualizando) */}
                    {isUpdating && (
                        <div className="absolute inset-0 bg-black/10 dark:bg-black/20 rounded-full animate-pulse z-20"></div>
                    )}
                </button>
            </motion.div>

            {/* AlertDialog: Seguro de Créditos */}
            <AlertDialog open={showCreditWarning} onOpenChange={setShowCreditWarning}>
                <AlertDialogContent className="bg-card border-border dark:bg-zinc-900 dark:border-zinc-800">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-foreground">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10">
                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                            </div>
                            {t('autopilot.warnings.credits_title')}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground leading-relaxed pt-2">
                            {t('autopilot.warnings.credits_body', { count: data.queuedCount })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="pt-2">
                        <AlertDialogCancel className="dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-700">
                            {t('autopilot.warnings.cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={onConfirmCreditWarning}
                            className="bg-gradient-to-r from-indigo-600 to-cyan-500 text-white border-transparent hover:opacity-90 shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                        >
                            {t('autopilot.warnings.confirm')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
