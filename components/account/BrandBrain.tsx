"use client"

import { useEffect, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useI18n } from "@/lib/i18n-context"

type ToneVoice = "professional" | "friendly" | "aspirational" | "technical" | "minimalist" | "storytelling"
type TargetAudience = "consumer" | "business" | "reseller"
type Language = "Español" | "English" | "Português" | "Français"

interface BrandRules {
  id?: number
  user_id?: string
  tone_voice: ToneVoice
  target_audience: TargetAudience
  language: Language
  forbidden_words: string[]
}

const TONE_OPTIONS: { id: ToneVoice; label: string; desc: string; isDefault?: boolean }[] = [
  // Anchors seguros primero (para catálogo mixto)
  { 
    id: 'professional', 
    label: 'Professional', 
    desc: 'Clear, direct, results-oriented. Authoritative without being stiff.',
    isDefault: true 
  },
  { 
    id: 'friendly', 
    label: 'Friendly', 
    desc: 'Approachable, accessible, no technical jargon. Warm and human.' 
  },
  // Opciones de nicho después
  { 
    id: 'aspirational', 
    label: 'Aspirational', 
    desc: 'Lifestyle, desire, exclusivity. Sells identity and transformation.' 
  },
  { 
    id: 'technical', 
    label: 'Technical', 
    desc: 'Specifications, data, evidence. Precision-focused.' 
  },
  { 
    id: 'minimalist', 
    label: 'Minimalist', 
    desc: 'Clean, concise, premium. Less is more. Apple, Aesop, Muji style.' 
  },
  { 
    id: 'storytelling', 
    label: 'Storytelling', 
    desc: 'Narrative, heritage, handmade. Craft and provenance.' 
  },
]

const AUDIENCE_OPTIONS: { id: TargetAudience; label: string; desc: string; isDefault?: boolean }[] = [
  { 
    id: 'consumer', 
    label: 'Consumer', 
    desc: 'B2C: Quick, emotional purchase decisions.',
    isDefault: true 
  },
  { 
    id: 'business', 
    label: 'Business', 
    desc: 'B2B: Rational, ROI-driven purchase decisions.' 
  },
  { 
    id: 'reseller', 
    label: 'Reseller', 
    desc: 'Wholesale, distributor, volume buyer.' 
  },
]

const LANGUAGES: Language[] = ["English", "Español", "Português", "Français"]

const DEFAULTS: BrandRules = {
  tone_voice: "professional",
  target_audience: "consumer",
  language: "English",
  forbidden_words: [],
}

function buildPreview(rules: BrandRules, t?: any): string {
  const selectedTone = TONE_OPTIONS.find(opt => opt.id === rules.tone_voice) || TONE_OPTIONS[0]
  const selectedAudience = AUDIENCE_OPTIONS.find(opt => opt.id === rules.target_audience) || AUDIENCE_OPTIONS[0]
  
  const toneLabel = t ? (t(`account.brain.tones.${selectedTone.id}.label`) || selectedTone.label) : selectedTone.label
  const audienceLabel = t ? (t(`account.brain.audiences.${selectedAudience.id}.label`) || selectedAudience.label) : selectedAudience.label

  const forbidden =
    rules.forbidden_words.length > 0
      ? (t ? t('account.brain.preview.never', { words: rules.forbidden_words.join(", ") }) : ` Never use: ${rules.forbidden_words.join(", ")}.`)
      : ""

  if (t && t('account.brain.preview.write_with_tone')) {
    return t('account.brain.preview.write_with_tone', {
      lang: rules.language || 'English',
      tone: toneLabel,
      audience: audienceLabel
    }) + forbidden
  }

  return `Write copy in ${rules.language || 'English'} with ${selectedTone.label} tone for ${selectedAudience.label}.${forbidden}`
}

