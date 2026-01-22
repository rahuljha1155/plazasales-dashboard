import type { IBlogBySlugResponse, IBlogResponse, ICreateBlogData, IDeleteBlogResponse } from "@/types/IBlog";
import { api2 } from "./api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const getAllBlogs = async (): Promise<IBlogResponse> => {
    const response = await api2.get<IBlogResponse>('/blog/get-all-blogs');
    return response.data;
}

export const useGetAllBlogs = () => {
    return useQuery({
        queryKey: ['getAllBlogs'],
        queryFn: getAllBlogs
    });
}

export const getBlogBySlug = async (slug: string): Promise<IBlogBySlugResponse> => {
    const response = await api2.get<IBlogBySlugResponse>(`/blog/get-blog/${slug}`);
    return response.data;
}

export const useGetBlogBySlug = (slug: string) => {
    return useQuery({
        queryKey: ['getBlogBySlug', slug],
        queryFn: () => getBlogBySlug(slug)
    });
}

export const deleteBlog = async (blogId: string): Promise<IDeleteBlogResponse> => {
    const res = await api2.delete(`/blog/delete-blog/${blogId}`);
    return res.data;
}

export const deleteBulkBlogs = async (blogIds: string[]): Promise<IDeleteBlogResponse> => {
    const res = await api2.delete(`/blog/delete-blog/${blogIds.join(",")}`);
    return res.data;
}

export const useDeleteBlog = (blogId: string) => {
    const queryClient = useQueryClient();
    return useMutation<IDeleteBlogResponse>({
        mutationKey: ['deleteBlog', blogId],
        mutationFn: () => deleteBlog(blogId),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['getAllBlogs'] });
            queryClient.invalidateQueries({ queryKey: ['blog'] });
            toast.success(data.message || "Blog deleted successfully", {
                position: "bottom-right",
                description: "The blog has been deleted successfully."
            });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to delete blog", {
                position: "bottom-right",
                description: "An error occurred while deleting the blog."
            });
        }
    });
}

export const useDeleteBulkBlogs = () => {
    const queryClient = useQueryClient();
    return useMutation<IDeleteBlogResponse, unknown, string[]>({ // specify variables type as string[]
        mutationKey: ['deleteBulkBlogs'],
        mutationFn: (blogIds: string[]) => deleteBulkBlogs(blogIds),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['getAllBlogs'] });
            queryClient.invalidateQueries({ queryKey: ['blog'] });
            toast.success(data.message || "Blogs deleted successfully", {
                position: "bottom-right",
                description: "The selected blogs have been deleted successfully."
            });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to delete blogs", {
                position: "bottom-right",
                description: "An error occurred while deleting the blogs."
            });
        }
    });
}

export const publishBlog = async (data: FormData): Promise<{ status: number; message: string }> => {
    const res = await api2.post(`/blog/create-blog`, data, {
        headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data;
}

export const usePublishBlog = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['publishBlog'],
        mutationFn: (data: FormData) => publishBlog(data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['getAllBlogs'] });
            queryClient.invalidateQueries({ queryKey: ['blog'] });
            toast.success(data.message || "Blog published successfully", {
                position: "bottom-right",
                description: "The blog has been published successfully."
            });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to publish blog", {
                position: "bottom-right",
                description: "An error occurred while publishing the blog."
            });
        }
    });
}

export const updateBlog = async (blogId: string, data: FormData): Promise<{ status: number; message: string }> => {
    const res = await api2.put(`/blog/update-blog/${blogId}`, data, {
        headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data;
}

export const useUpdateBlog = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['updateBlog'],
        mutationFn: ({ blogId, data }: { blogId: string; data: FormData }) => updateBlog(blogId, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['getAllBlogs'] });
            queryClient.invalidateQueries({ queryKey: ['blog'] });
            toast.success(data.message || "Blog updated successfully", {
                position: "bottom-right",
                description: "The blog has been updated successfully."
            });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to update blog", {
                position: "bottom-right",
                description: "An error occurred while updating the blog."
            });
        }
    });
}

// Deleted Blogs APIs
export const getDeletedBlogs = async (page: number = 1, limit: number = 10) => {
    const response = await api2.get(`/blog/deleted-blogs?page=${page}&limit=${limit}`);
    return response.data;
};

export const useGetDeletedBlogs = (page: number = 1, limit: number = 10) => {
    return useQuery({
        queryKey: ["getDeletedBlogs", page, limit],
        queryFn: () => getDeletedBlogs(page, limit)
    });
};

export const recoverBlogs = async (ids: string[]) => {
    const response = await api2.put("/blog/recover-blogs", { ids });
    return response.data;
};

export const useRecoverBlogs = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["recoverBlogs"],
        mutationFn: (ids: string[]) => recoverBlogs(ids),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["getDeletedBlogs"] });
            queryClient.invalidateQueries({ queryKey: ["getAllBlogs"] });
            toast.success(data.message || "Blogs recovered successfully", {
                position: "bottom-right",
                description: "The selected blogs have been recovered successfully."
            });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to recover blogs", {
                position: "bottom-right",
                description: "An error occurred while recovering the blogs."
            });
        }
    });
};

export const destroyBlogPermanently = async (ids: string) => {
    const response = await api2.delete(`/blog/destroy-blog/${ids}`);
    return response.data;
};

export const useDestroyBlogPermanently = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["destroyBlogPermanently"],
        mutationFn: (ids: string) => destroyBlogPermanently(ids),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["getDeletedBlogs"] });
            toast.success(data.message || "Blog permanently deleted", {
                position: "bottom-right",
                description: "The blog has been permanently deleted from the system."
            });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to delete blog permanently", {
                position: "bottom-right",
                description: "An error occurred while deleting the blog permanently."
            });
        }
    });
};
