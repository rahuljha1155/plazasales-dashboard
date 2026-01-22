import type { ProductType } from "@/schema/product";

// Common, reusable primitives
export interface IApiResponseMeta {
  total?: number;
  page?: number;
  pageSize?: number;
  [key: string]: any;
}

export interface IApiError {
  message: string;
  code?: string | number;
  details?: any;
}

export interface ICreateProductRequest {
  name: string;
  slug?: string;              // if omitted, server may derive
  description?: string;
  price: number;
  currency?: string;
  sku?: string;
  brandId?: string;
  categoryId?: string;
  images?: string[];
  stock?: number;
  isActive?: boolean;
}

export interface ICreateProductResponse {
  success: boolean;
  data: IProduct;
  meta?: IApiResponseMeta;
  error?: IApiError;
}

/**
 * GET {{PLAZA_ENV}}/product/get-all-products
 * Optional query params are inferred; adjust to your API.
 */
export interface IGetAllProductsQuery {
  page?: number;
  search?: string;
}


interface SeoMetadata {
  // Define based on your SEO metadata structure
  // Example:
  // title?: string;
  // description?: string;
  // keywords?: string[];
}

interface Brand {
  id: string;
  name: string;
  logoUrl: string;
}

// Removed duplicate local IProduct interface. Use exported IProduct below.
export interface IProduct {
  id: string;
  createdAt: string;
  updatedAt: string;
  sortOrder: number;
  isDeleted: boolean;
  productType: string;
  name: string;
  sku: string;
  coverImage: string;
  detailImage: string[];
  slug: string;
  model: string;
  manualUrl: string | null;
  brochureUrl: string | null;
  price: string;
  yearlyPrice: string | null;
  mrp: string;
  shortDescription: string;
  description: string;
  technology: string;
  feature: string; // This is a JSON string, you might want to parse it
  metaTitle: string;
  metatag: string[];
  metadescription: string;
  isPublished: boolean;
  isPopular: boolean;
  productTypes: string;
  brand: Brand;
  subcategory: Subcategory;
  gallery: any[];
  videos: any[];
  downloadCategories: any[];
  downloads: any[];
  seoMetadata: SeoMetadata | null;
}

interface ProductsResponse {
  products: IProduct[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ApiResponse {
  status: number;
  data: ProductsResponse;
  cached: boolean;
}

// If you want to parse the feature field as an object:
interface ParsedFeature {
  capacity?: string;
  power?: string;
  innerPot?: string;
  autoShutOff?: boolean;
  keepWarm?: boolean;
  // Add other feature properties as needed
}


export interface IGetAllProductsResponse {
  status: number;
  data: ProductsResponse;
  cached: boolean;
}
/**
 * GET {{PLAZA_ENV}}/product/get-product/:slugOrId
 */
export interface IGetProductBySlugOrIdPath {
  slugOrId: string;
}


interface ProductResponse {
  status: number;
  product: Product;
  similarProducts: Product[];
}

interface Product {
  id: string;
  createdAt: string;
  updatedAt: string;
  sortOrder: number;
  isDeleted: boolean;
  name: string;
  sku: string | null;
  coverImage: string | null;
  detailImage: string[] | null;
  slug: string;
  model: string;
  manualUrl: string | null;
  brochureUrl: string | null;
  price: string;
  yearlyPrice: string | null;
  mrp: string | null;
  shortDescription: string;
  description: string;
  technology: string;
  feature: string;
  metaTitle: string;
  metatag: string[] | null;
  metadescription: string | null;
  isPublished: boolean;
  isPopular: boolean;
  productType: ProductType;
  brand: Brand;
  subcategory: Subcategory;
  gallery: any[]; // Could be more specific if you know the structure
  videos: any[]; // Could be more specific if you know the structure
  downloadCategories: any[]; // Could be more specific if you know the structure
  downloads: any[]; // Could be more specific if you know the structure
  seoMetadata: any | null; // Could be more specific if you know the structure
  icons: string[] | null;
}

interface Brand {
  id: string;
  name: string;
  logoUrl: string;
}

interface Subcategory {
  id: string;
  title: string;
  slug: string;
}

export interface IGetProductBySlugOrIdResponse {
  status: number;
  product: Product;
  similarProducts: Product[];
}
/**
 * PUT {{PLAZA_ENV}}/product/update-product/:id
 */
export interface IUpdateProductPath {
  id: string; // UUID
}

export interface IUpdateProductRequest {
  name?: string;
  slug?: string;
  description?: string;
  price?: number;
  currency?: string;
  sku?: string;
  brandId?: string;
  categoryId?: string;
  images?: string[];
  stock?: number;
  isActive?: boolean;
}

export interface IUpdateProductResponse {
  success: boolean;
  data: IProduct;
  error?: IApiError;
}

/**
 * DELETE {{PLAZA_ENV}}/product/delete-product/:id
 */
export interface IDeleteProductPath {
  id: string; // UUID
}

export interface IDeleteProductResponse {
  success: boolean;
  data?: { id: string };
  error?: IApiError;
}

/**
 * GET {{PLAZA_ENV}}/product/stats
 * Shape is guessed; adapt to your backend response.
 */
export interface IProductStatsResponse {
  success: boolean;
  data: {
    totalProducts: number;
    activeProducts?: number;
    outOfStock?: number;
    averagePrice?: number;
    minPrice?: number;
    maxPrice?: number;
    [key: string]: any;
  };
  error?: IApiError;
}

export interface IDeletedProduct {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  model: string;
  brand: Brand | null;
  subcategory: Subcategory | null;
  price: string;
  yearlyPrice: string | null;
  mrp: string | null;
  isPublished: boolean;
  isPopular: boolean;
  deletedAt: string;
}

export interface IDeletedProductsResponse {
  status: number;
  data: {
    products: IDeletedProduct[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface IRecoverProductsResponse {
  status: number;
  message: string;
  recoveredProductIds: string[];
}

export interface IDestroyProductPermanentlyResponse {
  status: number;
  message: string;
}