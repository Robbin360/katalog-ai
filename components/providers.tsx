"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"

export default function Providers({ children }: { children: React.ReactNode }) {
  // Creamos el cliente una sola vez por sesión
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Los datos se consideran "frescos" por 1 minuto para no saturar Supabase
        staleTime: 60 * 1000,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}