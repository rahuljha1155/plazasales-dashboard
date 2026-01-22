import { api } from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

export interface WhyLove {
  _id: string;
  title: string;
  description: string;
  package: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrev: boolean;
    nextPage: number | null;
    previousPage: number | null;
  };
  message: string;
}

export const useGetWhyLoveByPackageId = (
  packageId: string,
  page: number = 1,
  limit: number = 10
) => {
  return useQuery<PaginatedResponse<WhyLove>>({
    queryKey: ["why-love", packageId, page, limit],
    queryFn: async () => {
      const response = await api.get(
        `why-love/package/${packageId}?page=${page}&limit=${limit}`
      );
      return response.data;
    },
  });
};

export const useGetWhyLoveById = (id: string) => {
  return useQuery<
    {
      status: string
      data: {
        _id: string
        title: string
        description: string
        package: string
        isActive: boolean
        sortOrder: number
        createdAt: string
        updatedAt: string
        __v: number
      },
      message: string
    }>({
      queryKey: ["why-love", id],
      queryFn: async () => {
        const response = await api.get(`why-love/${id}`);
        return response.data;
      },
    });
};

export const useCreateWhyLove = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { formData: FormData }) => {
      const { formData } = data;
      const response = await api.post(`why-love`, formData, {});
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["why-love"] });
    },
  });
};

export const useUpdateWhyLove = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await api.put(`why-love/${id}`, data, {});
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["why-love", id] });
      queryClient.invalidateQueries({ queryKey: ["why-love"] });
    },
  });
};

export const useDeleteWhyLove = () => {
  const queryClient = useQueryClient();
  const params = useParams();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`why-love/${id}`);
      return response.data.data;
    },
    onSuccess: (_, id) => {
      // Invalidate the specific item
      queryClient.invalidateQueries({ queryKey: ["why-love", id] });
      // Invalidate the paginated list
      queryClient.invalidateQueries({
        queryKey: ["why-love", params.id],
        exact: false,
      });
      // Invalidate all why-love queries
      queryClient.invalidateQueries({
        queryKey: ["why-love"],
        exact: false,
      });
    },
  });
};
