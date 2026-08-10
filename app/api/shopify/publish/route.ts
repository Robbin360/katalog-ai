import { NextResponse } from "next/server"
import { createSupabaseServerClient, createSupabaseServiceClient, decryptShopifyToken } from '@/lib/supabase/server'

export const maxDuration = 60

const SHOPIFY_API_VERSION = "2026-04"
const SHOPIFY_FETCH_TIMEOUT_MS = 45_000
const DEFAULT_FRAMEWORK_USED = "manual_publish"
const DEFAULT_TONE_USED = "default"

interface PublishRequestBody {
  productId: string | number
}

interface AiProposal {
  new_title: string
  new_body_html: string
  framework_used?: string
  tone_used?: string
  description_length?: number
}

interface ShopifyProductRow {
  id: number
  shopify_id: string
  current_title: string | null
  current_body_html: string | null
  ai_proposal: unknown
  audit_status: string
}

interface OptimizationInsert {
  user_id: string
  product_id: number
  title_generated: string
  description_generated: string
  framework_used: string
  tone_used: string
  description_length: number
  title_previous: string | null
  description_previous: string | null
  status: "published"
}

interface ShopifyGraphqlError {
  message: string
}

interface ShopifyUserError {
  field?: string[] | null
  message: string
}

interface ShopifyProductUpdatePayload {
  product: {
    id: string
    title: string
  } | null
  userErrors: ShopifyUserError[]
}

interface ShopifyProductUpdateResponse {
  data?: {
    productUpdate?: ShopifyProductUpdatePayload | null
  }
  errors?: ShopifyGraphqlError[]
}

