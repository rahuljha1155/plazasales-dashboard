import { api } from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Video {
  id: string;
  title: string;
  productModelNumber: string;
  youtubeVideoId: string;
  productId: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}


interface GetAllVideosResponse {
  success: boolean;
  data: {
    videos: Video[];
    total: number;
    currentPage: number;
    totalPages: number;
  };
}

interface GetVideosByProductResponse {
  status: number;
  message: string;
  videos: Video[];
}

interface GetVideoResponse {
  success: boolean;
  data: Video;
}

interface CreateVideoPayload {
  title: string;
  productModelNumber?: string;
  youtubeVideoId: string;
  productId: string;
}

// Get all videos
export const useGetAllVideos = (page = 1, limit = 10) => {
  return useQuery<GetAllVideosResponse>({
    queryKey: ["videos", page, limit],
    queryFn: async () => {
      const response = await api.get("/video/get-all-videos", {
        params: { page, limit },
      });
      return response.data;
    },
  });
};

// Get videos by product ID
export const useGetVideosByProductId = (productId: string) => {
  return useQuery<GetVideosByProductResponse>({
    queryKey: ["videos", "product", productId],
    queryFn: async () => {
      const response = await api.get(`/video/get-videos-by-product/${productId}`);
      return response.data;
    },
    enabled: !!productId,
  });
};

// Get video by ID
export const useGetVideoById = (videoId: string) => {
  return useQuery<GetVideoResponse>({
    queryKey: ["video", videoId],
    queryFn: async () => {
      const response = await api.get(`/video/get-video/${videoId}`);
      return response.data;
    },
    enabled: !!videoId,
  });
};

// Create video
export const useCreateVideo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateVideoPayload) => {
      const response = await api.post("/video/create-video", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
};

// Update video
export const useUpdateVideo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ videoId, data }: { videoId: string; data: Partial<CreateVideoPayload> }) => {
      const response = await api.put(`/video/update-video/${videoId}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      queryClient.invalidateQueries({ queryKey: ["video", variables.videoId] });
    },
  });
};

// Delete video
export const useDeleteVideo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (videoId: string) => {
      const response = await api.delete(`/video/delete-video/${videoId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
};

/* -------------------------------------------------------------------------- */
/*                               Deleted Videos                               */
/* -------------------------------------------------------------------------- */

interface GetDeletedVideosResponse {
  success: boolean;
  data: {
    videos: Video[];
    total: number;
    page: number;
    totalPages: number;
  };
}

// Get deleted videos
export const useGetDeletedVideos = (page = 1, limit = 10) => {
  return useQuery<GetDeletedVideosResponse>({
    queryKey: ["deletedVideos", page, limit],
    queryFn: async () => {
      const response = await api.get("/video/deleted-videos", {
        params: { page, limit },
      });
      return response.data;
    },
  });
};

// Recover videos
export const useRecoverVideos = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const response = await api.put("/video/recover-videos", { ids });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deletedVideos"] });
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
};

// Destroy video permanently (supports comma-separated IDs)
export const useDestroyVideoPermanently = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string) => {
      const response = await api.delete(`/video/destroy-videos/${ids}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deletedVideos"] });
    },
  });
};
