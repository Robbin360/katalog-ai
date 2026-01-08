"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createServerClient } from "@supabase/ssr"
import { cookies, headers } from "next/headers"

// Función auxiliar para crear el cliente en el servidor
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
                        // Ignoramos errores de cookies en Server Components
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

// --- FUNCIÓN DE GOOGLE ROBUSTA ---
export async function signInWithGoogle() {
    const supabase = await createClient()

    // 1. Detectar Origen (Localhost o Vercel)
    // El fallback 'http://localhost:3000' evita que explote si headers() falla
    const origin = (await headers()).get('origin') || 'http://localhost:3000'

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            // Importante: Esto redirige a la ruta /auth/callback que crearemos/verificaremos
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
        redirect(data.url) // Nos vamos a Google
    }
}