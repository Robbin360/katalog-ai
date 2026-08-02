import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/dashboard'

    if (code) {
        const cookieStore = await cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll() },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    },
                },
            }
        )
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard'
            return NextResponse.redirect(`${origin}${safeNext}`)
        }
        console.error('[auth] exchangeCodeForSession falló:', error.message)
        return NextResponse.redirect(
            `${origin}/login?error=auth-code-error`
        )
    }

    // El proveedor puede devolver el error en la query en vez de un code.
    const providerError = searchParams.get('error_description')
        ?? searchParams.get('error')
    if (providerError) {
        console.error('[auth] el proveedor devolvió error:', providerError)
    }
    return NextResponse.redirect(`${origin}/login?error=auth-code-error`)
}