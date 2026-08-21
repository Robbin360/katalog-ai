/**
 * Contract tests for POST /api/shopify/publish — publicación manual recuperable
 *
 * Final contract: the route performs a single atomic local write via the
 * SECURITY DEFINER RPC `finalize_product_publish(p_user_id, p_product_id,
 * p_confirmed_title, p_confirmed_body_html)`. No saga, no direct
 * shopify_products.update / optimizations.insert, no credit RPCs.
 *
 * Recuperable: todos los errores con contexto de producto se registran vía
 * `record_publish_failure(p_user_id, p_product_id, p_code, p_stage, p_retryable,
 * p_message, p_details, p_next_retry_at, p_shopify_confirmed)`.
 * Solo p_shopify_confirmed=true después de validar product.id, title y
 * descriptionHtml no vacío devueltos por Shopify. Cualquier error anterior es false.
 *
 * Every test that asserts the ABSENCE of an effect first requires a
 * precondition proving the route reached the point where that effect
 * would occur (no false greens from early aborts).
 */
import { describe, it, expect, vi, beforeEach, afterEach, type MockedFunction } from "vitest"
import { NextResponse } from "next/server"

// ---------------------------------------------------------------------------
// Module mocks - hoisted before any imports that load the module graph
// ---------------------------------------------------------------------------
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
  createSupabaseServiceClient: vi.fn(),
  decryptShopifyToken: vi.fn(),
}))

vi.mock("next/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/server")>()
  return {
    ...actual,
    NextResponse: {
      ...actual.NextResponse,
      json: vi.fn((body: unknown, init?: ResponseInit) => ({
        _body: body,
        _status: init?.status ?? 200,
        json: async () => body,
        status: init?.status ?? 200,
      })),
    },
  }
})

// Import the modules under test AFTER mocks are in place
import { createSupabaseServerClient, createSupabaseServiceClient, decryptShopifyToken } from "@/lib/supabase/server"
import { POST } from "@/app/api/shopify/publish/route"

// ---------------------------------------------------------------------------
// Typed mock helpers
// ---------------------------------------------------------------------------
const mockCreateServerClient = createSupabaseServerClient as MockedFunction<typeof createSupabaseServerClient>
const mockCreateServiceClient = createSupabaseServiceClient as MockedFunction<typeof createSupabaseServiceClient>
const mockDecryptToken = decryptShopifyToken as MockedFunction<typeof decryptShopifyToken>

// ---------------------------------------------------------------------------
// Constants shared across tests
// ---------------------------------------------------------------------------
const SHOP_URL = "test-shop.myshopify.com"
const ACCESS_TOKEN = "shpat_test_token"
const USER_ID = "user-uuid-001"
const PRODUCT_ID = 1002
const SHOPIFY_GID = "gid://shopify/Product/8734559076523"
const APPROVED_TITLE = "Título aprobado"
const APPROVED_BODY_HTML = "<p>Descripción aprobada</p>"
const OPTIMIZATION_ID = "optimization-uuid-001"

const CREDIT_RPCS = [
  "reserve_or_reuse_product_credit",
  "commit_product_credit",
  "refund_product_reservation",
  "increment_profile_credits_used",
] as const

/** Realistic legacy product row: passed the quality gate, proposal set */
const DEFAULT_PRODUCT_ROW = {
  id: PRODUCT_ID,
  user_id: USER_ID,
  shopify_id: SHOPIFY_GID,
  current_title: "Título anterior",
  current_body_html: "<p>Descripción anterior</p>",
  audit_status: "READY_TO_PUBLISH",
  ai_proposal: {
    new_title: APPROVED_TITLE,
    new_body_html: APPROVED_BODY_HTML,
  },
}

// ---------------------------------------------------------------------------
// Factories (mock factories may use `any` internally; nothing else does)
// ---------------------------------------------------------------------------

/** Builds a mock supabase USER client with separate, trackable spies */
function makeUserClient({
  user = { id: USER_ID } as Record<string, unknown> | null,
  productRow = DEFAULT_PRODUCT_ROW as Record<string, unknown> | null,
} = {}) {
  const productSelectSpy = vi.fn()
  const productUpdateSpy = vi.fn()
  const optimizationInsertSpy = vi.fn()

  const fromSpy = vi.fn((table: string) => {
    if (table === "shopify_products") {
      return {
        select: vi.fn((cols?: string) => {
          productSelectSpy(cols)
          const chain: any = {
            eq: vi.fn(() => chain),
            single: vi.fn().mockResolvedValue({
              data: productRow,
              error: productRow ? null : { message: "Product not found" },
            }),
          }
          return chain
        }),
        update: vi.fn((payload: unknown) => {
          productUpdateSpy(payload)
          const chain: any = {
            eq: vi.fn(() => chain),
            then: (onfulfilled: any, onrejected: any) =>
              Promise.resolve({
                data: null,
                error: { message: "FORBIDDEN direct shopify_products.update" },
              }).then(onfulfilled, onrejected),
          }
          return chain
        }),
      }
    }

    if (table === "optimizations") {
      return {
        insert: vi.fn((payload: unknown) => {
          optimizationInsertSpy(payload)
          const chain: any = {
            then: (onfulfilled: any, onrejected: any) =>
              Promise.resolve({
                data: null,
                error: { message: "FORBIDDEN direct optimizations.insert" },
              }).then(onfulfilled, onrejected),
          }
          return chain
        }),
      }
    }

    throw new Error(`FORBIDDEN user from(): ${table}`)
  })

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }),
    },
    from: fromSpy,
    productSelectSpy,
    productUpdateSpy,
    optimizationInsertSpy,
  }
}

/** Builds a mock supabase SERVICE client (integrations read + rpc) */
function makeServiceClient({
  integration = {
    shop_url: SHOP_URL,
    access_token: "encrypted_token",
  } as Record<string, unknown> | null,
  finalizeResult = makeSuccessfulFinalize(),
  finalizeError = null as { message: string } | null,
  recordFailureResult = { recorded: true, reason: "recorded", audit_status: "ERROR", publish_attempts: 1, retryable: false, shopify_confirmed: false },
} = {}) {
  const rpcMock = vi.fn()

  rpcMock.mockImplementation((fnName: string, args?: Record<string, unknown>) => {
    if (fnName === "finalize_product_publish") {
      return Promise.resolve({
        data: finalizeError ? null : finalizeResult,
        error: finalizeError,
      })
    }
    if (fnName === "record_publish_failure") {
      // Simulate successful recording. Echo back shopify_confirmed flag.
      return Promise.resolve({
        data: [{ ...recordFailureResult, shopify_confirmed: (args as Record<string, unknown>)?.p_shopify_confirmed ?? false }],
        error: null,
      })
    }
    if ((CREDIT_RPCS as readonly string[]).includes(fnName)) {
      throw new Error(`FORBIDDEN RPC called: ${fnName}`)
    }
    return Promise.resolve({ data: null, error: { message: `Unexpected rpc: ${fnName}` } })
  })

  const fromMock = vi.fn((table: string) => {
    if (table === "integrations") {
      const chain: any = {
        select: vi.fn(() => chain),
        eq: vi.fn(() => chain),
        is: vi.fn(() => chain),
        single: vi.fn().mockResolvedValue({
          data: integration,
          error: integration ? null : { message: "no integration" },
        }),
      }
      return chain
    }
    throw new Error(`FORBIDDEN service from(): ${table}`)
  })

  return { from: fromMock, rpc: rpcMock }
}

