import { blogApi } from "../apis/api-call";
import type { IBlog } from "../types/IBlog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useGetBlog = () => {
  return useQuery<IBlog[]>({
    queryKey: ["blog"],
    queryFn: async () => {
      const response = await blogApi.getAllBlogs();
      return response.data.data;
    },
  });
};

export const useGetPaginatedBlogs = (page: number, limit: number) => {
  return useQuery({
    queryKey: ["blog", page, limit],
    queryFn: async () => {
      const response = await blogApi.getAllBlogs({ page, limit });
      return {
        data: response.data,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages,
        currentPage: response.pagination.currentPage,
        itemsPerPage: response.pagination.itemsPerPage,
        hasNextPage: response.pagination.hasNextPage,
        hasPreviousPage: response.pagination.hasPreviousPage,
        nextPage: response.pagination.nextPage,
        previousPage: response.pagination.previousPage,
      };
    },
  });
};

export const useGetBlogById = (id: string) => {
  return useQuery<IBlog>({
    queryKey: ["blog", id],
    queryFn: async () => {
      const response = await blogApi.getOne(id);
      return response.data.blog;
    },
    enabled: !!id,
  });
};

export const useCreateBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await blogApi.create(data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog"] });
    },
  });
};

export const useUpdateBlog = (blogId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await blogApi.update(blogId, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog"] });
    },
  });
};

export const useDeleteBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await blogApi.delete(id);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog"] });
      queryClient.invalidateQueries({ queryKey: ["getAllBlogs"] });
    },
  });
};
