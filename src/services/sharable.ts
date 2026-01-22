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