/** Successful finalize_product_publish payload */
function makeSuccessfulFinalize(overrides: Record<string, unknown> = {}) {
  return {
    success: true,
    reason: "completed",
    optimization_id: OPTIMIZATION_ID,
    ...overrides,
  }
}

/** Successful Shopify GraphQL response */
function makeShopifySuccess(overrides: Record<string, unknown> = {}) {
  return {
    data: {
      productUpdate: {
        product: {
          id: SHOPIFY_GID,
          title: APPROVED_TITLE,
          descriptionHtml: APPROVED_BODY_HTML,
          seo: { title: APPROVED_TITLE, description: null },
          ...overrides,
        },
        userErrors: [],
      },
    },
  }
}

/** Builds a mock Request object */
function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/shopify/publish", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

/** Sets up default mocks for a full happy-path scenario */
function setupDefaultMocks({
  user = { id: USER_ID } as Record<string, unknown> | null,
  productRow = DEFAULT_PRODUCT_ROW as Record<string, unknown> | null,
  integration = {
    shop_url: SHOP_URL,
    access_token: "encrypted_token",
  } as Record<string, unknown> | null,
  finalizeResult = makeSuccessfulFinalize(),
  finalizeError = null as { message: string } | null,
  shopifyBody = makeShopifySuccess(),
  shopifyFetchOverride = null as any,
} = {}) {
  const userClient = makeUserClient({ user, productRow })
  const serviceClient = makeServiceClient({ integration, finalizeResult, finalizeError })

  mockCreateServerClient.mockResolvedValue(userClient as any)
  mockCreateServiceClient.mockReturnValue(serviceClient as any)
  mockDecryptToken.mockResolvedValue(ACCESS_TOKEN)

  const fetchMock = shopifyFetchOverride ?? vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    statusText: "OK",
    json: async () => shopifyBody,
  })

  vi.stubGlobal("fetch", fetchMock)

  return { userClient, serviceClient, fetchMock }
}

/** Localiza una llamada RPC por nombre en el mock del service client */
function findRpc(
  serviceClient: { rpc: { mock: { calls: unknown[][] } } },
  name: string
) {
  return serviceClient.rpc.mock.calls.find((c) => c[0] === name)
}

function findAllRpc(
  serviceClient: { rpc: { mock: { calls: unknown[][] } } },
  name: string
) {
  return serviceClient.rpc.mock.calls.filter((c) => c[0] === name)
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
async function callPost(body: unknown): Promise<{ _body: unknown; _status: number }> {
  const req = makeRequest(body)
  const res = await POST(req)
  return res as unknown as { _body: unknown; _status: number }
}

async function callRawBody(rawBody: string): Promise<{ _body: unknown; _status: number }> {
  const req = new Request("http://localhost/api/shopify/publish", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: rawBody,
  })
  const res = await POST(req)
  return res as unknown as { _body: unknown; _status: number }
}

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

