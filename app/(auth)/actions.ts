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
    const data = { email: formData.get("email") as string, password: formData.get("password") as string }

    const { error } = await supabase.auth.signInWithPassword(data)
    if (error) {
        console.error("❌ ERROR LOGIN:", error.message)
        redirect("/login?error=auth-failed")
    }
    revalidatePath("/", "layout")
    redirect("/dashboard")
}

// --- 2. REGISTRARSE (Email/Password) ---
export async function signup(formData: FormData) {
    const supabase = await createClient()
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const fullName = formData.get("fullname") as string

    const signUpData = fullName
        ? { email, password, options: { data: { full_name: fullName } } }
        : { email, password }

    const { error } = await supabase.auth.signUp(signUpData)
    if (error) {
        console.error("❌ ERROR SIGNUP:", error.message)
        redirect("/signup?error=signup-failed")
    }
    revalidatePath("/", "layout")
    redirect("/dashboard")
}

// --- 3. LOGIN SOCIAL (GOOGLE) ---
export async function signInWithGoogle() {
    const supabase = await createClient()
    const origin = (await headers()).get('origin') || 'http://localhost:3000'

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${origin}/auth/callback`, queryParams: { access_type: 'offline', prompt: 'consent' } },
    })
    if (error) { console.error("❌ ERROR GOOGLE:", error.message); redirect("/login?error=oauth-failed") }
    if (data.url) redirect(data.url)
}

// --- 4. LOGIN SOCIAL (SLACK) ---
export async function signInWithSlack() {
    const supabase = await createClient()
    const origin = (await headers()).get('origin') || 'http://localhost:3000'

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'slack_oidc',
        options: { redirectTo: `${origin}/auth/callback` },
    })
    if (error) { console.error("❌ ERROR SLACK:", error.message); redirect("/login?error=slack-failed") }
    if (data.url) redirect(data.url)
}

// --- 5. LOGIN SOCIAL (X / TWITTER) ---
export async function signInWithX() {
    const supabase = await createClient()
    const origin = (await headers()).get('origin') || 'http://localhost:3000'

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'twitter', // En Supabase, X se sigue llamando 'twitter' en el código
        options: {
            redirectTo: `${origin}/auth/callback?next=/dashboard`,
            scopes: 'users.read tweet.read',
        },
    })
    if (error) { console.error("❌ ERROR X:", error.message); redirect("/login?error=x-failed") }
    if (data.url) redirect(data.url)
}

// --- 6. CERRAR SESIÓN ---
export async function signout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath("/", "layout")
    redirect("/login")
}