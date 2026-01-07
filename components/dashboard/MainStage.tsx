"use client"

import { useFoundryStore } from "@/store/useFoundryStore"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, Sparkles, Copy, ImageIcon, ArrowRight } from "lucide-react"

export default function MainStage() {
  const { selectedProductId } = useFoundryStore()

  // 1. Fetch de datos
  const { data: product, isLoading } = useQuery({
    queryKey: ['product', selectedProductId],
    queryFn: async () => {
      if (!selectedProductId) return null
      const { data } = await supabase
        .from('products_queue')
        .select('*') // Traemos todo, incluyendo raw_data para el título
        .eq('id', selectedProductId)
        .single()
      return data
    },
    enabled: !!selectedProductId
  })

  // Estado Vacío
  if (!selectedProductId) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center text-zinc-600 bg-zinc-950/50">
        <ImageIcon className="h-12 w-12 mb-4 opacity-20" />
        <p className="text-sm font-medium">Selecciona un activo del inventario</p>
      </div>
    )
  }

  if (isLoading) return <div className="p-10 text-zinc-500 animate-pulse">Cargando datos...</div>

  // --- LÓGICA DE ADAPTACIÓN DE DATOS ---
  // Esto asegura que leamos el JSON sin importar si la IA lo anidó o no
  const ai = product?.ai_output || {}
  const content = ai.descripcion_sarcastica ? ai : (ai.copy_ventas || {});

  // Rescate del Título: Si la IA no lo puso, usamos el que subió el usuario
  const title = ai.producto || product.raw_data?.title || "Producto Procesado";

  return (
    <ScrollArea className="h-full w-full bg-zinc-950">
      <div className="p-6 md:p-10 max-w-5xl mx-auto flex flex-col gap-6">

        {/* 1. HEADER & IMAGEN COMPACTA (Estilo Banner) */}
        <div className="flex flex-col md:flex-row gap-6 items-start border-b border-zinc-800 pb-8">
          {/* Imagen más pequeña y controlada */}
          <div className="w-full md:w-1/3 h-48 bg-zinc-900/50 border border-zinc-800 rounded-xl flex justify-center items-center shrink-0 overflow-hidden">
            {product?.original_image_url ? (
              <img
                src={product.original_image_url}
                alt="Producto"
                className="h-full w-full object-contain p-2 hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="text-zinc-700 text-xs">Sin Imagen</div>
            )}
          </div>

          {/* Título y Gancho (A la derecha de la imagen en escritorio) */}
          <div className="flex-1 space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[10px] px-2 py-0.5">
                <Sparkles className="w-3 h-3 mr-1" />
                AI Generated
              </Badge>
              <span className="text-xs font-mono text-zinc-600">ID: {product.id}</span>
            </div>

            <h1 className="text-3xl font-bold text-white tracking-tight leading-tight">
              {title}
            </h1>

            {content.gancho && (
              <p className="text-lg text-indigo-300 italic font-medium">
                "{content.gancho}"
              </p>
            )}
          </div>
        </div>

        {/* 2. CUERPO DEL CONTENIDO (El Chat / Descripción) */}
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">

          {/* Descripción Principal */}
          <div className="prose prose-invert max-w-none">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Descripción Generada</h3>
            <p className="text-zinc-300 leading-relaxed text-base whitespace-pre-wrap pl-4 border-l-2 border-zinc-800">
              {content.descripcion_sarcastica || content.description || "Descripción no disponible."}
            </p>
          </div>

          {/* Por qué comprarlo (Si existe) */}
          {content.por_que_comprarlo && (
            <div className="bg-zinc-900/30 p-4 rounded-lg border border-zinc-800/50">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">El veredicto</h3>
              <p className="text-sm text-zinc-400">{content.por_que_comprarlo}</p>
            </div>
          )}

          {/* Características (Grid Compacto) */}
          {content.caracteristicas_premium && (
            <div>
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Highlights</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Manejo seguro de array o string */}
                {(Array.isArray(content.caracteristicas_premium)
                  ? content.caracteristicas_premium
                  : [content.caracteristicas_premium]).map((feat: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded bg-zinc-900/40 border border-zinc-800/50 text-sm text-zinc-300">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* CTA Final (Versión Elegante) */}
          <div className="pt-10 mt-4 border-t border-zinc-800/50">
            <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">

              <div className="text-center md:text-left">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Call to Action Generado</p>
                <p className="text-sm text-zinc-300 italic">"{content.cta_final}"</p>
              </div>

              <div className="flex gap-3 w-full md:w-auto">
                <Button variant="outline" className="flex-1 md:flex-none border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800">
                  <Copy className="w-4 h-4 mr-2" /> Copiar
                </Button>
                <Button className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">
                  Usar este Copy
                </Button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </ScrollArea>
  )
}