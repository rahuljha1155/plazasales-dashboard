import { api2 } from "@/services/api";
import type { IFAQ, IFaqResponse } from "@/types/IFaq";

export const faqApi = {
  getAll: (): Promise<IFaqResponse> =>
    api2.get("/faq/get-all-faq").then((response) => {
      return response.data || [];
    }),

  getOne: (id: string) => api2.get(`/faq/get-faq/${id}`),

  create: (data: IFAQ) => api2.post("/faq/create-faq", data),

  update: (id: string, data: Partial<IFAQ>) =>
    api2.put(`/faq/update-faq/${id}`, data),

  delete: (id: string) => api2.delete(`/faq/delete-faq/${id}`),

  deleteBulk: (ids: string[]) => api2.delete(`/faq/delete-faq/${ids.join(",")}`),

  getDeleted: (page: number, limit: number) => api2.get(`/faq/deleted-faqs?page=${page}&limit=${limit}`),

  recover: (ids: string[]) => api2.put("/faq/recover-faqs", { ids }),

  destroyPermanently: (id: string) => api2.delete(`/faq/destroy-faqs/${id}`),
};
