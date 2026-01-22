import { api } from "@/services/api";
import { blogApi } from "../apis/api-call";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { IBlog } from "@/types/IBlog";

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
  };
}

export const useGetCategory = (page = 1, limit = 10) => {
  return useQuery<PaginatedResponse<any>, Error>({
    queryKey: ["category", page, limit],
    queryFn: async () => {
      const response = await api.get("category", {
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
    keepPreviousData: true
  } as any); // Type assertion to bypass the TypeScript error
};

export const useGetCategoryById = (id: string) => {
  return useQuery({
    queryKey: ["category", id],
    queryFn: async () => {
      const response = await api.get("/category/get-category/" + id);
      return response.data.data;
    },
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await api.post("category", data, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["category"] });
    },
  });
};

export const useUpdateCategory = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await api.put("category/" + id, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["category"] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete("category/" + id);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["category"] });
    },
  });
};