// ---------------------------------------------------------------------------
// 1-10. Validation & auth
// ---------------------------------------------------------------------------
describe("1-10. Validation & auth", () => {
  it("1. non-JSON body -> 400, no Shopify, no RPC", async () => {
    const { serviceClient, fetchMock } = setupDefaultMocks()

    const res = await callRawBody("not-json{{")

    expect(res._status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
    expect(serviceClient.rpc.mock.calls).toHaveLength(0)
  })

  it("2. productId absent -> 400", async () => {
    const { serviceClient, fetchMock } = setupDefaultMocks()

    const res = await callPost({})

    expect(res._status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
    // Sin productId válido no hay contexto para record_publish_failure
    expect(findRpc(serviceClient, "record_publish_failure")).toBeUndefined()
    expect(findRpc(serviceClient, "finalize_product_publish")).toBeUndefined()
  })

  it("3. productId negative -> 400", async () => {
    const { serviceClient, fetchMock } = setupDefaultMocks()

    const res = await callPost({ productId: -5 })

    expect(res._status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
    expect(findRpc(serviceClient, "record_publish_failure")).toBeUndefined()
  })

  it("4. productId non-numeric string -> 400", async () => {
    const { serviceClient, fetchMock } = setupDefaultMocks()

    const res = await callPost({ productId: "abc" })

    expect(res._status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
    expect(findRpc(serviceClient, "record_publish_failure")).toBeUndefined()
  })

  it("5. no user -> 401", async () => {
    const { serviceClient, fetchMock } = setupDefaultMocks({ user: null })

    const res = await callPost({ productId: PRODUCT_ID })

    expect(res._status).toBe(401)
    expect(fetchMock).not.toHaveBeenCalled()
    expect(findRpc(serviceClient, "record_publish_failure")).toBeUndefined()
  })

  it("6. no integration -> 404, registrado como preflight sin Shopify", async () => {
    const { serviceClient, fetchMock, userClient } = setupDefaultMocks({ integration: null })

    const res = await callPost({ productId: PRODUCT_ID })

    expect(res._status).toBe(404)
    expect(userClient.productSelectSpy).not.toHaveBeenCalled()
    expect(fetchMock).not.toHaveBeenCalled()
    // Con usuario y productId válidos, la ruta registra el fallo
    const recordCall = findRpc(serviceClient, "record_publish_failure")
    expect(recordCall).toBeDefined()
    expect((recordCall![1] as Record<string, unknown>).p_code).toBe("integration_missing")
    expect((recordCall![1] as Record<string, unknown>).p_stage).toBe("preflight")
    expect((recordCall![1] as Record<string, unknown>).p_retryable).toBe(false)
    expect((recordCall![1] as Record<string, unknown>).p_shopify_confirmed).toBe(false)
    expect(findRpc(serviceClient, "finalize_product_publish")).toBeUndefined()
  })

  it("7. product not found -> 404, no Shopify, registra preflight", async () => {
    const { serviceClient, fetchMock, userClient } = setupDefaultMocks({ productRow: null })

    const res = await callPost({ productId: PRODUCT_ID })

    expect(userClient.productSelectSpy).toHaveBeenCalled()
    expect(res._status).toBe(404)
    expect(fetchMock).not.toHaveBeenCalled()
    const recordCall = findRpc(serviceClient, "record_publish_failure")
    expect(recordCall).toBeDefined()
    expect((recordCall![1] as Record<string, unknown>).p_stage).toBe("preflight")
    expect((recordCall![1] as Record<string, unknown>).p_shopify_confirmed).toBe(false)
    expect(findRpc(serviceClient, "finalize_product_publish")).toBeUndefined()
  })

  it("8. audit_status != READY_TO_PUBLISH -> 409, no Shopify, registra preflight", async () => {
    const rejectedRow = { ...DEFAULT_PRODUCT_ROW, audit_status: "REJECTED" }
    const { serviceClient, fetchMock, userClient } = setupDefaultMocks({ productRow: rejectedRow })

    const res = await callPost({ productId: PRODUCT_ID })

    expect(userClient.productSelectSpy).toHaveBeenCalled()
    expect(res._status).toBe(409)
    expect(fetchMock).not.toHaveBeenCalled()
    const recordCall = findRpc(serviceClient, "record_publish_failure")
    expect(recordCall).toBeDefined()
    expect((recordCall![1] as Record<string, unknown>).p_code).toBe("not_ready_to_publish")
    expect((recordCall![1] as Record<string, unknown>).p_stage).toBe("preflight")
    expect((recordCall![1] as Record<string, unknown>).p_retryable).toBe(false)
    expect((recordCall![1] as Record<string, unknown>).p_shopify_confirmed).toBe(false)
    expect(findRpc(serviceClient, "finalize_product_publish")).toBeUndefined()
  })

  it("9. ai_proposal without new_title -> 400, no Shopify, registra preflight", async () => {
    const noTitleRow = {
      ...DEFAULT_PRODUCT_ROW,
      ai_proposal: { new_body_html: APPROVED_BODY_HTML },
    }
    const { serviceClient, fetchMock, userClient } = setupDefaultMocks({ productRow: noTitleRow })

    const res = await callPost({ productId: PRODUCT_ID })

    expect(userClient.productSelectSpy).toHaveBeenCalled()
    expect(res._status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
    const recordCall = findRpc(serviceClient, "record_publish_failure")
    expect(recordCall).toBeDefined()
    expect((recordCall![1] as Record<string, unknown>).p_stage).toBe("preflight")
    expect((recordCall![1] as Record<string, unknown>).p_shopify_confirmed).toBe(false)
    expect(findRpc(serviceClient, "finalize_product_publish")).toBeUndefined()
  })

  it("10. ai_proposal without new_body_html -> 400, no Shopify, registra preflight", async () => {
    const noBodyRow = {
      ...DEFAULT_PRODUCT_ROW,
      ai_proposal: { new_title: APPROVED_TITLE },
    }
    const { serviceClient, fetchMock, userClient } = setupDefaultMocks({ productRow: noBodyRow })

    const res = await callPost({ productId: PRODUCT_ID })

    expect(userClient.productSelectSpy).toHaveBeenCalled()
    expect(res._status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
    const recordCall = findRpc(serviceClient, "record_publish_failure")
    expect(recordCall).toBeDefined()
    expect((recordCall![1] as Record<string, unknown>).p_stage).toBe("preflight")
    expect((recordCall![1] as Record<string, unknown>).p_shopify_confirmed).toBe(false)
    expect(findRpc(serviceClient, "finalize_product_publish")).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// 11-12. Payload sent to Shopify
// ---------------------------------------------------------------------------
describe("11-12. Payload sent to Shopify", () => {
  it("11. fetch called exactly once with id/title/descriptionHtml/seo from ai_proposal", async () => {
    const { fetchMock } = setupDefaultMocks()

    const res = await callPost({ productId: PRODUCT_ID })

    expect(res._status).toBe(200)
    expect(fetchMock).toHaveBeenCalledTimes(1)

    const [_url, fetchInit] = fetchMock.mock.calls[0]
    const requestBody = JSON.parse(fetchInit.body as string)

    // El writer (AIProposalOutput) no trae seo explicito: seo.title cae al
    // fallback del new_title confirmado y seo.description no se envia.
    expect(requestBody.variables.product).toEqual({
      id: SHOPIFY_GID,
      title: APPROVED_TITLE,
      descriptionHtml: APPROVED_BODY_HTML,
      seo: { title: APPROVED_TITLE },
    })
  })

  it("12. mutation requests product { id title descriptionHtml seo { title description } }", async () => {
    const { fetchMock } = setupDefaultMocks()

    await callPost({ productId: PRODUCT_ID })

    expect(fetchMock).toHaveBeenCalledTimes(1)

    const [_url, fetchInit] = fetchMock.mock.calls[0]
    const requestBody = JSON.parse(fetchInit.body as string)

    expect(requestBody.query).toContain("id")
    expect(requestBody.query).toContain("title")
    expect(requestBody.query).toContain("descriptionHtml")
    expect(requestBody.query).toContain("seo")
  })
})

// ---------------------------------------------------------------------------
// 13-18, 34-35. Shopify failures: all -> 502, registra shopify_request/verify con p_shopify_confirmed=false
// ---------------------------------------------------------------------------
describe("13-18, 34-35. Shopify failures", () => {
  async function assertShopifyFailure(
    shopifyFetchOverride: ReturnType<typeof vi.fn>,
    expected: { code?: string; stage?: string; retryable?: boolean } = {}
  ): Promise<{ _status: number; _body: unknown }> {
    const { serviceClient, userClient, fetchMock } = setupDefaultMocks({ shopifyFetchOverride })

    const res = await callPost({ productId: PRODUCT_ID })

    // Precondition: the route reached Shopify exactly once
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(res._status).toBe(502)
    // Debe registrar el fallo como no confirmado (Shopify no confirmó)
    const recordCall = findRpc(serviceClient, "record_publish_failure")
    expect(recordCall).toBeDefined()
    const args = recordCall![1] as Record<string, unknown>
    expect(args.p_shopify_confirmed).toBe(false)
    expect(args.p_stage).toBeDefined()
    if (expected.stage) expect(args.p_stage).toBe(expected.stage)
    if (expected.code) expect(args.p_code).toBe(expected.code)
    if (expected.retryable !== undefined) expect(args.p_retryable).toBe(expected.retryable)
    // No debe haber llamado a finalize
    expect(findRpc(serviceClient, "finalize_product_publish")).toBeUndefined()
    expect(userClient.productUpdateSpy).not.toHaveBeenCalled()
    expect(userClient.optimizationInsertSpy).not.toHaveBeenCalled()
    // publish_next_retry_at debe reflejar retryable
    if (expected.retryable === true) {
      expect(args.p_next_retry_at).toBeTruthy()
    } else if (expected.retryable === false) {
      expect(args.p_next_retry_at).toBeNull()
    }
    return res
  }

  it("13. HTTP 500 -> 502, retryable true, shopify_request", async () => {
    await assertShopifyFailure(
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        json: async () => ({}),
      }),
      { stage: "shopify_request", code: "shopify_http_error", retryable: true }
    )
  })

  it("14. GraphQL errors array -> 502", async () => {
    await assertShopifyFailure(
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        json: async () => ({ errors: [{ message: "GraphQL error from Shopify" }] }),
      }),
      { stage: "shopify_request", retryable: false }
    )
  })

  it("15. userErrors non-empty -> 502", async () => {
    await assertShopifyFailure(
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        json: async () => ({
          data: {
            productUpdate: {
              product: null,
              userErrors: [{ field: ["title"], message: "Title cannot be blank" }],
            },
          },
        }),
      }),
      { stage: "shopify_request", retryable: false }
    )
  })

  it("16. product null -> 502", async () => {
    await assertShopifyFailure(
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        json: async () => ({
          data: { productUpdate: { product: null, userErrors: [] } },
        }),
      }),
      { stage: "shopify_verify", retryable: false }
    )
  })

  it("17. product without id -> 502", async () => {
    await assertShopifyFailure(
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        json: async () => ({
          data: {
            productUpdate: {
              product: { title: APPROVED_TITLE, descriptionHtml: APPROVED_BODY_HTML },
              userErrors: [],
            },
          },
        }),
      }),
      { stage: "shopify_verify", retryable: false }
    )
  })

  it("18. returned title differs -> 502", async () => {
    await assertShopifyFailure(
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        json: async () => ({
          data: {
            productUpdate: {
              product: {
                id: SHOPIFY_GID,
                title: "WRONG TITLE",
                descriptionHtml: APPROVED_BODY_HTML,
              },
              userErrors: [],
            },
          },
        }),
      }),
      { stage: "shopify_verify", retryable: false }
    )
  })

  it("34. descriptionHtml vacío devuelto por Shopify -> 502, registra shopify_verify", async () => {
    await assertShopifyFailure(
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        json: async () => ({
          data: {
            productUpdate: {
              product: {
                id: SHOPIFY_GID,
                title: APPROVED_TITLE,
                descriptionHtml: "",
              },
              userErrors: [],
            },
          },
        }),
      }),
      { stage: "shopify_verify", retryable: false }
    )
  })

  it("35. descriptionHtml con solo whitespace -> 502, registra shopify_verify", async () => {
    await assertShopifyFailure(
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        json: async () => ({
          data: {
            productUpdate: {
              product: {
                id: SHOPIFY_GID,
                title: APPROVED_TITLE,
                descriptionHtml: "   \n\t  ",
              },
              userErrors: [],
            },
          },
        }),
      }),
      { stage: "shopify_verify", retryable: false }
    )
  })
})

