import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { CheckCircle2, AlertCircle, ShoppingBag, ArrowRight, Zap } from 'lucide-react'

export const revalidate = 0;

export default async function HomePage() {
  const cookieStore = await cookies();

  // 1. Cliente de Servidor (El que sabe leer cookies en Vercel)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignorar errores de escritura en server component
          }
        },
      },
    }
  );

  // 2. Traemos los datos
  const { data: products } = await supabase
    .from('products_queue')
    .select('*')
    .eq('status', 'DONE')
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30">
      <div className="max-w-6xl mx-auto p-6 md:p-12">

        <header className="mb-20 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-mono text-indigo-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            SYSTEM ONLINE
          </div>
          <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-white">
            Katalog<span className="text-indigo-600">.ai</span>
          </h1>
          <p className="text-zinc-500 text-lg max-w-xl mx-auto leading-relaxed">
            Fundición autónoma de activos. Sube tu inventario y deja que la IA haga el resto.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {(!products || products.length === 0) ? (
            <div className="col-span-full py-32 border border-dashed border-zinc-800 rounded-3xl flex flex-col items-center justify-center text-zinc-500 bg-zinc-900/20">
              <ShoppingBag className="w-16 h-16 mb-6 opacity-20" />
              <p className="text-xl font-medium">Esperando señal...</p>
              <p className="text-sm mt-2 opacity-50">Usa el panel lateral para subir productos.</p>
            </div>
          ) : (
            products.map((item) => {
              const ai = item.ai_output;
              return (
                <div key={item.id} className="group relative bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden hover:border-zinc-600 transition-all duration-500">
                  <div className="relative h-72 w-full bg-gradient-to-b from-white/5 to-transparent p-8 flex items-center justify-center">
                    <img
                      src={item.original_image_url}
                      alt="Product"
                      className="h-full w-full object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-6 right-6 px-3 py-1 bg-black/40 backdrop-blur border border-white/10 rounded-full text-xs font-mono text-zinc-300 notranslate">
                      ID: {item.id}
                    </div>
                  </div>

                  <div className="p-8 space-y-6 relative">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
                    <div>
                      <h2 className="text-3xl font-bold leading-tight mb-3 text-white notranslate">
                        {ai?.product_title || ai?.producto || 'Procesando...'}
                      </h2>
                      {ai?.short_description && (
                        <p className="text-zinc-400 text-sm leading-relaxed">
                          {ai.short_description}
                        </p>
                      )}
                    </div>

                    {ai?.features_list && (
                      <div className="grid grid-cols-1 gap-3 py-2">
                        {ai.features_list.slice(0, 3).map((feat: string, i: number) => (
                          <div key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}