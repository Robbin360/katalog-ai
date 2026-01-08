"use client"

import { useState } from "react"
import { login, signup } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ShieldCheck } from "lucide-react"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleAuth = async (formData: FormData, action: any) => {
    setIsLoading(true)
    try {
      await action(formData)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 text-zinc-100">
      <div className="w-full max-w-sm space-y-8 border border-zinc-800 bg-zinc-900/50 p-8 rounded-2xl backdrop-blur-xl">

        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 mb-4">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Katalog Foundry</h1>
          <p className="text-sm text-zinc-500">Acceso restringido al personal autorizado.</p>
        </div>

        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Corporativo</Label>
            <Input id="email" name="email" type="email" placeholder="nombre@empresa.com" required className="bg-zinc-950 border-zinc-800" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" name="password" type="password" required className="bg-zinc-950 border-zinc-800" />
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <Button formAction={(d) => handleAuth(d, login)} disabled={isLoading} className="w-full bg-white text-black hover:bg-zinc-200 font-bold">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Iniciar Sesión
            </Button>
            <Button formAction={(d) => handleAuth(d, signup)} disabled={isLoading} variant="ghost" className="w-full text-zinc-500 hover:text-white">
              Crear cuenta nueva
            </Button>
          </div>
        </form>

      </div>
    </div>
  )
}