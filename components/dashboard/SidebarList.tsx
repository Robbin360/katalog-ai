'use client';
import { supabase } from '@/lib/supabase';
import { useFoundryStore } from '@/store/useFoundryStore';
import { useQuery } from '@tanstack/react-query';
import { Package, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SidebarList() {
  const { selectedProductId, setSelectedProduct } = useFoundryStore();

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products_queue')
        .select('*')
        .in('status', ['DONE', 'QUEUED'])
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div className="p-4 flex justify-center"><Loader2 className="animate-spin text-zinc-500" /></div>;

  return (
    <div className="h-full overflow-y-auto bg-zinc-900/50 border-r border-zinc-800">
      <div className="p-4 border-b border-zinc-800">
        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
          <Package size={14} /> Inventory
        </h2>
      </div>
      <div className="p-2 space-y-1">
        {products?.map((product: any) => (
          <button
            key={product.id}
            onClick={() => setSelectedProduct(product.id)}
            className={cn(
              'w-full text-left p-3 rounded-md text-sm transition-colors',
              selectedProductId === product.id
                ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-zinc-700'
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
            )}
          >
            <div className="font-medium truncate">{product.name || 'Untitled Asset'}</div>
            <div className="text-xs text-zinc-500 flex justify-between mt-1">
              <span>{product.sku || 'NO-SKU'}</span>
              <span className={cn(
                'text-[10px] px-1.5 py-0.5 rounded-full',
                product.status === 'DONE' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
              )}>
                {product.status}
              </span>
            </div>
          </button>
        ))}
        {products?.length === 0 && (
          <div className="p-4 text-center text-zinc-600 text-sm">No assets found.</div>
        )}
      </div>
    </div>
  );
}
