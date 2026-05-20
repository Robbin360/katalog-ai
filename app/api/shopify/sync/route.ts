import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export const maxDuration = 60

const SHOPIFY_API_VERSION = "2026-04"
const SHOPIFY_FETCH_TIMEOUT_MS = 45_000
const PENDING_AUDIT_STATUS = "PENDING_AUDIT"

interface ShopifyIntegration {
  shop_url: string
  access_token: string
}

interface ShopifyGraphqlError {
  message: string
}

interface ShopifyFeaturedImage {
  url: string | null
}

interface ShopifyVariant {
  price: string | null
  compareAtPrice: string | null
  inventoryQuantity: number | null
  sku: string | null
}

interface ShopifyVariantConnection {
  nodes: ShopifyVariant[]
}

interface ShopifyProduct {
  id: string
  title: string
  descriptionHtml: string | null
  vendor: string | null
  totalInventory: number | null
  featuredImage: ShopifyFeaturedImage | null
  variants: ShopifyVariantConnection
}

interface ShopifyOrderLineItem {
  product: {
    id: string
  } | null
  quantity: number
}

interface ShopifyOrder {
  createdAt: string
  lineItems: {
    nodes: ShopifyOrderLineItem[]
  }
}

interface ShopifySyncData {
  products: {
    nodes: ShopifyProduct[]
  }
  orders: {
    nodes: ShopifyOrder[]
  }
}

interface ShopifyGraphqlResponse {
  data?: ShopifySyncData
  errors?: ShopifyGraphqlError[]
}

interface ExistingShopifyProduct {
  shopify_id: string
  current_body_html: string | null
  audit_status: string | null
  audit_score: number | null
}

interface SalesWindow {
  d7: number
  d14: number
  d30: number
}

interface ShopifyProductUpsert {
  user_id: string
  shopify_id: string
  current_title: string
  current_body_html: string | null
  vendor: string | null
  image_url: string | null
  price: number
  compare_at_price: number | null
  inventory_quantity: number
  sales_last_7_days: number
  audit_status: string
  audit_score: number
  updated_at: string
}

interface ProductMetricUpsert {
  user_id: string
  product_id: string
  measured_at: string
  conversion_rate: null
  orders_count_7d: number
  orders_count_14d: number
  orders_count_30d: number
  price: number
}

const extractNumericId = (gid: string): string => gid.split("/").pop() || gid

const parseMoney = (value: string | null | undefined): number => {
  if (!value) return 0

  const parsedValue = Number.parseFloat(value)
  return Number.isFinite(parsedValue) ? parsedValue : 0
}

const getPublicErrorMessage = (error: unknown): string => {
  if (error instanceof DOMException && error.name === "TimeoutError") {
    return "Shopify sync timed out. Please try again."
  }

  return "Unable to sync Shopify data. Please try again."
}

const getLogError = (error: unknown): string => {
  if (error instanceof Error) return error.message
  return String(error)
}

/**
 * Neutralizes Shopify's HTML Pretty-Printing before comparison.
 * Shopify injects `\n` between tags (e.g. `</li>\n<li>`) which breaks
 * strict equality checks. This function:
 *   1. Strips all whitespace sitting exactly between `>` and `<`
 *   2. Collapses any remaining runs of whitespace into a single space
 *   3. Trims leading/trailing whitespace
 */
