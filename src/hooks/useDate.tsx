import { api } from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useGetFixedDates = (packageId: string) => {
  return useQuery({
    queryKey: ["fixed-dates", packageId],
    queryFn: async () => {
      const response = await api.get(`fixed-date/package/${packageId}`);
      return response.data.data;
    },
  });
};

export const useGetFixedDate = (id: string) => {
  return useQuery({
    queryKey: ["fixed-date", id],
    queryFn: async () => {
      const response = await api.get(`fixed-date/${id}`);
      return response.data.data;
    },
  });
};

export const useCreateFixedDate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { packageId: string; [key: string]: any }) => {
      const { packageId, ...fixedDateData } = data;
      const response = await api.post(`fixed-date/${packageId}`, fixedDateData);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["fixed-dates", variables.packageId],
      });
    },
  });
};

export const useUpdateFixedDate = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.put(`fixed-date/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fixed-date", id] });
      queryClient.invalidateQueries({ queryKey: ["fixed-dates"] });
    },
  });
};

export const useDeleteFixedDate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`fixed-date/${id}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fixed-dates"] });
    },
  });
};
