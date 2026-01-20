"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useFoundryStore } from "@/store/useFoundryStore"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Package, Loader2, Plus, Upload, Link as LinkIcon, MoreVertical, LogOut, Settings, CreditCard, Image as ImageIcon, Trash2, AlertCircle, Check } from "lucide-react"
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
  const router = useRouter()
  const { selectedProductId, setSelectedProduct } = useFoundryStore()
  const queryClient = useQueryClient()

  const [isUploading, setIsUploading] = useState(false)
  const [activeTab, setActiveTab] = useState("inventory")

  const [file, setFile] = useState<File | null>(null)
  const [urlInput, setUrlInput] = useState("")
  const [title, setTitle] = useState("")
  const [brand, setBrand] = useState("")
  const [context, setContext] = useState("")

  // --- 1. OBTENER USUARIO ACTUAL ---
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    }
  })

  // Visuals
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User"
  const displayEmail = user?.email || ""
  const initials = displayName.substring(0, 2).toUpperCase()

  // --- 2. FETCH PRODUCTOS ---
  const { data: products, isLoading } = useQuery({
    queryKey: ['products-list'],
    queryFn: async () => {
      const { data } = await supabase
        .from('products_queue')
        .select('id, status, ai_output, created_at')
        .order('created_at', { ascending: false })
      return data
    },
    // Auto-refresco inteligente: Rápido si hay pendientes, lento si no
    refetchInterval: (query) => {
      const hasPending = query.state.data?.some((p: any) => p.status === 'QUEUED' || p.status === 'PROCESSING')
      return hasPending ? 2000 : 30000
    }
  })

  // --- ACCIÓN: BORRAR ---
  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm("Delete this asset?")) return
    const { error } = await supabase.from('products_queue').delete().eq('id', id)
    if (!error) {
      if (selectedProductId === id) setSelectedProduct(null)
      queryClient.invalidateQueries({ queryKey: ['products-list'] })
    }
  }

  // --- ACCIÓN: SUBIR ---
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

      if (!finalImageUrl) throw new Error("Image required")

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Session expired")

      // Check Créditos
      const { data: profile } = await supabase.from('profiles').select('credits_total, credits_used').eq('id', user.id).single()
      if ((profile?.credits_used || 0) >= (profile?.credits_total || 3)) {
        alert("⚠️ Out of credits! Please upgrade your plan.")
        setIsUploading(false); return
      }

      // Insertar
      const { error: dbError } = await supabase.from('products_queue').insert({
        user_id: user.id,
        original_image_url: finalImageUrl,
        status: 'QUEUED',
        raw_data: { title, brand, user_context: context }
      })

      if (dbError) throw dbError

      // Cobrar
      await supabase.from('profiles').update({ credits_used: (profile?.credits_used || 0) + 1 }).eq('id', user.id)

      // Reset
      setFile(null); setUrlInput(""); setTitle(""); setBrand(""); setContext("")
      setActiveTab("inventory")
      queryClient.invalidateQueries({ queryKey: ['products-list'] })
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })

    } catch (error: any) {
      alert(error.message)
    } finally {
      setIsUploading(false)
    }
  }

  // --- HELPER DE ESTILOS ---
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DONE': return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
      case 'ERROR': return "bg-red-500/10 text-red-500 border-red-500/20"
      default: return "bg-amber-500/10 text-amber-500 border-amber-500/20"
    }
  }

  // --- RENDERIZADO DE LISTA (Evita errores de sintaxis) ---
  const renderInventoryList = () => {
    if (isLoading) return <div className="p-4 text-center text-xs text-zinc-500 flex items-center justify-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> <span>Loading...</span></div>
    if (!products || products.length === 0) return <div className="p-6 text-center text-zinc-600 text-xs"><span>No assets found. Start by adding a new one.</span></div>

    return products.map((item) => {
      const itemTitle = item.ai_output?.product_title || item.ai_output?.producto || `Asset #${item.id}`;
      const isSelected = selectedProductId === item.id;

      return (
        <div key={item.id} className="relative group">
          <button
            onClick={() => setSelectedProduct(item.id)}
            className={cn(
              "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all duration-200 pr-8",
              isSelected ? "bg-zinc-900 border border-zinc-700 shadow-sm" : "hover:bg-zinc-900/50 border border-transparent"
            )}
          >
            <div className={cn("w-8 h-8 rounded flex items-center justify-center shrink-0 border border-zinc-800", isSelected ? "bg-indigo-500/10 text-indigo-400" : "bg-zinc-950 text-zinc-600")}>
              {item.status === 'ERROR' ? <AlertCircle className="w-4 h-4 text-red-500" /> : <Package className="w-4 h-4" />}
            </div>

            <div className="flex flex-col overflow-hidden w-full">
              <span className={cn("text-xs font-medium truncate notranslate", isSelected ? "text-zinc-200" : "text-zinc-400 group-hover:text-zinc-300")}>
                {itemTitle}
              </span>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={cn("text-[9px] px-1.5 py-0.5 rounded-sm font-mono uppercase tracking-wider border notranslate", getStatusColor(item.status))}>
                  {item.status}
                </span>
                <span className="text-[9px] text-zinc-600 font-mono notranslate">#{item.id}</span>
              </div>
            </div>
          </button>

          {/* Botón Borrar (Solo en Hover) */}
          <button
            onClick={(e) => handleDelete(item.id, e)}
            className="absolute right-2 top-3 p-1.5 rounded-md text-zinc-600 hover:text-red-400 hover:bg-zinc-800 opacity-0 group-hover:opacity-100 transition-all z-10"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    })
  }

  return (
    <div className="h-full flex flex-col bg-zinc-950 border-r border-zinc-800 font-sans">

      {/* TABS */}
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

      {/* CONTENIDO */}
      <div className="flex-1 min-h-0 overflow-hidden relative">
        {activeTab === 'inventory' ? (
          <ScrollArea className="h-full">
            <div className="flex flex-col p-2 gap-1 pb-20">
              {renderInventoryList()}
            </div>
          </ScrollArea>
        ) : (
          <ScrollArea className="h-full">
            <div className="p-4 space-y-6 pb-24">

              {/* IMAGEN UPLOAD */}
              <div className="space-y-3">
                <Label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider"><span>Asset Image</span></Label>
                <div className="grid gap-3">
                  <div className="relative group cursor-pointer">
                    <Input type="file" accept="image/*" className="opacity-0 absolute inset-0 z-10 cursor-pointer h-24 w-full" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} />
                    <div className={cn(
                      "h-24 border border-dashed rounded-lg flex flex-col items-center justify-center transition-colors",
                      file ? "border-emerald-500/30 bg-emerald-500/5" : "border-zinc-700 bg-zinc-900/30 group-hover:bg-zinc-900/50"
                    )}>
                      {file ? (
                        <>
                          <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center mb-2"><Check className="w-4 h-4 text-emerald-500" /></div>
                          <span className="text-xs text-emerald-400 font-medium truncate max-w-[200px]">{file.name}</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5 text-zinc-500 mb-2" />
                          <span className="text-xs text-zinc-400"><span>Upload or Drag</span></span>
                        </>
                      )}
                    </div>
                  </div>
                  <Input placeholder="Or paste URL..." className="bg-zinc-900 border-zinc-800 h-9 text-xs" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} />
                </div>
              </div>

              {/* DATOS */}
              <div className="space-y-3">
                <Label className="text-[10px] uppercase font-bold text-zinc-500"><span>Product Data</span></Label>
                <div className="grid gap-2">
                  <Input placeholder="Name (e.g. Nike Air Max)" className="bg-zinc-900 border-zinc-800 h-9 text-xs" value={title} onChange={(e) => setTitle(e.target.value)} />
                  <Input placeholder="Brand (e.g. Nike)" className="bg-zinc-900 border-zinc-800 h-9 text-xs" value={brand} onChange={(e) => setBrand(e.target.value)} />
                </div>
              </div>

              {/* DESCRIPCIÓN */}
              <div className="space-y-3">
                <Label className="text-[10px] uppercase font-bold text-zinc-500"><span>Description / Specs</span></Label>
                <Textarea
                  placeholder="Paste technical details, materials, or vendor specs here..."
                  className="bg-zinc-900 border-zinc-800 text-xs min-h-[100px] resize-none focus:ring-indigo-500/50"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                />
              </div>

              <Button onClick={handleUpload} disabled={isUploading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-10 text-xs shadow-lg shadow-indigo-900/20">
                {isUploading ? <><Loader2 className="w-3 h-3 mr-2 animate-spin" /> <span>PROCESSING...</span></> : <span>START FOUNDRY</span>}
              </Button>
            </div>
          </ScrollArea>
        )}
      </div>

      {/* FOOTER */}
      <div className="p-3 border-t border-zinc-800 bg-zinc-900 mt-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-zinc-900 transition-colors group outline-none border border-transparent hover:border-zinc-800">
              <Avatar className="h-8 w-8 rounded-full border border-zinc-700 bg-zinc-800">
                <AvatarImage src={user?.user_metadata?.avatar_url} className="object-cover" />
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
            <DropdownMenuLabel className="text-xs font-normal text-zinc-500 px-2 py-1.5"><span>My Account</span></DropdownMenuLabel>
            <DropdownMenuItem onClick={() => router.push('/account')} className="text-xs px-2 py-2 cursor-pointer focus:bg-zinc-800 focus:text-white rounded-md"><Settings className="w-3.5 h-3.5 mr-2" /> <span>Settings</span></DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/account')} className="text-xs px-2 py-2 cursor-pointer focus:bg-zinc-800 focus:text-white rounded-md"><CreditCard className="w-3.5 h-3.5 mr-2" /> <span>Billing</span></DropdownMenuItem>
            <DropdownMenuSeparator className="bg-zinc-800 my-1" />
            <DropdownMenuItem onClick={() => signout()} className="text-red-400 focus:text-red-300 cursor-pointer px-2 py-2"><LogOut className="w-3.5 h-3.5 mr-2" /> <span>Sign Out</span></DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}