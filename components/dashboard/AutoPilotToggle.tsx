"use client"

import React, { useState } from 'react';
import { motion, useAnimation } from "framer-motion";
import { Zap } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useI18n } from "@/lib/i18n-context";
import { useQueryClient } from "@tanstack/react-query";

// Tipos requeridos por la consulta actualizada en page.tsx
interface AutoPilotData {
    enabled: boolean;
    integrationCount: number;
    queuedCount: number;
    brandRules: { tone_voice: string, forbidden_words: string[] | null } | null;
    plan: string;
}

export function AutoPilotToggle({ data }: { data: AutoPilotData }) {
    const { t } = useI18n();
    const [isUpdating, setIsUpdating] = useState(false);
    const controls = useAnimation();
    const queryClient = useQueryClient();

    // Animación de Error (Shake)
    const triggerShake = async () => {
        await controls.start({
            x: [0, -5, 5, -5, 5, 0],
            transition: { duration: 0.4 }
        });
    };

    const handleToggle = async () => {
        if (isUpdating) return;

        const isTurningOn = !data.enabled;

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

            // Candado 3: Cerebro Entrenado
            let isTrained = false;
            if (data.brandRules) {
                const hasCustomVoice = data.brandRules.tone_voice &&
                    (data.brandRules.tone_voice !== 'Professional and Persuasive' &&
                        data.brandRules.tone_voice !== 'Profesional y Persuasivo');
                const hasForbiddenWords = data.brandRules.forbidden_words && data.brandRules.forbidden_words.length > 0;

                if (hasCustomVoice || hasForbiddenWords) {
                    isTrained = true;
                }
            }

            if (!isTrained) {
                toast.error(t('autopilot.toasts.locks.brand'));
                triggerShake();
                return;
            }

            // Candado 4: Seguro de Créditos (Warning)
            if (data.queuedCount > 50) {
                const proceed = window.confirm(t('autopilot.warnings.credits', { count: data.queuedCount }));
                if (!proceed) {
                    return;
                }
            }
        }

        // Proceder con la actualización de la BD
        setIsUpdating(true);
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) throw new Error("Unauthenticated");

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ auto_pilot_enabled: isTurningOn })
                .eq('id', user.id);

            if (updateError) throw updateError;

            // Toast de éxito
            toast.success(isTurningOn ? t('autopilot.toasts.activated') : t('autopilot.toasts.paused'));

            // Refrescar los datos del dashboard
            queryClient.invalidateQueries({ queryKey: ['dashboard-full'] });

        } catch (error) {
            console.error(error);
            toast.error(t('autopilot.toasts.error'));
            triggerShake();
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <motion.div animate={controls} className="flex items-center gap-3 bg-secondary/80 dark:bg-zinc-900/50 px-3 py-1.5 rounded-full border border-border/50 shadow-sm">
            <span className="text-sm font-bold tracking-tight text-foreground dark:text-white hidden md:block select-none">
                {t('autopilot.label')}
            </span>
            <button
                onClick={handleToggle}
                disabled={isUpdating}
                className={`relative flex h-8 w-14 items-center rounded-full p-1 transition-all duration-300 outline-none ${data.enabled
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
                    className={`flex h-6 w-6 items-center justify-center rounded-full shadow-md z-10 ${data.enabled
                        ? "mx-0 bg-white ml-auto"
                        : "mx-0 bg-white dark:bg-zinc-400/90 ml-0 shadow-sm"
                        }`}
                >
                    <Zap className={`h-3.5 w-3.5 ${data.enabled ? "fill-current text-indigo-500" : "text-muted-foreground dark:text-zinc-800"}`} />
                </motion.div>

                {/* Fondo de carga (si está actualizando) */}
                {isUpdating && (
                    <div className="absolute inset-0 bg-black/10 dark:bg-black/20 rounded-full animate-pulse z-20"></div>
                )}
            </button>
        </motion.div>
    );
}
