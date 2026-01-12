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

  // Excepciones: Rutas que SIEMPRE deben ser públicas
  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth')
  const isLoginRoute = request.nextUrl.pathname.startsWith('/login')
  const isWebhookRoute = request.nextUrl.pathname.startsWith('/api/webhooks') // <--- LA CLAVE ES ESTA

  // Si NO hay usuario...
  if (!user) {
    // ...y NO está intentando entrar a una ruta pública permitida...
    if (!isLoginRoute && !isAuthRoute && !isWebhookRoute) {
      // ...lo mandamos al login.
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  // Si SÍ hay usuario y quiere ir al login...
  if (user && isLoginRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}