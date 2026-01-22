// Ads Types
export interface IAd {
    id: string;
    title: string;
    description: string;
    bannerUrls: string[];
    targetUrl: string;
    isActive: boolean;
    startAt: string;
    endAt: string;
    productId?: string;
    brandId?: string;
    categoryId?: string;
    subcategoryId?: string;
    productIds?: string[];
    sortOrder: number;
    impressions?: string;
    clicks?: string;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string | null;
    brand?: {
        id: string;
        name: string;
        slug: string;
        logoUrl?: string;
    };
    category?: {
        id: string;
        name: string;
        slug: string;
    };
    subcategory?: {
        id: string;
        name: string;
        slug: string;
    };
    product?: {
        id: string;
        name: string;
        slug: string;
    };
}

export interface ICreateAdRequest {
    title: string;
    description: string;
    bannerUrls: string[] | File[];
    targetUrl: string;
    isActive: boolean;
    startAt: string;
    endAt: string;
    productId?: string;
    brandId?: string;
    categoryId?: string;
    subcategoryId?: string;
    productIds?: string[];
    sortOrder: number;
}

export interface IUpdateAdRequest extends Partial<ICreateAdRequest> { }

export interface IGetAllAdsQuery {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    productId?: string;
    brandId?: string;
    categoryId?: string;
    subcategoryId?: string;
}

export interface IGetAllAdsResponse {
    status: number;
    data: {
        ads: IAd[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    message: string;
    cached?: boolean;
}

export interface ICreateAdResponse {
    status: number;
    data: IAd;
    message: string;
}

export interface IUpdateAdResponse {
    status: number;
    data: IAd;
    message: string;
}

export interface IDeleteAdResponse {
    status: number;
    message: string;
}

export interface IGetDeletedAdsResponse {
    status: number;
    data: {
        ads: IAd[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    message: string;
}

export interface IAdAnalytics {
    id: string;
    title: string;
    impressions: number;
    clicks: number;
    ctr: number;
    indicator: "high" | "medium" | "low";
    createdAt: string;
}

export interface IGetAdAnalyticsResponse {
    status: number;
    message: string;
    data: IAdAnalytics;
}
