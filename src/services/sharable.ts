import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api2 } from "./api";
import { toast } from "sonner";

const toggleSharableActive = async (sharableId: string, isActive: boolean) => {
  const res = await api2.put(`/shareable/update-shareable/${sharableId}`, {
    isActive
  });
  return res.data;
};

export const useToggleSharableActive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["toggleSharableActive"],
    mutationFn: ({ sharableId, isActive }: { sharableId: string; isActive: boolean }) =>
      toggleSharableActive(sharableId, isActive),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["getSharables"] });

      toast.success(
        (data as any)?.message || "Sharable status updated successfully",
        { position: "bottom-right" }
      );
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update sharable status",
        { position: "bottom-right" }
      );
    }
  });
};

const updateSharableSortOrder = async (sharableId: string, sortOrder: number) => {
  const res = await api2.put(`/shareable/update-shareable/${sharableId}`, {
    sortOrder
  });
  return res.data;
};

export const useUpdateSharableSortOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["updateSharableSortOrder"],
    mutationFn: ({ sharableId, sortOrder }: { sharableId: string; sortOrder: number }) =>
      updateSharableSortOrder(sharableId, sortOrder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getSharables"] });
    },
    onError: (error: any) => {
      console.error("Sort order update error:", error);
      const errorMessage = error.response?.data?.message || "Failed to update sharable order";
      
      // Don't show toast for recaptcha errors as the interceptor will retry
      if (!errorMessage.toLowerCase().includes("recaptcha")) {
        toast.error(errorMessage, { position: "bottom-right" });
      }
    }
  });
};
