import type { homefaq } from "@/types/homefaq";
import { homefaqApi } from "../apis/api-call";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useGetHomefaqs = () =>
  useQuery<homefaq[]>({
    queryKey: ["homefaq"],
    queryFn: async () => {
      const res = await homefaqApi.getAll();
      return res.data.data;
    },
  });

export const useCreateHomefaq = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; description: string }) => {
      const res = await homefaqApi.create(data);
      return res.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["homefaq"] }),
  });
};

export const useUpdateHomefaq = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; description: string }) => {
      const res = await homefaqApi.update(id, data);
      return res.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["homefaq"] }),
  });
};

export const useDeleteHomefaq = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await homefaqApi.delete(id);
      return res.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["homefaq"] }),
  });
};
