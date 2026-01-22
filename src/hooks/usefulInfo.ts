import type { usefulInfo } from "@/types/usefulinfo";
import { usefulInfoAPi } from "../apis/api-call";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface UsefulInfoItem {
  _id: string;
  name: string;
  description: string;
  sortOrder?: number; // optional since not present in all items
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Pagination {
  total: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasNext: boolean;
  hasPrev: boolean;
  nextPage: number | null;
  previousPage: number | null;
}

export interface UsefulInfoResponse {
  status: string;
  data: UsefulInfoItem[];
  pagination: Pagination;
  message: string;
}

export interface UsefulInfoApiResponse {
  data: UsefulInfoItem[];
  pagination: Pagination;
  status: string;
  message: string;
}

export const useGetUsefulInfos = (page = 1, limit = 10) => {
  return useQuery<UsefulInfoApiResponse, Error>({
    queryKey: ["useful-info", page, limit],
    queryFn: async () => {
      const response = await usefulInfoAPi.getAll({ page, limit });
      return {
        data: response.data,
        pagination: response.pagination,
        status: "success",
        message: "Data fetched successfully",
      };
    },
    keepPreviousData: true,
  } as any); // Temporary any type to bypass the type error
};

export const useCreateUsefulInfo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; description: string }) => {
      const res = await usefulInfoAPi.create(data);
      return res.data.data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["useful-info"] }),
  });
};

export const useUpdateUsefulInfo = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; description: string }) => {
      const res = await usefulInfoAPi.update(id, data);
      return res.data.data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["useful-info"] }),
  });
};

export const useDeleteUsefulInfo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await usefulInfoAPi.delete(id);
      return res.data.data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["useful-info"] }),
  });
};
