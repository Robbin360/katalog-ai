import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {

  // 1. Crear respuesta base
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 2. Conectar Supabase
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

  // 3. Verificar usuario
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 4. REGLAS DE PROTECCIÓN BLINDADAS

  const path = request.nextUrl.pathname

  // Definimos qué rutas son públicas (Cualquiera puede entrar)
  const isPublicRoute =
    path === '/' ||                       // Landing Page
    path.startsWith('/login') ||          // Login
    path.startsWith('/auth') ||           // OAuth Callback
    path.startsWith('/api')               // Webhooks y Stripe

  // ESCENARIO A: Usuario NO Logueado
  if (!user) {
    // Si intenta entrar a una ruta privada (ej: /dashboard, /account)...
    if (!isPublicRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  // ESCENARIO B: Usuario SÍ Logueado
  if (user) {
    // Si intenta entrar al Login...
    // Lo mandamos directo a su herramienta de trabajo
    if (path.startsWith('/login')) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Coincidir con todas las rutas excepto:
     * - _next/static (archivos estáticos)
     * - _next/image (imágenes optimizadas)
     * - favicon.ico (icono)
     * - Archivos con extensión (imágenes, css, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}