"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createServerClient } from "@supabase/ssr"
import { cookies, headers } from "next/headers"

// --- HELPER: Crear Cliente Supabase (Servidor) ---
async function createClient() {
    const cookieStore = await cookies()

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll() },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch { }
                },
            },
        }
    )
}

// --- 1. INICIAR SESIÓN (Email/Password) ---
export async function login(formData: FormData) {
    const supabase = await createClient()
    const email = String(formData.get("email") ?? "").trim()
    const password = String(formData.get("password") ?? "")
    const rawNext = String(formData.get("redirect") ?? "")

    // Solo rutas internas: evita redirección abierta a dominios externos.
    const next =
        rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/dashboard"

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
        console.error("[auth] login falló:", error.message)
        redirect("/login?error=auth-failed")
    }

    revalidatePath("/", "layout")
    redirect(next)
}

// --- 2. REGISTRARSE (Email/Password) ---
export async function signup(formData: FormData) {
    const supabase = await createClient()
    const email = String(formData.get("email") ?? "").trim()
    const password = String(formData.get("password") ?? "")
    const fullName = String(formData.get("fullname") ?? "").trim()

    if (!email || !password) redirect("/signup?error=missing-fields")

    const hdrs = await headers()
    const origin = hdrs.get('origin') ?? 'http://localhost:3000'

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${origin}/auth/callback`,
            ...(fullName ? { data: { full_name: fullName } } : {}),
        },
    })

    if (error) {
        console.error("[auth] signup falló:", error.message)
        redirect("/signup?error=signup-failed")
    }

    // Sin sesión = el proyecto exige confirmar el correo.
    // Mandar a /dashboard aquí provoca un rebote infinito contra el proxy.
    if (!data.session) {
        redirect("/login?message=check-email")
    }

    revalidatePath("/", "layout")
    redirect("/dashboard")
}

// --- 3. LOGIN SOCIAL (GOOGLE, SLACK, X) ---
type OAuthResult = { url?: string; error?: string }

async function startOAuth(
    provider: 'google' | 'slack_oidc' | 'x',
    extra?: { scopes?: string }
): Promise<OAuthResult> {
    const supabase = await createClient()
    const hdrs = await headers()
    const origin = hdrs.get('origin') ?? 'http://localhost:3000'

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
            redirectTo: `${origin}/auth/callback`,
            ...(extra?.scopes ? { scopes: extra.scopes } : {}),
        },
    })

    if (error) {
        console.error(`[auth] OAuth ${provider} falló:`, error.message)
        return { error: error.message }
    }
    if (!data?.url) return { error: 'no_oauth_url' }
    return { url: data.url }
}

export async function signInWithGoogle(): Promise<OAuthResult> {
    return startOAuth('google')
}

export async function signInWithSlack(): Promise<OAuthResult> {
    return startOAuth('slack_oidc')
}

export async function signInWithX(): Promise<OAuthResult> {
    return startOAuth('x', { scopes: 'users.read tweet.read' })
}

// --- 6. CERRAR SESIÓN ---
export async function signout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath("/", "layout")
    redirect("/login")
}