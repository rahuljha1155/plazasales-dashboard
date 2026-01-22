import { api } from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useGetExclusions = (packageId: string, category: string = '') => {
  return useQuery({
    queryKey: ["exclusions", packageId, category],
    queryFn: async () => {
      const response = await api.get(`exclusion/package/${packageId}`, {
        params: { category: category || undefined }
      });
      return response.data.data;
    },
  });
};

export const useGetExclusion = (id: string) => {
  return useQuery({
    queryKey: ["exclusion", id],
    queryFn: async () => {
      const response = await api.get(`exclusion/${id}`);
      return response.data.data;
    },
  });
};

export const useCreateExclusion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { packageId: string; formData: FormData }) => {
      const { packageId, formData } = data;
      const response = await api.post(`exclusion/${packageId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["exclusions", variables.packageId] });
    },
  });
};

export const useUpdateExclusion = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await api.put(`exclusion/${id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exclusion", id] });
      queryClient.invalidateQueries({ queryKey: ["exclusions"] });
    },
  });
};

export const useDeleteExclusion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`exclusion/${id}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exclusions"] });
    },
  });
};