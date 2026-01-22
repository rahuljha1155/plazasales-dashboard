export interface ISubcategory {
  id: string;
  createdAt: string;
  updatedAt?: string;
  sortOrder: number;
  isDeleted?: boolean;
  title: string;
  slug: string;
  coverImage?: string;
  seoMetadata?: any | null;
  category?: {
    id: string;
    title: string;
    slug: string;
    brand?: {
      id: string;
      title?: string;
      name?: string;
      slug?: string;
      logoUrl?: string;
    };
  };
}

export interface ISubcategoryByCategoryResponse {
  status: number;
  data: {
    subCategories: ISubcategory[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface IGetSubCategoryResponse {
  status: number;
  data: {
    subCategories: ISubcategory[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface IDeletedSubcategory {
  id: string;
  title: string;
  slug: string;
  coverImage: string;
  category: {
    id: string;
    title: string;
    slug: string;
  };
  createdAt: string;
}

export interface IDeletedSubcategoriesResponse {
  status: number;
  data: {
    subCategories: IDeletedSubcategory[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  cached: boolean;
}

export interface IRecoverSubcategoriesResponse {
  status: number;
  message: string;
  recoveredSubcategoryIds: string[];
}

export interface IDestroySubcategoryPermanentlyResponse {
  status: number;
  message: string;
}
