import { api } from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseQueryOptions } from "@tanstack/react-query";

// Get all packages
export const useGetPackages = () => {
  return useQuery({
    queryKey: ["packages"],
    queryFn: async () => {
      const response = await api.get("package");
      return response.data.data;
    },
  });
};

// Get package by ID
export const useGetPackageById = (id: string) => {
  return useQuery({
    queryKey: ["package", id],
    queryFn: async () => {
      const response = await api.get(`package/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

// Get packages by category
export const useGetPackagesByCategory = (categoryId: string) => {
  return useQuery({
    queryKey: ["packages", "category", categoryId],
    queryFn: async () => {
      const response = await api.get(`package/category/${categoryId}`);
      return response.data.data;
    },
    enabled: !!categoryId,
  });
};

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
  };
}

// Get packages by subcategory with pagination
export const useGetPackagesBySubCategory = (subCategoryId: string, page = 1, limit = 10) => {
  return useQuery<PaginatedResponse<any>, Error>({
    queryKey: ["packages", "subcategory", subCategoryId, page, limit],
    queryFn: async () => {
      const response = await api.get(`package/subcategory/${subCategoryId}`, {
        params: {
          page,
          limit
        }
      });
      return {
        data: response.data.data,
        pagination: response.data.pagination
      };
    },
    enabled: !!subCategoryId,
    keepPreviousData: true
  } as UseQueryOptions<PaginatedResponse<any>, Error>);
};

// Create package
export const useCreatePackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await api.post("package", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packages"] });
    },
  });
};

// Update package
export const useUpdatePackage = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await api.put(`package/${id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      queryClient.invalidateQueries({ queryKey: ["package", id] });
    },
  });
};

// Delete package
export const useDeletePackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`package/${id}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packages"] });
    },
  });
};
