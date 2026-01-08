"use client"

import { useState } from "react"
import { useFoundryStore } from "@/store/useFoundryStore"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Package, Loader2, Plus, Upload, Link as LinkIcon, Image as ImageIcon } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

export default function SidebarList() {
  const { selectedProductId, setSelectedProduct } = useFoundryStore()
  const queryClient = useQueryClient()

  // Estado del Formulario
  const [isUploading, setIsUploading] = useState(false)
  const [activeTab, setActiveTab] = useState("inventory") // 'inventory' | 'new'

  // Datos del formulario
  const [file, setFile] = useState<File | null>(null)
  const [urlInput, setUrlInput] = useState("")
  const [title, setTitle] = useState("")
  const [brand, setBrand] = useState("")
  const [context, setContext] = useState("") // Descripción extra del usuario

  // 1. Fetch de productos (Inventario)
  const { data: products, isLoading } = useQuery({
    queryKey: ['products-list'],
    queryFn: async () => {
      const { data } = await supabase
        .from('products_queue')
        .select('id, status, ai_output, created_at')
        .order('created_at', { ascending: false })
      return data
    }
  })

  // 2. Función de Subida (La Magia)
  const handleUpload = async () => {
    try {
      setIsUploading(true)
      let finalImageUrl = urlInput

      // A. Si hay archivo, lo subimos a Supabase Storage
      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(fileName, file)

        if (uploadError) throw uploadError

        // Obtenemos la URL pública
        const { data: urlData } = supabase.storage
          .from('images')
          .getPublicUrl(fileName)

        finalImageUrl = urlData.publicUrl
      }

      if (!finalImageUrl) throw new Error("Necesitas una imagen (Archivo o URL)")

      // B. Guardamos en la Base de Datos (Cola de n8n)
      // Usamos el ID de tu usuario (o el que estés usando en auth)
      // Para MVP usamos hardcoded o auth.getUser() si ya lo implementamos.
      // Aquí asumimos el ID que usaste antes para que n8n detecte las reglas.
      // 1. Obtener el usuario autenticado real
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("No hay sesión activa. Por favor inicia sesión.")
      }

      const userId = user.id // ¡Ahora es el ID dinámico de quien estéUpload`**.

      const { error: dbError } = await supabase
        .from('products_queue')
        .insert({
          user_id: userId,
          original_image_url: finalImageUrl,
          status: 'QUEUED',
          raw_data: {
            title: title || "Producto sin nombre", // Título manual
            brand: brand,
            user_context: context // La descripción extra que pediste
          }
        })

      if (dbError) throw dbError

      // C. Limpieza y Refresco
      setFile(null)
      setUrlInput("")
      setTitle("")
      setBrand("")
      setContext("")
      setActiveTab("inventory") // Volver a la lista
      queryClient.invalidateQueries({ queryKey: ['products-list'] }) // Recargar lista

    } catch (error) {
      alert("Error al subir: " + error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="h-full flex flex-col bg-zinc-950 border-r border-zinc-800">

      {/* Tabs de Navegación */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="p-3 border-b border-zinc-800">
          <TabsList className="w-full bg-zinc-900 grid grid-cols-2">
            <TabsTrigger value="inventory" className="text-xs">Inventario</TabsTrigger>
            <TabsTrigger value="new" className="text-xs flex gap-2 items-center">
              <Plus className="w-3 h-3" /> Nuevo
            </TabsTrigger>
          </TabsList>
        </div>

        {/* PESTAÑA 1: INVENTARIO (LISTA) */}
        <TabsContent value="inventory" className="flex-1 min-h-0 m-0">
          {isLoading ? (
            <div className="flex h-20 items-center justify-center text-zinc-600">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="flex flex-col p-2 gap-1">
                {products?.map((item) => {
                  const itemTitle = item.ai_output?.producto || item.ai_output?.title || `Asset #${item.id}`;
                  const isSelected = selectedProductId === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedProduct(item.id)}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg text-left transition-all duration-200",
                        isSelected
                          ? "bg-zinc-900 border border-zinc-700 shadow-sm"
                          : "hover:bg-zinc-900/50 border border-transparent"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded flex items-center justify-center shrink-0",
                        isSelected ? "bg-indigo-500/20 text-indigo-400" : "bg-zinc-800 text-zinc-500"
                      )}>
                        <Package className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className={cn("text-xs font-medium truncate", isSelected ? "text-white" : "text-zinc-400")}>
                          {itemTitle}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded-sm font-mono",
                            item.status === 'DONE' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                          )}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        {/* PESTAÑA 2: NUEVO PRODUCTO (FORMULARIO) */}
        <TabsContent value="new" className="flex-1 min-h-0 m-0 overflow-y-auto">
          <div className="p-4 space-y-6">

            {/* 1. Subida de Imagen */}
            <div className="space-y-3">
              <Label className="text-zinc-400 text-xs uppercase font-bold">Imagen del Producto</Label>

              {/* Toggle URL vs Archivo (Simplificado) */}
              <div className="grid grid-cols-1 gap-2">
                <div className="relative group cursor-pointer">
                  <Input
                    type="file"
                    accept="image/*"
                    className="cursor-pointer opacity-0 absolute inset-0 z-10 h-20"
                    onChange={(e) => {
                      if (e.target.files?.[0]) setFile(e.target.files[0])
                    }}
                  />
                  <div className="h-20 border-2 border-dashed border-zinc-800 rounded-lg flex flex-col items-center justify-center text-zinc-500 group-hover:border-zinc-600 transition-colors bg-zinc-900/50">
                    <Upload className="w-5 h-5 mb-1" />
                    <span className="text-xs">{file ? file.name : "Arrastra o clic para subir"}</span>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute left-3 top-2.5 text-zinc-500"><LinkIcon className="w-4 h-4" /></div>
                  <Input
                    placeholder="O pega una URL..."
                    className="pl-9 bg-zinc-900 border-zinc-800 text-xs"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* 2. Datos Básicos */}
            <div className="space-y-3">
              <Label className="text-zinc-400 text-xs uppercase font-bold">Detalles</Label>
              <Input
                placeholder="Nombre del producto (Ej: Nike Air)"
                className="bg-zinc-900 border-zinc-800"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Input
                placeholder="Marca (Ej: Nike)"
                className="bg-zinc-900 border-zinc-800"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              />
            </div>

            {/* 3. Descripción Extra (Contexto) */}
            <div className="space-y-3">
              <Label className="text-zinc-400 text-xs uppercase font-bold">Instrucciones / Descripción</Label>
              <Textarea
                placeholder="Añade detalles extra: 'Resalta que es resistente al agua' o pega la descripción del proveedor..."
                className="bg-zinc-900 border-zinc-800 min-h-[100px] text-sm"
                value={context}
                onChange={(e) => setContext(e.target.value)}
              />
            </div>

            {/* Botón de Acción */}
            <Button
              className="w-full bg-white text-black hover:bg-zinc-200 font-bold"
              onClick={handleUpload}
              disabled={isUploading || (!file && !urlInput)}
            >
              {isUploading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Subiendo...</>
              ) : (
                "Procesar con IA"
              )}
            </Button>

          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}