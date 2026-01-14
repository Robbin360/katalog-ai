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

  // Valores por defecto
  const [tone, setTone] = useState("Professional and Persuasive")
  const [language, setLanguage] = useState("Spanish")
  const [audience, setAudience] = useState("General")
  const [forbidden, setForbidden] = useState("")

  // 1. Obtener usuario
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    }
  })
  const userId = user?.id

  // 2. Cargar reglas
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

  // 3. Guardar reglas
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
      alert("AI Brain Updated Successfully")
    } catch (e: any) {
      alert("Error: " + e.message)
    } finally {
      setIsSaving(false)
    }
  }

  // 4. Datos de exportación
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

  const copyToClipboard = (text: string) => {
    if (text) navigator.clipboard.writeText(text);
    alert("Copied to clipboard")
  }

  // --- SOLUCIÓN TÉCNICA: Tipado explícito del retorno ---
  const renderExportTab = (): React.ReactNode => {
    if (!selectedProductId) {
      return (
        <div className="p-10 text-center text-zinc-600 text-sm">
          <span>Select an asset to view export options</span>
        </div>
      )
    }

    return (
      <ScrollArea className="h-full p-6 space-y-6">
        <div className="space-y-2">
          <Label className="text-zinc-300 text-[10px] font-bold uppercase"><span>Shopify HTML</span></Label>
          <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-md text-[10px] text-zinc-500 font-mono h-24 overflow-hidden relative group">
            {aiData.description_html || "N/A"}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent pointer-events-none" />
          </div>
          <Button variant="outline" size="sm" className="w-full border-zinc-700 text-zinc-300 hover:text-white" onClick={() => copyToClipboard(aiData.description_html)}>
            <Copy className="w-3 h-3 mr-2" /> <span>Copy HTML</span>
          </Button>
        </div>

        <Separator className="bg-zinc-800" />

        <div className="space-y-2">
          <Label className="text-zinc-300 text-[10px] font-bold uppercase"><span>Meta Description</span></Label>
          <p className="text-xs text-zinc-500 bg-zinc-900/50 p-2 rounded border border-zinc-800">
            {aiData.short_description}
          </p>
          <Button variant="outline" size="sm" className="w-full border-zinc-700 text-zinc-300 hover:text-white" onClick={() => copyToClipboard(aiData.short_description)}>
            <Copy className="w-3 h-3 mr-2" /> <span>Copy Meta</span>
          </Button>
        </div>

        <div className="space-y-2">
          <Label className="text-zinc-300 text-[10px] font-bold uppercase"><span>Keywords CSV</span></Label>
          <p className="text-xs text-zinc-500 bg-zinc-900/50 p-2 rounded border border-zinc-800 truncate">
            {aiData.seo_tags}
          </p>
          <Button variant="outline" size="sm" className="w-full border-zinc-700 text-zinc-300 hover:text-white" onClick={() => copyToClipboard(aiData.seo_tags)}>
            <Copy className="w-3 h-3 mr-2" /> <span>Copy Tags</span>
          </Button>
        </div>
      </ScrollArea>
    )
  }

  return (
    <div className="h-full bg-zinc-950 border-l border-zinc-800 flex flex-col font-sans">
      <Tabs defaultValue="config" className="flex-1 flex flex-col">

        {/* HEADER TABS */}
        <div className="p-3 border-b border-zinc-800 bg-zinc-900">
          <TabsList className="w-full bg-zinc-950 border border-zinc-800 grid grid-cols-2">
            <TabsTrigger value="config" className="text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-500">
              <Sliders className="w-3 h-3 mr-2" />
              <span>AI Config</span>
            </TabsTrigger>
            <TabsTrigger value="export" className="text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-500">
              <Download className="w-3 h-3 mr-2" />
              <span>Export</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="config" className="flex-1 min-h-0 m-0">
          <ScrollArea className="h-full p-6">
            <div className="space-y-8">

              {/* VOICE TONE */}
              <div className="space-y-3">
                <Label className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider flex items-center gap-2">
                  <Mic className="w-3 h-3" />
                  <span>Voice Tone</span>
                </Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 text-zinc-200">
                    <SelectValue placeholder="Select tone..." />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                    <SelectItem value="Professional and Persuasive">👔 <span>Professional</span></SelectItem>
                    <SelectItem value="Luxury and Minimalist">💎 <span>Luxury / Premium</span></SelectItem>
                    <SelectItem value="Urgent and Sales-driven">🔥 <span>Aggressive Sales</span></SelectItem>
                    <SelectItem value="Friendly and Educational">🌱 <span>Friendly / Blog</span></SelectItem>
                    <SelectItem value="Sarcastic and Viral">😎 <span>Sarcastic (Social)</span></SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* TARGET AUDIENCE */}
              <div className="space-y-3">
                <Label className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider flex items-center gap-2">
                  <Users className="w-3 h-3" />
                  <span>Target Audience</span>
                </Label>
                <Select value={audience} onValueChange={setAudience}>
                  <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 text-zinc-200">
                    <SelectValue placeholder="Select audience..." />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                    <SelectItem value="General"><span>General</span></SelectItem>
                    <SelectItem value="Gen Z"><span>Gen Z (Youth)</span></SelectItem>
                    <SelectItem value="Professionals"><span>Professionals / B2B</span></SelectItem>
                    <SelectItem value="Parents"><span>Parents / Home</span></SelectItem>
                    <SelectItem value="Gamers"><span>Gamers / Tech</span></SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* OUTPUT LANGUAGE */}
              <div className="space-y-3">
                <Label className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider flex items-center gap-2">
                  <Globe className="w-3 h-3" />
                  <span>Output Language</span>
                </Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 text-zinc-200">
                    <SelectValue placeholder="Select language..." />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300 max-h-60">
                    <SelectItem value="Spanish"><span>Spanish (Español)</span></SelectItem>
                    <SelectItem value="English"><span>English (US)</span></SelectItem>
                    <SelectItem value="Portuguese"><span>Portuguese (BR)</span></SelectItem>
                    <SelectItem value="French"><span>French (Français)</span></SelectItem>
                    <SelectItem value="German"><span>German (Deutsch)</span></SelectItem>
                    <SelectItem value="Italian"><span>Italian (Italiano)</span></SelectItem>
                    <SelectItem value="Dutch"><span>Dutch (Nederlands)</span></SelectItem>
                    <SelectItem value="Chinese"><span>Chinese (Simplified)</span></SelectItem>
                    <SelectItem value="Japanese"><span>Japanese (日本語)</span></SelectItem>
                    <SelectItem value="Russian"><span>Russian (Русский)</span></SelectItem>
                    <SelectItem value="Korean"><span>Korean (한국어)</span></SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator className="bg-zinc-800" />

              {/* FORBIDDEN WORDS */}
              <div className="space-y-3">
                <Label className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider">
                  <span>Forbidden Words</span>
                </Label>
                <Input
                  value={forbidden}
                  onChange={(e) => setForbidden(e.target.value)}
                  placeholder="e.g. cheap, bad, slow..."
                  className="bg-zinc-900 border-zinc-800 text-zinc-200 placeholder:text-zinc-600"
                />
              </div>

              <Button onClick={handleSaveRules} disabled={isSaving} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold">
                {isSaving ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                <span>Save Configuration</span>
              </Button>

            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="export" className="flex-1 min-h-0 m-0">
          {renderExportTab()}
        </TabsContent>
      </Tabs>
    </div>
  )
}