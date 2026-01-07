'use client';
import { useFoundryStore } from '@/store/useFoundryStore';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Layers, Loader2 } from 'lucide-react';

export default function MainStage() {
  const { selectedProductId } = useFoundryStore();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', selectedProductId],
    queryFn: async () => {
      if (!selectedProductId) return null;
      const { data, error } = await supabase
        .from('products_queue')
        .select('*')
        .eq('id', selectedProductId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!selectedProductId,
  });

  if (!selectedProductId) {
    return (
      <div className='h-full flex flex-col items-center justify-center text-zinc-600 space-y-4'>
        <Layers size={48} className='opacity-20' />
        <p className='text-sm font-medium'>Select an asset to inspect</p>
      </div>
    );
  }

  if (isLoading) return <div className='h-full flex items-center justify-center'><Loader2 className='animate-spin text-zinc-500' /></div>;

  return (
    <div className='h-full flex flex-col bg-zinc-950'>
      <div className='flex-1 p-8 flex flex-col items-center overflow-y-auto'>
        <div className='w-full max-w-3xl bg-zinc-900 rounded-xl border border-zinc-800 shadow-2xl overflow-hidden'>
          <div className='aspect-video bg-zinc-950 flex items-center justify-center relative group'>
             <div className='absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800/30 to-zinc-950'></div>
             <span className='text-zinc-700 font-mono text-xs z-10'>NO PREVIEW AVAILABLE</span>
          </div>
          <div className='p-6 space-y-6'>
            <div>
              <h1 className='text-2xl font-semibold text-white tracking-tight'>{product.name}</h1>
              <p className='text-zinc-500 text-sm font-mono mt-1'>{product.sku}</p>
            </div>
            <div className='bg-zinc-950 rounded-lg p-4 border border-zinc-800/50 overflow-x-auto'>
              <pre className='text-xs font-mono text-emerald-400 leading-relaxed'>
                {JSON.stringify(product, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
