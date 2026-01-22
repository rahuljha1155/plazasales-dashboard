import type { certificate } from "@/types/certificate";
import { certificateApi } from "../apis/api-call";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// models/certificate.interface.ts

export interface Certificate {
  _id: string;
  name: string;
  description: string;
  image: string;
  imagePublicId: string;
  sortOrder?: number; // optional, since some items may not have it
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CertificatePagination {
  total: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasNext: boolean;
  hasPrev: boolean;
  nextPage: number | null;
  previousPage: number | null;
}

export interface CertificateResponse {
  status: "success" | "error";
  data: Certificate[];
  pagination: CertificatePagination;
  message: string;
}


export const useGetCertificates = () =>
  useQuery<CertificateResponse>({
    queryKey: ["certificates"],
    queryFn: async () => {
      const res = await certificateApi.getAll();
      return res.data;
    },
  });

export const useCreateCertificate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: FormData) => {
      const res = await certificateApi.create(data);
      return res.data.data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["certificates"] }),
  });
};

export const useUpdateCertificate = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: FormData) => {
      const res = await certificateApi.update(id, data);
      return res.data.data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["certificates"] }),
  });
};

export const useDeleteCertificate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await certificateApi.delete(id);
      return res.data.data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["certificates"] }),
  });
};
