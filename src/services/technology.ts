import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api2 } from "./api";
import type {
    ITechnologyResponse,
    ITechnologyByIdResponse,
    ICreateTechnologyResponse,
    IUpdateTechnologyResponse,
    IDeleteTechnologyResponse,
    ICreateTechnologyPayload,
} from "@/types/ITechnology";

// Get all technologies
export const getTechnologies = async (page: number = 1, limit: number = 10): Promise<ITechnologyResponse> => {
    const response = await api2.get<ITechnologyResponse>(`/technology/get-technologies?page=${page}&limit=${limit}`);
    return response.data;
};

export const useGetTechnologies = (page: number = 1, limit: number = 10) => {
    return useQuery({
        queryKey: ["getTechnologies", page, limit],
        queryFn: () => getTechnologies(page, limit),
    });
};


export interface TechnologyResponse {
    status: number;
    message: string;
    technology: Technology;
}

export interface Technology {
    id: string;
    createdAt: string;
    updatedAt: string;
    sortOrder: number;
    title: string;
    description: string;
    bannerUrls: string[];
    coverImage: string;
}


// Get technology by ID
export const getTechnologyById = async (id: string): Promise<TechnologyResponse> => {
    const response = await api2.get<TechnologyResponse>(`/technology/get-technology/${id}`);
    return response.data;
};

export const useGetTechnologyById = (id: string) => {
    return useQuery({
        queryKey: ["getTechnologyById", id],
        queryFn: () => getTechnologyById(id),
        enabled: !!id,
    });
};

// Create technology
export const createTechnology = async (data: ICreateTechnologyPayload): Promise<ICreateTechnologyResponse> => {
    const response = await api2.post<ICreateTechnologyResponse>("/technology/create-technology", data);
    return response.data;
};

export const useCreateTechnology = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["createTechnology"],
        mutationFn: (data: ICreateTechnologyPayload) => createTechnology(data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["getTechnologies"] });
            toast.success(data.message || "Technology created successfully", {
                position: "bottom-right",
                description: "The technology has been created successfully.",
            });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to create technology", {
                position: "bottom-right",
                description: "An error occurred while creating the technology.",
            });
        },
    });
};

// Update technology
export const updateTechnology = async (id: string, data: ICreateTechnologyPayload): Promise<IUpdateTechnologyResponse> => {
    const response = await api2.put<IUpdateTechnologyResponse>(`/technology/update-technology/${id}`, data);
    return response.data;
};

export const useUpdateTechnology = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["updateTechnology"],
        mutationFn: ({ id, data }: { id: string; data: ICreateTechnologyPayload }) => updateTechnology(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["getTechnologies"] });
            queryClient.invalidateQueries({ queryKey: ["getTechnologyById"] });
            toast.success(data.message || "Technology updated successfully", {
                position: "bottom-right",
                description: "The technology has been updated successfully.",
            });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to update technology", {
                position: "bottom-right",
                description: "An error occurred while updating the technology.",
            });
        },
    });
};

// Delete technology (soft delete)
export const deleteTechnology = async (ids: string): Promise<IDeleteTechnologyResponse> => {
    const response = await api2.delete<IDeleteTechnologyResponse>(`/technology/delete-technology/${ids}`);
    return response.data;
};

// Bulk delete technologies
export const deleteBulkTechnologies = async (ids: string[]): Promise<IDeleteTechnologyResponse> => {
    const response = await api2.delete<IDeleteTechnologyResponse>(`/technology/delete-technology/${ids.join(',')}`);
    return response.data;
};

export const useDeleteTechnology = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["deleteTechnology"],
        mutationFn: (ids: string) => deleteTechnology(ids),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["getTechnologies"] });
            toast.success(data.message || "Technology deleted successfully", {
                position: "bottom-right",
                description: "The technology has been deleted successfully.",
            });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to delete technology", {
                position: "bottom-right",
                description: "An error occurred while deleting the technology.",
            });
        },
    });
};

export const useDeleteBulkTechnologies = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["deleteBulkTechnologies"],
        mutationFn: async (ids: string[]) => {
            const response = await api2.delete(`/technology/delete/${ids.join(',')}`);
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["getTechnologies"] });
            toast.success(data.message || "Technologies deleted successfully", {
                position: "bottom-right",
                description: "The selected technologies have been deleted successfully."
            });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to delete technologies", {
                position: "bottom-right"
            });
        },
    });
};

// Get deleted technologies
export const getDeletedTechnologies = async (page: number = 1, limit: number = 10): Promise<ITechnologyResponse> => {
    const response = await api2.get<ITechnologyResponse>(`/technology/deleted-technologies?page=${page}&limit=${limit}`);
    return response.data;
};

export const useGetDeletedTechnologies = (page: number = 1, limit: number = 10) => {
    return useQuery({
        queryKey: ["getDeletedTechnologies", page, limit],
        queryFn: () => getDeletedTechnologies(page, limit),
    });
};

// Recover deleted technologies
export const recoverTechnologies = async (ids: string[]): Promise<IDeleteTechnologyResponse> => {
    const response = await api2.put<IDeleteTechnologyResponse>("/technology/recover-technologies", { ids });
    return response.data;
};

export const useRecoverTechnologies = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["recoverTechnologies"],
        mutationFn: (ids: string[]) => recoverTechnologies(ids),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["getDeletedTechnologies"] });
            queryClient.invalidateQueries({ queryKey: ["getTechnologies"] });
            toast.success(data.message || "Technologies recovered successfully", {
                position: "bottom-right",
                description: "The selected technologies have been recovered successfully.",
            });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to recover technologies", {
                position: "bottom-right",
                description: "An error occurred while recovering the technologies.",
            });
        },
    });
};

// Destroy technology permanently
export const destroyTechnology = async (ids: string): Promise<IDeleteTechnologyResponse> => {
    const response = await api2.delete<IDeleteTechnologyResponse>(`/technology/destroy-technology/${ids}`);
    return response.data;
};

export const useDestroyTechnology = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["destroyTechnology"],
        mutationFn: (ids: string) => destroyTechnology(ids),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["getDeletedTechnologies"] });
            toast.success(data.message || "Technology permanently deleted", {
                position: "bottom-right",
                description: "The technology has been permanently deleted from the system.",
            });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to delete technology permanently", {
                position: "bottom-right",
                description: "An error occurred while deleting the technology permanently.",
            });
        },
    });
};

// Bulk destroy technologies permanently
export const useDestroyBulkTechnologies = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["destroyBulkTechnologies"],
        mutationFn: async (ids: string[]) => {
            const response = await api2.delete<IDeleteTechnologyResponse>(`/technology/destroy-technology/${ids.join(',')}`);
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["getDeletedTechnologies"] });
            toast.success(data.message || "Technologies permanently deleted", {
                position: "bottom-right",
                description: "The selected technologies have been permanently deleted from the system.",
            });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to delete technologies permanently", {
                position: "bottom-right",
                description: "An error occurred while deleting the technologies permanently.",
            });
        },
    });
};
