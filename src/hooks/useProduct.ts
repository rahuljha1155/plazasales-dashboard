import { api } from "@/services/api";
import { getBrands } from "@/services/brand";
import { getAllProducts, getProductBySlugOrId } from "@/services/product";
import { getAllSubCategories } from "@/services/subcategory";
import type { IGetAllProductsResponse } from "@/types/IProduct";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
  };
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  model: string;
  price: number;
  mp?: number;
  shortDescription: string;
  description: string;
  technology?: string;
  feature?: string;
  metaTitle?: string;
  metalag?: string[];
  metalescription?: string;
  isPublished: boolean;
  isPopular: boolean;
  branded: string;
  subcategoryId: string;
  coverimage?: string;
  classImage?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const useGetProducts = (page = 1, limit = 10) => {
  return useQuery<IGetAllProductsResponse>({
    queryKey: ["products", page, limit],
    queryFn: () => getAllProducts({ page })
  })
};

export const useGetProductById = (id: string) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => getProductBySlugOrId(id),
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await api.post("/product/create-product", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data;
    },
    onSuccess: () => {
      // Invalidate all product-related queries to refresh the table
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["getAllProducts"] });
      queryClient.invalidateQueries({ queryKey: ["getProductsBySubcategory"] });
      queryClient.invalidateQueries({ queryKey: ["getProductsByCategory"] });
      queryClient.invalidateQueries({ queryKey: ["getProductStats"] });
    },
  });
};

export const useUpdateProduct = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await api.put(`/product/update-product/${id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data;
    },
    onSuccess: () => {
      // Invalidate all product-related queries to refresh the table
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", id] });
      queryClient.invalidateQueries({ queryKey: ["getAllProducts"] });
      queryClient.invalidateQueries({ queryKey: ["getProductsBySubcategory"] });
      queryClient.invalidateQueries({ queryKey: ["getProductsByCategory"] });
      queryClient.invalidateQueries({ queryKey: ["getProductBySlugOrId", id] });
      queryClient.invalidateQueries({ queryKey: ["getProductStats"] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/product/delete-product/${id}`);
      return response.data.data;
    },
    onSuccess: () => {
      // Invalidate all product-related queries to refresh the table
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["getAllProducts"] });
      queryClient.invalidateQueries({ queryKey: ["getProductsBySubcategory"] });
      queryClient.invalidateQueries({ queryKey: ["getProductsByCategory"] });
      queryClient.invalidateQueries({ queryKey: ["getProductStats"] });
    },
  });
};

export const useDeleteBulkProducts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["deleteBulkProducts"],
    mutationFn: async (ids: string[]) => {
      const response = await api.delete(`/product/delete-product/${ids.join(',')}`);
      return response.data;
    },
    onSuccess: () => {
    // Invalidate all product-related queries to refresh the table
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["getAllProducts"] });
      queryClient.invalidateQueries({ queryKey: ["getProductsBySubcategory"] });
      queryClient.invalidateQueries({ queryKey: ["getProductsByCategory"] });
      queryClient.invalidateQueries({ queryKey: ["getProductStats"] });
    },
  });
};

// Get all brands for dropdown
export const useGetBrands = () => {
  return useQuery({
    queryKey: ["brands"],
    queryFn: getBrands
  });
};

// Get all subcategories for dropdown
export const useGetSubcategories = () => {
  return useQuery({
    queryKey: ["subcategories"],
    queryFn: getAllSubCategories
  });
};

// Search products
export const useSearchProducts = (searchQuery: string, options?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ["products", "search", searchQuery, options?.page, options?.limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (options?.page) params.append("page", options.page.toString());
      if (options?.limit) params.append("limit", options.limit.toString());

      const response = await api.get(`/product/search-products?${params.toString()}`);
      return response.data;
    },
    enabled: !!searchQuery,
  });
};
