import { api } from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useGetGear = (packageId: string) => {
  return useQuery({
    queryKey: ["gear", packageId],
    queryFn: async () => {
      const response = await api.get(`gear/package/${packageId}`);
      return response.data.data;
    },
  });
};

export const useGetGearItem = (id: string) => {
  return useQuery({
    queryKey: ["gear-item", id],
    queryFn: async () => {
      const response = await api.get(`gear/${id}`);
      return response.data.data;
    },
  });
};

export const useCreateGear = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      packageId: string;
      body: { title: string; description: string };
    }) => {
      const { packageId, body } = data;
      const response = await api.post(`gear/${packageId}`, body);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["gear", variables.packageId],
      });
    },
  });
};

export const useUpdateGear = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      body: { title: string; description: string };
      packageId?: string;
    }) => {
      if (!id) {
        throw new Error("Gear ID is required for update");
      }
      const response = await api.put(`gear/${id}`, data.body);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      const packageId = variables.packageId;
      if (packageId) {
        queryClient.invalidateQueries({ queryKey: ["gear", packageId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["gear"] });
      }
      if (id) {
        queryClient.invalidateQueries({ queryKey: ["gear-item", id] });
      }
    },
  });
};

export const useDeleteGear = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`gear/${id}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gear"] });
    },
  });
};
