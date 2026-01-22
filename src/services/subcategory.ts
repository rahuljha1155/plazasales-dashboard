import type {
  ISubcategoryByCategoryResponse,
  ISubcategory,
  IGetSubCategoryResponse,
} from "@/types/ISubcategory";
import { api2 } from "./api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// === Get All Subcategories ===
export const getAllSubCategories = async (): Promise<IGetSubCategoryResponse> => {
  const res = await api2.get<IGetSubCategoryResponse>("/subcategory/get-all-subcategories");
  return res.data;
};

export const useGetAllSubCategories = () => {
  return useQuery({
    queryKey: ["getAllSubCategories"],
    queryFn: getAllSubCategories,
  });
};

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
    staleTime: 30000, // Cache for 30 seconds
  });
};

// === Get Subcategory by ID ===
export const getSubcategoryById = async (
  subcategoryId: string
): Promise<{ status: number; data: ISubcategory }> => {
  const res = await api2.get(`/subcategory/${subcategoryId}`);
  return res.data;
};

export const useGetSubcategoryById = (subcategoryId: string) => {
  return useQuery({
    queryKey: ["getSubcategoryById", subcategoryId],
    queryFn: () => getSubcategoryById(subcategoryId),
    enabled: !!subcategoryId,
  });
};


export interface ISubcategoryByID {
  status: number
  subCategory: {
    id: string
    createdAt: string
    updatedAt: string
    sortOrder: 2,
    title: string
    slug: string
    coverImage: string
    description: string | null
    category: {
      id: string
      createdAt: string
      updatedAt: string
      sortOrder: number
      title: string
      slug: string
      coverImage: string
      description: string
    }
  }
}


// === Get Subcategory by ID or Slug ===
export const getSubcategoryByIdOrSlug = async (
  idOrSlug: string
): Promise<ISubcategoryByID> => {
  const res = await api2.get(`/subcategory/get-subcategory/${idOrSlug}`);
  return res.data;
};

export const useGetSubCategoryByIdOrSlug = (idOrSlug: string) => {
  return useQuery({
    queryKey: ["getSubcategoryByIdOrSlug", idOrSlug],
    queryFn: () => getSubcategoryByIdOrSlug(idOrSlug),
    enabled: !!idOrSlug,
  });
};

// === Create Subcategory ===
export const createSubcategory = async (
  data: FormData
): Promise<{ status: number; message: string; data: ISubcategory }> => {
  const res = await api2.post(`/subcategory/create-subcategory`, data);
  return res.data;
};

export const useCreateSubCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["createSubcategory"],
    mutationFn: createSubcategory,
    onSuccess: (data) => {
      toast.success(data.message || "Subcategory created successfully", {
        position: "bottom-right",
      });
      // Invalidate and refetch subcategory queries to auto-update the table
      queryClient.invalidateQueries({ queryKey: ["getSubcategoriesByCategoryId"] });
      queryClient.invalidateQueries({ queryKey: ["getAllSubCategories"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create subcategory", {
        position: "bottom-right",
      });
    },
  });
};

// === Update Subcategory ===
export const updateSubcategory = async (
  subcategoryId: string,
  data: FormData
): Promise<{ status: number; message: string; data: ISubcategory }> => {
  const res = await api2.put(`/subcategory/update-subcategory/${subcategoryId}`, data);
  return res.data;
};

export const useUpdateSubCategory = (subcategoryId: string) => {
  return useMutation({
    mutationKey: ["updateSubcategory", subcategoryId],
    mutationFn: (data: FormData) => updateSubcategory(subcategoryId, data),
    onSuccess: (data) => {
      toast.success(data.message || "Subcategory updated successfully", {
        position: "bottom-right",
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update subcategory", {
        position: "bottom-right",
      });
    },
  });
};

// === Delete Subcategory ===
export const deleteSubcategory = async (
  subcategoryId: string
): Promise<{ status: number; message: string }> => {
  const res = await api2.delete(`/subcategory/delete-subcategory/${subcategoryId}`);
  return res.data;
};

// Alias for backward compatibility
export const deleteSubCategory = deleteSubcategory;

// === Bulk Delete Subcategories ===
export const deleteBulkSubcategories = async (
  ids: string[]
): Promise<{ status: number; message: string }> => {
  const res = await api2.delete(`/subcategory/delete-subcategory/${ids.join(',')}`);
  return res.data;
};

export const useDeleteSubCategory = () => {
  return useMutation({
    mutationKey: ["deleteSubcategory"],
    mutationFn: (subcategoryId: string) => deleteSubcategory(subcategoryId),
    onSuccess: (data) => {
      toast.success(data.message || "Subcategory deleted successfully", {
        position: "bottom-right",
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete subcategory", {
        position: "bottom-right",
      });
    },
  });
};

export const useDeleteBulkSubcategories = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["deleteBulkSubcategories"],
    mutationFn: async (ids: string[]) => {
      const response = await api2.delete(`/subcategory/delete/${ids.join(',')}`);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["getAllSubCategories"] });
      toast.success(data.message || "Subcategories deleted successfully", {
        position: "bottom-right",
        description: "The selected subcategories have been deleted successfully."
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete subcategories", {
        position: "bottom-right"
      });
    },
  });
};

// === Deleted Subcategories APIs ===
export const getDeletedSubcategories = async (page: number = 1, limit: number = 10) => {
  const response = await api2.get(`/subcategory/deleted-subcategories?page=${page}&limit=${limit}`);
  return response.data;
};

export const useGetDeletedSubcategories = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ["getDeletedSubcategories", page, limit],
    queryFn: () => getDeletedSubcategories(page, limit)
  });
};

export const recoverSubcategories = async (ids: string[]) => {
  const response = await api2.put("/subcategory/recover-subcategories", { ids });
  return response.data;
};

export const useRecoverSubcategories = () => {
  return useMutation({
    mutationKey: ["recoverSubcategories"],
    mutationFn: (ids: string[]) => recoverSubcategories(ids),
    onSuccess: (data) => {
      toast.success(data.message || "Subcategories recovered successfully", {
        position: "bottom-right",
        description: "The selected subcategories have been recovered successfully."
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to recover subcategories", {
        position: "bottom-right",
        description: "An error occurred while recovering the subcategories."
      });
    }
  });
};

export const destroySubcategoryPermanently = async (subcategoryId: string) => {
  const response = await api2.delete(`/subcategory/destroy-subcategory/${subcategoryId}`);
  return response.data;
};

export const useDestroySubcategoryPermanently = () => {
  return useMutation({
    mutationKey: ["destroySubcategoryPermanently"],
    mutationFn: (subcategoryId: string) => destroySubcategoryPermanently(subcategoryId),
    onSuccess: (data) => {
      toast.success(data.message || "Subcategory permanently deleted", {
        position: "bottom-right",
        description: "The subcategory has been permanently deleted from the system."
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete subcategory permanently", {
        position: "bottom-right",
        description: "An error occurred while permanently deleting the subcategory."
      });
    }
  });
};
