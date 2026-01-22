import { api } from "@/services/api";
import type { IGalleryResponse } from "@/types/IGallery";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Gallery {
  id: string;
  caption: string;
  isHome: boolean;
  productId: string;
  mediaAsset: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface GalleryFormData {
  caption: string;
  isHome: boolean;
  productId: string;
  mediaAsset: File[];
}

export const useGetAllGalleries = () => {
  return useQuery({
    queryKey: ["galleries"],
    queryFn: async () => {
      const response = await api.get<IGalleryResponse>("/gallery/get-all-galleries");
      return response.data;
    },
  });
};

export const useGetGalleryById = (id: string) => {
  return useQuery<{ data: Gallery }>({
    queryKey: ["gallery", id],
    queryFn: async () => {
      const response = await api.get(`/gallery/get-gallery/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useGetGalleriesByProductId = (productId: string) => {
  return useQuery<{ data: IGalleryResponse }>({
    queryKey: ["galleries", "product", productId],
    queryFn: async () => {
      const response = await api.get(`/gallery/get-gallery/${productId}`);
      return response.data
    },
    enabled: !!productId,
  });
};


export const useCreateGallery = (productId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await api.post("/gallery/create-gallery", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["galleries"] });
      if (productId) {
        queryClient.invalidateQueries({ queryKey: ["product", productId] });
        queryClient.invalidateQueries({ queryKey: ["getProductBySlugOrId", productId] });
      }
    },
  });
};


export const useUpdateGallery = (id: string, productId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await api.put(`/gallery/update-gallery/${id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["galleries"] });
      queryClient.invalidateQueries({ queryKey: ["gallery", id] });
      if (productId) {
        queryClient.invalidateQueries({ queryKey: ["product", productId] });
        queryClient.invalidateQueries({ queryKey: ["getProductBySlugOrId", productId] });
      }
    },
  });
};


export const useDeleteGallery = (productId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/gallery/delete-gallery/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["galleries"] });
      if (productId) {
        queryClient.invalidateQueries({ queryKey: ["product", productId] });
        queryClient.invalidateQueries({ queryKey: ["getProductBySlugOrId", productId] });
      }
    },
  });
};


export const useDeleteBulkGalleries = (productId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["deleteBulkGalleries"],
    mutationFn: async (ids: string[]) => {
      const response = await api.delete(`/gallery/delete-gallery/${ids.join(',')}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["galleries"] });
      if (productId) {
        queryClient.invalidateQueries({ queryKey: ["product", productId] });
        queryClient.invalidateQueries({ queryKey: ["getProductBySlugOrId", productId] });
      }
    },
  });
};

export const useGetDeletedGalleries = () => {
  return useQuery({
    queryKey: ["deleted-galleries"],
    queryFn: async () => {
      const response = await api.get("/gallery/deleted-galleries");
      return response.data;
    },
  });
};

export const useRecoverGalleries = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const response = await api.put("/gallery/recover-galleries", { ids });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["galleries"] });
      queryClient.invalidateQueries({ queryKey: ["deleted-galleries"] });
    },
  });
};

export const useDestroyGalleries = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const response = await api.delete(`/gallery/destroy-gallery/${ids.join(',')}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deleted-galleries"] });
    },
  });
};
