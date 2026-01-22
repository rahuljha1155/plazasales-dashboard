import { api } from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useGetAttractions = (packageId: string) => {
  return useQuery({
    queryKey: ["attractions", packageId],
    queryFn: async () => {
      const response = await api.get(`attraction/package/${packageId}`);
      return response.data.data;
    },
  });
};

export const useGetAttraction = (id: string) => {
  return useQuery({
    queryKey: ["attraction", id],
    queryFn: async () => {
      const response = await api.get(`attraction/${id}`);
      return response.data.data;
    },
  });
};

export const useCreateAttraction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { packageId: string; formData: FormData }) => {
      const { packageId, formData } = data;
      const response = await api.post(`attraction/${packageId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["attractions", variables.packageId],
      });
    },
  });
};

export const useUpdateAttraction = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.put(`attraction/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attraction", id] });
      queryClient.invalidateQueries({ queryKey: ["attractions"] });
    },
  });
};

export const useDeleteAttraction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`attraction/${id}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attractions"] });
    },
  });
};