// ---------------------------------------------------------------------------
// 19-23, 33, 36. Success path
// ---------------------------------------------------------------------------
describe("19-23, 33, 36. Success", () => {
  it("19. descriptionHtml reescrito por Shopify (mismo contenido, HTML distinto) -> 200, y el valor devuelto por Shopify se pasa a la RPC", async () => {
    const REWRITTEN_HTML = '<P class="shopify">Hola mundo</P>\n'
    const proposalRow = {
      ...DEFAULT_PRODUCT_ROW,
      ai_proposal: {
        new_title: APPROVED_TITLE,
        new_body_html: "<p>Hola mundo</p>",
      },
    }
    const { serviceClient } = setupDefaultMocks({
      productRow: proposalRow,
      shopifyBody: makeShopifySuccess({ descriptionHtml: REWRITTEN_HTML }),
    })

    const res = await callPost({ productId: PRODUCT_ID })

    expect(res._status).toBe(200)
    expect(res._body).toMatchObject({
      success: true,
      message: "Published to Shopify successfully",
    })

    const finalizeCalls = serviceClient.rpc.mock.calls.filter(
      (c) => c[0] === "finalize_product_publish"
    )
    expect(finalizeCalls).toHaveLength(1)
    expect(finalizeCalls[0][1]).toMatchObject({
      p_user_id: USER_ID,
      p_product_id: PRODUCT_ID,
      p_confirmed_title: APPROVED_TITLE,
      p_confirmed_body_html: REWRITTEN_HTML,
    })
    // Éxito no registra fallo
    expect(findRpc(serviceClient, "record_publish_failure")).toBeUndefined()
  })

  it("20. reason completed -> 200, RPC once with the four params from the Shopify response", async () => {
    // The proposal's body has surrounding whitespace; Shopify returns it
    // trimmed. The RPC must receive the values Shopify CONFIRMED (trimmed),
    // proving provenance from the response, not from the raw proposal.
    const paddedBodyRow = {
      ...DEFAULT_PRODUCT_ROW,
      ai_proposal: {
        new_title: APPROVED_TITLE,
        new_body_html: `  ${APPROVED_BODY_HTML}  `,
      },
    }
    const { serviceClient } = setupDefaultMocks({ productRow: paddedBodyRow })

    const res = await callPost({ productId: PRODUCT_ID })

    expect(res._status).toBe(200)
    expect(res._body).toMatchObject({
      success: true,
      message: "Published to Shopify successfully",
    })

    const finalizeCalls = serviceClient.rpc.mock.calls.filter(
      (c) => c[0] === "finalize_product_publish"
    )
    expect(finalizeCalls).toHaveLength(1)
    // Solo finalize, sin record_publish_failure
    expect(serviceClient.rpc.mock.calls).toHaveLength(1)

    expect(finalizeCalls[0][1]).toEqual({
      p_user_id: USER_ID,
      p_product_id: PRODUCT_ID,
      p_confirmed_title: APPROVED_TITLE,
      p_confirmed_body_html: APPROVED_BODY_HTML,
    })
  })

  it("21. reason already_completed -> 200, no second Shopify call", async () => {
    const { serviceClient, fetchMock } = setupDefaultMocks({
      finalizeResult: makeSuccessfulFinalize({ success: false, reason: "already_completed" }),
    })

    const res = await callPost({ productId: PRODUCT_ID })

    expect(findRpc(serviceClient, "finalize_product_publish")).toBeDefined()
    expect(res._status).toBe(200)
    expect(res._body).toMatchObject({
      success: true,
      message: "Published to Shopify successfully",
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(findRpc(serviceClient, "record_publish_failure")).toBeUndefined()
  })

  it("22. success path: zero direct shopify_products updates", async () => {
    const { serviceClient, userClient } = setupDefaultMocks()

    const res = await callPost({ productId: PRODUCT_ID })

    // Precondition: the route reached the finalize RPC
    expect(findRpc(serviceClient, "finalize_product_publish")).toBeDefined()
    expect(res._status).toBe(200)
    expect(userClient.productUpdateSpy).not.toHaveBeenCalled()
  })

  it("23. success path: zero direct optimizations inserts", async () => {
    const { serviceClient, userClient } = setupDefaultMocks()

    const res = await callPost({ productId: PRODUCT_ID })

    // Precondition: the route reached the finalize RPC
    expect(findRpc(serviceClient, "finalize_product_publish")).toBeDefined()
    expect(res._status).toBe(200)
    expect(userClient.optimizationInsertSpy).not.toHaveBeenCalled()
  })

  it("33. productId string numérico llega al RPC como el mismo valor del body", async () => {
    const { serviceClient } = setupDefaultMocks()

    const res = await callPost({ productId: String(PRODUCT_ID) })

    expect(findRpc(serviceClient, "finalize_product_publish")).toBeDefined()
    expect(res._status).toBe(200)
    expect(res._body).toMatchObject({
      success: true,
      message: "Published to Shopify successfully",
    })

    const finalizeCalls = serviceClient.rpc.mock.calls.filter(
      (c) => c[0] === "finalize_product_publish"
    )
    expect(finalizeCalls).toHaveLength(1)
    expect(finalizeCalls[0][1]).toMatchObject({
      p_user_id: USER_ID,
      p_product_id: PRODUCT_ID,
      p_confirmed_title: APPROVED_TITLE,
      p_confirmed_body_html: APPROVED_BODY_HTML,
    })
  })

  it("36. proposal con \\n final y Shopify devuelve recortado -> 200", async () => {
    const proposalRow = {
      ...DEFAULT_PRODUCT_ROW,
      ai_proposal: {
        new_title: APPROVED_TITLE,
        new_body_html: "<p>Hola</p>\n",
      },
    }
    const { serviceClient, fetchMock } = setupDefaultMocks({
      productRow: proposalRow,
      shopifyBody: makeShopifySuccess({ descriptionHtml: "<p>Hola</p>" }),
    })

    const res = await callPost({ productId: PRODUCT_ID })

    expect(findRpc(serviceClient, "finalize_product_publish")).toBeDefined()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(res._status).toBe(200)
    expect(res._body).toMatchObject({
      success: true,
      message: "Published to Shopify successfully",
    })

    const finalizeCalls = serviceClient.rpc.mock.calls.filter(
      (c) => c[0] === "finalize_product_publish"
    )
    expect(finalizeCalls).toHaveLength(1)
    expect(finalizeCalls[0][1]).toMatchObject({
      p_user_id: USER_ID,
      p_product_id: PRODUCT_ID,
      p_confirmed_title: APPROVED_TITLE,
      p_confirmed_body_html: "<p>Hola</p>",
    })
  })

  it("37. seo_title/seo_description explicitos de la propuesta viajan al input seo", async () => {
    const seoRow = {
      ...DEFAULT_PRODUCT_ROW,
      ai_proposal: {
        new_title: APPROVED_TITLE,
        new_body_html: APPROVED_BODY_HTML,
        seo_title: "Meta title explicito",
        seo_description: "Meta description explicita",
      },
    }
    const { fetchMock } = setupDefaultMocks({
      productRow: seoRow,
      shopifyBody: makeShopifySuccess({
        seo: { title: "Meta title explicito", description: "Meta description explicita" },
      }),
    })

    const res = await callPost({ productId: PRODUCT_ID })

    expect(res._status).toBe(200)

    const [_url, fetchInit] = fetchMock.mock.calls[0]
    const requestBody = JSON.parse(fetchInit.body as string)

    expect(requestBody.variables.product.seo).toEqual({
      title: "Meta title explicito",
      description: "Meta description explicita",
    })
  })

  it("38. seo devuelto distinto al enviado -> 200 (soft check, console.warn)", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
    const { fetchMock } = setupDefaultMocks({
      shopifyBody: makeShopifySuccess({
        seo: { title: "Normalizado por Shopify", description: null },
      }),
    })

    const res = await callPost({ productId: PRODUCT_ID })

    expect(res._status).toBe(200)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("seo mismatch after update")
    )
    warnSpy.mockRestore()
  })
})

