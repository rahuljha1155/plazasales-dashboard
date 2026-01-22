import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Icon } from "@iconify/react/dist/iconify.js";
import { TableShimmer } from "@/components/table-shimmer";
import { DataTable } from "../ui/data-table";
import {
    useGetDeletedProductDownloads,
    useRecoverProductDownloads,
    useDestroyProductDownloads
} from "@/hooks/useProductDownload";
import Breadcrumb from "@/components/dashboard/Breadcumb";
import { createDeletedProductDownloadColumns } from "./DeletedProductDownloadTableColumns";
import type { ProductDownload } from "@/types/IDownload";
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

export default function DeletedProductDownloadList() {
    const navigate = useNavigate();
    const { user } = useUserStore();
    const [pagination, setPagination] = useState<PaginationState>({
        page: 1,
        limit: 10,
    });
    const { selectedBrand, selectedCategory, selectedSubcategory, selectedProduct } = useSelectedDataStore()

    const [selectedRows, setSelectedRows] = useState<ProductDownload[]>([]);

    const { data, isLoading } = useGetDeletedProductDownloads(pagination.page, pagination.limit);
    const { mutateAsync: recoverDownloads, isPending: isRecoverPending } = useRecoverProductDownloads();
    const { mutateAsync: destroyPermanently, isPending: isDestroyPending } = useDestroyProductDownloads();

    // Check if user is sudo admin
    const isSudoAdmin = user?.role === UserRole.SUDOADMIN;

    // Redirect if not sudo admin
    if (!isSudoAdmin && !isLoading) {
        navigate("/dashboard");
        toast.error("Access denied. Only sudo admins can access this page.");
        return null;
    }

    const handleRecover = async (id: string) => {
        try {
            await recoverDownloads([id]);
            toast.success("Product download recovered successfully");
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error.message);
        }
    };

    const handleRecoverSelected = async () => {
        if (selectedRows.length === 0) {
            toast.error("Please select at least one product download to recover");
            return;
        }

        try {
            const ids = selectedRows.map((download) => download.id);
            await recoverDownloads(ids);
            toast.success(`${ids.length} product downloads recovered successfully`);
            setSelectedRows([]);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error.message);
        }
    };

    const handleRecoverAll = async () => {
        if (!data?.data?.downloads || data.data.downloads.length === 0) {
            toast.error("No deleted product downloads to recover");
            return;
        }

        try {
            const ids = data.data.downloads.map((download: ProductDownload) => download.id);
            await recoverDownloads(ids);
            toast.success(`All ${ids.length} product downloads recovered successfully`);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error.message);
        }
    };

    const handleDestroyPermanently = async (id: string) => {
        try {
            await destroyPermanently(id);
            toast.success("Product download permanently deleted");
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error.message);
        }
    };

    const handleDestroySelected = async () => {
        if (selectedRows.length === 0) {
            toast.error("Please select at least one product download to delete");
            return;
        }

        try {
            const ids = selectedRows.map((download) => download.id).join(",");
            await destroyPermanently(ids);
            toast.success(`${selectedRows.length} product downloads permanently deleted`);
            setSelectedRows([]);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error.message);
        }
    };

    const columns = createDeletedProductDownloadColumns({
        onRecover: handleRecover,
        onDestroyPermanently: handleDestroyPermanently,
        isRecoverPending,
        isDestroyPending,
    });

    const tableData = (data?.data?.downloads || []).map((download: ProductDownload) => ({
        ...download,
        _id: download.id,
    }));

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <TableShimmer />
            </div>
        );
    }

    return (
        <div className="w-full space-y-6 ">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <Breadcrumb
                    links={[
                        { label: selectedBrand?.name || "Brands", href: "/dashboard/brands" },
                        { label: selectedCategory?.title || "Product Types", href: `/dashboard/category/${selectedBrand?.slug || ""}` },
                        { label: selectedSubcategory?.title || "Categories", href: `/dashboard/category/${selectedBrand?.slug || ""}/subcategory/${selectedCategory?.slug || ""}` },
                        { label: selectedProduct?.name || "Products", href: `/dashboard/category/${selectedBrand?.slug || ""}/subcategory/${selectedCategory?.slug || ""}/products/${selectedSubcategory?.slug || selectedSubcategory?.original?.slug || ""}` },
                        { label: "Downloads", href: `/dashboard/download-category/53842f0d-e22c-49f7-aa05-3bda290ddc36/contents/${selectedProduct?.id || ""}` },
                        { label: "Deleted Downloads", isActive: true },
                    ]}
                />
            </div>


            <div className="bg-white">
                <DataTable
                    columns={columns as any}
                    data={tableData}
                    filterColumn="title"
                    elements={
                        <div className="flex gap-2">
                            {selectedRows.length > 0 && (
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        className="rounded-sm hover:shadow-md transition-shadow text-green-600 hover:bg-green-50 hover:border-green-600"
                                        onClick={handleRecoverSelected}
                                        disabled={isRecoverPending}
                                    >
                                        <Icon icon="solar:refresh-bold" className="mr-2" width="20" />
                                        Recover Selected ({selectedRows.length})
                                    </Button>

                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="destructive"
                                                className="rounded-sm hover:shadow-md transition-shadow"
                                                disabled={isDestroyPending}
                                            >
                                                <Icon icon="solar:trash-bin-trash-bold" className="mr-2" width="20" />
                                                Delete Selected ({selectedRows.length})
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
                                                            Delete Selected Downloads
                                                        </AlertDialogTitle>
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            {selectedRows.length} download(s) selected
                                                        </p>
                                                    </div>
                                                </div>
                                                <AlertDialogDescription className="text-gray-600">
                                                    This action cannot be undone. This will permanently delete the selected downloads from the database.
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
                                                    Delete Forever
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
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
                                                        Recover All Product Downloads
                                                    </AlertDialogTitle>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {data?.data.total} download(s)
                                                    </p>
                                                </div>
                                            </div>
                                            <AlertDialogDescription className="text-gray-600">
                                                This will restore all {data?.data.total} deleted product downloads and make them available again. Are you sure?
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel className="rounded-lg">
                                                Cancel
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                                className="bg-green-500 hover:bg-green-600 rounded-lg"
                                                onClick={handleRecoverAll}
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
                    filterPlaceholder="Search deleted product downloads by title..."
                    pagination={{
                        itemsPerPage: pagination.limit,
                        currentPage: data?.data?.currentPage || 1,
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
                    onRowSelectionChange={(rows) => {
                        setSelectedRows(rows as ProductDownload[]);
                    }}
                />
            </div>

        </div>
    );
}
