import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { type ISeoMetadata } from "@/types/ISeoMetadata";
import { toast } from "sonner";

interface PaginatedSeoResponse {
  status: number;
  message: string;
  data: {
    records: ISeoMetadata[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface SingleSeoResponse {
  status: number;
  message: string;
  seoMetadata: ISeoMetadata;
}

interface GetAllSeoParams {
  page?: number;
  limit?: number;
  entityType?: string;
  search?: string;
}

// Get all SEO metadata with pagination
export const useGetAllSeo = (params: GetAllSeoParams = {}) => {
  const { page = 1, limit = 10, entityType, search } = params;

  return useQuery<PaginatedSeoResponse, Error>({
    queryKey: ["seo-metadata", page, limit, entityType, search],
    queryFn: async () => {
      const response = await api.get("/seo-metadata/get-all-seo", {
        params: {
          page,
          limit,
          entityType,
          search,
        },
      });
      return response.data;
    },
    keepPreviousData: true,
  } as any);
};

// Get SEO metadata by entity type and ID
export const useGetSeoByEntity = (entityType: string, entityId: string, enabled: boolean = true) => {
  return useQuery<SingleSeoResponse, Error>({
    queryKey: ["seo-metadata-by-entity", entityType, entityId],
    queryFn: async () => {
      const response = await api.get(`/seo/${entityType}/${entityId}`);
      return response.data;
    },
    enabled: !!entityId && !!entityType && enabled,
  });
};

// Get SEO metadata by ID
export const useGetSeoById = (id: string) => {
  return useQuery<SingleSeoResponse, Error>({
    queryKey: ["seo-metadata", id],
    queryFn: async () => {
      const response = await api.get(`/seo-metadata/get-seo/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Delete SEO metadata (soft delete)
export const useDeleteSeo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/seo-metadata/delete-seo/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seo-metadata"] });
      toast.success("SEO metadata deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete SEO metadata");
    },
  });
};

// Update SEO metadata
export const useUpdateSeo = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await api.put(`/seo-metadata/update-seo/${id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seo-metadata"] });
      toast.success("SEO metadata updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update SEO metadata");
    },
  });
};

// Get all deleted SEO metadata (for sudo admin)
export const useGetDeletedSeo = (params: GetAllSeoParams = {}) => {
  const { page = 1, limit = 10 } = params;

  return useQuery<PaginatedSeoResponse, Error>({
    queryKey: ["deleted-seo-metadata", page, limit],
    queryFn: async () => {
      const response = await api.get("/seo-metadata/deleted-seo", {
        params: {
          page,
          limit,
        },
      });
      return response.data;
    },
    keepPreviousData: true,
  } as any);
};

// Recover deleted SEO metadata
export const useRecoverSeo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const response = await api.put("/seo-metadata/recover-seo", { ids });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deleted-seo-metadata"] });
      queryClient.invalidateQueries({ queryKey: ["seo-metadata"] });
      toast.success("SEO metadata recovered successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to recover SEO metadata");
    },
  });
};

// Permanently delete SEO metadata
export const useDestroySeo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/seo-metadata/destroy-seo/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deleted-seo-metadata"] });
      toast.success("SEO metadata permanently deleted");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to permanently delete SEO metadata");
    },
  });
};