async function fetchBrandRules(): Promise<BrandRules> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No user authenticated")

  const { data, error } = await supabase
    .from("brand_rules")
    .select("id, user_id, tone_voice, target_audience, language, forbidden_words")
    .eq("user_id", user.id)
    .maybeSingle()
  
  if (error) throw error
  if (!data) return { ...DEFAULTS, user_id: user.id }
  
  return {
    id: data.id,
    user_id: data.user_id,
    tone_voice: (data.tone_voice as ToneVoice) ?? DEFAULTS.tone_voice,
    target_audience: (data.target_audience as TargetAudience) ?? DEFAULTS.target_audience,
    language: (data.language as Language) ?? DEFAULTS.language,
    forbidden_words: data.forbidden_words ?? [],
  }
}

async function saveBrandRules(rules: BrandRules): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No user authenticated")

    const payload = {
    user_id: user.id,
    tone_voice: rules.tone_voice,
    target_audience: rules.target_audience,
    language: rules.language,
    forbidden_words: rules.forbidden_words,
    updated_at: new Date().toISOString()
  }

  const { error } = await supabase
    .from("brand_rules")
    .upsert(payload, { onConflict: 'user_id' })
  
  if (error) throw error
}

function OptionCard({ label, desc, isDefault, active, onClick, t_badge }: {
  label: string; desc: string; isDefault?: boolean; active: boolean; onClick: () => void; t_badge?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex flex-col gap-1 rounded-xl border p-3 text-left transition-all duration-200",
        active
          ? "ring-2 ring-emerald-500 bg-emerald-500/10 border-transparent dark:bg-emerald-500/10"
          : "border-border bg-card hover:bg-muted dark:border-zinc-800 dark:hover:bg-zinc-900/50 dark:bg-transparent"
      )}
    >
      {isDefault && (
        <span className={cn(
          "absolute right-2 top-2 rounded-full border px-2 py-0.5 text-[10px]",
          active ? "border-emerald-500/40 text-emerald-600 dark:text-emerald-400" : "border-border text-muted-foreground/50 dark:border-zinc-800 dark:text-zinc-500"
        )}>
          {t_badge || "default"}
        </span>
      )}
      <span className={cn("text-sm font-medium", active ? "text-emerald-700 dark:text-emerald-400" : "text-foreground/80 dark:text-zinc-300")}>
        {label}
      </span>
      <span className="text-xs text-muted-foreground dark:text-zinc-500 leading-snug">{desc}</span>
    </button>
  )
}

function PillOption({ label, active, onClick }: {
  label: string; active: boolean; onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-1.5 text-xs transition-all duration-200",
        active
          ? "ring-2 ring-emerald-500 bg-emerald-500/10 border-transparent text-emerald-700 dark:text-emerald-400"
          : "border-border bg-card hover:bg-muted text-muted-foreground dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900/50 dark:hover:text-zinc-300 dark:bg-transparent"
      )}
    >
      {label}
    </button>
  )
}

