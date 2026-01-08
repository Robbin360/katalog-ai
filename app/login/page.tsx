"use client"

import { useState } from "react"
import { login, signup, signInWithGoogle } from "./actions" // Importamos la acción de Google
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ShieldCheck, Mail } from "lucide-react"

// Icono simple de Google para el botón
function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

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
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 text-zinc-100 font-sans">
      <div className="w-full max-w-sm space-y-8 border border-zinc-800 bg-zinc-900/50 p-8 rounded-2xl backdrop-blur-xl shadow-2xl">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 mb-4 border border-indigo-500/20">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Katalog Foundry</h1>
          <p className="text-sm text-zinc-500">Acceso seguro al sistema.</p>
        </div>

        {/* Botón de Google (El Protagonista) */}
        <div className="space-y-3">
          <form action={signInWithGoogle}>
            <Button
              variant="outline"
              className="w-full bg-white text-black hover:bg-zinc-200 border-0 font-bold h-11"
              type="submit"
            >
              <GoogleIcon className="mr-2 h-5 w-5" />
              Continuar con Google
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-zinc-900 px-2 text-zinc-500">O con email</span>
            </div>
          </div>
        </div>

        {/* Formulario Tradicional */}
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-400">Email Corporativo</Label>
            <Input id="email" name="email" type="email" placeholder="nombre@empresa.com" required className="bg-zinc-950 border-zinc-800 focus:border-indigo-500" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-zinc-400">Contraseña</Label>
            <Input id="password" name="password" type="password" required className="bg-zinc-950 border-zinc-800 focus:border-indigo-500" />
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <Button formAction={(d) => handleAuth(d, login)} disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Mail className="mr-2 h-4 w-4" /> Entrar con Email
            </Button>
            <Button formAction={(d) => handleAuth(d, signup)} disabled={isLoading} variant="ghost" className="w-full text-zinc-500 hover:text-white h-auto py-2 text-xs">
              ¿No tienes cuenta? Regístrate
            </Button>
          </div>
        </form>

      </div>
    </div>
  )
}