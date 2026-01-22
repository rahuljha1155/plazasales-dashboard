import { useQueryClient } from "@tanstack/react-query";
import {
    useGetAllAds,
    useGetContextAds,
    useCreateAd,
    useUpdateAd,
    useDeleteAds,
    useGetDeletedAds,
    useDestroyAdsPermanently,
    useRecoverAds,
} from "@/services/ads";
import type { IGetAllAdsQuery } from "@/types/IAds";

export const useAds = (params?: IGetAllAdsQuery) => {
    const queryClient = useQueryClient();

    const getAllAdsQuery = useGetAllAds(params);
    const createAdMutation = useCreateAd();
    const deleteAdsMutation = useDeleteAds();

    const invalidateAds = () => {
        queryClient.invalidateQueries({ queryKey: ["getAllAds"] });
        queryClient.invalidateQueries({ queryKey: ["getContextAds"] });
    };

    return {
        ads: getAllAdsQuery.data?.data?.ads || [],
        total: getAllAdsQuery.data?.data?.total || 0,
        totalPages: getAllAdsQuery.data?.data?.totalPages || 0,
        isLoading: getAllAdsQuery.isLoading,
        error: getAllAdsQuery.error,
        createAd: createAdMutation.mutateAsync,
        deleteAds: deleteAdsMutation.mutateAsync,
        isCreating: createAdMutation.isPending,
        isDeleting: deleteAdsMutation.isPending,
        invalidateAds,
    };
};

export const useContextAds = (params: {
    productId?: string;
    categoryId?: string;
    brandId?: string;
    subcategoryId?: string;
}) => {
    return useGetContextAds(params);
};

export const useDeletedAds = (page: number = 1, limit: number = 10) => {
    const queryClient = useQueryClient();
    const deletedAdsQuery = useGetDeletedAds(page, limit);
    const recoverAdsMutation = useRecoverAds();
    const destroyAdsMutation = useDestroyAdsPermanently();

    const invalidateDeletedAds = () => {
        queryClient.invalidateQueries({ queryKey: ["getDeletedAds"] });
        queryClient.invalidateQueries({ queryKey: ["getAllAds"] });
    };

    return {
        ads: deletedAdsQuery.data?.data?.ads || [],
        total: deletedAdsQuery.data?.data?.total || 0,
        totalPages: deletedAdsQuery.data?.data?.totalPages || 0,
        isLoading: deletedAdsQuery.isLoading,
        error: deletedAdsQuery.error,
        recoverAds: recoverAdsMutation.mutateAsync,
        destroyAds: destroyAdsMutation.mutateAsync,
        isRecovering: recoverAdsMutation.isPending,
        isDestroying: destroyAdsMutation.isPending,
        invalidateDeletedAds,
    };
};

export {
    useGetAllAds,
    useGetContextAds,
    useCreateAd,
    useUpdateAd,
    useDeleteAds,
    useGetDeletedAds,
    useDestroyAdsPermanently,
    useRecoverAds,
};
