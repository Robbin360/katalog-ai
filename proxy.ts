import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// En Next.js 16, la convención es 'proxy' en lugar de 'middleware'
export async function proxy(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value)
                        response.cookies.set(name, value, options)
                    })
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()
    const path = request.nextUrl.pathname

    // Rutas que no requieren estar logueado
    const isPublicRoute =
        path === '/' ||
        path.startsWith('/login') ||
        path.startsWith('/signup') ||
        path.startsWith('/forgot-password') ||
        path.startsWith('/update-password') ||
        path.startsWith('/privacy') ||
        path.startsWith('/terms') ||
        path.startsWith('/auth') ||
        path.startsWith('/api') ||
        path.startsWith('/pricing') ||
        path.startsWith('/features') ||
        path.startsWith('/faq') ||
        path.startsWith('/integrations') ||
        path.startsWith('/about') ||
        path.startsWith('/contact');

    // Si no está logueado y va a una ruta privada -> Al Login
    if (!user && !isPublicRoute) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // Si está logueado y va a la Landing o al Auth Suite -> Al Dashboard
    if (user && (path === '/' || path.startsWith('/login') || path.startsWith('/signup') || path.startsWith('/forgot-password') || path.startsWith('/update-password'))) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
    }

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|robots.txt|sitemap.xml|manifest.webmanifest|opengraph-image|twitter-image|_next/data|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
