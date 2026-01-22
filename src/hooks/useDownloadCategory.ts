import { api } from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  DownloadCategory,
  CreateDownloadCategoryPayload
} from "@/types/IDownload";



export interface ICategoryByProductId {
  id: string
  sortOrder: number
  kind: string
  title: string
  subtitle: string
  isActive: boolean
}

export interface ICategoryByProductId {
  status: number,
  message: string;
  categories: ICategoryByProductId[];
}

export interface ApiResponse {
  status: number;
  message: string;
  data: CategoryResponseData;
  cached: boolean;
}

export interface CategoryResponseData {
  categories: Category[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CategoryResponse {
  status: number;
  message: string;
  category: Category;
}

export interface Category {
  id: string;
  createdAt: string;
  updatedAt: string;
  sortOrder: number;
  isDeleted: boolean;
  product: Product | null;
  kind: string;
  title: string;
  subtitle: string;
  iconKey: string;
  isActive: boolean;
  extra?: {
    updateChannel?: string;
  };
  items: any[]; // Change to specific type when items structure is known
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
  model: string | null;
  manualUrl: string | null;
  brochureUrl: string | null;
  price: string | null;
  yearlyPrice: string | null;
  mrp: string | null;
  shortDescription: string | null;
  description: string | null;
  technology: string | null;
  feature: string | null;
  metaTitle: string | null;
  metatag: string | null;
  metadescription: string | null;
  isPublished: boolean;
  isPopular: boolean;
}


export interface SingleCategoryResponse {
  status: number;
  message: string;
  category: Category;
}


// export interface Category {
//   id: string;
//   createdAt: string;
//   updatedAt: string;
//   sortOrder: number;
//   isDeleted: boolean;
//   product: Product | null;
//   kind: string;
//   title: string;
//   subtitle: string;
//   iconKey: string | null;
//   isActive: boolean;
//   extra?: Record<string, any>;
//   items: any[];
// }

// export interface Product {
//   id: string;
//   createdAt: string;
//   updatedAt: string;
//   sortOrder: number;
//   isDeleted: boolean;
//   name: string;
//   sku: string | null;
//   coverImage: string | null;
//   detailImage: string | null;
//   slug: string;
//   model: string;
//   manualUrl: string | null;
//   brochureUrl: string | null;
//   price: string | number;
//   yearlyPrice: string | number | null;
//   mrp: string | number | null;
//   shortDescription: string;
//   description: string;
//   technology: string;
//   feature: string;
//   metaTitle: string | null;
//   metatag: string | null;
//   metadescription: string | null;
//   isPublished: boolean;
//   isPopular: boolean;
// }


// Get all download categories
export const useGetAllDownloadCategories = (page = 1, limit = 10) => {
  return useQuery<ApiResponse>({
    queryKey: ["download-categories", page, limit],
    queryFn: async () => {
      const response = await api.get("/download-category/get-all-categories", {
        params: { page, limit },
      });
      return response.data;
    },
  });
};

// Get download categories by product ID
export const useGetCategoriesByProduct = (productId: string) => {
  return useQuery<ICategoryByProductId>({
    queryKey: ["download-categories-by-product", productId],
    queryFn: async () => {
      const response = await api.get(`/download-category/get-categories-by-product/${productId}`);
      return response.data;
    },
    enabled: !!productId,
  });
};

// Get download category by ID
export const useGetDownloadCategoryById = (categoryId: string) => {
  return useQuery<SingleCategoryResponse>({
    queryKey: ["download-category", categoryId],
    queryFn: async () => {
      const response = await api.get(`/download-category/get-category/${categoryId}`);
      return response.data;
    },
    enabled: !!categoryId,
  });
};

// Create download category
export const useCreateDownloadCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateDownloadCategoryPayload) => {
      const response = await api.post("/download-category/create-category", data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["download-categories"] });
      queryClient.invalidateQueries({ queryKey: ["download-categories-by-product", variables.productId] });
    },
  });
};

// Update download category
export const useUpdateDownloadCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      categoryId,
      data
    }: {
      categoryId: string;
      data: Partial<CreateDownloadCategoryPayload>
    }) => {
      const response = await api.put(`/download-category/update-category/${categoryId}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["download-categories"] });
      queryClient.invalidateQueries({ queryKey: ["download-category", variables.categoryId] });
      queryClient.invalidateQueries({ queryKey: ["download-categories-by-product", variables.data.productId] });
    },
  });
};

// Delete download category
export const useDeleteDownloadCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId: string) => {
      const response = await api.delete(`/download-category/delete-category/${categoryId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["download-categories"] });
      queryClient.invalidateQueries({ queryKey: ["download-categories-by-product"] });
    },
  });
};

// Bulk delete download categories
export const useDeleteBulkDownloadCategories = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryIds: string[]) => {
      const response = await api.delete(`/download-category/delete-category/${categoryIds.join(',')}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["download-categories"] });
      queryClient.invalidateQueries({ queryKey: ["download-categories-by-product"] });
    },
  });
};

// Get deleted download categories
export const useGetDeletedDownloadCategories = (page: number = 1, limit: number = 10) => {
  return useQuery<ApiResponse>({
    queryKey: ["deleted-download-categories", page, limit],
    queryFn: async () => {
      const response = await api.get("/download-category/deleted-categories", {
        params: { page, limit },
      });
      return response.data;
    },
  });
};

// Recover download categories
export const useRecoverDownloadCategories = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const response = await api.put("/download-category/recover-categories", { ids });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deleted-download-categories"] });
      queryClient.invalidateQueries({ queryKey: ["download-categories"] });
      queryClient.invalidateQueries({ queryKey: ["download-categories-by-product"] });
    },
  });
};

// Destroy download category permanently
export const useDestroyDownloadCategoryPermanently = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/download-category/destroy-categories/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deleted-download-categories"] });
    },
  });
};