class PublicRouteError extends Error {
  constructor(
    public readonly status: number,
    public readonly publicMessage: string,
    internalMessage?: string
  ) {
    super(internalMessage ?? publicMessage)
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

const parseRequestBody = (payload: unknown): PublishRequestBody => {
  if (!isRecord(payload)) {
    throw new PublicRouteError(400, "Invalid publish request.")
  }

  const productId = payload.productId
  const isValidNumber = typeof productId === "number" && Number.isInteger(productId) && productId > 0
  const isValidString = typeof productId === "string" && /^[0-9]+$/.test(productId.trim())

  if (!isValidNumber && !isValidString) {
    throw new PublicRouteError(400, "Invalid product id.")
  }

  return { productId }
}

const parseAiProposal = (payload: unknown): AiProposal => {
  if (!isRecord(payload)) {
    throw new PublicRouteError(400, "Product or AI proposal not found.")
  }

  const newTitle = payload.new_title
  const newBodyHtml = payload.new_body_html

  if (typeof newTitle !== "string" || newTitle.trim().length === 0) {
    throw new PublicRouteError(400, "Product or AI proposal not found.")
  }

  if (typeof newBodyHtml !== "string" || newBodyHtml.trim().length === 0) {
    throw new PublicRouteError(400, "Product or AI proposal not found.")
  }

  return {
    new_title: newTitle,
    new_body_html: newBodyHtml,
    framework_used: typeof payload.framework_used === "string" && payload.framework_used.trim().length > 0
      ? payload.framework_used.trim()
      : undefined,
    tone_used: typeof payload.tone_used === "string" && payload.tone_used.trim().length > 0
      ? payload.tone_used.trim()
      : undefined,
    description_length: typeof payload.description_length === "number" &&
      Number.isFinite(payload.description_length)
      ? payload.description_length
      : undefined
  }
}

const stripHtml = (html: string): string =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()

const getDescriptionLength = (proposal: AiProposal): number =>
  Math.max(0, Math.trunc(proposal.description_length ?? stripHtml(proposal.new_body_html).length))

const getProductIdForShopify = (shopifyId: string): string => {
  if (shopifyId.startsWith("gid://shopify/Product/")) return shopifyId
  return `gid://shopify/Product/${shopifyId}`
}

const getPublicErrorResponse = (error: unknown): { status: number; message: string } => {
  if (error instanceof PublicRouteError) {
    return { status: error.status, message: error.publicMessage }
  }

  if (error instanceof DOMException && error.name === "TimeoutError") {
    return { status: 504, message: "Shopify publish timed out. Please try again." }
  }

  return { status: 500, message: "Unable to publish product. Please try again." }
}

const getLogError = (error: unknown): string => {
  if (error instanceof Error) return error.message
  return String(error)
}

export async function POST(req: Request) {
  try {
    const requestBody = parseRequestBody(await req.json() as unknown)
    const supabase = await createSupabaseServerClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
    }

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

    const { data: productData, error: productError } = await supabase
      .from("shopify_products")
      .select("id, shopify_id, current_title, current_body_html, ai_proposal, audit_status")
      .eq("id", requestBody.productId)
      .eq("user_id", user.id)
      .single()

    if (productError || !productData) {
      throw new PublicRouteError(404, "Product or AI proposal not found.", productError?.message)
    }

    // Lista blanca: solo productos que pasaron el quality gate (misma doctrina
    // que route_after_save en Katalog-brain). Fallo cerrado: cualquier otro
    // estado bloquea la publicación, antes de reservar crédito. Sin esta guarda,
    // un producto rechazado por el gate (crédito ya reembolsado) podía
    // publicarse desde el ProductSheet y cobrar de nuevo un crédito.
    if (productData.audit_status !== "READY_TO_PUBLISH") {
      return NextResponse.json(
        { error: "Product not approved. It must pass the quality gate before publishing." },
        { status: 409 }
      )
    }

    const product = productData as ShopifyProductRow
    const aiProposal = parseAiProposal(product.ai_proposal)

    // Reserva el crédito ANTES de publicar. Idempotente: si el Brain ya cobró
    // por este producto, devuelve la reserva existente sin descontar de nuevo.
    const { data: reserveData, error: reserveError } = await serviceClient
      .rpc("reserve_or_reuse_product_credit", {
        p_user_id: user.id,
        p_product_id: product.id,
        p_base_amount: 1,
      })

    const reservation = Array.isArray(reserveData) ? reserveData[0] : reserveData

    if (reserveError || !reservation?.success) {
      if (reservation?.reason === "insufficient_credits") {
        return NextResponse.json({ error: "No credits available." }, { status: 402 })
      }
      throw new PublicRouteError(
        500,
        "Unable to reserve credit for this publish.",
        reserveError?.message ?? reservation?.reason ?? "reserve_failed"
      )
    }

    const releaseReservationIfNew = async () => {
      if (reservation.reason !== "reserved_new") return
      try {
        await serviceClient.rpc("refund_product_reservation", {
          p_user_id: user.id,
          p_product_id: product.id,
          p_reservation_id: reservation.reservation_id,
        })
      } catch (refundError) {
        console.error("refund_product_reservation failed", {
          product_id: product.id,
          error: getLogError(refundError),
        })
      }
    }

    const mutation = `
      mutation productUpdate($product: ProductUpdateInput!) {
        productUpdate(product: $product) {
          product { id title }
          userErrors { field message }
        }
      }
    `
    const variables = {
      product: {
        id: getProductIdForShopify(product.shopify_id),
        title: aiProposal.new_title,
        descriptionHtml: aiProposal.new_body_html
      }
    }

    let shopifyResponse: Response
    try {
      shopifyResponse = await fetch(
        `https://${shop_url}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": access_token
          },
          body: JSON.stringify({ query: mutation, variables }),
          signal: AbortSignal.timeout(SHOPIFY_FETCH_TIMEOUT_MS)
        }
      )
    } catch (fetchError) {
      await releaseReservationIfNew()
      throw fetchError
    }

    if (!shopifyResponse.ok) {
      await releaseReservationIfNew()
      throw new PublicRouteError(
        502,
        "Shopify rejected the publish request.",
        `Shopify API Error: ${shopifyResponse.status} ${shopifyResponse.statusText}`
      )
    }

    const shopifyData = await shopifyResponse.json() as ShopifyProductUpdateResponse

    if (shopifyData.errors?.length) {
      await releaseReservationIfNew()
      throw new PublicRouteError(
        502,
        "Shopify rejected the publish request.",
        `GraphQL Error: ${shopifyData.errors[0].message}`
      )
    }

    const userErrors = shopifyData.data?.productUpdate?.userErrors ?? []
    if (userErrors.length > 0) {
      await releaseReservationIfNew()
      throw new PublicRouteError(
        502,
        "Shopify rejected the publish request.",
        `Shopify User Error: ${userErrors[0].message}`
      )
    }

    const updatedProduct = shopifyData.data?.productUpdate?.product
    if (!updatedProduct?.id) {
      await releaseReservationIfNew()
      throw new PublicRouteError(502, "Shopify rejected the publish request.")
    }
    if (updatedProduct.title !== aiProposal.new_title) {
      await releaseReservationIfNew()
      throw new PublicRouteError(
        502,
        "Shopify accepted the update but did not apply the title.",
        `Title mismatch. Sent: ${aiProposal.new_title} | Returned: ${updatedProduct.title}`
      )
    }

    const publishedAt = new Date().toISOString()
    const { error: productUpdateError } = await supabase
      .from("shopify_products")
      .update({
        audit_status: "OPTIMIZED",
        current_body_html: aiProposal.new_body_html,
        current_title: aiProposal.new_title,
        error_log: null,
        last_audit_at: publishedAt,
        updated_at: publishedAt
      })
      .eq("id", product.id)
      .eq("user_id", user.id)

    if (productUpdateError) {
      throw new PublicRouteError(
        500,
        "Product was published, but local sync failed.",
        productUpdateError.message
      )
    }

    const optimizationInsert: OptimizationInsert = {
      user_id: user.id,
      product_id: product.id,
      title_generated: aiProposal.new_title,
      description_generated: aiProposal.new_body_html,
      framework_used: aiProposal.framework_used ?? DEFAULT_FRAMEWORK_USED,
      tone_used: aiProposal.tone_used ?? DEFAULT_TONE_USED,
      description_length: getDescriptionLength(aiProposal),
      title_previous: product.current_title,
      description_previous: product.current_body_html,
      status: "published"
    }

    const { error: optimizationError } = await supabase
      .from("optimizations")
      .insert(optimizationInsert)

    if (optimizationError) {
      throw new PublicRouteError(
        500,
        "Product was published, but optimization history failed.",
        optimizationError.message
      )
    }

    // Confirma el cargo. Idempotente: si el Brain ya lo comprometió,
    // devuelve already_committed sin descontar otra vez.
    const { data: commitData, error: commitError } = await serviceClient
      .rpc("commit_product_credit", {
        p_user_id: user.id,
        p_product_id: product.id,
        p_reservation_id: reservation.reservation_id,
      })

    const commit = Array.isArray(commitData) ? commitData[0] : commitData

    if (commitError || !commit?.success) {
      // El producto YA está publicado. No abortamos: se registra y se sigue.
      console.error("commit_product_credit failed after publish", {
        product_id: product.id,
        user_id: user.id,
        reservation_id: reservation.reservation_id,
        reason: commit?.reason ?? commitError?.message ?? "unknown",
      })
    }

    return NextResponse.json({
      success: true,
      message: "Published to Shopify successfully"
    })
  } catch (error: unknown) {
    const publicError = getPublicErrorResponse(error)
    console.error("Shopify publish failed:", getLogError(error))

    return NextResponse.json(
      { error: publicError.message },
      { status: publicError.status }
    )
  }
}
