import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Icon } from "@iconify/react/dist/iconify.js";
import { TableShimmer } from "@/components/table-shimmer";
import { DataTable } from "@/components/ui/data-table";
import { useGetDeletedVideos, useRecoverVideos, useDestroyVideoPermanently, type Video } from "@/hooks/useVideo";
import Breadcrumb from "@/components/dashboard/Breadcumb";
import { createDeletedVideoColumns } from "./DeletedVideoTableColumns";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "@/store/userStore";
import { UserRole } from "@/components/LoginPage";
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
import { useSelectedDataStore } from "@/store/selectedStore";

interface PaginationState {
    page: number;
    limit: number;
}

export default function DeletedVideoList() {
    const navigate = useNavigate();
    const { user } = useUserStore();
    const [pagination, setPagination] = useState<PaginationState>({
        page: 1,
        limit: 10,
    });

    const [selectedRows, setSelectedRows] = useState<Video[]>([]);

    const { data, isLoading } = useGetDeletedVideos(pagination.page, pagination.limit);
    const { mutateAsync: recoverVideos, isPending: isRecoverPending } = useRecoverVideos();
    const { mutateAsync: destroyVideoPermanently, isPending: isDestroyPending } = useDestroyVideoPermanently();

    const { selectedBrand, selectedCategory, selectedSubcategory, selectedProduct } = useSelectedDataStore()

    const breadcrumbLinks = [
        { label: selectedBrand?.name || "Brands", href: "/dashboard/brands" },
        { label: selectedCategory?.title || "Product Types", href: `/dashboard/category/${selectedBrand?.slug || ""}` },
        { label: selectedSubcategory?.title || "Categories", href: `/dashboard/category/${selectedBrand?.slug || ""}/subcategory/${selectedCategory?.slug || ""}` },
        { label: selectedProduct?.name || "Products", href: `/dashboard/category/${selectedBrand?.slug || ""}/subcategory/${selectedCategory?.slug || ""}/products/${selectedSubcategory?.slug || selectedSubcategory?.original?.slug || ""}` },
        { label: "Videos", href: `/dashboard/products/video/${selectedProduct?.id || ""}` },
        { label: "Deleted Videos", isActive: true },
    ];


    // Check if user is sudo admin
    const isSudoAdmin = user?.role === UserRole.SUDOADMIN;

    // Redirect if not sudo admin
    if (!isSudoAdmin && !isLoading) {
        navigate("/dashboard/videos"); // Or wherever the video list is
        toast.error("Access denied. Only sudo admins can access this page.");
        return null;
    }

    const handleRecover = async (id: string) => {
        try {
            await recoverVideos([id]);
            toast.success("Video recovered successfully");
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to recover video");
        }
    };

    const handleRecoverAll = async () => {
        if (selectedRows.length === 0) {
            toast.error("Please select at least one video to recover");
            return;
        }

        try {
            const ids = selectedRows.map((video) => video.id);
            await recoverVideos(ids);
            setSelectedRows([]);
            toast.success("Selected videos recovered successfully");
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to recover videos");
        }
    };

    const handleRecoverAllVideos = async () => {
        if (!data?.data?.videos || data.data.videos.length === 0) {
            toast.error("No deleted videos to recover");
            return;
        }

        try {
            const ids = data.data.videos.map((video: any) => video.id);
            await recoverVideos(ids);
            toast.success("All videos recovered successfully");
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to recover all videos");
        }
    };

    const handleDestroyPermanently = async (id: string) => {
        try {
            await destroyVideoPermanently(id);
            toast.success("Video permanently deleted");
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to delete video permanently");
        }
    };

    const handleDestroySelected = async () => {
        if (selectedRows.length === 0) {
            toast.error("Please select at least one video to delete");
            return;
        }

        try {
            const ids = selectedRows.map((video) => video.id).join(",");
            await destroyVideoPermanently(ids);
            setSelectedRows([]);
            toast.success("Selected videos permanently deleted");
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to delete videos");
        }
    };

    const columns = createDeletedVideoColumns({
        onRecover: handleRecover,
        onDestroyPermanently: handleDestroyPermanently,
        isRecoverPending,
        isDestroyPending,
    });

    const tableData = data?.data.videos || [];

    if (isLoading) {
        return (
            <div className="">
                <TableShimmer />
            </div>
        );
    }

    return (
        <div className="w-full space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ">
                <Breadcrumb
                    links={breadcrumbLinks}
                />
            </div>

            <div className="bg-white">
                <DataTable
                    columns={columns}
                    data={tableData}
                    onRowSelectionChange={setSelectedRows}
                    elements={
                        <div className="flex gap-2">
                            {selectedRows.length > 0 && (
                                <Button
                                    variant="outline"
                                    className="rounded-sm hover:shadow-md transition-shadow text-green-600 hover:bg-green-50 hover:border-green-600"
                                    onClick={handleRecoverAll}
                                    disabled={isRecoverPending}
                                >
                                    <Icon icon="solar:refresh-bold" className="mr-2" width="20" />
                                    Recover ({selectedRows.length})
                                </Button>
                            )}

                            {selectedRows.length > 0 && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="rounded-sm hover:shadow-md transition-shadow text-red-600 hover:bg-red-50 hover:border-red-600"
                                            disabled={isDestroyPending}
                                        >
                                            <Icon icon="solar:trash-bin-trash-bold" className="mr-2" width="20" />
                                            Delete ({selectedRows.length})
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="max-w-md">
                                        <AlertDialogHeader>
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                                                    <Icon
                                                        icon="solar:trash-bin-trash-bold"
                                                        className="text-red-600"
                                                        width="24"
                                                    />
                                                </div>
                                                <div>
                                                    <AlertDialogTitle className="text-lg">
                                                        Delete Videos
                                                    </AlertDialogTitle>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {selectedRows.length} video(s)
                                                    </p>
                                                </div>
                                            </div>
                                            <AlertDialogDescription className="text-gray-600">
                                                This will permanently delete the selected videos. This action cannot be undone. Are you sure you want to proceed?
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel className="rounded-lg">
                                                Cancel
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                                className="bg-red-500 hover:bg-red-600 rounded-lg"
                                                onClick={handleDestroySelected}
                                            >
                                                <Icon icon="solar:trash-bin-trash-bold" className="mr-2" width="16" />
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}

                            {tableData.length > 0 && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            className="rounded-sm bg-green-600 hover:bg-green-700 hover:shadow-md transition-shadow"
                                            disabled={isRecoverPending}
                                        >
                                            <Icon icon="solar:refresh-bold" className="mr-2" width="20" />
                                            Recover All
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="max-w-md">
                                        <AlertDialogHeader>
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                                    <Icon
                                                        icon="solar:refresh-bold"
                                                        className="text-green-600"
                                                        width="24"
                                                    />
                                                </div>
                                                <div>
                                                    <AlertDialogTitle className="text-lg">
                                                        Recover All Videos
                                                    </AlertDialogTitle>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {data?.data.total} video(s)
                                                    </p>
                                                </div>
                                            </div>
                                            <AlertDialogDescription className="text-gray-600">
                                                This will restore all {data?.data.total} deleted videos and make them available again in the system. Are you sure you want to proceed?
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel className="rounded-lg">
                                                Cancel
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                                className="bg-green-500 hover:bg-green-600 rounded-lg"
                                                onClick={handleRecoverAllVideos}
                                            >
                                                <Icon icon="solar:refresh-bold" className="mr-2" width="16" />
                                                Recover All
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </div>
                    }
                    filterColumn="title"
                    filterPlaceholder="Search deleted videos by title..."
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
                />
            </div>
        </div>
    );
}
