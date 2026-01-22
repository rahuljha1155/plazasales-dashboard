export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  certificate: string;
  themeColor: string;
  isAuthorizedDistributor: boolean;
  bannerUrls: string[];
  brandImageUrls?: string | string[];
  popularProducts: any[];
  seoMetadata: any | null;
  sortOrder: number;
  playStoreUrl?: string;
  appStoreUrl?: string;
}

export interface BrandListState {
  isAdding: boolean;
  brandToEdit: string | null;
  viewingBrand: string | null;
}

export interface PaginationState {
  page: number;
  limit: number;
}
