export enum BrandUSPType {
  SAAS = "SaaS",
  HARDWARE = "Hardware",
  OTHERS = "Others"
}



export interface IBrandBySlugResponse {
   status: number;
  brand: IBrand;
};

export interface IBrandData {
  brands: IBrand[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IBrand {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  certificate: string | null;
  themeColor: string;
  isAuthorizedDistributor: boolean;
  usp: BrandUSPType;
  bannerUrls: string[];
  description: string;
  appStoreUrl?: string;
  playStoreUrl?: string;
}



export interface IPostBrand {
  name: string;
  slug: string;
  logoUrl: File;
  certificate: string;
  themeColor: string;
  isAuthorizedDistributor: boolean;
  usp: BrandUSPType;
  bannerUrls: File[];
  description: string;
}

export interface ICreateBrandResponse {
  status: number
  message: string
}

export interface IDeleteBrandResponse {
  status: number
  message: string
  deletedBrandIds: string[]
}

export interface IUpdateBrandResponse {
  status: number
  message: string
}

interface SeoMetadata {
  // Define based on your actual SEO metadata structure
  // Example:
  // title?: string;
  // description?: string;
  // keywords?: string[];
}

interface PopularProduct {
  id: string;
  createdAt: string;
  sortOrder: number;
  name: string;
  coverImage: string;
  slug: string;
  model: string;
  price: string;
  isPopular: boolean;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  certificate: string;
  themeColor: string;
  isAuthorizedDistributor: boolean;
  bannerUrls: string[];
  popularProducts: PopularProduct[];
  seoMetadata: SeoMetadata | null;
  sortOrder: number;
}

interface BrandsResponse {
  brands: Brand[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}



export interface IBrandResponse {
  status: number;
  data: BrandsResponse;
  cached: boolean;
}


export interface IBrand {
  id: string;
  createdAt: string;
  updatedAt: string;
  sortOrder: number;
  isDeleted: boolean;
  name: string;
  slug: string;
  logoUrl: string | null;
  certificate: string | null;
  indoorImage: string | null;
  outdoorImage: string | null;
  youtubeId: string | null;
  themeColor: string;
  description: string;
  isAuthorizedDistributor: boolean;
  usp: BrandUSPType;
  bannerUrls: string[];
  categories: ICategory[];
  popularProducts: IProduct[];
  brandImageUrls: string[]
}

export interface ICategory {
  id: string;
  createdAt: string;
  updatedAt: string;
  sortOrder: number;
  isDeleted: boolean;
  title: string;
  slug: string;
  coverImage: string | null;
}

export interface IProduct {
  // Placeholder until product structure is known
}

export interface IDeletedBrand {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  slug: string;
  logoUrl: string;
  themeColor: string;
  description: string;
  isAuthorizedDistributor: boolean;
  bannerUrls: string[];
  deletedAt: string;
}

export interface IDeletedBrandsResponse {
  status: number;
  data: {
    brands: IDeletedBrand[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface IRecoverBrandsResponse {
  status: number;
  message: string;
  recoveredBrandIds: string[];
}

export interface IDestroyBrandPermanentlyResponse {
  status: number;
  message: string;
}
