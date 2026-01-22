import type {
  IInquiry,
  ICreateInquiryRequest,
  ICreateInquiryResponse,
  IGetAllInquiriesResponse,
  IGetInquiryByIdResponse,
  IUpdateInquiryRequest,
  IUpdateInquiryResponse,
  IDeleteInquiryResponse,
} from "@/types/IInquiry";
import { api2 } from "./api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// === Get All Inquiries ===
export const getAllInquiries = async (page: number = 1, limit: number = 10): Promise<IGetAllInquiriesResponse> => {
  const res = await api2.get<IGetAllInquiriesResponse>("/inquiry/get-all-inquiries", {
    params: { page, limit }
  });
  return res.data;
};

export const useGetAllInquiries = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ["getAllInquiries", page, limit],
    queryFn: () => getAllInquiries(page, limit),
  });
};

// === Get All Demo Requests ===
export const getAllDemoRequests = async (page: number = 1, limit: number = 10): Promise<IGetAllInquiriesResponse> => {
  const res = await api2.get<IGetAllInquiriesResponse>("/contact/get-demo-contacts", {
    params: { page, limit }
  });
  return res.data;
};

export const useGetAllDemoRequests = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ["getAllDemoRequests", page, limit],
    queryFn: () => getAllDemoRequests(page, limit),
  });
};

// === Get Inquiry By ID ===
export const getInquiryById = async (
  id: string
): Promise<IGetInquiryByIdResponse> => {
  const res = await api2.get<IGetInquiryByIdResponse>(`/inquiry/get-inquiry/${id}`);
  return res.data;
};

export const useGetInquiryById = (id: string) => {
  return useQuery({
    queryKey: ["getInquiryById", id],
    queryFn: () => getInquiryById(id),
    enabled: !!id,
  });
};

// === Get Demo Contact By ID ===
export const getDemoContactById = async (
  id: string
): Promise<any> => {
  const res = await api2.get<any>(`/contact/get-demo-contacts/${id}`);
  return res.data;
};

export const useGetDemoContactById = (id: string) => {
  return useQuery({
    queryKey: ["getDemoContactById", id],
    queryFn: () => getDemoContactById(id),
    enabled: !!id,
  });
};

// === Create Inquiry ===
export const createInquiry = async (
  data: ICreateInquiryRequest
): Promise<ICreateInquiryResponse> => {
  const res = await api2.post<ICreateInquiryResponse>("/inquiry/create-inquiry", data);
  return res.data;
};

export const useCreateInquiry = () => {
  return useMutation({
    mutationKey: ["createInquiry"],
    mutationFn: createInquiry,
    onSuccess: (data) => {
      toast.success((data as any)?.message || "Inquiry created successfully", {
        position: "bottom-right",
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create inquiry", {
        position: "bottom-right",
      });
    },
  });
};

// === Update Inquiry ===
export const updateInquiry = async (
  id: string,
  data: IUpdateInquiryRequest
): Promise<IUpdateInquiryResponse> => {
  const res = await api2.put<IUpdateInquiryResponse>(`/inquiry/update-inquiry/${id}`, data);
  return res.data;
};

export const useUpdateInquiry = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["updateInquiry", id],
    mutationFn: (data: IUpdateInquiryRequest) => updateInquiry(id, data),
    onSuccess: (data) => {
      toast.success((data as any)?.message || "Inquiry updated successfully", {
        position: "bottom-right",
      });
      queryClient.invalidateQueries({ queryKey: ["getAllInquiries"] });
      queryClient.invalidateQueries({ queryKey: ["getInquiryById", id] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update inquiry", {
        position: "bottom-right",
      });
    },
  });
};

// === Delete Inquiry ===
export const deleteInquiry = async (id: string): Promise<IDeleteInquiryResponse> => {
  const res = await api2.delete<IDeleteInquiryResponse>(`/inquiry/delete-inquiry/${id}`);
  return res.data;
};

// === Bulk Delete Inquiries ===
export const deleteBulkInquiries = async (ids: string[]): Promise<IDeleteInquiryResponse> => {
  const res = await api2.delete<IDeleteInquiryResponse>(`/inquiry/delete/${ids.join(',')}`);
  return res.data;
};

export const useDeleteInquiry = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["deleteInquiry", id],
    mutationFn: () => deleteInquiry(id),
    onSuccess: (data) => {
      toast.success((data as any)?.message || "Inquiry deleted successfully", {
        position: "bottom-right",
      });
      queryClient.invalidateQueries({ queryKey: ["getAllInquiries"] });
      queryClient.invalidateQueries({ queryKey: ["getDeletedInquiries"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete inquiry", {
        position: "bottom-right",
      });
    },
  });
};