// ---------------------------------------------------------------------------
// 24-27. RPC failures after Shopify confirmed — deben registrar con p_shopify_confirmed=true
// ---------------------------------------------------------------------------
describe("24-27. RPC failures", () => {
  it("24. reason not_ready_to_publish -> 409, registra local_finalize con confirmed true", async () => {
    const { serviceClient, fetchMock } = setupDefaultMocks({
      finalizeResult: makeSuccessfulFinalize({ success: false, reason: "not_ready_to_publish" }),
    })

    const res = await callPost({ productId: PRODUCT_ID })

    expect(findRpc(serviceClient, "finalize_product_publish")).toBeDefined()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(res._status).toBe(409)
    const recordCall = findRpc(serviceClient, "record_publish_failure")
    expect(recordCall).toBeDefined()
    const args = recordCall![1] as Record<string, unknown>
    expect(args.p_shopify_confirmed).toBe(true)
    expect(args.p_stage).toBe("local_finalize")
    expect(args.p_retryable).toBe(true)
    expect(args.p_next_retry_at).toBeTruthy()
  })

  it("25. reason user_mismatch -> 404, registra local_finalize", async () => {
    const { serviceClient, fetchMock } = setupDefaultMocks({
      finalizeResult: makeSuccessfulFinalize({ success: false, reason: "user_mismatch" }),
    })

    const res = await callPost({ productId: PRODUCT_ID })

    expect(findRpc(serviceClient, "finalize_product_publish")).toBeDefined()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(res._status).toBe(404)
    const recordCall = findRpc(serviceClient, "record_publish_failure")
    expect(recordCall).toBeDefined()
    expect((recordCall![1] as Record<string, unknown>).p_shopify_confirmed).toBe(true)
    expect((recordCall![1] as Record<string, unknown>).p_stage).toBe("local_finalize")
  })

  it("26. reason proposal_mismatch -> 500 with retry message, registra con confirmed true", async () => {
    const { serviceClient, fetchMock } = setupDefaultMocks({
      finalizeResult: makeSuccessfulFinalize({ success: false, reason: "proposal_mismatch" }),
    })

    const res = await callPost({ productId: PRODUCT_ID })

    expect(findRpc(serviceClient, "finalize_product_publish")).toBeDefined()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(res._status).toBe(500)
    expect((res._body as Record<string, unknown>).error).toMatch(/retry/i)
    const recordCall = findRpc(serviceClient, "record_publish_failure")
    expect(recordCall).toBeDefined()
    expect((recordCall![1] as Record<string, unknown>).p_shopify_confirmed).toBe(true)
    expect((recordCall![1] as Record<string, unknown>).p_stage).toBe("local_finalize")
    expect((recordCall![1] as Record<string, unknown>).p_retryable).toBe(true)
  })

  it("27. RPC error (error non-null) -> 500, no second Shopify call, registra con confirmed true", async () => {
    const { serviceClient, fetchMock } = setupDefaultMocks({
      finalizeError: { message: "db exploded" },
    })

    const res = await callPost({ productId: PRODUCT_ID })

    expect(findRpc(serviceClient, "finalize_product_publish")).toBeDefined()
    expect(res._status).toBe(500)
    expect((res._body as Record<string, unknown>).error).toMatch(/retry/i)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const recordCall = findRpc(serviceClient, "record_publish_failure")
    expect(recordCall).toBeDefined()
    expect((recordCall![1] as Record<string, unknown>).p_shopify_confirmed).toBe(true)
    expect((recordCall![1] as Record<string, unknown>).p_stage).toBe("local_finalize")
  })
})

