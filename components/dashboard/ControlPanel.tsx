"use client"

import { useState, useEffect } from "react"
import { useFoundryStore } from "@/store/useFoundryStore"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Sliders, Download, Copy, Save, RefreshCw } from "lucide-react"

export default function ControlPanel() {
  const { selectedProductId } = useFoundryStore()
  const queryClient = useQueryClient()
  const [isSaving, setIsSaving] = useState(false)

  // Estados locales para el formulario
  const [tone, setTone] = useState("")
  const [forbidden, setForbidden] = useState("")

  // 1. Obtener el Usuario Actual
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    }
  })

  const userId = user?.id

  // 2. Cargar las Reglas de Marca
  const { data: rules } = useQuery({
    queryKey: ['brand-rules', userId],
    queryFn: async () => {
      if (!userId) return null
      const { data } = await supabase
        .from('brand_rules')
        .select('*')
        .eq('user_id', userId)
        .single()
      return data
    },
    enabled: !!userId
  })

  // Sincronizar campos cuando cargan las reglas de la DB
  useEffect(() => {
    if (rules) {
      setTone(rules.tone_voice || "")
      setForbidden(rules.forbidden_words ? rules.forbidden_words.join(", ") : "")
    }
  }, [rules])

  // 3. Función para Guardar (UPSERT)
  const handleSaveRules = async () => {
    if (!userId) return
    setIsSaving(true)
    try {
      const forbiddenArray = forbidden.split(",").map(s => s.trim()).filter(s => s.length > 0)

      const { error } = await supabase
        .from('brand_rules')
        .upsert({
          user_id: userId,
          tone_voice: tone,
          forbidden_words: forbiddenArray
        }, { onConflict: 'user_id' })

      if (error) throw error

      alert("Configuración de IA guardada.")
      queryClient.invalidateQueries({ queryKey: ['brand-rules'] })
    } catch (e: any) {
      alert("Error: " + e.message)
    } finally {
      setIsSaving(false)
    }
  }

  // 4. Datos para Exportación
  const { data: product } = useQuery({
    queryKey: ['product-export', selectedProductId],
    queryFn: async () => {
      if (!selectedProductId) return null
      const { data } = await supabase
        .from('products_queue')
        .select('ai_output')
        .eq('id', selectedProductId)
        .single()
      return data
    },
    enabled: !!selectedProductId
  })

  const aiData = product?.ai_output || {}

  return (
    <div className="h-full bg-zinc-950 border-l border-zinc-800 flex flex-col font-sans">
      <Tabs defaultValue="config" className="flex-1 flex flex-col">
        <div className="p-3 border-b border-zinc-800 bg-zinc-900/30">
          <TabsList className="w-full bg-zinc-900 grid grid-cols-2">
            <TabsTrigger value="config" className="text-xs flex items-center gap-2">
              <Sliders className="w-3 h-3" /> Configuración
            </TabsTrigger>
            <TabsTrigger value="export" className="text-xs flex items-center gap-2">
              <Download className="w-3 h-3" /> Exportar
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="config" className="flex-1 min-h-0 m-0">
          <ScrollArea className="h-full p-6">
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-zinc-400 text-xs uppercase font-bold tracking-wider">Identidad de la IA</Label>
                <div className="space-y-2">
                  <span className="text-xs text-zinc-500">Tono de Voz</span>
                  <Textarea
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    placeholder="Ej: Profesional y persuasivo..."
                    className="bg-zinc-900 border-zinc-800 text-sm min-h-[80px]"
                  />
                </div>
              </div>

              <Separator className="bg-zinc-800" />

              <div className="space-y-3">
                <Label className="text-zinc-400 text-xs uppercase font-bold tracking-wider">Restricciones</Label>
                <Input
                  value={forbidden}
                  onChange={(e) => setForbidden(e.target.value)}
                  placeholder="Palabras prohibidas..."
                  className="bg-zinc-900 border-zinc-800 text-sm"
                />
              </div>

              <Button
                onClick={handleSaveRules}
                disabled={isSaving || !userId}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
              >
                {isSaving ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Guardar Reglas
              </Button>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="export" className="flex-1 min-h-0 m-0">
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
                  <Button
                    variant="link"
                    className="p-0 h-auto text-indigo-400 text-xs mt-2"
                    onClick={() => navigator.clipboard.writeText(aiData.description_html)}
                  >
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