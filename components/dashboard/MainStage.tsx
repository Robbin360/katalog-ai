"use client"

import { useFoundryStore } from "@/store/useFoundryStore"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, ImageIcon, Tag, Layers, FileText } from "lucide-react"

export default function MainStage() {
  const { selectedProductId } = useFoundryStore()

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', selectedProductId],
    queryFn: async () => {
      if (!selectedProductId) return null
      const { data } = await supabase
        .from('products_queue')
        .select('*')
        .eq('id', selectedProductId)
        .single()
      return data
    },
    enabled: !!selectedProductId
  })

  // Función para copiar al portapapeles
  const handleCopy = (text: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    alert("HTML code copied to clipboard!")
  }

  if (!selectedProductId) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center text-zinc-600 bg-zinc-950/50">
        <ImageIcon className="h-12 w-12 mb-4 opacity-20" />
        <p className="text-sm font-medium"><span>Select a product to view technical details</span></p>
      </div>
    )
  }

  if (isLoading) return <div className="p-10 text-zinc-500 animate-pulse"><span>Analyzing product...</span></div>

  // Accedemos directamente al JSON generado por el nuevo prompt
  const data = product?.ai_output || {}

  return (
    <ScrollArea className="h-full w-full bg-zinc-950">
      <div className="p-6 md:p-10 max-w-5xl mx-auto flex flex-col gap-8">

        {/* HEADER: IMAGEN + TÍTULO SEO */}
        <div className="flex flex-col md:flex-row gap-8 border-b border-zinc-800 pb-8">
          <div className="w-full md:w-1/3 h-64 bg-zinc-900/50 border border-zinc-800 rounded-xl flex justify-center items-center overflow-hidden shrink-0">
            {product?.original_image_url ? (
              <img
                src={product.original_image_url}
                alt="Product"
                className="h-full w-full object-contain p-4 hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <span className="text-zinc-700"><span>No Image</span></span>
            )}
          </div>

          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-2 py-0.5 text-[10px] uppercase tracking-wide">
                <span>SEO Optimized</span>
              </Badge>
              <span className="text-xs font-mono text-zinc-600 notranslate">ID: {product.id}</span>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider"><span>Product Title (H1)</span></label>
              <h1 className="text-2xl font-bold text-white leading-tight font-sans selection:bg-indigo-500/30">
                {data.product_title || <span>Generating title...</span>}
              </h1>
            </div>

            <div className="space-y-1 pt-2">
              <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider"><span>Meta Description</span></label>
              <p className="text-zinc-400 text-sm leading-relaxed border-l-2 border-zinc-700 pl-3">
                {data.short_description || "..."}
              </p>
            </div>
          </div>
        </div>

        {/* CUERPO: DESCRIPCIÓN Y SPECS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* COLUMNA IZQ: Descripción HTML */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" /> <span>Product Description</span>
              </h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-zinc-500 hover:text-white"
                onClick={() => handleCopy(data.description_html)}
              >
                <Copy className="w-3 h-3 mr-1" /> <span>Copy HTML</span>
              </Button>
            </div>

            {/* Renderizamos el HTML de forma segura */}
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 text-zinc-300 text-sm leading-7 space-y-4">
              <div dangerouslySetInnerHTML={{ __html: data.description_html || "<p>Generating description...</p>" }} />
            </div>
          </div>

          {/* COLUMNA DER: Detalles Técnicos & Tags */}
          <div className="space-y-6">

            {/* Lista de Features */}
            <div className="bg-zinc-900/20 border border-zinc-800 rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-3 h-3" /> <span>Key Features</span>
              </h3>
              <ul className="space-y-2">
                {data.features_list?.map((feat: string, i: number) => (
                  <li key={i} className="text-xs text-zinc-300 flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">•</span> {feat}
                  </li>
                ))}
              </ul>
            </div>

            {/* Tags / Keywords */}
            <div className="bg-zinc-900/20 border border-zinc-800 rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                <Tag className="w-3 h-3" /> <span>SEO Keywords</span>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {data.seo_tags?.split(',').map((tag: string, i: number) => (
                  <span key={i} className="px-2 py-1 bg-zinc-800 rounded text-[10px] text-zinc-400 border border-zinc-700">
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </div>

            {/* Especificaciones Técnicas */}
            {data.technical_specs && (
              <div className="bg-zinc-900/20 border border-zinc-800 rounded-xl p-5 space-y-3">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider"><span>Specs</span></h3>
                <div className="space-y-2">
                  {Object.entries(data.technical_specs).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-xs border-b border-zinc-800/50 pb-1 last:border-0">
                      <span className="text-zinc-500">{key}</span>
                      <span className="text-zinc-300 font-medium">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </ScrollArea>
  )
}