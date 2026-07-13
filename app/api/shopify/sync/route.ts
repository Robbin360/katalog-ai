import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export const maxDuration = 60

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

interface ShopifyIntegration {
  shop_url: string
  access_token: string
}

export async function POST() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return cookieStore.getAll() } } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: integrationData, error: integrationError } = await supabase
      .from("integrations")
      .select("shop_url, access_token")
      .eq("user_id", user.id)
      .eq("provider", "shopify")
      .single()

    const integration = integrationData as ShopifyIntegration | null

    if (integrationError || !integration) {
      return NextResponse.json(
        { error: "Please connect Shopify in Settings first." },
        { status: 400 }
      )
    }

    const shopUrlPattern = /^[a-zA-Z0-9][-a-zA-Z0-9]*\.myshopify\.com$/
    if (!shopUrlPattern.test(integration.shop_url)) {
      return NextResponse.json(
        { error: "Invalid Shopify URL format detected." },
        { status: 400 }
      )
    }

    // Trigger sync in katalog-brain (Python/FastAPI background task)
    const brainSyncUrl = `${BACKEND_URL}/api/shopify/sync`
    const brainResponse = await fetch(brainSyncUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: user.id,
        shop_url: integration.shop_url,
        access_token: integration.access_token,
      }),
    })

    if (!brainResponse.ok) {
      const errorText = await brainResponse.text()
      throw new Error(`Katalog Brain Sync Error: ${brainResponse.status} - ${errorText}`)
    }

    const brainData = await brainResponse.json()

    return NextResponse.json({
      success: true,
      message: "Sync started in background.",
      data: brainData,
    })
  } catch (error: unknown) {
    console.error("Shopify sync failed to start:", error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: `Unable to start sync: ${errorMessage}` }, { status: 500 })
  }
}
