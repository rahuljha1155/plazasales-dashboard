import type {
  ICategoryResponse,
  ICategoryBySlugResponse,
  ICreateCategoryData,
  IUpdateCategoryData,
  IDeleteCategoryResponse,
  ICategoryByBrandResponse,
  ISubcategoryByCategoryResponse,
} from "@/types/ICategory";
import { api2 } from "./api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// === Get All Categories ===
export const getAllCategories = async (): Promise<ICategoryResponse> => {
  const res = await api2.get<ICategoryResponse>("/category/get-all-categories");
  return res.data;
};

export const useGetAllCategories = () => {
  return useQuery({
    queryKey: ["getAllCategories"],
    queryFn: getAllCategories,
  });
};

// === Get Category By Slug ===
export const getCategoryBySlug = async (
  slug: string
): Promise<ICategoryBySlugResponse> => {
  const res = await api2.get<ICategoryBySlugResponse>(
    `/category/get-category/${slug}`
  );
  return res.data;
};

export const useGetCategoryBySlug = (slug: string) => {
  return useQuery({
    queryKey: ["getCategoryBySlug", slug],
    queryFn: () => getCategoryBySlug(slug),
    enabled: !!slug,
  });
};

// === Create Category ===
export const createCategory = async (
  data: ICreateCategoryData
): Promise<{ status: number; message: string }> => {
  const res = await api2.post(`/category/create-category`, data);
  return res.data;
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["createCategory"],
    mutationFn: createCategory,
    onSuccess: (data) => {
      toast.success(data.message || "Category created successfully", {
        position: "bottom-right",
      });
      // Invalidate and refetch category queries to auto-update the table
      queryClient.invalidateQueries({ queryKey: ["getCategoryByBrand"] });
      queryClient.invalidateQueries({ queryKey: ["getAllCategories"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create category", {
        position: "bottom-right",
      });
    },
  });
};

// === Update Category ===
export const updateCategory = async (
  categoryId: string,
  data: IUpdateCategoryData
): Promise<{ status: number; message: string }> => {
  const res = await api2.put(`/category/update-category/${categoryId}`, data);
  return res.data;
};

export const useUpdateCategory = (categoryId: string) => {
  return useMutation({
    mutationKey: ["updateCategory", categoryId],
    mutationFn: (data: IUpdateCategoryData) => updateCategory(categoryId, data),
    onSuccess: (data) => {
      toast.success(data.message || "Category updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update category");
    },
  });
};

// === Delete Category ===
export const deleteCategory = async (
  categoryId: string
): Promise<IDeleteCategoryResponse> => {
  const res = await api2.delete(`/category/delete-category/${categoryId}`);
  return res.data;
};

export const deleteBulkCategories = async (categoryIds: string[]): Promise<IDeleteCategoryResponse> => {
  const res = await api2.delete(`/category/delete-category/${categoryIds.join(',')}`);
  return res.data;
};

export const useDeleteCategory = () => {
  return useMutation({
    mutationKey: ["deleteCategory"],
    mutationFn: (categoryId: string) => deleteCategory(categoryId),
    onSuccess: (data) => {
      toast.success(data.message || "Category deleted successfully", {
        position: "bottom-right",
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete category");
    },
  });
};

export const useDeleteBulkCategories = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["deleteBulkCategories"],
    mutationFn: (categoryIds: string[]) => deleteBulkCategories(categoryIds),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["getCategories"] });
      queryClient.invalidateQueries({ queryKey: ["getCategoryByBrand"] });
      toast.success(data.message || "Categories deleted successfully", {
        position: "bottom-right",
        description: "The selected categories have been deleted successfully."
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete categories", {
        position: "bottom-right",
        description: "An error occurred while deleting the categories."
      });
    },
  });
};


export async function getCategoryByBrand(
  brandId: string,
  page: number = 1,
  limit: number = 10
): Promise<ICategoryByBrandResponse> {
  const res = await api2.get(`/category/get-brand-categories/${brandId}`, {
    params: { page, limit }
  });
  return res.data;
}

export const useGetCategoryByBrand = (
  brandId: string,
  page: number = 1,
  limit: number = 10
) => {
  return useQuery({
    queryKey: ["getCategoryByBrand", brandId, page, limit],
    queryFn: () => getCategoryByBrand(brandId, page, limit),
    enabled: !!brandId,
  });
}

// === Get Subcategories by Category ID ===
export const getSubcategoriesByCategoryId = async (
  categoryId: string,
  page: number = 1,
  limit: number = 10
): Promise<ISubcategoryByCategoryResponse> => {
  const res = await api2.get<ISubcategoryByCategoryResponse>(
    `/subcategory/get-category-subcategories/${categoryId}`,
    {
      params: { page, limit }
    }
  );
  return res.data;
};

export const useGetSubcategoriesByCategoryId = (
  categoryId: string,
  page: number = 1,
  limit: number = 10
) => {
  return useQuery({
    queryKey: ["getSubcategoriesByCategoryId", categoryId, page, limit],
    queryFn: () => getSubcategoriesByCategoryId(categoryId, page, limit),
    enabled: !!categoryId,
  });
};

// === Deleted Categories APIs ===
export const getDeletedCategories = async (page: number = 1, limit: number = 10) => {
  const response = await api2.get(`/category/deleted-categories?page=${page}&limit=${limit}`);
  return response.data;
};

export const useGetDeletedCategories = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ["getDeletedCategories", page, limit],
    queryFn: () => getDeletedCategories(page, limit)
  });
};

export const recoverCategories = async (ids: string[]) => {
  const response = await api2.put("/category/recover-categories", { ids });
  return response.data;
};

export const useRecoverCategories = () => {
  return useMutation({
    mutationKey: ["recoverCategories"],
    mutationFn: (ids: string[]) => recoverCategories(ids),
    onSuccess: (data) => {
      toast.success(data.message || "Categories recovered successfully", {
        position: "bottom-right",
        description: "The selected categories have been recovered successfully."
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to recover categories", {
        position: "bottom-right",
        description: "An error occurred while recovering the categories."
      });
    }
  });
};

export const destroyCategoryPermanently = async (categoryId: string) => {
  const response = await api2.delete(`/category/destroy-category/${categoryId}`);
  return response.data;
};

export const useDestroyCategoryPermanently = () => {
  return useMutation({
    mutationKey: ["destroyCategoryPermanently"],
    mutationFn: (categoryId: string) => destroyCategoryPermanently(categoryId),
    onSuccess: (data) => {
      toast.success(data.message || "Category permanently deleted", {
        position: "bottom-right",
        description: "The category has been permanently deleted from the system."
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete category permanently", {
        position: "bottom-right",
        description: "An error occurred while permanently deleting the category."
      });
    }
  });
};