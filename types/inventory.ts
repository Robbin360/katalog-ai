export type ProductStatus = 'PENDING_AUDIT' | 'NEEDS_REVIEW' | 'OPTIMIZED' | 'IDLE';

export interface Product {
    id: string;
    shopifyId: string;
    title: string;
    image: string | null;
    status: string; // Dynamic string for audit_status
    healthScore: number;
    createdAt: string;
    platform: string;
    revenueImpact?: number;
    currentBodyHtml?: string;
    aiProposal?: {
        new_title?: string;
        new_body_html?: string;
        [key: string]: any;
    };
    fullData?: any; 
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