// ---------------------------------------------------------------------------
// 28-30. Billing: zero credit RPCs in all scenarios
// ---------------------------------------------------------------------------
describe("28-30. Zero billing RPCs", () => {
  it("28. zero credit RPCs on success path", async () => {
    const { serviceClient } = setupDefaultMocks()

    const res = await callPost({ productId: PRODUCT_ID })

    // Precondition: the route reached the finalize RPC
    expect(findRpc(serviceClient, "finalize_product_publish")).toBeDefined()
    expect(res._status).toBe(200)

    const creditCalls = serviceClient.rpc.mock.calls.filter((c) =>
      (CREDIT_RPCS as readonly string[]).includes(c[0] as string)
    )
    expect(creditCalls).toHaveLength(0)
    // Success no debe llamar a record_publish_failure
    expect(findRpc(serviceClient, "record_publish_failure")).toBeUndefined()
  })

  it("29. zero credit RPCs when Shopify fails, pero sí registra publish failure", async () => {
    const { serviceClient, fetchMock } = setupDefaultMocks({
      shopifyFetchOverride: vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        json: async () => ({}),
      }),
    })

    const res = await callPost({ productId: PRODUCT_ID })

    // Precondition: the route reached Shopify
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(res._status).toBe(502)
    const creditCalls = serviceClient.rpc.mock.calls.filter((c) =>
      (CREDIT_RPCS as readonly string[]).includes(c[0] as string)
    )
    expect(creditCalls).toHaveLength(0)
    const recordCall = findRpc(serviceClient, "record_publish_failure")
    expect(recordCall).toBeDefined()
    expect((recordCall![1] as Record<string, unknown>).p_shopify_confirmed).toBe(false)
  })

  it("30. zero credit RPCs on timeout, registra con retryable true", async () => {
    const { serviceClient, fetchMock } = setupDefaultMocks({
      shopifyFetchOverride: vi.fn().mockRejectedValue(
        new DOMException("timeout", "TimeoutError")
      ),
    })

    const res = await callPost({ productId: PRODUCT_ID })

    // Precondition: the route reached Shopify
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(res._status).toBe(504)
    const creditCalls = serviceClient.rpc.mock.calls.filter((c) =>
      (CREDIT_RPCS as readonly string[]).includes(c[0] as string)
    )
    expect(creditCalls).toHaveLength(0)
    const recordCall = findRpc(serviceClient, "record_publish_failure")
    expect(recordCall).toBeDefined()
    expect((recordCall![1] as Record<string, unknown>).p_stage).toBe("shopify_request")
    expect((recordCall![1] as Record<string, unknown>).p_retryable).toBe(true)
    expect((recordCall![1] as Record<string, unknown>).p_shopify_confirmed).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// 31-32. Network ambiguity: registra con p_shopify_confirmed=false, retryable true
// ---------------------------------------------------------------------------
describe("31-32. Network ambiguity", () => {
  it("31. fetch timeout -> 504, registra con confirmed false y retryable true, finalize NOT called", async () => {
    const { serviceClient, fetchMock } = setupDefaultMocks({
      shopifyFetchOverride: vi.fn().mockRejectedValue(
        new DOMException("timeout", "TimeoutError")
      ),
    })

    const res = await callPost({ productId: PRODUCT_ID })

    // Precondition: the route reached Shopify
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(res._status).toBe(504)
    expect(findRpc(serviceClient, "finalize_product_publish")).toBeUndefined()
    const recordCall = findRpc(serviceClient, "record_publish_failure")
    expect(recordCall).toBeDefined()
    const args = recordCall![1] as Record<string, unknown>
    expect(args.p_shopify_confirmed).toBe(false)
    expect(args.p_retryable).toBe(true)
    expect(args.p_stage).toBe("shopify_request")
    expect(args.p_next_retry_at).toBeTruthy()
  })

  it("32. fetch TypeError (network failure) -> error response, registra con confirmed false, RPC NOT called finalize", async () => {
    const { serviceClient, fetchMock } = setupDefaultMocks({
      shopifyFetchOverride: vi.fn().mockRejectedValue(new TypeError("fetch failed")),
    })

    const res = await callPost({ productId: PRODUCT_ID })

    // Precondition: the route reached Shopify
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(res._status).toBe(500)
    expect(findRpc(serviceClient, "finalize_product_publish")).toBeUndefined()
    const recordCall = findRpc(serviceClient, "record_publish_failure")
    expect(recordCall).toBeDefined()
    expect((recordCall![1] as Record<string, unknown>).p_shopify_confirmed).toBe(false)
    expect((recordCall![1] as Record<string, unknown>).p_retryable).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// 39-45. Publicación recuperable — validación de p_shopify_confirmed y campos publish_*
// ---------------------------------------------------------------------------
describe("39-45. Recuperable — p_shopify_confirmed y retry logic", () => {
  it("39. p_shopify_confirmed false para todos los fallos pre-Shopify (preflight)", async () => {
    const noTitleRow = {
      ...DEFAULT_PRODUCT_ROW,
      ai_proposal: { new_body_html: APPROVED_BODY_HTML },
    }
    const { serviceClient } = setupDefaultMocks({ productRow: noTitleRow })
    const res = await callPost({ productId: PRODUCT_ID })
    expect(res._status).toBe(400)
    const rec = findRpc(serviceClient, "record_publish_failure")
    expect(rec).toBeDefined()
    expect((rec![1] as Record<string, unknown>).p_shopify_confirmed).toBe(false)
    expect((rec![1] as Record<string, unknown>).p_stage).toBe("preflight")
  })

  it("40. p_shopify_confirmed false para shopify_verify (title mismatch) aunque Shopify respondió", async () => {
    const { serviceClient } = setupDefaultMocks({
      shopifyFetchOverride: vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        json: async () => ({
          data: {
            productUpdate: {
              product: { id: SHOPIFY_GID, title: "WRONG", descriptionHtml: APPROVED_BODY_HTML },
              userErrors: [],
            },
          },
        }),
      }),
    })
    const res = await callPost({ productId: PRODUCT_ID })
    expect(res._status).toBe(502)
    const rec = findRpc(serviceClient, "record_publish_failure")
    expect(rec).toBeDefined()
    expect((rec![1] as Record<string, unknown>).p_shopify_confirmed).toBe(false)
    expect((rec![1] as Record<string, unknown>).p_stage).toBe("shopify_verify")
  })

  it("41. p_shopify_confirmed true solo después de validar id/title/description no vacío", async () => {
    const { serviceClient } = setupDefaultMocks({
      finalizeResult: makeSuccessfulFinalize({ success: false, reason: "proposal_mismatch" }),
    })
    const res = await callPost({ productId: PRODUCT_ID })
    expect(res._status).toBe(500)
    const rec = findRpc(serviceClient, "record_publish_failure")
    expect(rec).toBeDefined()
    expect((rec![1] as Record<string, unknown>).p_shopify_confirmed).toBe(true)
    expect((rec![1] as Record<string, unknown>).p_stage).toBe("local_finalize")
    // Debe tener p_next_retry_at porque es retryable
    expect((rec![1] as Record<string, unknown>).p_next_retry_at).toBeTruthy()
  })

  it("42. publish_error_details sanitizado y p_next_retry_at coherente con retryable", async () => {
    const { serviceClient } = setupDefaultMocks({
      shopifyFetchOverride: vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        statusText: "Too Many Requests",
        json: async () => ({}),
      }),
    })
    const res = await callPost({ productId: PRODUCT_ID })
    expect(res._status).toBe(502)
    const rec = findRpc(serviceClient, "record_publish_failure")
    expect(rec).toBeDefined()
    const args = rec![1] as Record<string, unknown>
    expect(args.p_code).toBe("shopify_http_error")
    expect(args.p_retryable).toBe(true)
    expect(args.p_next_retry_at).toBeTruthy()
    expect(args.p_details).toBeDefined()
    // No debe filtrar tokens
    const detailsStr = JSON.stringify(args.p_details)
    expect(detailsStr).not.toContain(ACCESS_TOKEN)
  })

  it("43. éxito no llama a record_publish_failure y no hace updates directos", async () => {
    const { serviceClient, userClient } = setupDefaultMocks()
    const res = await callPost({ productId: PRODUCT_ID })
    expect(res._status).toBe(200)
    expect(findRpc(serviceClient, "record_publish_failure")).toBeUndefined()
    expect(userClient.productUpdateSpy).not.toHaveBeenCalled()
    expect(userClient.optimizationInsertSpy).not.toHaveBeenCalled()
  })

  it("44. record_publish_failure recibe p_user_id y p_product_id correctos", async () => {
    const { serviceClient } = setupDefaultMocks({
      shopifyFetchOverride: vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        json: async () => ({ errors: [{ message: "boom" }] }),
      }),
    })
    const res = await callPost({ productId: PRODUCT_ID })
    expect(res._status).toBe(502)
    const rec = findRpc(serviceClient, "record_publish_failure")
    expect(rec).toBeDefined()
    const args = rec![1] as Record<string, unknown>
    expect(args.p_user_id).toBe(USER_ID)
    expect(args.p_product_id).toBe(PRODUCT_ID)
    expect(typeof args.p_message).toBe("string")
    expect((args.p_message as string).length).toBeGreaterThan(0)
  })

  it("45. p_code y p_stage son strings no vacíos y retryable es boolean", async () => {
    const { serviceClient } = setupDefaultMocks({
      finalizeError: { message: "db exploded" },
    })
    const res = await callPost({ productId: PRODUCT_ID })
    expect(res._status).toBe(500)
    const rec = findRpc(serviceClient, "record_publish_failure")
    expect(rec).toBeDefined()
    const args = rec![1] as Record<string, unknown>
    expect(typeof args.p_code).toBe("string")
    expect((args.p_code as string).length).toBeGreaterThan(0)
    expect(typeof args.p_stage).toBe("string")
    expect(["preflight", "shopify_request", "shopify_verify", "local_finalize"]).toContain(args.p_stage)
    expect(typeof args.p_retryable).toBe("boolean")
    expect(typeof args.p_shopify_confirmed).toBe("boolean")
  })
})

