"use client"

import { useFoundryStore } from "@/store/useFoundryStore"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Package, Loader2 } from "lucide-react"

export default function SidebarList() {
  const { selectedProductId, setSelectedProduct } = useFoundryStore()

  const { data: products, isLoading } = useQuery({
    queryKey: ['products-list'],
    queryFn: async () => {
      const { data } = await supabase
        .from('products_queue')
        .select('id, status, ai_output, created_at') // Pedimos solo lo necesario
        .order('created_at', { ascending: false })
      return data
    }
  })

  if (isLoading) {
    return (
      <div className="flex h-20 items-center justify-center text-zinc-600">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-zinc-950 border-r border-zinc-800">
      <div className="p-4 border-b border-zinc-800">
        <h2 className="text-xs font-bold text-zinc-500 tracking-wider uppercase">Inventory</h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="flex flex-col p-2 gap-1">
          {products?.map((item) => {
            // Intentamos sacar el nombre de varios lugares posibles
            const title = item.ai_output?.producto || item.ai_output?.title || `Asset #${item.id}`;
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
                  <span className={cn(
                    "text-sm font-medium truncate",
                    isSelected ? "text-white" : "text-zinc-400"
                  )}>
                    {title}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-sm font-mono",
                      item.status === 'DONE'
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-amber-500/10 text-amber-500"
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
    </div>
  )
}