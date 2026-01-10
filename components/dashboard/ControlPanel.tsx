"use client"

import { useState, useEffect } from "react"
import { useFoundryStore } from "@/store/useFoundryStore"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Sliders, Download, Save, RefreshCw, Globe, Users, Mic, Copy } from "lucide-react"

export default function ControlPanel() {
  const { selectedProductId } = useFoundryStore()
  const queryClient = useQueryClient()
  const [isSaving, setIsSaving] = useState(false)
  const [tone, setTone] = useState("Profesional y Persuasivo")
  const [language, setLanguage] = useState("Español")
  const [audience, setAudience] = useState("General")
  const [forbidden, setForbidden] = useState("")

  const { data: user } = useQuery({ queryKey: ['current-user'], queryFn: async () => { const { data } = await supabase.auth.getUser(); return data.user } })
  const userId = user?.id

  const { data: rules } = useQuery({
    queryKey: ['brand-rules', userId],
    queryFn: async () => {
      if (!userId) return null
      const { data } = await supabase.from('brand_rules').select('*').eq('user_id', userId).single()
      return data
    },
    enabled: !!userId
  })

  useEffect(() => {
    if (rules) {
      if (rules.tone_voice) setTone(rules.tone_voice)
      if (rules.language) setLanguage(rules.language)
      if (rules.target_audience) setAudience(rules.target_audience)
      setForbidden(rules.forbidden_words ? rules.forbidden_words.join(", ") : "")
    }
  }, [rules])

  const handleSaveRules = async () => {
    if (!userId) return
    setIsSaving(true)
    try {
      const forbiddenArray = forbidden.split(",").map(s => s.trim()).filter(s => s.length > 0)
      const { error } = await supabase.from('brand_rules').upsert({ user_id: userId, tone_voice: tone, language: language, target_audience: audience, forbidden_words: forbiddenArray }, { onConflict: 'user_id' })
      if (error) throw error
      queryClient.invalidateQueries({ queryKey: ['brand-rules'] })
      alert("Guardado correctamente")
    } catch (e: any) { alert("Error: " + e.message) } finally { setIsSaving(false) }
  }

  const { data: product } = useQuery({
    queryKey: ['product-export', selectedProductId],
    queryFn: async () => {
      if (!selectedProductId) return null
      const { data } = await supabase.from('products_queue').select('ai_output').eq('id', selectedProductId).single()
      return data
    },
    enabled: !!selectedProductId
  })
  const aiData = product?.ai_output || {}

  const copyToClipboard = (text: string) => { if (text) navigator.clipboard.writeText(text); alert("Copiado") }

  return (
    <div className="h-full bg-zinc-950 border-l border-zinc-800 flex flex-col font-sans">
      <Tabs defaultValue="config" className="flex-1 flex flex-col">

        {/* HEADER LIMPIO (Sin "IA" para evitar problemas de traducción) */}
        <div className="p-3 border-b border-zinc-800 bg-zinc-900">
          <TabsList className="w-full bg-zinc-950 border border-zinc-800 grid grid-cols-2">
            <TabsTrigger value="config" className="text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-500">
              <Sliders className="w-3 h-3 mr-2" />
              <span>Configuración</span>
            </TabsTrigger>
            <TabsTrigger value="export" className="text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-500">
              <Download className="w-3 h-3 mr-2" />
              <span>Exportar</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="config" className="flex-1 min-h-0 m-0">
          <ScrollArea className="h-full p-6">
            <div className="space-y-8">

              <div className="space-y-3">
                <Label className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider flex items-center gap-2">
                  <Mic className="w-3 h-3" />
                  <span>Tono de Voz</span>
                </Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 text-zinc-200">
                    <SelectValue placeholder="Selecciona..." />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                    <SelectItem value="Profesional y Persuasivo"><span>Profesional</span></SelectItem>
                    <SelectItem value="Lujo y Minimalista"><span>Lujo / Premium</span></SelectItem>
                    <SelectItem value="Urgencia y Oferta"><span>Agresivo / Ventas</span></SelectItem>
                    <SelectItem value="Sarcástico y con emojis"><span>Sarcástico</span></SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider flex items-center gap-2">
                  <Users className="w-3 h-3" />
                  <span>Público Objetivo</span>
                </Label>
                <Select value={audience} onValueChange={setAudience}>
                  <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 text-zinc-200">
                    <SelectValue placeholder="Selecciona..." />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                    <SelectItem value="General"><span>General</span></SelectItem>
                    <SelectItem value="Gen Z"><span>Gen Z (Jóvenes)</span></SelectItem>
                    <SelectItem value="Profesionales"><span>Profesionales</span></SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider flex items-center gap-2">
                  <Globe className="w-3 h-3" />
                  <span>Idioma de Salida</span>
                </Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 text-zinc-200">
                    <SelectValue placeholder="Selecciona..." />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                    <SelectItem value="Español"><span>Español</span></SelectItem>
                    <SelectItem value="Inglés"><span>English</span></SelectItem>
                    <SelectItem value="Portugués"><span>Português</span></SelectItem>
                    <SelectItem value="Chino"><span>中文 (Chino)</span></SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator className="bg-zinc-800" />

              <div className="space-y-3">
                <Label className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider">
                  <span>Palabras Prohibidas</span>
                </Label>
                <Input value={forbidden} onChange={(e) => setForbidden(e.target.value)} placeholder="..." className="bg-zinc-900 border-zinc-800 text-zinc-200" />
              </div>

              <Button onClick={handleSaveRules} disabled={isSaving} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold">
                {isSaving ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                <span>Guardar Configuración</span>
              </Button>

            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="export" className="flex-1 min-h-0 m-0">
          {!selectedProductId ? (
            <div className="p-10 text-center text-zinc-600 text-sm"><span>Selecciona un activo</span></div>
          ) : (
            <ScrollArea className="h-full p-6 space-y-6">
              <div className="space-y-2">
                <Label className="text-zinc-300 text-[10px] font-bold uppercase"><span>HTML para Shopify</span></Label>
                <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-md text-[10px] text-zinc-500 font-mono h-24 overflow-hidden relative group">
                  {aiData.description_html || "N/A"}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent pointer-events-none" />
                </div>
                <Button variant="outline" size="sm" className="w-full border-zinc-700 text-zinc-300 hover:text-white" onClick={() => copyToClipboard(aiData.description_html)}>
                  <Copy className="w-3 h-3 mr-2" /> <span>Copiar HTML</span>
                </Button>
              </div>
              <Separator className="bg-zinc-800" />
              <div className="space-y-2">
                <Label className="text-zinc-300 text-[10px] font-bold uppercase"><span>Meta Description</span></Label>
                <p className="text-xs text-zinc-500 bg-zinc-900/50 p-2 rounded border border-zinc-800">{aiData.short_description}</p>
                <Button variant="outline" size="sm" className="w-full border-zinc-700 text-zinc-300 hover:text-white" onClick={() => copyToClipboard(aiData.short_description)}>
                  <Copy className="w-3 h-3 mr-2" /> <span>Copiar Meta</span>
                </Button>
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}