const normalizeHtml = (html?: string | null): string => {
  if (!html) return ""
  return html
    .replace(/>\s+</g, "><")
    .replace(/\s+/g, " ")
    .trim()
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

    const now = new Date()
    const updatedAt = now.toISOString()
    const measuredAt = updatedAt.split("T")[0]
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const graphqlQuery = {
      query: `
        query getSyncData($orderQuery: String!) {
          products(first: 50) {
            nodes {
              id
              title
              descriptionHtml
              vendor
              totalInventory
              featuredImage {
                url
              }
              variants(first: 1) {
                nodes {
                  price
                  compareAtPrice
                  inventoryQuantity
                  sku
                }
              }
            }
          }
          orders(first: 250, query: $orderQuery) {
            nodes {
              createdAt
              lineItems(first: 50) {
                nodes {
                  product {
                    id
                  }
                  quantity
                }
              }
            }
          }
        }
      `,
      variables: { orderQuery: `created_at:>=${thirtyDaysAgo.toISOString()}` }
    }

    const shopifyUrl = `https://${integration.shop_url}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`
    const shopifyResponse = await fetch(shopifyUrl, {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": integration.access_token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(graphqlQuery),
      signal: AbortSignal.timeout(SHOPIFY_FETCH_TIMEOUT_MS)
    })

    if (!shopifyResponse.ok) {
      throw new Error(`Shopify API Error: ${shopifyResponse.status} ${shopifyResponse.statusText}`)
    }

    const shopifyPayload = await shopifyResponse.json() as ShopifyGraphqlResponse
    if (shopifyPayload.errors?.length) {
      throw new Error(`GraphQL Error: ${shopifyPayload.errors[0].message}`)
    }

    if (!shopifyPayload.data) {
      throw new Error("Shopify response did not include sync data")
    }

    const products = shopifyPayload.data.products.nodes
    const orders = shopifyPayload.data.orders.nodes
    const productIds = products.map((product) => extractNumericId(product.id))

    const existingProductsById = new Map<string, ExistingShopifyProduct>()
    if (productIds.length > 0) {
      const { data: existingProductsData, error: existingProductsError } = await supabase
        .from("shopify_products")
        .select("shopify_id, current_body_html, audit_status, audit_score")
        .eq("user_id", user.id)
        .in("shopify_id", productIds)

      if (existingProductsError) {
        throw new Error(`Pre-fetch Error: ${existingProductsError.message}`)
      }

      const existingProducts = (existingProductsData ?? []) as ExistingShopifyProduct[]
      existingProducts.forEach((product) => {
        existingProductsById.set(product.shopify_id, product)
      })
    }

    const salesMap: Record<string, SalesWindow> = {}
    orders.forEach((order) => {
      const orderDate = new Date(order.createdAt)
      const diffDays = Math.ceil(
        Math.abs(now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24)
      )

      order.lineItems.nodes.forEach((item) => {
        if (!item.product?.id) return

        const productId = extractNumericId(item.product.id)
        salesMap[productId] ??= { d7: 0, d14: 0, d30: 0 }
        salesMap[productId].d30 += item.quantity

        if (diffDays <= 14) salesMap[productId].d14 += item.quantity
        if (diffDays <= 7) salesMap[productId].d7 += item.quantity
      })
    })

    const productsToSync: ShopifyProductUpsert[] = products.map((product) => {
      const shopifyId = extractNumericId(product.id)
      const mainVariant = product.variants.nodes[0]
      const currentBodyHtml = product.descriptionHtml ?? null
      const existingProduct = existingProductsById.get(shopifyId)
      const isDescriptionUnchanged =
        existingProduct !== undefined &&
        normalizeHtml(existingProduct.current_body_html) === normalizeHtml(currentBodyHtml)
      const sales = salesMap[shopifyId] ?? { d7: 0, d14: 0, d30: 0 }

      return {
        user_id: user.id,
        shopify_id: shopifyId,
        current_title: product.title,
        current_body_html: currentBodyHtml,
        vendor: product.vendor,
        image_url: product.featuredImage?.url ?? null,
        price: parseMoney(mainVariant?.price),
        compare_at_price: mainVariant?.compareAtPrice
          ? parseMoney(mainVariant.compareAtPrice)
          : null,
        inventory_quantity: mainVariant?.inventoryQuantity ?? product.totalInventory ?? 0,
        sales_last_7_days: sales.d7,
        audit_status: isDescriptionUnchanged
          ? existingProduct.audit_status ?? PENDING_AUDIT_STATUS
          : PENDING_AUDIT_STATUS,
        audit_score: isDescriptionUnchanged ? existingProduct.audit_score ?? 0 : 0,
        updated_at: updatedAt
      }
    })

    const metricsToUpsert: ProductMetricUpsert[] = products.map((product) => {
      const shopifyId = extractNumericId(product.id)
      const mainVariant = product.variants.nodes[0]
      const sales = salesMap[shopifyId] ?? { d7: 0, d14: 0, d30: 0 }

      return {
        user_id: user.id,
        product_id: shopifyId,
        measured_at: measuredAt,
        conversion_rate: null,
        orders_count_7d: sales.d7,
        orders_count_14d: sales.d14,
        orders_count_30d: sales.d30,
        price: parseMoney(mainVariant?.price)
      }
    })

    if (productsToSync.length > 0) {
      const { error: productsUpsertError } = await supabase
        .from("shopify_products")
        .upsert(productsToSync, { onConflict: "user_id,shopify_id" })

      if (productsUpsertError) {
        throw new Error(`Shopify Products Upsert Error: ${productsUpsertError.message}`)
      }

      const { error: metricsUpsertError } = await supabase
        .from("product_metrics")
        .upsert(metricsToUpsert, { onConflict: "product_id,measured_at" })

      if (metricsUpsertError) {
        throw new Error(`Product Metrics Upsert Error: ${metricsUpsertError.message}`)
      }
    }

    return NextResponse.json({
      success: true,
      count: productsToSync.length,
      message: "Sync successful. State Locking and daily metric throttling applied."
    })
  } catch (error: unknown) {
    console.error("Shopify sync failed:", getLogError(error))
    return NextResponse.json({ error: getPublicErrorMessage(error) }, { status: 500 })
  }
}
