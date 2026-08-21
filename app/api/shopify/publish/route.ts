import { NextResponse } from "next/server"
import { createSupabaseServerClient, createSupabaseServiceClient, decryptShopifyToken } from "@/lib/supabase/server"

export const maxDuration = 60

const SHOPIFY_API_VERSION = "2026-04"
const SHOPIFY_FETCH_TIMEOUT_MS = 45_000
const PUBLISH_RETRY_DELAY_MS = 2 * 60 * 1000

interface PublishRequestBody {
  productId: string | number
}

interface AiProposal {
  new_title: string
  new_body_html: string
  seo_title?: string
  seo_description?: string
}

interface ShopifyProductRow {
  id: number
  shopify_id: string
  current_title: string | null
  current_body_html: string | null
  ai_proposal: unknown
  audit_status: string
  publish_attempts?: number | null
  publish_next_retry_at?: string | null
  publish_error_code?: string | null
  publish_error_stage?: string | null
  publish_error_retryable?: boolean | null
  publish_error_at?: string | null
  publish_error_details?: unknown | null
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
    seo: { title?: string | null; description?: string | null } | null
  } | null
  userErrors: ShopifyUserError[]
}

interface ShopifyProductUpdateResponse {
  data?: {
    productUpdate?: ShopifyProductUpdatePayload | null
  }
  errors?: ShopifyGraphqlError[]
}

