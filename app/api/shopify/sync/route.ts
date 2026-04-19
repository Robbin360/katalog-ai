import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// --- HELPER: Extraer ID numérico de Shopify GID ---
// 'gid://shopify/Product/123456789' -> '123456789'
const extractNumericId = (gid: string): string => gid.split("/").pop() || gid;

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return cookieStore.getAll() } } }
    )

    // 1. Verificar sesión del usuario
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // 2. Obtener credenciales de Shopify
    const { data: integration, error: intError } = await supabase
      .from('integrations')
      .select('shop_url, access_token')
      .eq('user_id', user.id)
      .eq('provider', 'shopify')
      .single()

    if (intError || !integration) {
      return NextResponse.json({ error: "Please connect Shopify in Settings first." }, { status: 400 })
    }

    // Validación de seguridad (SSRF)
    const shopUrlPattern = /^[a-zA-Z0-9][-a-zA-Z0-9]*\.myshopify\.com$/;
    if (!shopUrlPattern.test(integration.shop_url)) {
      return NextResponse.json({ error: "Invalid Shopify URL format detected." }, { status: 400 });
    }

    // 3. Preparar Query de GraphQL (Eficiencia: 1 Sola Petición)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const orderQuery = `created_at:>=${sevenDaysAgo.toISOString()}`;

    const graphqlQuery = {
      query: `
        query getSyncData($orderQuery: String!) {
          products(first: 50) {
            nodes {
              id
              title
              descriptionHtml
              vendor
              featuredImage {
                url
              }
              variants(first: 1) {
                nodes {
                  price
                  compareAtPrice
                  inventoryItem {
                    inventoryLevels(first: 1) {
                      nodes {
                        quantities(names: ["available"]) {
                          name
                          quantity
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          orders(first: 250, query: $orderQuery) {
            nodes {
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
      variables: { orderQuery }
    };

    const shopifyUrl = `https://${integration.shop_url}/admin/api/2026-04/graphql.json`;

    const res = await fetch(shopifyUrl, {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": integration.access_token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(graphqlQuery)
    });

    if (!res.ok) throw new Error(`Shopify API Error: ${res.statusText}`);
    const { data, errors } = await res.json();
    if (errors) throw new Error(`GraphQL Error: ${errors[0].message}`);

    const products = data.products.nodes;
    const orders = data.orders.nodes;

    // 4. Procesar Ventas (Mapeo de product_id -> cantidad acumulada)
    const salesMap: Record<string, number> = {};
    orders.forEach((order: any) => {
      order.lineItems.nodes.forEach((item: any) => {
        if (item.product?.id) {
          const pid = extractNumericId(item.product.id);
          salesMap[pid] = (salesMap[pid] || 0) + item.quantity;
        }
      });
    });

    // 5. Mapear Productos con Métricas Avanzadas
    const productsToSync = products.map((p: any) => {
      const numericId = extractNumericId(p.id);
      const mainVariant = p.variants.nodes[0];
      
      const currentPrice = mainVariant?.price ? parseFloat(mainVariant.price) : 0;
      const comparePrice = mainVariant?.compareAtPrice ? parseFloat(mainVariant.compareAtPrice) : null;
      
      const availableStock = mainVariant?.inventoryItem?.inventoryLevels?.nodes[0]
        ?.quantities?.find((q: any) => q.name === 'available')?.quantity || 0;

      return {
        user_id: user.id,
        shopify_id: numericId,
        current_title: p.title,
        current_body_html: p.descriptionHtml,
        vendor: p.vendor,
        image_url: p.featuredImage?.url || null,
        
        price: currentPrice,
        compare_at_price: comparePrice,
        inventory_quantity: availableStock,
        sales_last_7_days: salesMap[numericId] || 0, // Por defecto 0
        
        audit_status: 'PENDING_AUDIT',
        updated_at: new Date().toISOString()
      };
    });

    // 6. Upsert en Supabase
    const { error: dbError } = await supabase
      .from('shopify_products')
      .upsert(productsToSync, { onConflict: 'user_id, shopify_id' })

    if (dbError) throw dbError;

    return NextResponse.json({
      success: true,
      count: productsToSync.length,
      message: `Sync successful. Processed ${productsToSync.length} products with 7-day sales metrics.`
    });

  } catch (error: any) {
    console.error("Sync Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}