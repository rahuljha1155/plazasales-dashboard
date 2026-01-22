import { api } from "@/services/api";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useGetSubCategory = () => {
  return useQuery({
    queryKey: ["subcategory"],
    queryFn: async () => {
      const response = await api.get("subcategory");
      return response.data.data;
    },
  });
};

export const useGetSubCategoryById = (id: string) => {
  return useQuery({
    queryKey: ["subcategory", id],
    queryFn: async () => {
      const response = await api.get("category/" + id);
      return response.data.data;
    },
  });
};

export const useCreateSubCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await api.post("subcategory", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcategory"] });
    },
  });
};

export const useUpdateSubCategory = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await api.put("subcategory/" + id, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcategory"] });
    },
  });
};

export const useDeleteSubCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete("subcategory/" + id);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcategory"] });
    },
  });
};
