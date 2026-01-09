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
  
  // Estado del Formulario
  const [isUploading, setIsUploading] = useState(false)
  const [activeTab, setActiveTab] = useState("inventory")
  
  // Datos del formulario
  const [file, setFile] = useState<File | null>(null)
  const [urlInput, setUrlInput] = useState("")
  const [title, setTitle] = useState("")
  const [brand, setBrand] = useState("")
  const [context, setContext] = useState("")

  // 1. OBTENER USUARIO ACTUAL (Para el Avatar y la Subida)
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    }
  })

  // Lógica de Nombre Visual
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Usuario"
  const displayEmail = user?.email || ""
  const initials = displayName.substring(0, 2).toUpperCase()

  // 2. Fetch de productos (Inventario)
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

      // A. Subir Archivo a Storage
      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(fileName, file)

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('images')
          .getPublicUrl(fileName)
        
        finalImageUrl = urlData.publicUrl
      }

      if (!finalImageUrl) throw new Error("Necesitas una imagen (Archivo o URL)")
      if (!user) throw new Error("Debes iniciar sesión para procesar activos.")

      // B. Guardar en Base de Datos (Cola de n8n)
      const { error: dbError } = await supabase
        .from('products_queue')
        .insert({
          user_id: user.id, // ID Dinámico
          original_image_url: finalImageUrl,
          status: 'QUEUED',
          raw_data: {
            title: title || "Producto sin nombre",
            brand: brand,
            user_context: context
          }
        })

      if (dbError) throw dbError

      // C. Limpieza
      setFile(null); setUrlInput(""); setTitle(""); setBrand(""); setContext("")
      setActiveTab("inventory")
      queryClient.invalidateQueries({ queryKey: ['products-list'] })

    } catch (error: any) {
      alert("Error al subir: " + error.message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="h-full flex flex-col bg-zinc-950 border-r border-zinc-800 font-sans">
      
      {/* HEADER TABS (DISEÑO MEJORADO) */}
      <div className="p-3 border-b border-zinc-800 bg-zinc-900">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full bg-zinc-950 border border-zinc-800 grid grid-cols-2">
            <TabsTrigger 
              value="inventory" 
              className="text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-500"
            >
              Inventario
            </TabsTrigger>
            <TabsTrigger 
              value="new" 
              className="text-xs flex gap-2 items-center data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-500"
            >
              <Plus className="w-3 h-3" /> Nuevo
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 min-h-0 overflow-hidden relative">
        
        {/* PESTAÑA 1: INVENTARIO */}
        {activeTab === 'inventory' ? (
          <ScrollArea className="h-full">
            <div className="flex flex-col p-2 gap-1 pb-20">
              {isLoading ? (
                <div className="p-4 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin"/> Cargando activos...
                </div>
              ) : products?.map((item) => {
                // Lógica robusta para encontrar el título
                const itemTitle = item.ai_output?.product_title || item.ai_output?.producto || `Asset #${item.id}`;
                const isSelected = selectedProductId === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedProduct(item.id)}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg text-left transition-all duration-200 group",
                      isSelected 
                        ? "bg-zinc-900 border border-zinc-700 shadow-sm" 
                        : "hover:bg-zinc-900/50 border border-transparent"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded flex items-center justify-center shrink-0 border border-zinc-800",
                      isSelected ? "bg-indigo-500/10 text-indigo-400" : "bg-zinc-950 text-zinc-600"
                    )}>
                      <Package className="w-4 h-4" />
                    </div>
                    
                    <div className="flex flex-col overflow-hidden w-full">
                      <span className={cn(
                        "text-xs font-medium truncate",
                        isSelected ? "text-zinc-200" : "text-zinc-400 group-hover:text-zinc-300"
                      )}>
                        {itemTitle}
                      </span>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className={cn(
                          "text-[9px] px-1.5 py-0.5 rounded-sm font-mono uppercase tracking-wider", 
                          item.status === 'DONE' 
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                            : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                        )}>
                          {item.status}
                        </span>
                        <span className="text-[9px] text-zinc-600 font-mono">
                          #{item.id}
                        </span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </ScrollArea>
        ) : (
          
          /* PESTAÑA 2: FORMULARIO NUEVO (AQUÍ ESTÁ EL CÓDIGO COMPLETO) */
          <ScrollArea className="h-full">
            <div className="p-4 space-y-6 pb-24">
              
              {/* 1. Subida de Imagen */}
              <div className="space-y-3">
                <Label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Imagen del Activo</Label>
                
                <div className="grid gap-3">
                  <div className="relative group cursor-pointer">
                    <Input 
                      type="file" 
                      accept="image/*" 
                      className="opacity-0 absolute inset-0 z-10 cursor-pointer h-24 w-full"
                      onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
                    />
                    <div className={cn(
                      "h-24 border border-dashed rounded-lg flex flex-col items-center justify-center transition-colors",
                      file 
                        ? "border-emerald-500/30 bg-emerald-500/5" 
                        : "border-zinc-700 bg-zinc-900/30 group-hover:bg-zinc-900/50 group-hover:border-zinc-600"
                    )}>
                      {file ? (
                        <>
                          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center mb-2">
                            <Upload className="w-4 h-4 text-emerald-500" />
                          </div>
                          <span className="text-xs text-emerald-400 font-medium truncate max-w-[180px]">{file.name}</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5 text-zinc-500 mb-2" />
                          <span className="text-xs text-zinc-400">Arrastra o clic para subir</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute left-3 top-2.5 text-zinc-500 pointer-events-none">
                      <LinkIcon className="w-3.5 h-3.5"/>
                    </div>
                    <Input 
                      placeholder="O pega una URL pública..." 
                      className="pl-9 bg-zinc-900 border-zinc-800 h-9 text-xs text-zinc-300 placeholder:text-zinc-600 focus-visible:ring-indigo-500/50"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* 2. Datos Básicos */}
              <div className="space-y-3">
                <Label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Metadatos Base</Label>
                <div className="grid gap-2">
                  <Input 
                    placeholder="Nombre (Ej: Nike Air Max)" 
                    className="bg-zinc-900 border-zinc-800 h-9 text-xs" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                  />
                  <Input 
                    placeholder="Marca (Ej: Nike)" 
                    className="bg-zinc-900 border-zinc-800 h-9 text-xs" 
                    value={brand} 
                    onChange={(e) => setBrand(e.target.value)} 
                  />
                </div>
              </div>

              {/* 3. Contexto Extra */}
              <div className="space-y-3">
                <Label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Instrucciones al Agente</Label>
                <Textarea 
                  placeholder="Ej: Resalta que es impermeable y perfecto para running nocturno..." 
                  className="bg-zinc-900 border-zinc-800 text-xs min-h-[100px] resize-none focus-visible:ring-indigo-500/50"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                />
              </div>

              {/* Botón de Acción */}
              <Button 
                onClick={handleUpload} 
                disabled={isUploading || (!file && !urlInput)} 
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-10 text-xs shadow-lg shadow-indigo-900/20"
              >
                {isUploading ? (
                  <><Loader2 className="w-3 h-3 mr-2 animate-spin" /> PROCESANDO...</>
                ) : (
                  "INICIAR FUNDICIÓN"
                )}
              </Button>

            </div>
          </ScrollArea>
        )}
      </div>

      {/* FOOTER DE USUARIO (FLOTANTE ESTILO GOOGLE) */}
      <div className="p-3 border-t border-zinc-800 bg-zinc-950 mt-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-zinc-900 transition-colors group outline-none border border-transparent hover:border-zinc-800">
              <Avatar className="h-8 w-8 rounded-full border border-zinc-700 bg-zinc-800">
                <AvatarImage src={user?.user_metadata?.avatar_url} className="object-cover" />
                <AvatarFallback className="bg-indigo-900 text-indigo-200 text-[10px] font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-left overflow-hidden">
                <p className="text-xs font-medium text-zinc-200 truncate">
                  {displayName}
                </p>
                <p className="text-[10px] text-zinc-500 truncate group-hover:text-zinc-400 transition-colors">
                  {displayEmail}
                </p>
              </div>
              
              <MoreVertical className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300" />
            </button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent className="w-60 bg-zinc-900 border-zinc-800 text-zinc-300 p-1 mb-2 ml-2 shadow-2xl" align="start" side="top">
            <div className="px-2 py-1.5 border-b border-zinc-800/50 mb-1">
              <p className="text-xs font-medium text-white">{displayName}</p>
              <p className="text-[10px] text-zinc-500">{displayEmail}</p>
            </div>
            
            <DropdownMenuItem className="text-xs px-2 py-2 cursor-pointer focus:bg-zinc-800 focus:text-white rounded-md">
              <Settings className="w-3.5 h-3.5 mr-2" /> Configuración de Cuenta
            </DropdownMenuItem>
            
            <DropdownMenuItem className="text-xs px-2 py-2 cursor-pointer focus:bg-zinc-800 focus:text-white rounded-md">
              <CreditCard className="w-3.5 h-3.5 mr-2" /> Facturación & Plan
            </DropdownMenuItem>
            
            <DropdownMenuSeparator className="bg-zinc-800 my-1" />
            
            <DropdownMenuItem 
              className="text-xs px-2 py-2 cursor-pointer text-red-400 focus:text-red-300 focus:bg-red-950/30 rounded-md"
              onClick={() => signout()}
            >
              <LogOut className="w-3.5 h-3.5 mr-2" /> Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

    </div>
  )
}