// ---------------------------------------------------------------------------
// 46-54. Parche mínimo: retry con lectura previa y huella semántica
// ---------------------------------------------------------------------------
describe("46-54. Retry con lectura previa", () => {
  const RETRY_ROW_LOCAL = {
    ...DEFAULT_PRODUCT_ROW,
    publish_error_code: "LOCAL_FINALIZE_ERROR",
    publish_error_stage: "local_finalize",
    publish_error_retryable: true,
    publish_attempts: 1,
  }
  const RETRY_ROW_TIMEOUT = {
    ...DEFAULT_PRODUCT_ROW,
    publish_error_code: "TIMEOUT",
    publish_error_stage: "shopify_request",
    publish_error_retryable: true,
    publish_attempts: 1,
  }

  it("46. LOCAL_FINALIZE_ERROR y remoto coincide: una lectura, cero productUpdate, un finalize", async () => {
    const { serviceClient, fetchMock } = setupDefaultMocks({
      productRow: RETRY_ROW_LOCAL as unknown as Record<string, unknown>,
      shopifyFetchOverride: vi.fn().mockImplementation((_url: string, init: RequestInit) => {
        const body = JSON.parse((init as Record<string, unknown>).body as string)
        if (body.query.includes("productUpdate")) {
          throw new Error("productUpdate should not be called when remote matches")
        }
        // lectura
        return Promise.resolve({
          ok: true,
          status: 200,
          statusText: "OK",
          json: async () => ({
            data: { product: { id: SHOPIFY_GID, title: APPROVED_TITLE, descriptionHtml: APPROVED_BODY_HTML } },
          }),
        } as Response)
      }),
    })

    const res = await callPost({ productId: PRODUCT_ID })

    expect(res._status).toBe(200)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const firstBody = JSON.parse((fetchMock.mock.calls[0][1] as Record<string, unknown>).body as string)
    expect(firstBody.query).toContain("product")
    expect(firstBody.query).not.toContain("productUpdate")
    expect(findRpc(serviceClient, "finalize_product_publish")).toBeDefined()
    expect(findRpc(serviceClient, "record_publish_failure")).toBeUndefined()
  })

  it("47. TIMEOUT previo y remoto coincide: cero mutaciones, finalize exitoso", async () => {
    const { serviceClient, fetchMock } = setupDefaultMocks({
      productRow: RETRY_ROW_TIMEOUT as unknown as Record<string, unknown>,
      shopifyFetchOverride: vi.fn().mockImplementation((_url: string, init: RequestInit) => {
        const body = JSON.parse((init as Record<string, unknown>).body as string)
        if (body.query.includes("productUpdate")) throw new Error("should not mutate")
        return Promise.resolve({
          ok: true,
          status: 200,
          statusText: "OK",
          json: async () => ({
            data: { product: { id: SHOPIFY_GID, title: APPROVED_TITLE, descriptionHtml: APPROVED_BODY_HTML } },
          }),
        } as Response)
      }),
    })

    const res = await callPost({ productId: PRODUCT_ID })
    expect(res._status).toBe(200)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(findRpc(serviceClient, "finalize_product_publish")).toBeDefined()
  })

  it("48. TIMEOUT previo y remoto no coincide: una lectura, una mutación, un finalize", async () => {
    const { serviceClient, fetchMock } = setupDefaultMocks({
      productRow: RETRY_ROW_TIMEOUT as unknown as Record<string, unknown>,
      shopifyFetchOverride: vi.fn().mockImplementation((_url: string, init: RequestInit) => {
        const body = JSON.parse((init as Record<string, unknown>).body as string)
        if (body.query.includes("productUpdate")) {
          // mutación
          return Promise.resolve({
            ok: true,
            status: 200,
            statusText: "OK",
            json: async () => makeShopifySuccess(),
          } as Response)
        }
        // lectura devuelve contenido distinto
        return Promise.resolve({
          ok: true,
          status: 200,
          statusText: "OK",
          json: async () => ({
            data: { product: { id: SHOPIFY_GID, title: "Different title", descriptionHtml: "<p>Different</p>" } },
          }),
        } as Response)
      }),
    })

    const res = await callPost({ productId: PRODUCT_ID })
    expect(res._status).toBe(200)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(findRpc(serviceClient, "finalize_product_publish")).toBeDefined()
    const calls = fetchMock.mock.calls
    expect(JSON.parse((calls[0][1] as Record<string, unknown>).body as string).query).not.toContain("productUpdate")
    expect(JSON.parse((calls[1][1] as Record<string, unknown>).body as string).query).toContain("productUpdate")
  })

  it("49. lectura Shopify falla (5xx): cero mutaciones, cero finalize, error retryable", async () => {
    const { serviceClient, fetchMock } = setupDefaultMocks({
      productRow: RETRY_ROW_LOCAL as unknown as Record<string, unknown>,
      shopifyFetchOverride: vi.fn().mockImplementation((_url: string, init: RequestInit) => {
        const body = JSON.parse((init as Record<string, unknown>).body as string)
        if (body.query.includes("productUpdate")) throw new Error("should not mutate on read failure")
        return Promise.resolve({
          ok: false,
          status: 500,
          statusText: "Internal Server Error",
          json: async () => ({}),
        } as Response)
      }),
    })

    const res = await callPost({ productId: PRODUCT_ID })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(findRpc(serviceClient, "finalize_product_publish")).toBeUndefined()
    const rec = findRpc(serviceClient, "record_publish_failure")
    expect(rec).toBeDefined()
    const args = rec![1] as Record<string, unknown>
    expect(args.p_retryable).toBe(true)
    expect(args.p_shopify_confirmed).toBe(false)
    expect(args.p_stage).toBe("shopify_request")
    // Debe ser retryable -> mensaje seguro
    expect(res._status).toBe(502)
  })

  it("50. HTML cosméticamente distinto se considera coincidencia (huella)", async () => {
    const { serviceClient, fetchMock } = setupDefaultMocks({
      productRow: RETRY_ROW_LOCAL as unknown as Record<string, unknown>,
      shopifyFetchOverride: vi.fn().mockImplementation((_url: string, init: RequestInit) => {
        const body = JSON.parse((init as Record<string, unknown>).body as string)
        if (body.query.includes("productUpdate")) throw new Error("cosmetic diff should not trigger mutation")
        return Promise.resolve({
          ok: true,
          status: 200,
          statusText: "OK",
          json: async () => ({
            data: {
              product: {
                id: SHOPIFY_GID,
                title: APPROVED_TITLE,
                // mismo contenido pero con tags/entidades distintas
                descriptionHtml: '<p class="shopify" data-a="1">  Descripción   aprobada </p>',
              },
            },
          }),
        } as Response)
      }),
    })

    const res = await callPost({ productId: PRODUCT_ID })
    expect(res._status).toBe(200)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(findRpc(serviceClient, "finalize_product_publish")).toBeDefined()
  })

  it("51. Contenido realmente distinto ejecuta una mutación", async () => {
    const { serviceClient, fetchMock } = setupDefaultMocks({
      productRow: RETRY_ROW_LOCAL as unknown as Record<string, unknown>,
      shopifyFetchOverride: vi.fn().mockImplementation((_url: string, init: RequestInit) => {
        const body = JSON.parse((init as Record<string, unknown>).body as string)
        if (body.query.includes("productUpdate")) {
          return Promise.resolve({
            ok: true,
            status: 200,
            statusText: "OK",
            json: async () => makeShopifySuccess(),
          } as Response)
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          statusText: "OK",
          json: async () => ({
            data: { product: { id: SHOPIFY_GID, title: "Otro título", descriptionHtml: "<p>Otro contenido</p>" } },
          }),
        } as Response)
      }),
    })

    const res = await callPost({ productId: PRODUCT_ID })
    expect(res._status).toBe(200)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it("52. Shopify confirmado y finalize falla: p_shopify_confirmed=true, sin segunda mutación", async () => {
    const { serviceClient, fetchMock } = setupDefaultMocks({
      productRow: RETRY_ROW_TIMEOUT as unknown as Record<string, unknown>,
      finalizeError: { message: "db exploded" },
      shopifyFetchOverride: vi.fn().mockImplementation((_url: string, init: RequestInit) => {
        const body = JSON.parse((init as Record<string, unknown>).body as string)
        if (body.query.includes("productUpdate")) {
          return Promise.resolve({
            ok: true,
            status: 200,
            statusText: "OK",
            json: async () => makeShopifySuccess(),
          } as Response)
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          statusText: "OK",
          json: async () => ({
            data: { product: { id: SHOPIFY_GID, title: "Old", descriptionHtml: "<p>Old</p>" } },
          }),
        } as Response)
      }),
    })

    const res = await callPost({ productId: PRODUCT_ID })
    expect(fetchMock).toHaveBeenCalledTimes(2) // una lectura + una mutación
    expect(findRpc(serviceClient, "finalize_product_publish")).toBeDefined()
    const rec = findRpc(serviceClient, "record_publish_failure")
    expect(rec).toBeDefined()
    const args = rec![1] as Record<string, unknown>
    expect(args.p_code).toBe("LOCAL_FINALIZE_ERROR")
    expect(args.p_stage).toBe("local_finalize")
    expect(args.p_retryable).toBe(true)
    expect(args.p_shopify_confirmed).toBe(true)
    // Sin segunda mutación
    expect(fetchMock.mock.calls.filter((c: unknown[]) => JSON.parse((c[1] as Record<string, unknown>).body as string).query.includes("productUpdate"))).toHaveLength(1)
    expect(res._status).toBe(500)
  })

  it("53. already_completed éxito sin duplicar historial ni cobro", async () => {
    const { serviceClient, fetchMock } = setupDefaultMocks({
      productRow: RETRY_ROW_LOCAL as unknown as Record<string, unknown>,
      finalizeResult: makeSuccessfulFinalize({ success: false, reason: "already_completed" }),
      shopifyFetchOverride: vi.fn().mockImplementation((_url: string, init: RequestInit) => {
        const body = JSON.parse((init as Record<string, unknown>).body as string)
        if (body.query.includes("productUpdate")) throw new Error("already_completed should not mutate")
        return Promise.resolve({
          ok: true,
          status: 200,
          statusText: "OK",
          json: async () => ({
            data: { product: { id: SHOPIFY_GID, title: APPROVED_TITLE, descriptionHtml: APPROVED_BODY_HTML } },
          }),
        } as Response)
      }),
    })

    const res = await callPost({ productId: PRODUCT_ID })
    expect(res._status).toBe(200)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(findRpc(serviceClient, "finalize_product_publish")).toBeDefined()
    // No debe llamar record_publish_failure en éxito
    expect(findRpc(serviceClient, "record_publish_failure")).toBeUndefined()
    const creditCalls = serviceClient.rpc.mock.calls.filter((c) => (CREDIT_RPCS as readonly string[]).includes(c[0] as string))
    expect(creditCalls).toHaveLength(0)
  })

  it("54. Token inválido en lectura: no retryable, mensaje reconexión, sin mutación", async () => {
    const { serviceClient, fetchMock } = setupDefaultMocks({
      productRow: RETRY_ROW_LOCAL as unknown as Record<string, unknown>,
      shopifyFetchOverride: vi.fn().mockImplementation((_url: string, init: RequestInit) => {
        const body = JSON.parse((init as Record<string, unknown>).body as string)
        if (body.query.includes("productUpdate")) throw new Error("should not mutate on 401")
        return Promise.resolve({
          ok: false,
          status: 401,
          statusText: "Unauthorized",
          json: async () => ({}),
        } as Response)
      }),
    })

    const res = await callPost({ productId: PRODUCT_ID })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(findRpc(serviceClient, "finalize_product_publish")).toBeUndefined()
    const rec = findRpc(serviceClient, "record_publish_failure")
    expect(rec).toBeDefined()
    const args = rec![1] as Record<string, unknown>
    expect(args.p_retryable).toBe(false)
    expect(args.p_shopify_confirmed).toBe(false)
    expect(res._status).toBe(401)
    expect((res._body as Record<string, unknown>).error).toMatch(/reconnect/i)
  })
})
