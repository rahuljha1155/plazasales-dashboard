export interface IGalleryResponse {
  status: number;
  data: GalleryData;
  cached: boolean;
}

export interface GalleryData {
  galleries: Gallery[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Gallery {
  id: string;
  createdAt: string;
  updatedAt: string;
  sortOrder: number;
  isDeleted: boolean;
  caption: string;
  isHome: boolean;
  product: Product;
  mediaAsset: MediaAsset[];
}

export interface Product {
  id: string;
  createdAt: string;
  updatedAt: string;
  sortOrder: number;
  isDeleted: boolean;
  name: string;
  sku: string | null;
  coverImage: string | null;
  detailImage: string | null;
  slug: string;
  model: string;
  manualUrl: string | null;
  brochureUrl: string | null;
  price: string | null;
  yearlyPrice: string | null;
  mrp: string | null;
  shortDescription: string;
  description: string;
  technology: string;
  feature: string;
  metaTitle: string;
  metatag: string | null;
  metadescription: string | null;
  isPublished: boolean;
  isPopular: boolean;
}

export interface MediaAsset {
  id: string;
  createdAt: string;
  updatedAt: string;
  sortOrder: number;
  isDeleted: boolean;
  fileUrl: string;
  type: "IMAGE" | "VIDEO" | string;
}
