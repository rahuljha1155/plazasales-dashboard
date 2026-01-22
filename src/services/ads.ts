import type {
    ICreateAdRequest,
    ICreateAdResponse,
    IGetAllAdsQuery,
    IGetAllAdsResponse,
    IUpdateAdRequest,
    IUpdateAdResponse,
    IDeleteAdResponse,
    IGetDeletedAdsResponse,
    IGetAdAnalyticsResponse,
} from "@/types/IAds";
import { api2 } from "./api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// === Get All Ads ===
export const getAllAds = async (
    params?: IGetAllAdsQuery
): Promise<IGetAllAdsResponse> => {
    const res = await api2.get<IGetAllAdsResponse>("/ads/get-ads", { params });
    return res.data;
};

export const useGetAllAds = (params?: IGetAllAdsQuery) => {
    return useQuery({
        queryKey: ["getAllAds", params],
        queryFn: () => getAllAds(params),
    });
};

// === Get Context Ads (by productId, categoryId, brandId, subcategoryId) ===
export const getContextAds = async (
    params: { productId?: string; categoryId?: string; brandId?: string; subcategoryId?: string }
): Promise<IGetAllAdsResponse> => {
    const res = await api2.get<IGetAllAdsResponse>("/ads/context-ads", {
        params,
    });
    return res.data;
};

export const useGetContextAds = (params: {
    productId?: string;
    categoryId?: string;
    brandId?: string;
    subcategoryId?: string;
}) => {
    return useQuery({
        queryKey: ["getContextAds", params],
        queryFn: () => getContextAds(params),
        enabled: !!(params.productId || params.categoryId || params.brandId || params.subcategoryId),
    });
};

// === Create Ad ===
export const createAd = async (
    data: ICreateAdRequest | FormData
): Promise<ICreateAdResponse> => {
    const res = await api2.post<ICreateAdResponse>("/ads/create-ad", data);
    return res.data;
};

export const useCreateAd = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["createAd"],
        mutationFn: (data: ICreateAdRequest | FormData) => createAd(data),
        onSuccess: (data) => {
            toast.success(data?.message || "Ad created successfully", {
                position: "bottom-right",
            });
            queryClient.invalidateQueries({ queryKey: ["getAllAds"] });
            queryClient.invalidateQueries({ queryKey: ["getContextAds"] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to create ad", {
                position: "bottom-right",
            });
        },
    });
};

// === Update Ad ===
export const updateAd = async (
    adId: string,
    data: IUpdateAdRequest | FormData
): Promise<IUpdateAdResponse> => {
    const res = await api2.put<IUpdateAdResponse>(
        `/ads/update-ad/${adId}`,
        data
    );
    return res.data;
};

export const useUpdateAd = (adId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["updateAd", adId],
        mutationFn: (data: IUpdateAdRequest | FormData) => updateAd(adId, data),
        onSuccess: (data) => {
            toast.success(data?.message || "Ad updated successfully", {
                position: "bottom-right",
            });
            queryClient.invalidateQueries({ queryKey: ["getAllAds"] });
            queryClient.invalidateQueries({ queryKey: ["getContextAds"] });
            queryClient.invalidateQueries({ queryKey: ["getAd", adId] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to update ad", {
                position: "bottom-right",
            });
        },
    });
};

// === Delete Ad (single or multiple) ===
export const deleteAds = async (ids: string): Promise<IDeleteAdResponse> => {
    const res = await api2.delete<IDeleteAdResponse>(`/ads/delete-ad/${ids}`);
    return res.data;
};

export const useDeleteAds = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["deleteAds"],
        mutationFn: (ids: string) => deleteAds(ids),
        onSuccess: (data) => {
            toast.success(data?.message || "Ad(s) deleted successfully", {
                position: "bottom-right",
            });
            queryClient.invalidateQueries({ queryKey: ["getAllAds"] });
            queryClient.invalidateQueries({ queryKey: ["getContextAds"] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to delete ad(s)", {
                position: "bottom-right",
            });
        },
    });
};

// === Get Deleted Ads (Sudo Admin) ===
export const getDeletedAds = async (
    page: number = 1,
    limit: number = 10
): Promise<IGetDeletedAdsResponse> => {
    const res = await api2.get<IGetDeletedAdsResponse>(
        `/ads/deleted-ads?page=${page}&limit=${limit}`
    );
    return res.data;
};

export const useGetDeletedAds = (page: number = 1, limit: number = 10) => {
    return useQuery({
        queryKey: ["getDeletedAds", page, limit],
        queryFn: () => getDeletedAds(page, limit),
    });
};

// === Destroy Ad Permanently (Sudo Admin) ===
export const destroyAdsPermanently = async (
    ids: string
): Promise<IDeleteAdResponse> => {
    const res = await api2.delete<IDeleteAdResponse>(`/ads/destroy-ad/${ids}`);
    return res.data;
};

export const useDestroyAdsPermanently = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["destroyAdsPermanently"],
        mutationFn: (ids: string) => destroyAdsPermanently(ids),
        onSuccess: (data) => {
            toast.success(data?.message || "Ad(s) permanently deleted", {
                position: "bottom-right",
            });
            queryClient.invalidateQueries({ queryKey: ["getDeletedAds"] });
        },
        onError: (error: any) => {
            toast.error(
                error.response?.data?.message || "Failed to delete ad(s) permanently",
                { position: "bottom-right" }
            );
        },
    });
};

// === Recover Deleted Ads (Sudo Admin) ===
export const recoverAds = async (ids: string[]): Promise<IDeleteAdResponse> => {
    const res = await api2.put<IDeleteAdResponse>(`/ads/recover-ads`, { ids });
    return res.data;
};

export const useRecoverAds = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["recoverAds"],
        mutationFn: (ids: string | string[]) => {
            const idsArray = typeof ids === "string" ? ids.split(",") : ids;
            return recoverAds(idsArray);
        },
        onSuccess: (data) => {
            toast.success(data?.message || "Ad(s) recovered successfully", {
                position: "bottom-right",
            });
            queryClient.invalidateQueries({ queryKey: ["getDeletedAds"] });
            queryClient.invalidateQueries({ queryKey: ["getAllAds"] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to recover ad(s)", {
                position: "bottom-right",
            });
        },
    });
};

// === Get Ad Analytics ===
export const getAdAnalytics = async (
    adId: string
): Promise<IGetAdAnalyticsResponse> => {
    const res = await api2.get<IGetAdAnalyticsResponse>(
        `/ads/${adId}/analytics`
    );
    return res.data;
};

export const useGetAdAnalytics = (adId: string) => {
    return useQuery({
        queryKey: ["getAdAnalytics", adId],
        queryFn: () => getAdAnalytics(adId),
        enabled: !!adId,
    });
};
