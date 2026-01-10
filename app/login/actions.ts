"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// Helper para conectar Supabase
async function createClient() {
    const cookieStore = await cookies()

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // Ignorar errores de cookies en Server Components
                    }
                },
            },
        }
    )
}

export async function login(formData: FormData) {
    const supabase = await createClient()
    const data = {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        console.error("❌ ERROR LOGIN:", error.message)
        redirect("/login?error=auth-failed")
    }

    revalidatePath("/", "layout")
    redirect("/")
}

export async function signup(formData: FormData) {
    const supabase = await createClient()
    const data = {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
    }

    const { error } = await supabase.auth.signUp(data)

    if (error) {
        console.error("❌ ERROR SIGNUP:", error.message)
        redirect("/login?error=signup-failed")
    }

    revalidatePath("/", "layout")
    redirect("/")
}

// --- FUNCIÓN GOOGLE ACTUALIZADA (DINÁMICA) ---
export async function signInWithGoogle() {
    const supabase = await createClient()

    // Lógica Dinámica:
    // 1. En Vercel: Usará la variable de entorno (ej: https://tudominio.vercel.app)
    // 2. En Local: Si no hay variable, usa localhost:3000
    const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${origin}/auth/callback`,
            queryParams: {
                access_type: 'offline',
                prompt: 'consent',
            },
        },
    })

    if (error) {
        console.error("❌ ERROR OAUTH:", error.message)
        redirect("/login?error=oauth-failed")
    }

    if (data.url) {
        redirect(data.url)
    }
}

export async function signout() {
    const supabase = await createClient()

    // 1. Cerrar sesión en Supabase
    await supabase.auth.signOut()

    // 2. Limpiar caché y redirigir
    revalidatePath("/", "layout")
    redirect("/login")
}