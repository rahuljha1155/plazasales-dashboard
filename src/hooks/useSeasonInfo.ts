import { api } from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useGetSeasonInfoByPackageId = (packageId: string) => {
  return useQuery({
    queryKey: ["season-info", packageId],
    queryFn: async () => {
      const response = await api.get(`season-info/package/${packageId}`);
      return response.data;
    },
  });
};

export const useGetSeasonInfoById = (id: string) => {
  return useQuery({
    queryKey: ["season-info", id],
    queryFn: async () => {
      const response = await api.get(`season-info/${id}`);
      return response.data;
    },
  });
};

export const useCreateSeasonInfo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { formData: FormData }) => {
      const { formData } = data;
      const response = await api.post(`season-info`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["season-info"] });
    },
  });
};

export const useUpdateSeasonInfo = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await api.put(`season-info/${id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["season-info", id] });
      queryClient.invalidateQueries({ queryKey: ["season-info"] });
    },
  });
};

export const useDeleteSeasonInfo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`season-info/${id}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["season-info"] });
    },
  });
};
