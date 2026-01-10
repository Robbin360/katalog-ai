"use client"

import { useState } from "react"
import { useFoundryStore } from "@/store/useFoundryStore"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Package, Loader2, Plus, Upload, Link as LinkIcon, MoreVertical, LogOut, Settings, CreditCard } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { signout } from "@/app/login/actions"

export default function SidebarList() {
  const { selectedProductId, setSelectedProduct } = useFoundryStore()
  const queryClient = useQueryClient()

  const [isUploading, setIsUploading] = useState(false)
  const [activeTab, setActiveTab] = useState("inventory")
  const [file, setFile] = useState<File | null>(null)
  const [urlInput, setUrlInput] = useState("")
  const [title, setTitle] = useState("")
  const [brand, setBrand] = useState("")
  const [context, setContext] = useState("")

  // 1. OBTENER USUARIO
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    }
  })

  // --- LÓGICA DE NOMBRE MEJORADA ---
  const metadata = user?.user_metadata || {}
  // Prioridad: 1. Nombre completo Google, 2. Nombre manual, 3. Email (antes del @)
  const displayName = metadata.full_name || metadata.name || user?.email?.split('@')[0] || "Usuario"
  const displayEmail = user?.email || ""
  const initials = displayName.substring(0, 2).toUpperCase()

  // 2. Fetch productos
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

  // 3. Función de Subida
  const handleUpload = async () => {
    try {
      setIsUploading(true)
      let finalImageUrl = urlInput

      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage.from('images').upload(fileName, file)
        if (uploadError) throw uploadError
        const { data: urlData } = supabase.storage.from('images').getPublicUrl(fileName)
        finalImageUrl = urlData.publicUrl
      }

      if (!finalImageUrl) throw new Error("Necesitas una imagen")

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Sesión expirada")

      const { error: dbError } = await supabase.from('products_queue').insert({
        user_id: user.id,
        original_image_url: finalImageUrl,
        status: 'QUEUED',
        raw_data: { title, brand, user_context: context }
      })

      if (dbError) throw dbError

      setFile(null); setUrlInput(""); setTitle(""); setBrand(""); setContext("")
      setActiveTab("inventory")
      queryClient.invalidateQueries({ queryKey: ['products-list'] })

    } catch (error: any) {
      alert(error.message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="h-full flex flex-col bg-zinc-950 border-r border-zinc-800 font-sans">
      <div className="p-3 border-b border-zinc-800 bg-zinc-900">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full bg-zinc-950 border border-zinc-800 grid grid-cols-2">
            <TabsTrigger value="inventory" className="text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-500">
              <span>Inventario</span>
            </TabsTrigger>
            <TabsTrigger value="new" className="text-xs flex gap-2 items-center data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-500">
              <Plus className="w-3 h-3" /> <span>Nuevo</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden relative">
        {activeTab === 'inventory' ? (
          <ScrollArea className="h-full">
            <div className="flex flex-col p-2 gap-1 pb-20">
              {isLoading ? (
                <div className="p-4 text-center text-xs text-zinc-500"><span>Cargando...</span></div>
              ) : products?.map((item) => {
                const itemTitle = item.ai_output?.product_title || item.ai_output?.producto || `Asset #${item.id}`;
                const isSelected = selectedProductId === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedProduct(item.id)}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg text-left transition-all duration-200 group",
                      isSelected ? "bg-zinc-900 border border-zinc-700 shadow-sm" : "hover:bg-zinc-900/50 border border-transparent"
                    )}
                  >
                    <div className={cn("w-8 h-8 rounded flex items-center justify-center shrink-0 border border-zinc-800", isSelected ? "bg-indigo-500/10 text-indigo-400" : "bg-zinc-950 text-zinc-600")}>
                      <Package className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col overflow-hidden w-full">
                      {/* notranslate para proteger el nombre del producto, quítalo si quieres traducir */}
                      <span className={cn("text-xs font-medium truncate", isSelected ? "text-zinc-200" : "text-zinc-400 group-hover:text-zinc-300")}>
                        {itemTitle}
                      </span>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className={cn("text-[9px] px-1.5 py-0.5 rounded-sm font-mono uppercase tracking-wider", item.status === 'DONE' ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border border-amber-500/20")}>
                          {item.status}
                        </span>
                        <span className="text-[9px] text-zinc-600 font-mono notranslate">#{item.id}</span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </ScrollArea>
        ) : (
          <ScrollArea className="h-full">
            <div className="p-4 space-y-6 pb-24">
              {/* Formulario de subida... (Se mantiene igual que antes) */}
              <div className="space-y-3">
                <Label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider"><span>Imagen</span></Label>
                {/* ... Inputs de archivo/url ... */}
                <div className="grid gap-3">
                  <div className="relative group cursor-pointer">
                    <Input type="file" accept="image/*" className="opacity-0 absolute inset-0 z-10 cursor-pointer h-24 w-full" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} />
                    <div className={cn("h-24 border border-dashed rounded-lg flex flex-col items-center justify-center transition-colors", file ? "border-emerald-500/30 bg-emerald-500/5" : "border-zinc-700 bg-zinc-900/30 group-hover:bg-zinc-900/50")}>
                      <Upload className="w-5 h-5 text-zinc-500 mb-2" />
                      <span className="text-xs text-zinc-400">{file ? file.name : "Subir archivo"}</span>
                    </div>
                  </div>
                  <Input placeholder="URL..." className="bg-zinc-900 border-zinc-800 h-9 text-xs" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] uppercase font-bold text-zinc-500"><span>Nombre</span></Label>
                <Input className="bg-zinc-900 border-zinc-800 h-9 text-xs" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <Button onClick={handleUpload} disabled={isUploading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-10 text-xs">
                {isUploading ? "..." : <span>PROCESAR</span>}
              </Button>
            </div>
          </ScrollArea>
        )}
      </div>

      <div className="p-3 border-t border-zinc-800 bg-zinc-950 mt-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-zinc-900 transition-colors group outline-none border border-transparent hover:border-zinc-800">
              <Avatar className="h-8 w-8 rounded-full border border-zinc-700 bg-zinc-800">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-indigo-900 text-indigo-200 text-[10px] font-bold notranslate">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left overflow-hidden">
                <p className="text-xs font-medium text-zinc-200 truncate notranslate">{displayName}</p>
                <p className="text-[10px] text-zinc-500 truncate notranslate">{displayEmail}</p>
              </div>
              <MoreVertical className="w-4 h-4 text-zinc-600" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-60 bg-zinc-900 border-zinc-800 text-zinc-300 ml-2" align="start" side="top">
            <DropdownMenuItem onClick={() => signout()} className="text-red-400 focus:text-red-300 cursor-pointer">
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}