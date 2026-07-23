import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const protectedPaths = ['/dashboard', '/account', '/inventory', '/settings', '/app'];

export async function proxy(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Solo aplicar a rutas protegidas — el resto cae a not-found.tsx
    if (!protectedPaths.some(p => path.startsWith(p))) {
        return NextResponse.next();
    }

    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

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

    if (!user) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('redirect', path)
        return NextResponse.redirect(url)
    }

    return response
}

export const config = {
    matcher: ['/dashboard/:path*', '/account/:path*', '/inventory/:path*', '/settings/:path*', '/app/:path*'],
};
