import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from '@/lib/supabase/server'

// El Brain responde 202 en <1s. Si tarda más, algo está mal upstream y no
// tiene sentido que Vercel sostenga la conexión esperando un grafo de minutos.
const BRAIN_TIMEOUT_MS = 5000

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) return NextResponse.json({ error: "No session" }, { status: 401 })

    const body = await request.json()
    const { product_id } = body
    if (!product_id) return NextResponse.json({ error: "product_id is required" }, { status: 400 })

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), BRAIN_TIMEOUT_MS)

    let brainResponse: Response
    try {
      brainResponse = await fetch(`${BACKEND_URL}/api/optimize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ product_id }),
        signal: controller.signal,
      })
    } finally {
      clearTimeout(timeout)
    }

    const brainData = await brainResponse.json().catch(() => ({}))
    // Propagar el 202 (o 409/4xx/5xx) tal cual, sin reinterpretar el estado.
    if (!brainResponse.ok) {
      return NextResponse.json(
        { error: brainData.detail || `Brain error: ${brainResponse.status}` },
        { status: brainResponse.status }
      )
    }

    return NextResponse.json(brainData, { status: brainResponse.status })
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        { error: "Brain did not respond in time (5s). Try again." },
        { status: 504 }
      )
    }
    console.error("Optimize proxy error:", error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: `Unable to optimize: ${errorMessage}` }, { status: 500 })
  }
}