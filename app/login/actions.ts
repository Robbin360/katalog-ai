"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createServerClient } from "@supabase/ssr"
import { cookies, headers } from "next/headers"

// Helper para conectar Supabase en el servidor
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
        redirect("/login?error=auth-failed")
    }

    revalidatePath("/", "layout")
    redirect("/dashboard") // Redirige al dashboard al entrar
}

export async function signup(formData: FormData) {
    const supabase = await createClient()
    const data = {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
    }

    const { error } = await supabase.auth.signUp(data)

    if (error) {
        redirect("/login?error=signup-failed")
    }

    revalidatePath("/", "layout")
    redirect("/login?success=check-email")
}

export async function signInWithGoogle() {
    const supabase = await createClient()

    // Detecta si estás en localhost o Vercel automáticamente
    const origin = (await headers()).get('origin') || 'http://localhost:3000'

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
        redirect("/login?error=oauth-failed")
    }

    if (data.url) {
        redirect(data.url)
    }
}

export async function resetPassword(formData: FormData) {
    const supabase = await createClient()
    const email = formData.get("email") as string
    const origin = (await headers()).get('origin') || 'http://localhost:3000'

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/callback?next=/account`,
    })

    if (error) {
        redirect("/login?error=reset-failed")
    }

    redirect("/login?success=reset-sent")
}

export async function signout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath("/", "layout")
    redirect("/login")
}