export const useDeleteBulkInquiries = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["deleteBulkInquiries"],
    mutationFn: async (ids: string[]) => {
      const response = await api2.delete(`/inquiry/delete-inquiry/${ids.join(',')}`);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["getAllInquiries"] });
      queryClient.invalidateQueries({ queryKey: ["getDeletedInquiries"] });
      toast.success((data as any)?.message || "Inquiries deleted successfully", {
        position: "bottom-right",
        description: "The selected inquiries have been deleted successfully."
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete inquiries", {
        position: "bottom-right"
      });
    },
  });
};

// === Get Deleted Inquiries ===
export const getDeletedInquiries = async (page: number = 1, limit: number = 10) => {
  const res = await api2.get("/inquiry/deleted-inquiries", {
    params: { page, limit }
  });
  return res.data;
};

export const useGetDeletedInquiries = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ["getDeletedInquiries", page, limit],
    queryFn: () => getDeletedInquiries(page, limit),
  });
};

// === Recover Inquiries ===
export const recoverInquiries = async (ids: string[]) => {
  const res = await api2.put("/inquiry/recover-inquiries", { ids });
  return res.data;
};

export const useRecoverInquiries = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["recoverInquiries"],
    mutationFn: (ids: string[]) => recoverInquiries(ids),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["getDeletedInquiries"] });
      queryClient.invalidateQueries({ queryKey: ["getAllInquiries"] });
      toast.success(data?.message || "Inquiries recovered successfully", {
        position: "bottom-right",
        description: "The selected inquiries have been recovered successfully."
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to recover inquiries", {
        position: "bottom-right",
        description: "An error occurred while recovering the inquiries."
      });
    },
  });
};

// === Destroy Inquiries Permanently ===
export const destroyInquiriesPermanently = async (ids: string[]) => {
  const idsParam = ids.join(',');
  const res = await api2.delete(`/inquiry/destroy-inquiries/${idsParam}`);
  return res.data;
};

export const useDestroyInquiriesPermanently = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["destroyInquiriesPermanently"],
    mutationFn: (ids: string[]) => destroyInquiriesPermanently(ids),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["getDeletedInquiries"] });
      toast.success(data?.message || "Inquiries permanently deleted", {
        position: "bottom-right",
        description: "The selected inquiries have been permanently deleted from the system."
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete inquiries permanently", {
        position: "bottom-right",
        description: "An error occurred while deleting the inquiries permanently."
      });
    },
  });
};

// === Create Reply ===
export interface ICreateReplyRequest {
  message: string;
  inquiryId: string;
}

export interface ICreateReplyResponse {
  status: number;
  message: string;
}

export const createReply = async (
  data: ICreateReplyRequest
): Promise<ICreateReplyResponse> => {
  const res = await api2.post<ICreateReplyResponse>("/reply/create-reply", data);
  return res.data;
};

export const useCreateReply = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["createReply"],
    mutationFn: createReply,
    onSuccess: (data) => {
      toast.success(data?.message || "Reply sent successfully", {
        position: "bottom-right",
      });
      // Invalidate inquiries queries to trigger auto-refetch
      queryClient.invalidateQueries({ queryKey: ["getAllInquiries"] });
      queryClient.invalidateQueries({ queryKey: ["getInquiryById"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to send reply", {
        position: "bottom-right",
      });
    },
  });
};

// === Create Demo Reply ===
export interface ICreateDemoReplyRequest {
  message: string;
  contactId: string;
}

export const createDemoReply = async (
  data: ICreateDemoReplyRequest
): Promise<ICreateReplyResponse> => {
  const res = await api2.post<ICreateReplyResponse>("/reply/create-demo-reply", data);
  return res.data;
};

export const useCreateDemoReply = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["createDemoReply"],
    mutationFn: createDemoReply,
    onSuccess: (data) => {
      toast.success(data?.message || "Reply sent successfully", {
        position: "bottom-right",
      });
      // Invalidate demo contacts queries to trigger auto-refetch
      queryClient.invalidateQueries({ queryKey: ["getAllDemoRequests"] });
      queryClient.invalidateQueries({ queryKey: ["getDemoContactById"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to send reply", {
        position: "bottom-right",
      });
    },
  });
};