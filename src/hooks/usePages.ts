import type { PageContent } from "@/types/pages";
import { pageApi } from "../apis/api-call";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useGetPages = () =>
  useQuery<PageContent[]>({
    queryKey: ["pages"],
    queryFn: async () => {
      const res = await pageApi.getAll();
      return res.data.data;
    },
  });

export const useGetPageById = (id: string) =>
  useQuery<PageContent>({
    queryKey: ["pages", id],
    queryFn: async () => {
      const res = await pageApi.getOne(id);
      return res.data.data;
    },
  });

export const useGetPageBySlug = (slug: string) =>
  useQuery<PageContent>({
    queryKey: ["pages", "slug", slug],
    queryFn: async () => {
      const res = await pageApi.getBySlug(slug);
      return res.data.data;
    },
  });

export const useCreatePage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: FormData) => {
      const res = await pageApi.create(data);
      return res.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pages"] }),
  });
};

export const useUpdatePage = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: FormData) => {
      const res = await pageApi.update(id, data);
      return res.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pages"] }),
  });
};

export const useDeletePage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await pageApi.delete(id);
      return res.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pages"] }),
  });
};
