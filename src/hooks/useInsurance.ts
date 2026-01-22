import { api } from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

export interface Insurance {
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

export const useGetInsuranceByPackageId = (
  packageId: string,
  page: number = 1,
  limit: number = 10
) => {
  return useQuery<PaginatedResponse<Insurance>>({
    queryKey: ["insurance", packageId, page, limit],
    queryFn: async () => {
      const response = await api.get(
        `insurance/package/${packageId}?page=${page}&limit=${limit}`
      );
      return response.data;
    },
  });
};

interface ApiResponse {
  data: Insurance;
  message: string;
  success: boolean;
}

export const useGetInsuranceById = (id: string) => {
  return useQuery<ApiResponse>({
    queryKey: ["insurance", id],
    queryFn: async () => {
      const response = await api.get<ApiResponse>(`insurance/${id}`);
      return response.data;
    },
    enabled: !!id, // Only run the query if the ID exists
  });
};

export const useCreateInsurance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { formData: FormData }) => {
      const { formData } = data;
      const response = await api.post(`insurance`, formData, {});
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insurance"] });
    },
  });
};

export const useUpdateInsurance = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await api.put(`insurance/${id}`, data, {});
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insurance", id] });
      queryClient.invalidateQueries({ queryKey: ["insurance"] });
    },
  });
};

export const useDeleteInsurance = () => {
  const queryClient = useQueryClient();
  const params = useParams();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`insurance/${id}`);
      return response.data.data;
    },
    onSuccess: (_, id) => {
      // Invalidate the specific item
      queryClient.invalidateQueries({ queryKey: ["insurance", id] });
      // Invalidate the paginated list
      queryClient.invalidateQueries({
        queryKey: ["insurance", params.id],
        exact: false,
      });
      // Invalidate all why-love queries
      queryClient.invalidateQueries({
        queryKey: ["insurance"],
        exact: false,
      });
    },
  });
};
