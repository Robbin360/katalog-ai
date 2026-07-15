import { NextResponse } from "next/server"
import { createSupabaseServerClient, createSupabaseServiceClient, decryptShopifyToken } from '@/lib/supabase/server'

export const maxDuration = 60

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

export async function POST() {
  try {
    const supabase = await createSupabaseServerClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Leer el access_token encriptado usando service role (bypassa RLS)
    const serviceClient = createSupabaseServiceClient();
    const { data: integrationData, error: integrationError } = await serviceClient
        .from("integrations")
        .select("shop_url, access_token")
        .eq("user_id", user.id)
        .eq("provider", "shopify")
        .is("uninstalled_at", null)
        .single();

    if (integrationError || !integrationData) {
        return NextResponse.json({ error: "No Shopify integration found" }, { status: 404 });
    }

    // Desencriptar el token
    const access_token = await decryptShopifyToken(serviceClient, integrationData.access_token);
    const shop_url = integrationData.shop_url;

    const shopUrlPattern = /^[a-zA-Z0-9][-a-zA-Z0-9]*\.myshopify\.com$/
    if (!shopUrlPattern.test(shop_url)) {
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
        shop_url: shop_url,
        access_token: access_token,
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
