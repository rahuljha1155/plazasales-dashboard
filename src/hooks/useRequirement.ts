import { api } from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useGetRequirements = (packageId: string) => {
  return useQuery({
    queryKey: ["requirements", packageId],
    queryFn: async () => {
      const response = await api.get(`requirement/package/${packageId}`);
      return response.data.data;
    },
  });
};

export const useGetRequirement = (id: string) => {
  return useQuery({
    queryKey: ["requirement", id],
    queryFn: async () => {
      const response = await api.get(`requirement/${id}`);
      return response.data.data;
    },
  });
};

export const useCreateRequirement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { packageId: string; formData: FormData }) => {
      const { packageId, formData } = data;
      const response = await api.post(`requirement/${packageId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["requirements", variables.packageId] });
    },
  });
};

export const useUpdateRequirement = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await api.put(`requirement/${id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requirement", id] });
      queryClient.invalidateQueries({ queryKey: ["requirements"] });
    },
  });
};

export const useDeleteRequirement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`requirement/${id}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requirements"] });
    },
  });
};