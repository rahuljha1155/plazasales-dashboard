import { api } from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

export interface ImportantNotice {
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

export const useGetImportantNoticeByPackageId = (
  packageId: string,
  page: number = 1,
  limit: number = 10
) => {
  return useQuery<PaginatedResponse<ImportantNotice>>({
    queryKey: ["important-notice", packageId, page, limit],
    queryFn: async () => {
      const response = await api.get(
        `important-notice/package/${packageId}?page=${page}&limit=${limit}`
      );
      return response.data;
    },
  });
};

interface ApiResponse {
  data: ImportantNotice;
  message: string;
  success: boolean;
}

export const useGetImportantNoticeById = (id: string) => {
  return useQuery<ApiResponse>({
    queryKey: ["important-notice", id],
    queryFn: async () => {
      const response = await api.get<ApiResponse>(`important-notice/${id}`);
      return response.data;
    },
    enabled: !!id, // Only run the query if the ID exists
  });
};

export const useCreateImportantNotice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { formData: FormData }) => {
      const { formData } = data;
      const response = await api.post(`important-notice`, formData, {});
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["important-notice"] });
    },
  });
};

export const useUpdateImportantNotice = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await api.put(`important-notice/${id}`, data, {});
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["important-notice", id] });
      queryClient.invalidateQueries({ queryKey: ["important-notice"] });
    },
  });
};

export const useDeleteImportantNotice = () => {
  const queryClient = useQueryClient();
  const params = useParams();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`important-notice/${id}`);
      return response.data.data;
    },
    onSuccess: (_, id) => {
      // Invalidate the specific item
      queryClient.invalidateQueries({ queryKey: ["important-notice", id] });
      // Invalidate the paginated list
      queryClient.invalidateQueries({
        queryKey: ["important-notice", params.id],
        exact: false,
      });
      // Invalidate all why-love queries
      queryClient.invalidateQueries({
        queryKey: ["important-notice"],
        exact: false,
      });
    },
  });
};
