import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const maxDuration = 120

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

    const brainResponse = await fetch(`${BACKEND_URL}/api/optimize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ product_id }),
    })

    if (!brainResponse.ok) {
      const errorData = await brainResponse.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.detail || `Brain error: ${brainResponse.status}` },
        { status: brainResponse.status }
      )
    }

    const brainData = await brainResponse.json()
    return NextResponse.json(brainData)
  } catch (error: unknown) {
    console.error("Optimize proxy error:", error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: `Unable to optimize: ${errorMessage}` }, { status: 500 })
  }
}
