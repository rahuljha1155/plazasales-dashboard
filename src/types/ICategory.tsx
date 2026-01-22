export interface ICategoryResponse {
  status: number;
  data: ICategoryData;
  cached: boolean;
}

export interface ICategoryData {
  categories: ICategory[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ICategory {
  id: string;
  createdAt: string;
  updatedAt?: string;
  sortOrder: number;
  isDeleted?: boolean;
  title: string;
  slug: string;
  coverImage?: string;
  brand?: IBrand | null;
  seoMetadata?: any | null;
  subCategories?: ISubCategory[];
}

export interface IBrand {
  id: string;
  name: string;
  logoUrl?: string;
}

export interface ISubCategory {
  id: string;
  createdAt: string;
  updatedAt?: string;
  sortOrder: number;
  isDeleted?: boolean;
  title: string;
  slug: string;
  coverImage?: string;
  seoMetadata?: any | null;
}

export interface ICategoryBySlugResponse {
  status: number;
  category: ICategory;
}

export interface ICreateCategoryData {
  title: string;
  slug: string;
  brandId: string | null;
}

export interface IUpdateCategoryData {
  title?: string;
  slug?: string;
  brandId?: string | null;
}

export interface IDeleteCategoryResponse {
  status: number;
  message: string;
  deletedCategoryIds: string[];
}


export interface ICategoryByBrandResponse {
    status: number
    data: {
        categories: ICategory[]
        total: number
        page: number
        limit: number
        totalPages: number
    }
}

export interface ISubcategoryByCategoryResponse {
  status: number;
  data: {
    subCategories: ICategory[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface IDeletedCategory {
  id: string;
  title: string;
  slug: string;
  brand: {
    id: string;
    name: string;
    slug: string;
  };
  coverImage: string;
  description: string | null;
  deletedAt: string;
}

export interface IDeletedCategoriesResponse {
  status: number;
  data: {
    categories: IDeletedCategory[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface IRecoverCategoriesResponse {
  status: number;
  message: string;
  recoveredCategoryIds: string[];
}

export interface IDestroyPermanentlyResponse {
  status: number;
  message: string;
}