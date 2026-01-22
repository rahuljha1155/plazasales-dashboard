import { api } from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useGetInclusions = (packageId: string, category: string = '') => {
  return useQuery({
    queryKey: ["inclusions", packageId, category],
    queryFn: async () => {
      const response = await api.get(`inclusion/package/${packageId}`, {
        params: { category: category || undefined }
      });
      return response.data.data;
    },
  });
};

export const useGetInclusion = (id: string) => {
  return useQuery({
    queryKey: ["inclusion", id],
    queryFn: async () => {
      const response = await api.get(`inclusion/${id}`);
      return response.data.data;
    },
  });
};

export const useCreateInclusion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { packageId: string; formData: FormData }) => {
      const { packageId, formData } = data;
      const response = await api.post(`inclusion/${packageId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["inclusions", variables.packageId] });
    },
  });
};

export const useUpdateInclusion = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await api.put(`inclusion/${id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inclusion", id] });
      queryClient.invalidateQueries({ queryKey: ["inclusions"] });
    },
  });
};

export const useDeleteInclusion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`inclusion/${id}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inclusions"] });
    },
  });
};