interface ShopifyProductReadResponse {
  data?: {
    product?: {
      id: string
      title: string
      descriptionHtml: string
    } | null
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

  const seoTitle = typeof payload.seo_title === "string" ? payload.seo_title.trim() : ""
  const seoDescription = typeof payload.seo_description === "string" ? payload.seo_description.trim() : ""

  return {
    new_title: newTitle,
    new_body_html: newBodyHtml,
    ...(seoTitle ? { seo_title: seoTitle } : {}),
    ...(seoDescription ? { seo_description: seoDescription } : {}),
  }
}

const getProductIdForShopify = (shopifyId: string): string => {
  if (shopifyId.startsWith("gid://shopify/Product/")) return shopifyId
  return `gid://shopify/Product/${shopifyId}`
}

// Huella semántica: replica public.publish_text_fingerprint en JS
// quitar tags HTML, convertir &nbsp; y entidades comunes, colapsar whitespace, trim
const publishTextFingerprint = (text: string | null | undefined): string => {
  if (!text) return ""
  let t = String(text)
    .replace(/\u00A0/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#34;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
  t = t.replace(/<[^>]*>/g, " ")
  t = t.replace(/\s+/g, " ").trim()
  return t
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

  // Estado para registro recuperable. Solo p_shopify_confirmed=true
  // después de validar product.id, title y descriptionHtml no vacío
  // devueltos por Shopify. Cualquier error anterior usa false.
  let userId: string | null = null
  let productIdForLog: number | null = null
  let shopifyConfirmed = false
  let hasLoggedFailure = false
  const serviceClient = createSupabaseServiceClient()

  const getNextRetryAt = (retryable: boolean): string | null => {
    if (!retryable) return null
    return new Date(Date.now() + PUBLISH_RETRY_DELAY_MS).toISOString()
  }

  const recordFailure = async (args: {
    code: string
    stage: string
    retryable: boolean
    message: string
    details?: Record<string, unknown>
    shopifyConfirmed?: boolean
  }): Promise<void> => {
    if (!userId || !productIdForLog || hasLoggedFailure) return
    hasLoggedFailure = true
    const nextRetryAt = getNextRetryAt(args.retryable)
    const safeMessage = (args.message ?? args.code ?? "publish_failed").slice(0, 4000)
    const safeDetails = isRecord(args.details) ? args.details : {}
    try {
      await serviceClient.rpc("record_publish_failure", {
        p_user_id: userId,
        p_product_id: productIdForLog,
        p_code: args.code.slice(0, 120),
        p_stage: args.stage.slice(0, 80),
        p_retryable: args.retryable,
        p_message: safeMessage,
        p_details: safeDetails,
        p_next_retry_at: nextRetryAt,
        p_shopify_confirmed: args.shopifyConfirmed ?? shopifyConfirmed,
      })
    } catch (rpcError) {
      console.error("record_publish_failure failed:", getLogError(rpcError))
    }
  }

  try {
    const requestBody = parseRequestBody(rawBody)
    productIdForLog = typeof requestBody.productId === "string"
      ? parseInt(String(requestBody.productId).trim(), 10)
      : requestBody.productId

    const supabase = await createSupabaseServerClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
    }
    userId = user.id

    const { data: integrationData, error: integrationError } = await serviceClient
      .from("integrations")
      .select("shop_url, access_token")
      .eq("user_id", user.id)
      .eq("provider", "shopify")
      .is("uninstalled_at", null)
      .single()

    if (integrationError || !integrationData) {
      await recordFailure({
        code: "integration_missing",
        stage: "preflight",
        retryable: false,
        message: integrationError?.message ?? "No Shopify integration found",
        details: {},
        shopifyConfirmed: false,
      })
      return NextResponse.json({ error: "No Shopify integration found. Please connect Shopify." }, { status: 404 })
    }

    let access_token: string
    try {
      access_token = await decryptShopifyToken(serviceClient, integrationData.access_token)
    } catch (decryptError) {
      await recordFailure({
        code: "INVALID_TOKEN",
        stage: "preflight",
        retryable: false,
        message: getLogError(decryptError),
        details: {},
        shopifyConfirmed: false,
      })
      throw new PublicRouteError(500, "Shopify authentication failed. Please reconnect Shopify.", getLogError(decryptError))
    }
    const shop_url = integrationData.shop_url

    const shopUrlPattern = /^[a-zA-Z0-9][-a-zA-Z0-9]*\.myshopify\.com$/
    if (!shopUrlPattern.test(shop_url)) {
      await recordFailure({
        code: "invalid_shop_url",
        stage: "preflight",
        retryable: false,
        message: "Invalid Shopify URL format detected.",
        details: { shop_url: shop_url?.slice(0, 120) },
        shopifyConfirmed: false,
      })
      return NextResponse.json(
        { error: "Invalid Shopify URL format detected." },
        { status: 400 }
      )
    }

    const { data: productData, error: productError } = await supabase
      .from("shopify_products")
      .select("id, shopify_id, current_title, current_body_html, ai_proposal, audit_status, publish_error_code, publish_error_stage, publish_error_retryable, publish_attempts, publish_next_retry_at")
      .eq("id", requestBody.productId)
      .eq("user_id", user.id)
      .single()

    if (productError || !productData) {
      await recordFailure({
        code: "product_not_found",
        stage: "preflight",
        retryable: false,
        message: productError?.message ?? "Product not found",
        details: { productId: productIdForLog },
        shopifyConfirmed: false,
      })
      throw new PublicRouteError(404, "Product or AI proposal not found.", productError?.message)
    }

    const product = productData as ShopifyProductRow
    productIdForLog = product.id

    // Detectar retry de cierre local pendiente o timeout/network
    const isRetry = product.publish_error_retryable === true &&
      typeof product.publish_error_code === "string" &&
      ["LOCAL_FINALIZE_ERROR", "TIMEOUT", "NETWORK_ERROR"].includes(product.publish_error_code)

    // Lista blanca: solo productos que pasaron el quality gate, salvo retry de timeout/network/local_finalize
    if (productData.audit_status !== "READY_TO_PUBLISH" && !isRetry) {
      await recordFailure({
        code: "not_ready_to_publish",
        stage: "preflight",
        retryable: false,
        message: `audit_status=${productData.audit_status}`,
        details: { audit_status: productData.audit_status },
        shopifyConfirmed: false,
      })
      return NextResponse.json(
        { error: "Product not approved. It must pass the quality gate before publishing." },
        { status: 409 }
      )
    }

    let aiProposal: AiProposal
    try {
      aiProposal = parseAiProposal(product.ai_proposal)
    } catch (e) {
      if (e instanceof PublicRouteError) {
        await recordFailure({
          code: "proposal_missing",
          stage: "preflight",
          retryable: false,
          message: getLogError(e),
          details: {},
          shopifyConfirmed: false,
        })
      }
      throw e
    }

    const seoTitle = aiProposal.seo_title ?? aiProposal.new_title
    const seoDescription = aiProposal.seo_description

    // ─────────────────────────────────────────────────────────────
    // Flujo retry: lectura previa para evitar doble mutación
    // ─────────────────────────────────────────────────────────────
    if (isRetry) {
      const readQuery = `
        query getProduct($id: ID!) {
          product(id: $id) {
            id
            title
            descriptionHtml
          }
        }
      `
      const readVariables = { id: getProductIdForShopify(product.shopify_id) }
      let readResponse: Response
      try {
        readResponse = await fetch(
          `https://${shop_url}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Shopify-Access-Token": access_token,
            },
            body: JSON.stringify({ query: readQuery, variables: readVariables }),
            signal: AbortSignal.timeout(SHOPIFY_FETCH_TIMEOUT_MS),
          }
        )
      } catch (fetchError) {
        const isTimeout = fetchError instanceof DOMException && (fetchError as DOMException).name === "TimeoutError"
        await recordFailure({
          code: isTimeout ? "TIMEOUT" : "NETWORK_ERROR",
          stage: "shopify_request",
          retryable: true,
          message: getLogError(fetchError),
          details: { name: fetchError instanceof Error ? fetchError.name : String(fetchError) },
          shopifyConfirmed: false,
        })
        return NextResponse.json(
          { error: "Shopify is temporarily unavailable. Please retry publishing." },
          { status: isTimeout ? 504 : 502 }
        )
      }

      if (!readResponse.ok) {
        const status = readResponse.status
        const retryable = status === 429 || status >= 500
        if (retryable) {
          await recordFailure({
            code: status === 429 ? "RATE_LIMITED" : "SHOPIFY_5XX",
            stage: "shopify_request",
            retryable: true,
            message: `Shopify read failed: ${status} ${readResponse.statusText}`,
            details: { status, statusText: readResponse.statusText },
            shopifyConfirmed: false,
          })
          return NextResponse.json(
            { error: "Shopify is temporarily unavailable. Please retry publishing." },
            { status: status === 429 ? 429 : 502 }
          )
        } else {
          // 401,403,404 o permanente
          const code = status === 401 ? "INVALID_TOKEN" : status === 403 ? "SHOPIFY_FORBIDDEN" : status === 404 ? "SHOPIFY_NOT_FOUND" : "SHOPIFY_READ_ERROR"
          await recordFailure({
            code,
            stage: "shopify_request",
            retryable: false,
            message: `Shopify read failed: ${status} ${readResponse.statusText}`,
            details: { status, statusText: readResponse.statusText },
            shopifyConfirmed: false,
          })
          if (status === 401 || status === 403) {
            return NextResponse.json(
              { error: "Shopify authentication failed. Please reconnect Shopify." },
              { status: status === 401 ? 401 : 403 }
            )
          }
          if (status === 404) {
            return NextResponse.json(
              { error: "Product not found in Shopify." },
              { status: 404 }
            )
          }
          return NextResponse.json(
            { error: "Shopify read failed. Please try again." },
            { status: 502 }
          )
        }
      }

      const readData = (await readResponse.json()) as ShopifyProductReadResponse
      if (readData.errors?.length) {
        await recordFailure({
          code: "SHOPIFY_READ_ERROR",
          stage: "shopify_request",
          retryable: false,
          message: `GraphQL Error: ${readData.errors[0].message}`,
          details: { errors: readData.errors.slice(0, 3).map((e) => e.message) },
          shopifyConfirmed: false,
        })
        return NextResponse.json(
          { error: "Shopify read failed. Please try again." },
          { status: 502 }
        )
      }

      const remoteProduct = readData.data?.product
      if (!remoteProduct?.id) {
        await recordFailure({
          code: "SHOPIFY_NOT_FOUND",
          stage: "shopify_request",
          retryable: false,
          message: "Shopify product not found",
          details: {},
          shopifyConfirmed: false,
        })
        return NextResponse.json(
          { error: "Product not found in Shopify." },
          { status: 404 }
        )
      }

      if (typeof remoteProduct.title !== "string" || typeof remoteProduct.descriptionHtml !== "string") {
        await recordFailure({
          code: "SHOPIFY_READ_ERROR",
          stage: "shopify_verify",
          retryable: false,
          message: "Shopify returned invalid product data",
          details: {},
          shopifyConfirmed: false,
        })
        return NextResponse.json(
          { error: "Shopify returned invalid product data." },
          { status: 502 }
        )
      }

      // Huella semántica: si ya coincide, no mutar
      const remoteTitleFp = publishTextFingerprint(remoteProduct.title)
      const proposalTitleFp = publishTextFingerprint(aiProposal.new_title)
      const remoteDescFp = publishTextFingerprint(remoteProduct.descriptionHtml)
      const proposalDescFp = publishTextFingerprint(aiProposal.new_body_html)

      if (remoteTitleFp === proposalTitleFp && remoteDescFp === proposalDescFp) {
        // Ya está publicado, solo cerrar localmente
        if (remoteProduct.title.trim().length === 0 || remoteProduct.descriptionHtml.trim().length === 0) {
          await recordFailure({
            code: "SHOPIFY_READ_ERROR",
            stage: "shopify_verify",
            retryable: false,
            message: "Shopify returned empty title or description",
            details: {},
            shopifyConfirmed: false,
          })
          return NextResponse.json(
            { error: "Shopify returned invalid product data." },
            { status: 502 }
          )
        }
        shopifyConfirmed = true
        const { data: finalizeData, error: finalizeError } = await serviceClient.rpc(
          "finalize_product_publish",
          {
            p_user_id: user.id,
            p_product_id: product.id,
            p_confirmed_title: remoteProduct.title,
            p_confirmed_body_html: remoteProduct.descriptionHtml,
          }
        )
        const finalizeResult: FinalizePublishResult | undefined = Array.isArray(finalizeData)
          ? finalizeData[0]
          : (finalizeData as FinalizePublishResult | null) ?? undefined

        if (finalizeError || !finalizeResult) {
          await recordFailure({
            code: "LOCAL_FINALIZE_ERROR",
            stage: "local_finalize",
            retryable: true,
            message: finalizeError?.message ?? "finalize_product_publish returned no data",
            details: { finalizeError: finalizeError?.message },
            shopifyConfirmed: true,
          })
          return NextResponse.json(
            { error: "Shopify was updated. Finishing the local record..." },
            { status: 500 }
          )
        }

        if (finalizeResult.reason === "completed" || finalizeResult.reason === "already_completed") {
          return NextResponse.json({
            success: true,
            message: "Published to Shopify successfully",
          })
        }

        if (finalizeResult.reason === "not_ready_to_publish") {
          await recordFailure({
            code: "LOCAL_FINALIZE_ERROR",
            stage: "local_finalize",
            retryable: true,
            message: `finalize_product_publish not_ready_to_publish`,
            details: { reason: finalizeResult.reason },
            shopifyConfirmed: true,
          })
          return NextResponse.json(
            { error: "Shopify was updated. Finishing the local record..." },
            { status: 500 }
          )
        }

        if (finalizeResult.reason === "product_not_found" || finalizeResult.reason === "user_mismatch") {
          await recordFailure({
            code: "LOCAL_FINALIZE_ERROR",
            stage: "local_finalize",
            retryable: true,
            message: `finalize_product_publish ${finalizeResult.reason}`,
            details: { reason: finalizeResult.reason },
            shopifyConfirmed: true,
          })
          return NextResponse.json(
            { error: "Shopify was updated. Finishing the local record..." },
            { status: 500 }
          )
        }

        await recordFailure({
          code: "LOCAL_FINALIZE_ERROR",
          stage: "local_finalize",
          retryable: true,
          message: `finalize_product_publish unexpected reason: ${finalizeResult.reason}`,
          details: { reason: finalizeResult.reason },
          shopifyConfirmed: true,
        })
        return NextResponse.json(
          { error: "Shopify was updated. Finishing the local record..." },
          { status: 500 }
        )
      }
      // No coincide -> caer al flujo de mutación (una sola)
    }

    // ─────────────────────────────────────────────────────────────
    // Flujo normal (nueva publicación o retry con contenido distinto)
    // ─────────────────────────────────────────────────────────────
    const mutation = `
      mutation productUpdate($product: ProductUpdateInput!) {
        productUpdate(product: $product) {
          product {
            id
            title
            descriptionHtml
            seo {
              title
              description
            }
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
        ...(seoTitle || seoDescription
          ? {
              seo: {
                ...(seoTitle ? { title: seoTitle } : {}),
                ...(seoDescription ? { description: seoDescription } : {}),
              },
            }
          : {}),
      },
    }

    let shopifyResponse: Response
    try {
      shopifyResponse = await fetch(
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
    } catch (fetchError) {
      const isTimeout = fetchError instanceof DOMException && (fetchError as DOMException).name === "TimeoutError"
      await recordFailure({
        code: isTimeout ? "TIMEOUT" : "NETWORK_ERROR",
        stage: "shopify_request",
        retryable: true,
        message: getLogError(fetchError),
        details: { name: fetchError instanceof Error ? fetchError.name : String(fetchError) },
        shopifyConfirmed: false,
      })
      throw fetchError
    }

    if (!shopifyResponse.ok) {
      const status = shopifyResponse.status
      if (status === 401 || status === 403) {
        await recordFailure({
          code: "INVALID_TOKEN",
          stage: "shopify_request",
          retryable: false,
          message: `Shopify API Error: ${status} ${shopifyResponse.statusText}`,
          details: { status, statusText: shopifyResponse.statusText },
          shopifyConfirmed: false,
        })
        throw new PublicRouteError(
          status === 401 ? 401 : 403,
          status === 401 ? "Shopify authentication failed. Please reconnect Shopify." : "Shopify permission denied. Please reconnect Shopify.",
          `Shopify API Error: ${status} ${shopifyResponse.statusText}`
        )
      }
      if (status === 404) {
        await recordFailure({
          code: "SHOPIFY_NOT_FOUND",
          stage: "shopify_request",
          retryable: false,
          message: `Shopify API Error: ${status} ${shopifyResponse.statusText}`,
          details: { status, statusText: shopifyResponse.statusText },
          shopifyConfirmed: false,
        })
        throw new PublicRouteError(
          404,
          "Product not found in Shopify.",
          `Shopify API Error: ${status} ${shopifyResponse.statusText}`
        )
      }
      const retryable = status === 429 || status >= 500
      await recordFailure({
        code: "shopify_http_error",
        stage: "shopify_request",
        retryable,
        message: `Shopify API Error: ${status} ${shopifyResponse.statusText}`,
        details: { status, statusText: shopifyResponse.statusText },
        shopifyConfirmed: false,
      })
      if (!retryable) {
        throw new PublicRouteError(
          502,
          "Shopify rejected the publish request.",
          `Shopify API Error: ${status} ${shopifyResponse.statusText}`
        )
      }
      throw new PublicRouteError(
        502,
        "Shopify is temporarily unavailable. Please retry publishing.",
        `Shopify API Error: ${status} ${shopifyResponse.statusText}`
      )
    }

    const shopifyData = (await shopifyResponse.json()) as ShopifyProductUpdateResponse

    if (shopifyData.errors?.length) {
      await recordFailure({
        code: "shopify_graphql_error",
        stage: "shopify_request",
        retryable: false,
        message: `GraphQL Error: ${shopifyData.errors[0].message}`,
        details: { errors: shopifyData.errors.slice(0, 3).map((e) => e.message) },
        shopifyConfirmed: false,
      })
      throw new PublicRouteError(
        502,
        "Shopify rejected the publish request.",
        `GraphQL Error: ${shopifyData.errors[0].message}`
      )
    }

    const userErrors = shopifyData.data?.productUpdate?.userErrors ?? []
    if (userErrors.length > 0) {
      const firstMsg = userErrors[0].message.toLowerCase()
      const isInvalidToken = firstMsg.includes("token") || firstMsg.includes("auth") || firstMsg.includes("permission")
      await recordFailure({
        code: isInvalidToken ? "INVALID_TOKEN" : "shopify_user_error",
        stage: "shopify_request",
        retryable: false,
        message: `Shopify User Error: ${userErrors[0].message}`,
        details: { userErrors: userErrors.slice(0, 3) },
        shopifyConfirmed: false,
      })
      if (isInvalidToken) {
        throw new PublicRouteError(
          401,
          "Shopify authentication failed. Please reconnect Shopify.",
          `Shopify User Error: ${userErrors[0].message}`
        )
      }
      throw new PublicRouteError(
        502,
        "Shopify rejected the publish request.",
        `Shopify User Error: ${userErrors[0].message}`
      )
    }

    const updatedProduct = shopifyData.data?.productUpdate?.product

    if (!updatedProduct?.id) {
      await recordFailure({
        code: "shopify_missing_id",
        stage: "shopify_verify",
        retryable: false,
        message: "Shopify returned no product id",
        details: {},
        shopifyConfirmed: false,
      })
      throw new PublicRouteError(502, "Shopify rejected the publish request.")
    }

    if (updatedProduct.title !== aiProposal.new_title) {
      await recordFailure({
        code: "shopify_title_mismatch",
        stage: "shopify_verify",
        retryable: false,
        message: `Title mismatch. Sent: ${aiProposal.new_title} | Returned: ${updatedProduct.title}`,
        details: { sent: aiProposal.new_title, returned: updatedProduct.title },
        shopifyConfirmed: false,
      })
      throw new PublicRouteError(
        502,
        "Shopify accepted the update but did not apply the title.",
        `Title mismatch. Sent: ${aiProposal.new_title} | Returned: ${updatedProduct.title}`
      )
    }

    if (
      typeof updatedProduct.descriptionHtml !== "string" ||
      updatedProduct.descriptionHtml.trim().length === 0
    ) {
      await recordFailure({
        code: "shopify_empty_description",
        stage: "shopify_verify",
        retryable: false,
        message: "Shopify returned an empty descriptionHtml.",
        details: {},
        shopifyConfirmed: false,
      })
      throw new PublicRouteError(
        502,
        "Shopify accepted the update but returned no description.",
        "Shopify returned an empty descriptionHtml."
      )
    }

    shopifyConfirmed = true

    if (updatedProduct.seo) {
      const seoMismatches: string[] = []
      if (seoTitle !== undefined && updatedProduct.seo.title !== seoTitle) {
        seoMismatches.push(`title: sent "${seoTitle}" | returned "${updatedProduct.seo.title ?? ""}"`)
      }
      if (seoDescription !== undefined && updatedProduct.seo.description !== seoDescription) {
        seoMismatches.push(`description: sent "${seoDescription}" | returned "${updatedProduct.seo.description ?? ""}"`)
      }
      if (seoMismatches.length > 0) {
        console.warn(`Shopify publish: seo mismatch after update (product ${product.id}): ${seoMismatches.join("; ")}`)
      }
    }

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
      await recordFailure({
        code: "LOCAL_FINALIZE_ERROR",
        stage: "local_finalize",
        retryable: true,
        message: finalizeError?.message ?? "finalize_product_publish returned no data",
        details: { finalizeError: finalizeError?.message },
        shopifyConfirmed: true,
      })
      throw new PublicRouteError(
        500,
        "Shopify was updated. We are finishing the local record. Please retry publishing.",
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
      await recordFailure({
        code: "LOCAL_FINALIZE_ERROR",
        stage: "local_finalize",
        retryable: true,
        message: `finalize_product_publish not_ready_to_publish`,
        details: { reason: finalizeResult.reason },
        shopifyConfirmed: true,
      })
      // Para publicación nueva, mantener 409; para retry, 500 con finishing
      if (isRetry) {
        return NextResponse.json(
          { error: "Shopify was updated. Finishing the local record... Please retry publishing." },
          { status: 500 }
        )
      }
      return NextResponse.json(
        { error: "Product not approved. It must pass the quality gate before publishing." },
        { status: 409 }
      )
    }

    if (finalizeResult.reason === "product_not_found" || finalizeResult.reason === "user_mismatch") {
      await recordFailure({
        code: "LOCAL_FINALIZE_ERROR",
        stage: "local_finalize",
        retryable: true,
        message: `finalize_product_publish ${finalizeResult.reason}`,
        details: { reason: finalizeResult.reason },
        shopifyConfirmed: true,
      })
      if (isRetry) {
        return NextResponse.json(
          { error: "Shopify was updated. Finishing the local record... Please retry publishing." },
          { status: 500 }
        )
      }
      return NextResponse.json(
        { error: "Product or AI proposal not found." },
        { status: 404 }
      )
    }

    await recordFailure({
      code: "LOCAL_FINALIZE_ERROR",
      stage: "local_finalize",
      retryable: true,
      message: `finalize_product_publish unexpected reason: ${finalizeResult.reason}`,
      details: { reason: finalizeResult.reason },
      shopifyConfirmed: true,
    })
    throw new PublicRouteError(
      500,
      "Shopify was updated. We are finishing the local record. Please retry publishing.",
      `finalize_product_publish unexpected reason: ${finalizeResult.reason}`
    )
  } catch (error: unknown) {
    if (!hasLoggedFailure && userId && productIdForLog) {
      const isTimeout = error instanceof DOMException && (error as DOMException).name === "TimeoutError"
      const isNetwork = error instanceof TypeError
      let code = "UNKNOWN_ERROR"
      let stage: string = shopifyConfirmed ? "local_finalize" : "shopify_request"
      let retryable = shopifyConfirmed ? true : false
      let message = getLogError(error)
      let details: Record<string, unknown> = {}

      if (error instanceof PublicRouteError) {
        const pub = error.publicMessage
        const status = error.status
        if (status === 400 && pub.includes("Invalid product id")) {
          code = "INVALID_PRODUCT_ID"
          stage = "preflight"
          retryable = false
        } else if (status === 400 && pub.includes("Invalid publish request")) {
          code = "INVALID_REQUEST"
          stage = "preflight"
          retryable = false
        } else if (status === 404 && pub.includes("Product or AI proposal not found")) {
          code = "proposal_missing"
          stage = "preflight"
          retryable = false
        } else if (status === 409) {
          code = "not_ready_to_publish"
          stage = "preflight"
          retryable = false
        } else if (status === 502) {
          if (message.includes("GraphQL Error")) {
            code = "SHOPIFY_READ_ERROR"
            stage = "shopify_request"
            retryable = false
          } else if (message.includes("Shopify User Error")) {
            code = "INVALID_TOKEN"
            stage = "shopify_request"
            retryable = false
          } else if (message.includes("Shopify API Error")) {
            code = "SHOPIFY_5XX"
            stage = "shopify_request"
            retryable = message.includes(" 429") || message.includes(" 500") || message.includes(" 502") || message.includes(" 503") || message.includes(" 504")
          } else if (message.includes("Title mismatch")) {
            code = "SHOPIFY_VERIFY_ERROR"
            stage = "shopify_verify"
            retryable = false
          } else if (message.includes("empty descriptionHtml")) {
            code = "SHOPIFY_VERIFY_ERROR"
            stage = "shopify_verify"
            retryable = false
          } else {
            code = "SHOPIFY_VERIFY_ERROR"
            stage = "shopify_verify"
            retryable = false
          }
        } else if (status === 500 && pub.includes("Finishing the local record")) {
          code = "LOCAL_FINALIZE_ERROR"
          stage = "local_finalize"
          retryable = true
        } else if (status === 401 || status === 403) {
          code = "INVALID_TOKEN"
          stage = "shopify_request"
          retryable = false
        } else {
          code = "UNKNOWN_ERROR"
          stage = shopifyConfirmed ? "local_finalize" : "preflight"
          retryable = shopifyConfirmed
        }
        details = {}
      } else if (isTimeout) {
        code = "TIMEOUT"
        stage = "shopify_request"
        retryable = true
        message = "Shopify publish timed out. Please try again."
        details = { name: (error as DOMException).name }
      } else if (isNetwork) {
        code = "NETWORK_ERROR"
        stage = "shopify_request"
        retryable = true
        details = { name: (error as Error).name }
      } else {
        code = "UNKNOWN_ERROR"
        stage = shopifyConfirmed ? "local_finalize" : "shopify_request"
        retryable = true
        details = {}
      }

      try {
        const nextRetryAt = getNextRetryAt(retryable)
        await serviceClient.rpc("record_publish_failure", {
          p_user_id: userId,
          p_product_id: productIdForLog,
          p_code: code.slice(0, 120),
          p_stage: stage.slice(0, 80),
          p_retryable: retryable,
          p_message: message.slice(0, 4000),
          p_details: details,
          p_next_retry_at: nextRetryAt,
          p_shopify_confirmed: shopifyConfirmed,
        })
      } catch (rpcError) {
        console.error("record_publish_failure failed (catch):", getLogError(rpcError))
      }
    }

    const publicError = getPublicErrorResponse(error)
    // Timeout mantiene 504, pero TypeError para publicación nueva debe ser 500 (compatibilidad con tests)
    if (error instanceof DOMException && error.name === "TimeoutError") {
      // Solo si no es retry con lectura previa (que ya retorna 504 arriba), aquí es productUpdate timeout
      const isFromRead = false
      if (!isFromRead) {
        // Mantener comportamiento original para productUpdate timeout: 504 via getPublicErrorResponse ya es 504, pero asegurar
      }
      return NextResponse.json(
        { error: "Shopify is temporarily unavailable. Please retry publishing." },
        { status: 504 }
      )
    }
    console.error("Shopify publish failed:", getLogError(error))

    return NextResponse.json(
      { error: publicError.message },
      { status: publicError.status }
    )
  }
}
