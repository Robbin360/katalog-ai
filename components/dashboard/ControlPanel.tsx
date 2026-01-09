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
import { Sliders, Download, Save, RefreshCw, Globe, Users, Mic, Copy } from "lucide-react"

export default function ControlPanel() {
  const { selectedProductId } = useFoundryStore()
  const queryClient = useQueryClient()
  const [isSaving, setIsSaving] = useState(false)

  // Estados locales con valores por defecto seguros
  const [tone, setTone] = useState("Profesional y Persuasivo")
  const [language, setLanguage] = useState("Español")
  const [audience, setAudience] = useState("General")
  const [forbidden, setForbidden] = useState("")

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    }
  })
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
      const { error } = await supabase.from('brand_rules').upsert({
        user_id: userId,
        tone_voice: tone,
        language: language,
        target_audience: audience,
        forbidden_words: forbiddenArray
      }, { onConflict: 'user_id' })

      if (error) throw error
      queryClient.invalidateQueries({ queryKey: ['brand-rules'] })
      alert("Cerebro actualizado")
    } catch (e: any) {
      alert("Error: " + e.message)
    } finally {
      setIsSaving(false)
    }
  }

  // Lógica Exportar
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

  return (
    <div className="h-full bg-zinc-950 border-l border-zinc-800 flex flex-col font-sans">
      <Tabs defaultValue="config" className="flex-1 flex flex-col">
        {/* HEADER MEJORADO: Más contraste */}
        <div className="p-3 border-b border-zinc-800 bg-zinc-900">
          <TabsList className="w-full bg-zinc-950 border border-zinc-800 grid grid-cols-2">
            <TabsTrigger value="config" className="text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-500">
              <Sliders className="w-3 h-3 mr-2" /> Configuración IA
            </TabsTrigger>
            <TabsTrigger value="export" className="text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-500">
              <Download className="w-3 h-3 mr-2" /> Exportar
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="config" className="flex-1 min-h-0 m-0">
          <ScrollArea className="h-full p-6">
            <div className="space-y-8">

              {/* Tono de Voz - ARREGLADO EL CSS */}
              <div className="space-y-3">
                <Label className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider flex items-center gap-2">
                  <Mic className="w-3 h-3" /> Tono de Voz
                </Label>
                <Select value={tone} onValueChange={setTone}>
                  {/* w-full para que ocupe todo el espacio */}
                  <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 text-zinc-200">
                    <SelectValue placeholder="Selecciona un tono" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                    <SelectItem value="Profesional y Persuasivo">👔 Profesional</SelectItem>
                    <SelectItem value="Lujo y Minimalista">💎 Lujo / Premium</SelectItem>
                    <SelectItem value="Urgencia y Oferta">🔥 Agresivo / Ventas</SelectItem>
                    <SelectItem value="Sarcástico y con emojis">😎 Sarcástico</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Público Objetivo */}
              <div className="space-y-3">
                <Label className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider flex items-center gap-2">
                  <Users className="w-3 h-3" /> Público Objetivo
                </Label>
                <Select value={audience} onValueChange={setAudience}>
                  <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 text-zinc-200">
                    <SelectValue placeholder="¿Para quién es?" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="Gen Z">Gen Z (Jóvenes)</SelectItem>
                    <SelectItem value="Profesionales">Profesionales</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Idioma */}
              <div className="space-y-3">
                <Label className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider flex items-center gap-2">
                  <Globe className="w-3 h-3" /> Idioma
                </Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 text-zinc-200">
                    <SelectValue placeholder="Idioma" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                    <SelectItem value="Español">Español</SelectItem>
                    <SelectItem value="Inglés">English</SelectItem>
                    <SelectItem value="Portugués">Português</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator className="bg-zinc-800" />

              {/* Palabras Prohibidas */}
              <div className="space-y-3">
                <Label className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider">Palabras Prohibidas</Label>
                <Input
                  value={forbidden}
                  onChange={(e) => setForbidden(e.target.value)}
                  placeholder="Ej: barato, malo"
                  className="bg-zinc-900 border-zinc-800 text-zinc-200"
                />
              </div>

              <Button onClick={handleSaveRules} disabled={isSaving} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold">
                {isSaving ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Actualizar Cerebro
              </Button>

            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="export" className="flex-1 min-h-0 m-0">
          {/* (Contenido de exportación igual...) */}
          {!selectedProductId ? (
            <div className="p-10 text-center text-zinc-600 text-sm">Selecciona un activo</div>
          ) : (
            <ScrollArea className="h-full p-6 space-y-6">
              <div className="space-y-4">
                <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                  <Label className="text-zinc-500 text-[10px] uppercase">Shopify HTML</Label>
                  <p className="text-[10px] text-zinc-400 font-mono mt-2 line-clamp-3">
                    {aiData.description_html || "N/A"}
                  </p>
                  <Button variant="link" className="p-0 h-auto text-indigo-400 text-xs mt-2" onClick={() => navigator.clipboard.writeText(aiData.description_html)}>
                    Copiar HTML
                  </Button>
                </div>
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}