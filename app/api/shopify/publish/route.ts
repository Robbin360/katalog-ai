import { NextResponse } from "next/server"
import { createSupabaseServerClient, createSupabaseServiceClient, decryptShopifyToken } from "@/lib/supabase/server"

export const maxDuration = 60

const SHOPIFY_API_VERSION = "2026-04"
const SHOPIFY_FETCH_TIMEOUT_MS = 45_000

interface PublishRequestBody {
  productId: string | number
}

interface AiProposal {
  new_title: string
  new_body_html: string
}

interface ShopifyProductRow {
  id: number
  shopify_id: string
  current_title: string | null
  current_body_html: string | null
  ai_proposal: unknown
  audit_status: string
}

interface FinalizePublishResult {
  success?: boolean
  reason?: string
  optimization_id?: string
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
    descriptionHtml: string
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
  }
}

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
  let rawBody: unknown
  try {
    rawBody = await req.json()
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body." },
      { status: 400 }
    )
  }

  try {
    const requestBody = parseRequestBody(rawBody)
    const supabase = await createSupabaseServerClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
    }

    // Leer el access_token encriptado usando service role (bypassa RLS)
    const serviceClient = createSupabaseServiceClient()
    const { data: integrationData, error: integrationError } = await serviceClient
      .from("integrations")
      .select("shop_url, access_token")
      .eq("user_id", user.id)
      .eq("provider", "shopify")
      .is("uninstalled_at", null)
      .single()

    if (integrationError || !integrationData) {
      return NextResponse.json({ error: "No Shopify integration found" }, { status: 404 })
    }

    // Desencriptar el token
    const access_token = await decryptShopifyToken(serviceClient, integrationData.access_token)
    const shop_url = integrationData.shop_url

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

    // Lista blanca: solo productos que pasaron el quality gate.
    if (productData.audit_status !== "READY_TO_PUBLISH") {
      return NextResponse.json(
        { error: "Product not approved. It must pass the quality gate before publishing." },
        { status: 409 }
      )
    }

    const product = productData as ShopifyProductRow
    const aiProposal = parseAiProposal(product.ai_proposal)

    const mutation = `
      mutation productUpdate($product: ProductUpdateInput!) {
        productUpdate(product: $product) {
          product {
            id
            title
            descriptionHtml
          }
          userErrors {
            field
            message
          }
        }
      }
    `
    const variables = {
      product: {
        id: getProductIdForShopify(product.shopify_id),
        title: aiProposal.new_title,
        descriptionHtml: aiProposal.new_body_html,
      },
    }

    const shopifyResponse = await fetch(
      `https://${shop_url}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": access_token,
        },
        body: JSON.stringify({ query: mutation, variables }),
        signal: AbortSignal.timeout(SHOPIFY_FETCH_TIMEOUT_MS),
      }
    )

    if (!shopifyResponse.ok) {
      throw new PublicRouteError(
        502,
        "Shopify rejected the publish request.",
        `Shopify API Error: ${shopifyResponse.status} ${shopifyResponse.statusText}`
      )
    }

    const shopifyData = (await shopifyResponse.json()) as ShopifyProductUpdateResponse

    if (shopifyData.errors?.length) {
      throw new PublicRouteError(
        502,
        "Shopify rejected the publish request.",
        `GraphQL Error: ${shopifyData.errors[0].message}`
      )
    }

    const userErrors = shopifyData.data?.productUpdate?.userErrors ?? []
    if (userErrors.length > 0) {
      throw new PublicRouteError(
        502,
        "Shopify rejected the publish request.",
        `Shopify User Error: ${userErrors[0].message}`
      )
    }

    const updatedProduct = shopifyData.data?.productUpdate?.product

    if (!updatedProduct?.id) {
      throw new PublicRouteError(502, "Shopify rejected the publish request.")
    }

    if (updatedProduct.title !== aiProposal.new_title) {
      throw new PublicRouteError(
        502,
        "Shopify accepted the update but did not apply the title.",
        `Title mismatch. Sent: ${aiProposal.new_title} | Returned: ${updatedProduct.title}`
      )
    }

    // Shopify es la autoridad sobre su propio HTML: puede reescribir tags,
    // atributos o entidades legítimamente. Aquí solo se exige que devolvió
    // contenido. La comparación semántica contra la propuesta aprobada la
    // hace finalize_product_publish, en un único lugar.
    if (
      typeof updatedProduct.descriptionHtml !== "string" ||
      updatedProduct.descriptionHtml.trim().length === 0
    ) {
      throw new PublicRouteError(
        502,
        "Shopify accepted the update but returned no description.",
        "Shopify returned an empty descriptionHtml."
      )
    }

    // Atomic local commit via finalize_product_publish RPC
    const { data: finalizeData, error: finalizeError } = await serviceClient.rpc(
      "finalize_product_publish",
      {
        p_user_id: user.id,
        p_product_id: product.id,
        p_confirmed_title: updatedProduct.title,
        p_confirmed_body_html: updatedProduct.descriptionHtml,
      }
    )

    const finalizeResult: FinalizePublishResult | undefined = Array.isArray(finalizeData)
      ? finalizeData[0]
      : (finalizeData as FinalizePublishResult | null) ?? undefined

    if (finalizeError || !finalizeResult) {
      throw new PublicRouteError(
        500,
        "Shopify was updated, but the local record failed. Please retry publishing.",
        finalizeError?.message ?? "finalize_product_publish returned no data"
      )
    }

    if (finalizeResult.reason === "completed" || finalizeResult.reason === "already_completed") {
      return NextResponse.json({
        success: true,
        message: "Published to Shopify successfully",
      })
    }

    if (finalizeResult.reason === "not_ready_to_publish") {
      return NextResponse.json(
        { error: "Product not approved. It must pass the quality gate before publishing." },
        { status: 409 }
      )
    }

    if (finalizeResult.reason === "product_not_found" || finalizeResult.reason === "user_mismatch") {
      return NextResponse.json(
        { error: "Product or AI proposal not found." },
        { status: 404 }
      )
    }

    throw new PublicRouteError(
      500,
      "Shopify was updated, but the local record failed. Please retry publishing.",
      `finalize_product_publish unexpected reason: ${finalizeResult.reason}`
    )
  } catch (error: unknown) {
    const publicError = getPublicErrorResponse(error)
    console.error("Shopify publish failed:", getLogError(error))

    return NextResponse.json(
      { error: publicError.message },
      { status: publicError.status }
    )
  }
}
