import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Esta es la función que Next.js busca. Debe llamarse 'middleware' y tener 'export'.
export async function middleware(request: NextRequest) {

  // 1. Crear una respuesta inicial
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 2. Conectar con Supabase para verificar la sesión
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

  // 3. Revisar si hay usuario logueado
  // IMPORTANTE: Usamos getUser() en lugar de getSession() por seguridad
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 4. Reglas de Protección
  // Si NO hay usuario y NO estamos en la página de login...
  if (!user && !request.nextUrl.pathname.startsWith('/login')) {
    // ...redirigir al login
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Si SÍ hay usuario y estamos en la página de login...
  if (user && request.nextUrl.pathname.startsWith('/login')) {
    // ...redirigir al dashboard (home)
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // 5. Dejar pasar
  return response
}

// Configuración: En qué rutas se ejecuta el middleware
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