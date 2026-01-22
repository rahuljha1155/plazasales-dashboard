import type {
  IGallery,
  ICreateGalleryRequest,
  ICreateGalleryResponse,
  IGetAllGalleriesResponse,
  IGetGalleryByIdResponse,
  IUpdateGalleryRequest,
  IUpdateGalleryResponse,
  IDeleteGalleryResponse,
} from "@/types/IProductGallery";
import { api2 } from "./api";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

// === Get All Galleries ===
export const getAllGalleries = async (): Promise<IGetAllGalleriesResponse> => {
  const res = await api2.get<IGetAllGalleriesResponse>("/gallery/get-all-galleries");
  return res.data;
};

export const useGetAllGalleries = () => {
  return useQuery({
    queryKey: ["getAllGalleries"],
    queryFn: getAllGalleries,
  });
};

// === Get Gallery By ID ===
export const getGalleryById = async (
  id: string
): Promise<IGetGalleryByIdResponse> => {
  const res = await api2.get<IGetGalleryByIdResponse>(`/gallery/get-gallery/${id}`);
  return res.data;
};

export const useGetGalleryById = (id: string) => {
  return useQuery({
    queryKey: ["getGalleryById", id],
    queryFn: () => getGalleryById(id),
    enabled: !!id,
  });
};

// === Create Gallery ===
export const createGallery = async (
  data: ICreateGalleryRequest
): Promise<ICreateGalleryResponse> => {
  const res = await api2.post<ICreateGalleryResponse>("/gallery/create-gallery", data);
  return res.data;
};

export const useCreateGallery = () => {
  return useMutation({
    mutationKey: ["createGallery"],
    mutationFn: createGallery,
    onSuccess: (data) => {
      toast.success((data as any)?.message || "Gallery created successfully", {
        position: "bottom-right",
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create gallery", {
        position: "bottom-right",
      });
    },
  });
};

// === Update Gallery ===
export const updateGallery = async (
  id: string,
  data: IUpdateGalleryRequest
): Promise<IUpdateGalleryResponse> => {
  const res = await api2.put<IUpdateGalleryResponse>(`/gallery/update-gallery/${id}`, data);
  return res.data;
};

export const useUpdateGallery = (id: string) => {
  return useMutation({
    mutationKey: ["updateGallery", id],
    mutationFn: (data: IUpdateGalleryRequest) => updateGallery(id, data),
    onSuccess: (data) => {
      toast.success((data as any)?.message || "Gallery updated successfully", {
        position: "bottom-right",
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update gallery", {
        position: "bottom-right",
      });
    },
  });
};

// === Delete Gallery ===
export const deleteGallery = async (id: string): Promise<IDeleteGalleryResponse> => {
  const res = await api2.delete<IDeleteGalleryResponse>(`/gallery/delete-gallery/${id}`);
  return res.data;
};

export const useDeleteGallery = (id: string) => {
  return useMutation({
    mutationKey: ["deleteGallery", id],
    mutationFn: () => deleteGallery(id),
    onSuccess: (data) => {
      toast.success((data as any)?.message || "Gallery deleted successfully", {
        position: "bottom-right",
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete gallery", {
        position: "bottom-right",
      });
    },
  });
};