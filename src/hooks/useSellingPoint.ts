import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { sellingPointServices } from "@/services/sellingPoint";

// Query keys
export const sellingPointKeys = {
  all: ["sellingPoints"] as const,
  lists: () => [...sellingPointKeys.all, "list"] as const,
  list: (filters: any) => [...sellingPointKeys.lists(), { filters }] as const,
  details: () => [...sellingPointKeys.all, "detail"] as const,
  detail: (id: string) => [...sellingPointKeys.details(), id] as const,
  byBrand: (identifier: string) => [...sellingPointKeys.all, "brand", identifier] as const,
  deleted: () => [...sellingPointKeys.all, "deleted"] as const,
};

// Get all selling points
export const useGetAllSellingPoints = (
  page?: number,
  limit?: number,
  search: string = "",
  brandId?: string
) => {
  return useQuery({
    queryKey: sellingPointKeys.list({ page, limit, search, brandId }),
    queryFn: () => sellingPointServices.getAllSellingPoints(page, limit, search, brandId),
  });
};

// Get selling point by ID
export const useGetSellingPointById = (id: string) => {
  return useQuery({
    queryKey: sellingPointKeys.detail(id),
    queryFn: () => sellingPointServices.getSellingPointById(id),
    enabled: !!id,
  });
};

// Get selling points by brand
export const useGetSellingPointsByBrand = (identifier: string) => {
  return useQuery({
    queryKey: sellingPointKeys.byBrand(identifier),
    queryFn: () => sellingPointServices.getSellingPointsByBrand(identifier),
    enabled: !!identifier,
  });
};

// Create selling point
export const useCreateSellingPoint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sellingPointServices.createSellingPoint,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: sellingPointKeys.lists() });
      
      toast.success(data.message || "Selling point created successfully", {
        position: "bottom-right",
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create selling point", {
        position: "bottom-right",
      });
    },
  });
};

// Update selling point
export const useUpdateSellingPoint = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => sellingPointServices.updateSellingPoint(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: sellingPointKeys.lists() });
      queryClient.invalidateQueries({ queryKey: sellingPointKeys.detail(id) });
      
      toast.success(data.message || "Selling point updated successfully", {
        position: "bottom-right",
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update selling point", {
        position: "bottom-right",
      });
    },
  });
};

// Delete selling point
export const useDeleteSellingPoint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sellingPointServices.deleteSellingPoint,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: sellingPointKeys.lists() });
      
      toast.success(data.message || "Selling point deleted successfully", {
        position: "bottom-right",
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete selling point", {
        position: "bottom-right",
      });
    },
  });
};

// Get deleted selling points
export const useGetDeletedSellingPoints = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: [...sellingPointKeys.deleted(), page, limit],
    queryFn: () => sellingPointServices.getDeletedSellingPoints(page, limit),
  });
};

// Recover selling points
export const useRecoverSellingPoints = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sellingPointServices.recoverSellingPoints,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: sellingPointKeys.deleted() });
      queryClient.invalidateQueries({ queryKey: sellingPointKeys.lists() });
      
      toast.success(data.message || "Selling points recovered successfully", {
        position: "bottom-right",
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to recover selling points", {
        position: "bottom-right",
      });
    },
  });
};

// Destroy selling points permanently
export const useDestroySellingPoints = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sellingPointServices.destroySellingPoints,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: sellingPointKeys.deleted() });
      
      toast.success(data.message || "Selling points permanently deleted", {
        position: "bottom-right",
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to permanently delete selling points", {
        position: "bottom-right",
      });
    },
  });
};

// Update selling point sort order
export const useUpdateSellingPointSortOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, sortOrder }: { id: string; sortOrder: number }) =>
      sellingPointServices.updateSellingPoint(id, { sortOrder }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sellingPointKeys.lists() });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update sort order", {
        position: "bottom-right",
      });
    },
  });
};
