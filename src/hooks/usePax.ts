import { api } from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useGetPaxes = (packageId: string) => {
  return useQuery({
    queryKey: ["paxes", packageId],
    queryFn: async () => {
      const response = await api.get(`pax/package/${packageId}`);
      return response.data.data;
    },
  });
};

export const useGetPax = (id: string) => {
  return useQuery({
    queryKey: ["pax", id],
    queryFn: async () => {
      const response = await api.get(`pax/${id}`);
      return response.data.data;
    },
  });
};

export const useCreatePax = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { packageId: string; [key: string]: any }) => {
      const { packageId, ...paxData } = data;
      const response = await api.post(`pax/${packageId}`, paxData);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["paxes", variables.packageId] });
    },
  });
};

export const useUpdatePax = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.put(`pax/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pax", id] });
      queryClient.invalidateQueries({ queryKey: ["paxes"] });
    },
  });
};

export const useDeletePax = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`pax/${id}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paxes"] });
    },
  });
};