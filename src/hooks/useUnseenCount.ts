import { api } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export const useUnseenCount = () => {
  return useQuery({
    queryKey: ["unseenCounts"],
    queryFn: async () => {
      const res = await api.get("/notifi/unseen-counts");
      return res.data;
    },
  });
};

// Mark seen mutation

export const useMarkSeen = (type: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/notifi/${type}/${id}/seen`);
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: [type] });
      const previousQueryData = queryClient.getQueryData<{ data: any[] }>([
        type,
      ]);

      if (previousQueryData && Array.isArray(previousQueryData.data)) {
        queryClient.setQueryData<{ data: any[] }>([type], (old) => {
          if (old && Array.isArray(old.data)) {
            const updatedData = old.data.map((item: any) => {
              if (item._id === id) {
                return { ...item, seen: true };
              }
              return item;
            });
            return { ...old, data: updatedData };
          }
          return old;
        });
      }
      return { previousQueryData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unseenCounts"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["contact"] });
      queryClient.invalidateQueries({ queryKey: ["custom-bookings"] });
    },
    onError: (err, id, context) => {
      //   toast.error("Failed to mark as seen");
      if (context?.previousQueryData) {
        queryClient.setQueryData([type], context.previousQueryData);
      }
    },
  });
};
