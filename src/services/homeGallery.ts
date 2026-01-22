import { api } from "./api";
import type { HomeGalleryType, GalleryResponse } from "@/types/homegalleryType";

export interface HomeGalleryParams {
  page?: number;
  limit?: number;
}

// Get all home galleries with pagination
export const getHomeGalleries = async (params?: HomeGalleryParams): Promise<GalleryResponse> => {
  const { page = 1, limit = 10 } = params || {};
  const response = await api.get<GalleryResponse>(`/home-gallery/get-home-galleries`, {
    params: { page, limit },
  });
  return response.data;
};

// Get single home gallery by ID
export const getHomeGalleryById = async (id: string): Promise<{ status: number; message: string; data: HomeGalleryType }> => {
  const response = await api.get(`/home-gallery/get-home-gallery/${id}`);
  return response.data;
};

// Create new home gallery
export const createHomeGallery = async (formData: FormData): Promise<{ status: number; message: string; data: HomeGalleryType }> => {
  const response = await api.post(`/home-gallery/create-home-gallery`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Update existing home gallery
export const updateHomeGallery = async (id: string, formData: FormData): Promise<{ status: number; message: string; data: HomeGalleryType }> => {
  const response = await api.put(`/home-gallery/update-home-gallery/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Soft delete home gallery
export const deleteHomeGallery = async (id: string): Promise<{ status: number; message: string }> => {
  const response = await api.delete(`/home-gallery/delete-home-gallery/${id}`);
  return response.data;
};

// Bulk delete home galleries
export const deleteBulkHomeGalleries = async (ids: string[]): Promise<{ status: number; message: string }> => {
  const response = await api.delete(`/home-gallery/delete-home-gallery/${ids.join(",")}`);
  return response.data;
};

// Permanently destroy home gallery
export const destroyHomeGallery = async (id: string): Promise<{ status: number; message: string }> => {
  const response = await api.delete(`/home-gallery/destroy-home-gallery/${id}`);
  return response.data;
};

// Get deleted home galleries
export const getDeletedHomeGalleries = async (params?: HomeGalleryParams): Promise<GalleryResponse> => {
  const { page = 1, limit = 10 } = params || {};
  const response = await api.get<GalleryResponse>(`/home-gallery/deleted-home-galleries`, {
    params: { page, limit },
  });
  return response.data;
};

// Recover deleted home galleries
export const recoverHomeGalleries = async (ids: string[]): Promise<{ status: number; message: string }> => {
  const response = await api.put(`/home-gallery/recover-home-galleries`, { ids });
  return response.data;
};
