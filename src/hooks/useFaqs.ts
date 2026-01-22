import { faqApi } from "@/services/faq";
import type { IFAQ, IFaqResponse } from "@/types/IFaq";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";


export const useGetFAQs = () => {
  return useQuery<IFaqResponse>({
    queryKey: ["faq"],
    queryFn: async () => {
      return await faqApi.getAll();
    },
  });
};

export const useGetFAQById = (id: string) => {
  return useQuery<IFAQ>({
    queryKey: ["faq", id],
    queryFn: async () => {
      const response = await faqApi.getOne(id);
      return response.data.faq;
    },
    enabled: !!id,
  });
};

export const useCreateFAQ = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: IFAQ) => {
      const response = await faqApi.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faq"] });
    },
  });
};

export const useUpdateFAQ = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<IFAQ>) => {
      const response = await faqApi.update(id, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faq"] });
    },
  });
};

export const useDeleteFAQ = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await faqApi.delete(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faq"] });
    },
  });
};

export const useDeleteBulkFAQs = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const response = await faqApi.deleteBulk(ids);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faq"] });
    },
  });
};

export const useGetDeletedFAQs = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ["deleted-faqs", page, limit],
    queryFn: () => faqApi.getDeleted(page, limit),
  });
};

export const useRecoverFAQs = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const response = await faqApi.recover(ids);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deleted-faqs"] });
      queryClient.invalidateQueries({ queryKey: ["faq"] });
    },
  });
};

export const useDestroyFAQPermanently = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await faqApi.destroyPermanently(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deleted-faqs"] });
    },
  });
};
