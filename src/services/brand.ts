import type { IBrandBySlugResponse, IBrandResponse, ICreateBrandResponse, IDeleteBrandResponse, IUpdateBrandResponse } from "@/types/IBrand";
import { api2 } from "./api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { IPostBrand } from "@/schema/brand";

export const getBrands = async (): Promise<IBrandResponse> => {
    const response = await api2.get<IBrandResponse>("/brand/get-all-brands");
    return response.data;
};

export const useGetBrands = () => {
    return useQuery({
        queryKey: ["getBrands"],
        queryFn: getBrands
    })
};


export const getBrandBySlug = async (slug: string): Promise<IBrandBySlugResponse> => {
    const response = await api2.get<IBrandBySlugResponse>(`/brand/get-brand/${slug}`);
    return response.data;
}

export const useGetBrandBySlug = (slug: string) => {
    return useQuery({
        queryKey: ["getBrandBySlug", slug],
        queryFn: () => getBrandBySlug(slug)
    })
};

export const getBrandById = async (id: string): Promise<IBrandBySlugResponse> => {
    const response = await api2.get<IBrandBySlugResponse>(`/brand/get-brand/${id}`);
    return response.data;
}

export const useGetBrandById = (id: string) => {
    return useQuery({
        queryKey: ["getBrandById", id],
        queryFn: () => getBrandById(id),
        enabled: !!id
    })
};


export const createBrand = async (brandData: IPostBrand): Promise<ICreateBrandResponse> => {
    const response = await api2.post<ICreateBrandResponse>("/brand/create-brand", brandData);
    return response.data;
}

export const useCreateBrand = (data: IPostBrand) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["createBrand"],
        mutationFn: () => createBrand(data),
        onSuccess: (data) => {
            // Invalidate and refetch brands list
            queryClient.invalidateQueries({ queryKey: ["getBrands"] });
            toast.success(data.message || "Brand created successfully", {
                position: "bottom-right",
                description: "The brand has been created successfully."
            });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to create brand", {
                position: "bottom-right",
                description: "An error occurred while creating the brand."
            });
        }

    })
}


export const deleteBrand = async (brandId: string): Promise<IDeleteBrandResponse> => {
    const response = await api2.delete<IDeleteBrandResponse>(`/brand/delete-brand/${brandId}`);
    return response.data;
}

export const deleteBulkBrands = async (brandIds: string[]): Promise<IDeleteBrandResponse> => {
    const response = await api2.delete<IDeleteBrandResponse>(`/brand/delete-brand/${brandIds.join(',')}`);
    return response.data;
}

export const useDeleteBrand = (brandId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["deleteBrand", brandId],
        mutationFn: () => deleteBrand(brandId),
        onSuccess: (data) => {
            // Invalidate and refetch brands list
            queryClient.invalidateQueries({ queryKey: ["getBrands"] });
            toast.success(data.message || "Brand deleted successfully", {
                position: "bottom-right",
                description: "The brand has been deleted successfully."
            });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to delete brand", {
                position: "bottom-right",
                description: "An error occurred while deleting the brand."
            });
        }
    })
}

export const useDeleteBulkBrands = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["deleteBulkBrands"],
        mutationFn: (brandIds: string[]) => deleteBulkBrands(brandIds),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["getBrands"] });
            toast.success(data.message || "Brands deleted successfully", {
                position: "bottom-right",
                description: "The selected brands have been deleted successfully."
            });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to delete brands", {
                position: "bottom-right",
                description: "An error occurred while deleting the brands."
            });
        }
    })
}

export const updateBrand = async (brandId: string, brandData: IPostBrand): Promise<IUpdateBrandResponse> => {
    const response = await api2.put<IUpdateBrandResponse>(`/brand/update-brand/${brandId}`, brandData);
    return response.data;
}

export const useUpdateBrand = (brandId: string, brandData: IPostBrand) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["updateBrand", brandId],
        mutationFn: () => updateBrand(brandId, brandData),
        onSuccess: (data) => {
            // Invalidate and refetch brands list
            queryClient.invalidateQueries({ queryKey: ["getBrands"] });
            toast.success(data.message || "Brand updated successfully", {
                position: "bottom-right",
                description: "The brand has been updated successfully."
            });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to update brand", {
                position: "bottom-right",
                description: "An error occurred while updating the brand."
            });
        }
    })
}

// Deleted Brands APIs
export const getDeletedBrands = async (page: number = 1, limit: number = 10) => {
    const response = await api2.get(`/brand/deleted-brands?page=${page}&limit=${limit}`);
    return response.data;
};

export const useGetDeletedBrands = (page: number = 1, limit: number = 10) => {
    return useQuery({
        queryKey: ["getDeletedBrands", page, limit],
        queryFn: () => getDeletedBrands(page, limit)
    });
};

export const recoverBrands = async (ids: string[]) => {
    const response = await api2.put("/brand/recover-brands", { ids });
    return response.data;
};

export const useRecoverBrands = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["recoverBrands"],
        mutationFn: (ids: string[]) => recoverBrands(ids),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["getDeletedBrands"] });
            queryClient.invalidateQueries({ queryKey: ["getBrands"] });
            toast.success(data.message || "Brands recovered successfully", {
                position: "bottom-right",
                description: "The selected brands have been recovered successfully."
            });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to recover brands", {
                position: "bottom-right",
                description: "An error occurred while recovering the brands."
            });
        }
    });
}

export const destroyBrandPermanently = async (id: string) => {
    const response = await api2.delete(`/brand/destroy-brand/${id}`);
    return response.data;
};

export const useDestroyBrandPermanently = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["destroyBrandPermanently"],
        mutationFn: (id: string) => destroyBrandPermanently(id),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["getDeletedBrands"] });
            toast.success(data.message || "Brand permanently deleted", {
                position: "bottom-right",
                description: "The brand has been permanently deleted from the system."
            });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to delete brand permanently", {
                position: "bottom-right",
                description: "An error occurred while deleting the brand permanently."
            });
        }
    });
}

export const updateBrandSortOrder = async (brandId: string, sortOrder: number) => {
    const response = await api2.put(`/brand/update-brand/${brandId}`, { sortOrder });
    return response.data;
};

export const useUpdateBrandSortOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["updateBrandSortOrder"],
        mutationFn: ({ brandId, sortOrder }: { brandId: string; sortOrder: number }) =>
            updateBrandSortOrder(brandId, sortOrder),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["getBrands"] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to update brand order", {
                position: "bottom-right",
                description: "An error occurred while updating the brand order."
            });
        }
    });
}
