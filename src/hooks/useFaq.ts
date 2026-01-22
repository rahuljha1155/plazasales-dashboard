import { api } from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useGetFaqs = (packageId: string) => {
  return useQuery({
    queryKey: ["faqs", packageId],
    queryFn: async () => {
      const response = await api.get(`faq/package/${packageId}`);
      return response.data.data;
    },
  });
};

export const useGetFaq = (id: string) => {
  return useQuery({
    queryKey: ["faq", id],
    queryFn: async () => {
      const response = await api.get(`faq/${id}`);
      return response.data.data;
    },
  });
};

export const useCreateFaq = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { packageId: string; formData: FormData }) => {
      const { packageId, formData } = data;
      const response = await api.post(`faq/${packageId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["faqs", variables.packageId] });
    },
  });
};

export const useUpdateFaq = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await api.put(`faq/${id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faq", id] });
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
    },
  });
};

export const useDeleteFaq = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`faq/${id}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
    },
  });
};