export function BrandBrainTab() {
  const { t } = useI18n()
  const queryClient = useQueryClient()
  const [tagInput, setTagInput] = useState("")
  const [local, setLocal] = useState<BrandRules | null>(null)

  const { data: saved, isLoading } = useQuery({
    queryKey: ["brand-rules"],
    queryFn: fetchBrandRules,
  })

  useEffect(() => {
    if (saved && !local) {
      setLocal(saved)
    }
  }, [saved, local])

  const rules: BrandRules = local ?? saved ?? DEFAULTS

  const { mutate: save, isPending } = useMutation({
    mutationFn: saveBrandRules,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brand-rules"] })
      toast.success(t('account.brain.toasts.success'))
    },
    onError: () => toast.error(t('account.brain.toasts.error')),
  })

  function patch(fields: Partial<BrandRules>) {
    setLocal((prev) => ({ ...(prev ?? rules), ...fields }))
  }

  function addTag() {
    const word = tagInput.trim().toLowerCase()
    if (!word || rules.forbidden_words.includes(word)) return
    patch({ forbidden_words: [...rules.forbidden_words, word] })
    setTagInput("")
  }

  function removeTag(word: string) {
    patch({ forbidden_words: rules.forbidden_words.filter((w) => w !== word) })
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") { e.preventDefault(); addTag() }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <span className="text-sm text-muted-foreground">{t('account.brain.loading')}</span>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-full">

      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div>
          <p className="text-sm font-medium text-foreground/80">{t('account.brain.voice_title')}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{t('account.brain.voice_subtitle')}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {TONE_OPTIONS.map((t_meta) => (
            <OptionCard
              key={t_meta.id}
              label={t(`account.brain.tones.${t_meta.id}.label`) || t_meta.label}
              desc={t(`account.brain.tones.${t_meta.id}.desc`) || t_meta.desc}
              isDefault={t_meta.isDefault}
              active={rules.tone_voice === t_meta.id}
              onClick={() => patch({ tone_voice: t_meta.id })}
              t_badge={t('account.brain.badge_default')}
            />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div>
          <p className="text-sm font-medium text-foreground/80">{t('account.brain.audience_title')}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{t('account.brain.audience_subtitle')}</p>
        </div>
        <Label className="text-[11px] uppercase tracking-widest text-muted-foreground/50 block">
          {t('account.brain.buyer_type')}
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {AUDIENCE_OPTIONS.map((a_meta) => (
            <OptionCard
              key={a_meta.id}
              label={t(`account.brain.audiences.${a_meta.id}.label`) || a_meta.label}
              desc={t(`account.brain.audiences.${a_meta.id}.desc`) || a_meta.desc}
              isDefault={a_meta.isDefault}
              active={rules.target_audience === a_meta.id}
              onClick={() => patch({ target_audience: a_meta.id })}
              t_badge={t('account.brain.badge_default')}
            />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div>
          <p className="text-sm font-medium text-foreground/80">{t('account.brain.lang_title')}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{t('account.brain.lang_subtitle')}</p>
        </div>
        <div>
          <Label className="text-[11px] uppercase tracking-widest text-muted-foreground/50 mb-2 block">
            {t('account.brain.lang_label')}
          </Label>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((lang) => (
              <PillOption
                key={lang}
                label={lang}
                active={rules.language === lang}
                onClick={() => patch({ language: lang })}
              />
            ))}
          </div>
        </div>
        <div>
          <Label className="text-[11px] uppercase tracking-widest text-muted-foreground/50 mb-2 block">
            {t('account.brain.forbidden_label')}
          </Label>
          <div className="flex flex-wrap gap-1.5 rounded-xl border border-border bg-muted/30 p-2.5 min-h-[44px] items-center">
            {rules.forbidden_words.map((word) => (
              <Badge
                key={word}
                variant="secondary"
                className="flex items-center gap-1 bg-muted text-foreground/60 border-border text-xs font-normal"
              >
                {word}
                <button
                  type="button"
                  onClick={() => removeTag(word)}
                  className="ml-0.5 text-muted-foreground hover:text-foreground transition-colors leading-none"
                >
                  ×
                </button>
              </Badge>
            ))}
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onBlur={addTag}
              placeholder={t('account.brain.forbidden_placeholder')}
              className="h-auto flex-1 min-w-[140px] border-none bg-transparent p-0 text-xs text-foreground/60 placeholder:text-muted-foreground/40 focus-visible:ring-0 shadow-none"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground/40 mb-1.5">
          {t('account.brain.instruction_header')}
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed italic">
          {buildPreview(rules, t)}
        </p>
      </div>

      <div className="flex justify-end pt-1">
        <Button
          onClick={() => save(rules)}
          disabled={isPending}
          className="bg-primary hover:bg-primary/90 text-white font-medium px-6"
        >
          {isPending ? t('account.brain.saving_btn') : t('account.brain.save_btn')}
        </Button>
      </div>

    </div>
  )
}