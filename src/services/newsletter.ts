import { api } from "./api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Types
export interface Subscriber {
    id: string;
    email: string;
    name?: string;
    createdAt: string;
    updatedAt: string;
}

export interface NewsletterResponse {
    status: number;
    data: {
        subscriptions: Subscriber[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface NewsletterAnalyticsResponse {
    status: number;
    message: string;
    data: {
        total: number;
        active: number;
        unsubscribed: number;
        deleted: number;
    };
}

export interface RecentSubscribersResponse {
    status: number;
    message: string;
    data: {
        records: Subscriber[];
    };
}


// API Functions
export const getSubscribers = async (page = 1, limit = 10) => {
    const response = await api.get<NewsletterResponse>(`/newsletter/subscriptions?page=${page}&limit=${limit}`);
    return response.data;
};

export const deleteSubscribers = async (ids: string[]) => {
    const response = await api.delete(`/newsletter/delete/${ids.join(",")}`);
    return response.data;
};

export const destroySubscribers = async (ids: string[]) => {
    const response = await api.delete(`/newsletter/destroy/${ids.join(",")}`);
    return response.data;
};

export const getDeletedSubscribers = async (page = 1, limit = 10) => {
    const response = await api.get<NewsletterResponse>(`/newsletter/deleted?page=${page}&limit=${limit}`);
    return response.data;
};

export const recoverSubscribers = async (ids: string[]) => {
    const response = await api.put(`/newsletter/recover`, { ids });
    return response.data;
};

export const getNewsletterAnalytics = async () => {
    const response = await api.get<NewsletterAnalyticsResponse>(`/analytics/newsletter/overview`);
    return response.data;
};

export const getRecentSubscribers = async () => {
    const response = await api.get<RecentSubscribersResponse>(`/analytics/newsletter/recent`);
    return response.data;
};


// Hooks
export const useGetSubscribers = (page = 1, limit = 10) => {
    return useQuery({
        queryKey: ["getSubscribers", page, limit],
        queryFn: () => getSubscribers(page, limit),
    });
};

export const useDeleteSubscribers = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteSubscribers,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["getSubscribers"] });
            queryClient.invalidateQueries({ queryKey: ["getDeletedSubscribers"] });
            queryClient.invalidateQueries({ queryKey: ["getNewsletterAnalytics"] });
            toast.success("Subscribers deleted successfully");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to delete subscribers");
        }
    });
};

export const useDestroySubscribers = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: destroySubscribers,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["getDeletedSubscribers"] });
            queryClient.invalidateQueries({ queryKey: ["getNewsletterAnalytics"] });
            toast.success("Subscribers permanently deleted");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to permanently delete subscribers");
        }
    });
};

export const useGetDeletedSubscribers = (page = 1, limit = 10) => {
    return useQuery({
        queryKey: ["getDeletedSubscribers", page, limit],
        queryFn: () => getDeletedSubscribers(page, limit),
    });
};

export const useRecoverSubscribers = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: recoverSubscribers,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["getSubscribers"] });
            queryClient.invalidateQueries({ queryKey: ["getDeletedSubscribers"] });
            queryClient.invalidateQueries({ queryKey: ["getNewsletterAnalytics"] });
            toast.success("Subscribers recovered successfully");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to recover subscribers");
        }
    });
};

export const useGetNewsletterAnalytics = () => {
    return useQuery({
        queryKey: ["getNewsletterAnalytics"],
        queryFn: getNewsletterAnalytics,
    });
};

export const useGetRecentSubscribers = () => {
    return useQuery({
        queryKey: ["getRecentSubscribers"],
        queryFn: getRecentSubscribers,
    });
};
