import { api } from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  ProductDownload,
  CreateProductDownloadPayload
} from "@/types/IDownload";

interface GetAllDownloadsResponse {
  success: boolean;
  data: {
    downloads: ProductDownload[];
    total: number;
    currentPage: number;
    totalPages: number;
  };
}

interface GetDownloadsByProductResponse {
  status: number;
  message: string;
  downloads: ProductDownload[];
}

interface GetDownloadResponse {
  success: boolean;
  data: ProductDownload;
}

// Get all product downloads
export const useGetAllProductDownloads = (page = 1, limit = 10, categoryId?: string) => {
  return useQuery<GetAllDownloadsResponse>({
    queryKey: ["product-downloads", page, limit, categoryId],
    queryFn: async () => {
      const response = await api.get("/product-download/get-all-downloads", {
        params: { page, limit, categoryId },
      });
      return response.data;
    },
  });
};

// Get downloads by product ID
export const useGetDownloadsByProductId = (productId: string) => {
  return useQuery<GetDownloadsByProductResponse>({
    queryKey: ["product-downloads-by-product", productId],
    queryFn: async () => {
      const response = await api.get(`/product-download/get-downloads-by-product/${productId}`);
      return response.data;
    },
    enabled: !!productId,
  });
};

// Get downloads by category ID
export const useGetDownloadsByCategoryId = (categoryId: string) => {
  return useQuery<GetDownloadsByProductResponse>({
    queryKey: ["product-downloads-by-category", categoryId],
    queryFn: async () => {
      const response = await api.get(`/product-download/get-downloads-by-category/${categoryId}`);
      return response.data;
    },
    enabled: !!categoryId,
  });
};

// Get product download by ID
export const useGetProductDownloadById = (downloadId: string) => {
  return useQuery<GetDownloadResponse>({
    queryKey: ["product-download", downloadId],
    queryFn: async () => {
      const response = await api.get(`/product-download/get-download/${downloadId}`);
      return response.data;
    },
    enabled: !!downloadId,
  });
};

// Create product download
export const useCreateProductDownload = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProductDownloadPayload & { recaptchaToken?: string }) => {
      const { recaptchaToken, ...downloadData } = data;
      const formData = new FormData();

      // Append all fields to FormData
      Object.entries(downloadData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'platforms' || key === 'extra' || key === 'mirrors') {
            formData.append(key, JSON.stringify(value));
          } else if (value instanceof File) {
            formData.append(key, value);
          } else if (typeof value === 'boolean') {
            // Explicitly handle boolean values
            formData.append(key, value ? 'true' : 'false');
          } else {
            formData.append(key, String(value));
          }
        }
      });

      const response = await api.post("/product-download/create-download", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(recaptchaToken && { 'x-recaptcha-token': recaptchaToken }),
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-downloads"] });
      queryClient.invalidateQueries({ queryKey: ["product-downloads-by-category"] });
    },
  });
};

// Update product download
export const useUpdateProductDownload = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      downloadId,
      data,
      recaptchaToken
    }: {
      downloadId: string;
        data: Partial<CreateProductDownloadPayload>,
        recaptchaToken?: string;
    }) => {
      const formData = new FormData();

      // Append all fields to FormData
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'platforms' || key === 'extra' || key === 'mirrors') {
            formData.append(key, JSON.stringify(value));
          } else if (value instanceof File) {
            formData.append(key, value);
          } else if (typeof value === 'boolean') {
            // Explicitly handle boolean values
            formData.append(key, value ? 'true' : 'false');
          } else {
            formData.append(key, String(value));
          }
        }
      });

      const response = await api.put(`/product-download/update-download/${downloadId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-Recaptcha-Token': recaptchaToken || '',
        },
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["product-downloads"] });
      queryClient.invalidateQueries({ queryKey: ["product-download", variables.downloadId] });
    },
  });
};

// Delete product download
export const useDeleteProductDownload = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (downloadId: string) => {
      const response = await api.delete(`/product-download/delete-download/${downloadId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-downloads"] });
      queryClient.invalidateQueries({ queryKey: ["product-downloads-by-product"] });
      queryClient.invalidateQueries({ queryKey: ["product-downloads-by-category"] });
    },
  });
};

// Get deleted product downloads
export const useGetDeletedProductDownloads = (page = 1, limit = 10) => {
  return useQuery<GetAllDownloadsResponse>({
    queryKey: ["deleted-product-downloads", page, limit],
    queryFn: async () => {
      const response = await api.get("/product-download/deleted-downloads", {
        params: { page, limit },
      });
      return response.data;
    },
  });
};

// Recover product downloads
export const useRecoverProductDownloads = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const response = await api.put("/product-download/recover-downloads", { ids });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deleted-product-downloads"] });
      queryClient.invalidateQueries({ queryKey: ["product-downloads"] });
      queryClient.invalidateQueries({ queryKey: ["product-downloads-by-product"] });
      queryClient.invalidateQueries({ queryKey: ["product-downloads-by-category"] });
    },
  });
};

// Destroy product downloads permanently
export const useDestroyProductDownloads = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/product-download/destroy-downloads/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deleted-product-downloads"] });
    },
  });
};


// Download file
export const useDownloadFile = () => {
  return useMutation({
    mutationFn: async (downloadId: string) => {
      const response = await api.get(`/product-download/download-file/${downloadId}`, {
        responseType: 'blob',
      });

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      // Get filename from content-disposition header if available
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'download';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return response.data;
    },
  });
};

// Update product download sort order
export const useUpdateProductDownloadSortOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ downloadId, sortOrder }: { downloadId: string; sortOrder: number }) => {
      const response = await api.put(`/product-download/update-download/${downloadId}`, { sortOrder });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-downloads"] });
      queryClient.invalidateQueries({ queryKey: ["product-downloads-by-product"] });
      queryClient.invalidateQueries({ queryKey: ["product-downloads-by-category"] });
    },
  });
};
