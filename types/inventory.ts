/**
 * Estados de auditoria de un producto.
 *
 * Fuente de verdad: el CHECK constraint valid_audit_status en
 * shopify_products, verificado por introspeccion el 2026-08-15.
 * Si cambias esta lista, debe cambiar tambien ese constraint.
 *
 * Antes esta union tenia 'IDLE' (que no existe en la base) y omitia
 * ocho estados que si existen.
 */
export type ProductStatus =
  | 'PENDING_AUDIT'
  | 'NEEDS_OPTIMIZATION'
  | 'PROCESSING'
  | 'READY_TO_PUBLISH'
  | 'OPTIMIZED'
  | 'ERROR'
  | 'OUT_OF_CREDITS'
  | 'NEEDS_REVIEW'
  | 'STABLE_PERFORMING'
  | 'MONITORING'
  | 'BENCHMARK'
  | 'INVESTIGATE_CAUSE';

/**
 * Propuesta generada por el optimizador de Katalog-brain.
 * Refleja core/schemas.py:AIProposalOutput.
 */
export interface AiProposal {
  new_title?: string;
  new_body_html?: string;
  seo_title?: string;
  seo_description?: string;
  audit_log?: string[];
  framework_used?: string;
  tone_used?: string;
  description_length?: number;
}

/**
 * Fila de shopify_products tal como la devuelve Supabase.
 * snake_case porque son las columnas reales.
 * audit_status es string (no ProductStatus) a proposito: la base puede
 * contener valores escritos por versiones anteriores del codigo, y un
 * cast optimista aqui produciria un tipo que miente.
 */
export interface ShopifyProductRow {
  id: number;
  shopify_id: string;
  current_title: string | null;
  current_body_html?: string | null;
  audit_status: string | null;
  audit_score: number | null;
  image_url: string | null;
  created_at: string;
  ai_proposal?: AiProposal | null;
  error_log?: string | null;
  audit_log?: unknown;
}

/** Producto normalizado para la UI. */
export interface Product {
  id: number;
  shopifyId: string;
  current_title: string;
  image: string | null;
  status: string;
  healthScore: number;
  createdAt: string;
  platform: string;
  revenueImpact?: number;
  currentBodyHtml?: string;
  aiProposal?: AiProposal;
  fullData?: ShopifyProductRow;
}

export interface DashboardData {
  products: Product[];
  userStatus: {
    dismissed: boolean;
    isPro: boolean;
    hasShopify: boolean;
    hasProducts: boolean;
  };
}

export interface InventoryResponse {
  products: Product[];
  totalCount: number;
}