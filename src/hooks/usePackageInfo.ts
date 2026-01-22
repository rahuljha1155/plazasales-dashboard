import { api } from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useGetPackageInfos = (packageId: string) => {
  return useQuery({
    queryKey: ["packageInfos", packageId],
    queryFn: async () => {
      const response = await api.get(`packageinfo/package/${packageId}`);
      return response.data.data;
    },
  });
};

export const useGetPackageInfo = (id: string) => {
  return useQuery({
    queryKey: ["packageInfo", id],
    queryFn: async () => {
      const response = await api.get(`packageinfo/${id}`);
      return response.data.data;
    },
  });
};

export const useCreatePackageInfo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { packageId: string; formData: FormData }) => {
      const { packageId, formData } = data;
      const response = await api.post(`packageinfo/${packageId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["packageInfos", variables.packageId] });
    },
  });
};

export const useUpdatePackageInfo = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await api.put(`packageinfo/${id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packageInfo", id] });
      queryClient.invalidateQueries({ queryKey: ["packageInfos"] });
    },
  });
};

export const useDeletePackageInfo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`packageinfo/${id}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packageInfos"] });
    },
  });
};