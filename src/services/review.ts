import { api2 } from "./api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { IPostReview } from "@/schema/review";
import type {
    IReviewResponse,
    ISingleReviewResponse,
    ICreateReviewResponse,
    IUpdateReviewResponse,
    IDeleteReviewResponse
} from "@/types/IReview";

export const getAllReviews = async (): Promise<IReviewResponse> => {
    const response = await api2.get<IReviewResponse>("/review/get-all-reviews");
    return response.data;
};

export const useGetAllReviews = () => {
    return useQuery({
        queryKey: ["getAllReviews"],
        queryFn: getAllReviews
    });
};

export const getReviewById = async (id: string): Promise<ISingleReviewResponse> => {
    const response = await api2.get<ISingleReviewResponse>(`/review/get-review/${id}`);
    return response.data;
};

export const useGetReviewById = (id: string) => {
    return useQuery({
        queryKey: ["getReviewById", id],
        queryFn: () => getReviewById(id),
        enabled: !!id
    });
};

export const createReview = async (reviewData: IPostReview): Promise<ICreateReviewResponse> => {
    const response = await api2.post<ICreateReviewResponse>("/review/create-review", reviewData);
    return response.data;
};

export const useCreateReview = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["createReview"],
        mutationFn: (data: IPostReview) => createReview(data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["getAllReviews"] });
            toast.success(data.message || "Review created successfully");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to create review");
        }
    });
};

export const updateReview = async (id: string, reviewData: IPostReview): Promise<IUpdateReviewResponse> => {
    const response = await api2.put<IUpdateReviewResponse>(`/review/update-review/${id}`, reviewData);
    return response.data;
};

export const useUpdateReview = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["updateReview"],
        mutationFn: ({ id, data }: { id: string; data: IPostReview }) => updateReview(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["getAllReviews"] });
            toast.success(data.message || "Review updated successfully");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to update review");
        }
    });
};

export const deleteReviews = async (ids: string): Promise<IDeleteReviewResponse> => {
    const response = await api2.delete<IDeleteReviewResponse>(`/review/delete-review/${ids}`);
    return response.data;
};

export const useDeleteReviews = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["deleteReviews"],
        mutationFn: (ids: string) => deleteReviews(ids),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["getAllReviews"] });
            toast.success(data.message || "Review(s) deleted successfully");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to delete review(s)");
        }
    });
};

export const getDeletedReviews = async (): Promise<IReviewResponse> => {
    const response = await api2.get<IReviewResponse>("/review/deleted-reviews");
    return response.data;
};

export const useGetDeletedReviews = () => {
    return useQuery({
        queryKey: ["getDeletedReviews"],
        queryFn: getDeletedReviews
    });
};

export const recoverReviews = async (ids: string[]): Promise<IDeleteReviewResponse> => {
    const response = await api2.put<IDeleteReviewResponse>("/review/recover-reviews", { ids });
    return response.data;
};

export const useRecoverReviews = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["recoverReviews"],
        mutationFn: (ids: string[]) => recoverReviews(ids),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["getDeletedReviews"] });
            queryClient.invalidateQueries({ queryKey: ["getAllReviews"] });
            toast.success(data.message || "Review(s) recovered successfully");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to recover review(s)");
        }
    });
};

export const destroyReviewPermanently = async (id: string): Promise<IDeleteReviewResponse> => {
    // The user specified /review/destroy-seo/:id for permanent delete
    const response = await api2.delete<IDeleteReviewResponse>(`/review/destroy-seo/${id}`);
    return response.data;
};

export const useDestroyReviewPermanently = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["destroyReviewPermanently"],
        mutationFn: (id: string) => destroyReviewPermanently(id),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["getDeletedReviews"] });
            toast.success(data.message || "Review permanently deleted");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to delete review permanently");
        }
    });
};
