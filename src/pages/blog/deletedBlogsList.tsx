import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Icon } from "@iconify/react/dist/iconify.js";
import { TableShimmer } from "@/components/table-shimmer";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "@/store/userStore";
import { UserRole } from "@/components/LoginPage";
import {
    useGetDeletedBlogs,
    useRecoverBlogs,
    useDestroyBlogPermanently,
} from "@/services/blog";
import { useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/data-table";
import { type ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Breadcrumb from "@/components/dashboard/Breadcumb";

type DeletedBlog = {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
    coverImage: string;
};

export default function DeletedBlogsList() {
    const navigate = useNavigate();
    const { user } = useUserStore();
    const queryClient = useQueryClient();
    const [pagination, setPagination] = useState({ page: 1, limit: 10 });
    const [selectedBlogs, setSelectedBlogs] = useState<string[]>([]);
    const [blogToDelete, setBlogToDelete] = useState<string | null>(null);

    const { data, isLoading } = useGetDeletedBlogs(pagination.page, pagination.limit);
    const { mutateAsync: recoverBlogs, isPending: isRecovering } = useRecoverBlogs();
    const { mutateAsync: destroyBlog, isPending: isDestroying } = useDestroyBlogPermanently();

    const isSudoAdmin = user?.role === UserRole.SUDOADMIN;

    const handleRecover = async (ids?: string[]) => {
        const blogsToRecover = ids || selectedBlogs;

        if (blogsToRecover.length === 0) {
            toast.error("Please select blogs to recover");
            return;
        }

        try {
            await recoverBlogs(blogsToRecover);
            queryClient.invalidateQueries({ queryKey: ["getDeletedBlogs"] });
            queryClient.invalidateQueries({ queryKey: ["getAllBlogs"] });
            setSelectedBlogs([]);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to recover blogs");
        }
    };

    const handleRecoverAll = async () => {
        const allBlogIds = data?.data?.blogs?.map((blog: DeletedBlog) => blog.id) || [];
        if (allBlogIds.length === 0) {
            toast.error("No blogs to recover");
            return;
        }
        await handleRecover(allBlogIds);
    };

    const handlePermanentDelete = async () => {
        if (!blogToDelete) return;

        try {
            await destroyBlog(blogToDelete);
            queryClient.invalidateQueries({ queryKey: ["getDeletedBlogs"] });
            setBlogToDelete(null);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to delete blog permanently");
        }
    };

    const handleDestroySelected = async () => {
        if (selectedBlogs.length === 0) {
            toast.error("Please select blogs to delete permanently");
            return;
        }

        try {
            await destroyBlog(selectedBlogs.join(","));
            queryClient.invalidateQueries({ queryKey: ["getDeletedBlogs"] });
            setSelectedBlogs([]);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to delete blogs permanently");
        }
    };

    const columns: ColumnDef<DeletedBlog>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    onCheckedChange={(value) => {
                        table.toggleAllPageRowsSelected(!!value);
                        if (value) {
                            setSelectedBlogs(data?.data?.blogs?.map((blog: DeletedBlog) => blog.id) || []);
                        } else {
                            setSelectedBlogs([]);
                        }
                    }}
                    className="ml-2"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={selectedBlogs.includes(row.original.id)}
                    onCheckedChange={(value) => {
                        if (value) {
                            setSelectedBlogs([...selectedBlogs, row.original.id]);
                        } else {
                            setSelectedBlogs(selectedBlogs.filter((id) => id !== row.original.id));
                        }
                    }}
                />
            ),
        },
        {
            accessorKey: "coverImage",
            header: "Slug",
            cell: ({ row }) => (
                <div className=" size-12" onClick={() => navigate(`/blog/${row.original.slug}`)}>
                    <img src={row.original.coverImage} alt="coverImage" className="w-full h-full object-cover" />
                </div>
            ),
        },
        {
            accessorKey: "title",
            header: "Title",
        },


        {
            accessorKey: "updatedAt",
            header: "Deleted At",
            cell: ({ row }) => new Date(row.original.updatedAt).toLocaleDateString(),
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRecover([row.original.id])}
                        disabled={isRecovering}
                        className="hover:bg-green-50 hover:border-green-500 hover:text-green-600"
                    >
                        <Icon icon="solar:refresh-bold" width="16" className="mr-1" />
                        Recover
                    </Button>
                    {isSudoAdmin && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setBlogToDelete(row.original.id)}
                            className="rounded-sm text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-600 transition-colors"
                            disabled={isDestroying}
                        >
                            <Icon icon="solar:trash-bin-trash-bold" className="mr-1.5" width="16" />
                            Delete Forever
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <TableShimmer />
            </div>
        );
    }

    return (
        <div className="w-full space-y-6">


            <Breadcrumb links={[
                {
                    label: "Blogs",
                    href: "/dashboard/blogs",
                },
                {
                    label: "Deleted Blogs",
                    href: "/dashboard/deleted-blogs",
                },
            ]} />

            <div className="bg-white">
                <DataTable
                    columns={columns}
                    data={data?.data?.blogs || []}
                    filterColumn="title"
                    filterPlaceholder="Search blogs by title..."
                    pagination={{
                        itemsPerPage: pagination.limit,
                        currentPage: data?.data?.page || 1,
                        totalItems: data?.data?.total || 0,
                        totalPages: data?.data?.totalPages || 1,
                        onPageChange: (page) => {
                            setPagination((prev) => ({ ...prev, page }));
                        },
                        onItemsPerPageChange: (itemsPerPage) => {
                            setPagination({ page: 1, limit: itemsPerPage });
                        },
                        showItemsPerPage: true,
                        showPageInput: true,
                        showPageInfo: true,
                    }}
                    elements={
                        <div className="flex gap-2">
                            {data?.data?.blogs && data.data.blogs.length > 0 && (
                                <Button
                                    variant="outline"
                                    onClick={handleRecoverAll}
                                    disabled={isRecovering}
                                    className="hover:bg-green-50 hover:border-green-500 hover:text-green-600"
                                >
                                    <Icon icon="solar:refresh-bold" className="mr-2" width="20" />
                                    Recover All
                                </Button>
                            )}
                            {selectedBlogs.length > 0 && (
                                <Button
                                    variant="default"
                                    onClick={() => handleRecover()}
                                    disabled={isRecovering}
                                >
                                    <Icon icon="solar:refresh-bold" className="mr-2" width="20" />
                                    Recover Selected ({selectedBlogs.length})
                                </Button>
                            )}
                            {selectedBlogs.length > 0 && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="hover:bg-red-50 hover:border-red-500 hover:text-red-600"
                                            disabled={isDestroying}
                                        >
                                            <Icon icon="solar:trash-bin-trash-bold" className="mr-2" width="20" />
                                            delete ({selectedBlogs.length})
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete the selected blogs
                                                from the system.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={handleDestroySelected}
                                                className="bg-red-600 hover:bg-red-700"
                                            >
                                                delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </div>
                    }
                />
            </div>

            <AlertDialog open={!!blogToDelete} onOpenChange={() => setBlogToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the blog
                            from the system.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handlePermanentDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete Permanently
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
