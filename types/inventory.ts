export type ProductStatus = 'DONE' | 'PENDING' | 'ERROR' | 'IDLE';

export interface Product {
    id: string;
    title: string;
    image: string | null;
    status: ProductStatus;
    healthScore: number;
    createdAt: string;
    platform: string;
    revenueImpact?: number;
    fullData?: any; // To store raw AI output or Shopify data if needed
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
