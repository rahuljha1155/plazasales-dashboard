import { videoReviewApi } from "../apis/api-call";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { VideoReviewItem, VideoReviewResponse } from "@/types/viewReview";

export const useGetVideoReviews = () =>
  useQuery<VideoReviewResponse>({
    queryKey: ["video-review"],
    queryFn: async () => {
      const res = await videoReviewApi.getAll();
      return res.data;
    },
  });

export const useGetVideoReviewsbyPackageId = (id: string) =>
  useQuery<VideoReviewResponse>({
    queryKey: ["video-review", id],
    queryFn: async () => {
      const res = await videoReviewApi.getAllByPackageId(id);
      return res.data;
    },
  });

export const useCreateVideoReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await videoReviewApi.create(formData);
      return res.data.data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["video-review"] }),
  });
};

export const useUpdateVideoReview = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await videoReviewApi.update(id, formData);
      return res.data.data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["video-review"] }),
  });
};

export const useDeleteVideoReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await videoReviewApi.delete(id);
      return res.data.data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["video-review"] }),
  });
};
