import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import type { UseQueryOptions } from "@tanstack/react-query";

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
export const useSearchPackage = (
  query: string,
  { page = 1, limit = 10 }: { page: number; limit: number }
) => {
  return useQuery<PaginatedResponse<any>, Error>({
    queryKey: ["packages", "search", query, limit, page],
    queryFn: async () => {
      const response = await api.get(`/packages/search`, {
        params: {
          query,
          limit,
          page,
        },
      });
      return {
        data: response.data.data,
        pagination: response.data.pagination,
      };
    },
    enabled: !!query,
    keepPreviousData: true,
  } as UseQueryOptions<PaginatedResponse<any>, Error>);
};
