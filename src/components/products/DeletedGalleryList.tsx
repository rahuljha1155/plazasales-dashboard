import { useState } from "react";
import Breadcrumb from "@/components/dashboard/Breadcumb";
import { href, useNavigate } from "react-router-dom";
import { useUserStore } from "@/store/userStore";
import { UserRole } from "@/components/LoginPage";
import { Icon } from "@iconify/react/dist/iconify.js";
import {
    type ColumnDef,
} from "@tanstack/react-table";
import { useGetDeletedGalleries, useRecoverGalleries, useDestroyGalleries } from "@/hooks/useGallery";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import {
    Trash2,
    RefreshCcw,
    Loader,
} from "lucide-react";
import { toast } from "sonner";
import { TableShimmer } from "../table-shimmer";
import { DataTable } from "@/components/ui/data-table";
import { useSelectedDataStore } from "@/store/selectedStore";

export interface MediaAsset {
    id: string;
    createdAt: string;
    updatedAt: string;
    sortOrder: number;
    isDeleted: boolean;
    fileUrl: string;
    type: "IMAGE" | "VIDEO" | "AUDIO";
}

export interface Gallery {
    id: string;
    createdAt: string;
    updatedAt: string;
    sortOrder: number;
    isDeleted: boolean;
    caption: string;
    isHome: boolean;
    productId?: string;
    mediaAsset: MediaAsset[];
}

export default function DeletedGalleryList() {
    const navigate = useNavigate();
    const { user } = useUserStore();
    const [selectedRows, setSelectedRows] = useState<Gallery[]>([]);
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
    const [showBulkRecoverDialog, setShowBulkRecoverDialog] = useState(false);
    const [actionId, setActionId] = useState<string | null>(null);
    const { selectedBrand, selectedCategory, selectedSubcategory, selectedProduct } = useSelectedDataStore()

    const { data: deletedGalleries, isLoading } = useGetDeletedGalleries();
    const { mutateAsync: recoverGalleries, isPending: isRecovering } = useRecoverGalleries();
    const { mutateAsync: destroyGalleries, isPending: isDestroying } = useDestroyGalleries();

    if (!isLoading && user?.role !== UserRole.SUDOADMIN) {
        navigate("/dashboard");
        toast.error("Access denied. Only sudo admins can access this page.");
        return null;
    }

    const handleRecoverAll = async () => {
        if (selectedRows.length === 0) {
            toast.error("Please select at least one gallery to recover");
            return;
        }

        try {
            const ids = selectedRows.map((row) => row.id);
            await recoverGalleries(ids);
            setSelectedRows([]);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to recover galleries");
        }
    };

    const handleRecoverAllGalleries = async () => {
        const galleries = Array.isArray(deletedGalleries)
            ? deletedGalleries
            : deletedGalleries?.data?.galleries
                ? deletedGalleries.data.galleries
                : [];

        const allIds = galleries.map((row: any) => row.id);
        if (allIds.length === 0) {
            toast.error("No deleted galleries to recover");
            return;
        }

        try {
            await recoverGalleries(allIds);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to recover all galleries");
        }
    };

    const handleDestroySelected = async () => {
        if (selectedRows.length === 0) {
            toast.error("Please select at least one gallery to delete");
            return;
        }

        try {
            const ids = selectedRows.map(row => row.id);
            await destroyGalleries(ids);
            setSelectedRows([]);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to delete galleries");
        }
    };

    const columns: ColumnDef<Gallery>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                    className="ml-2"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            header: "S.N.",
            cell: ({ row }) => <div>{parseInt(row.id) + 1}</div>,
        },
        {
            accessorKey: "mediaAsset",
            header: "Preview",
            cell: ({ row }) => {
                const gallery = row.original;
                const firstAsset = gallery.mediaAsset[0];
                return (
                    <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
                        {firstAsset ? (
                            firstAsset.type === "IMAGE" ? (
                                <img
                                    src={firstAsset.fileUrl}
                                    alt={gallery.caption}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <video
                                    src={firstAsset.fileUrl}
                                    className="w-full h-full object-cover"
                                />
                            )
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                No Image
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: "caption",
            header: "Caption",
        },
        {
            accessorKey: "mediaAsset",
            header: "Media Count",
            cell: ({ row }) => {
                const count = row.original.mediaAsset.length;
                return (
                    <span className="text-sm text-gray-600">
                        {count} {count === 1 ? "item" : "items"}
                    </span>
                );
            },
        },
        {
            id: "actions",
            header: () => {
                return (
                    <div className="flex items-center justify-end gap-2 pr-4">
                        Actions
                    </div>
                )
            },
            cell: ({ row }) => {
                const gallery = row.original;
                return (
                    <div className="flex items-center justify-end gap-2">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-sm text-green-600 hover:bg-green-50 hover:text-green-700 hover:border-green-600 transition-colors"
                                    disabled={isRecovering && actionId === gallery.id}
                                >
                                    {isRecovering && actionId === gallery.id ? (
                                        <Loader className="h-4 w-4 animate-spin mr-1.5" />
                                    ) : (
                                        <Icon icon="solar:refresh-bold" className="mr-1.5" width="16" />
                                    )}
                                    Recover
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Recover Gallery?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to recover this gallery?
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        className="bg-green-600 hover:bg-green-700"
                                        onClick={() => handleRecover([gallery.id])}
                                    >
                                        Recover
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-sm text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-600 transition-colors"
                                    disabled={isDestroying}
                                >
                                    <Icon icon="solar:trash-bin-trash-bold" className="mr-1.5" width="16" />
                                    Delete Forever
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Permanently?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently remove the gallery.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        className="bg-red-600 hover:bg-red-700"
                                        onClick={() => handleDestroy([gallery.id])}
                                    >
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                );
            },
        },
    ];

    const handleRecover = async (ids: string[]) => {
        try {
            await recoverGalleries(ids);
            toast.success("Gallery recovered successfully");
            setSelectedRows([]);
            setShowBulkRecoverDialog(false);
            setActionId(null);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to recover gallery");
        }
    };

    const handleDestroy = async (ids: string[]) => {
        try {
            await destroyGalleries(ids);
            toast.success("Gallery permanently deleted");
            setSelectedRows([]);
            setShowBulkDeleteDialog(false);
            setActionId(null);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to delete gallery");
        }
    };

    if (isLoading) {
        return <TableShimmer />;
    }

    const tableData = Array.isArray(deletedGalleries)
        ? deletedGalleries
        : deletedGalleries?.data?.galleries
            ? deletedGalleries.data.galleries
            : [];

    const breadcrumbLinks = [
        { label: selectedBrand?.name || "Brands", href: "/dashboard/brands" },
        { label: selectedCategory?.title || "Product Types", href: `/dashboard/category/${selectedBrand?.slug || ""}` },
        { label: selectedSubcategory?.title || "Categories", href: `/dashboard/category/${selectedBrand?.slug || ""}/subcategory/${selectedCategory?.slug || ""}` },
        { label: selectedProduct?.name || "Products", href: `/dashboard/category/${selectedBrand?.slug || ""}/subcategory/${selectedCategory?.slug || ""}/products/${selectedSubcategory?.slug || selectedSubcategory?.original?.slug || ""}` },
        { label: "Gallery", href: `/dashboard/products/gallery/${selectedProduct?.id || selectedProduct?.original?.id || ""}` },
        { label: "Deleted Galleries", isActive: true },
    ];

    return (
        <div className="w-full space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ">
                <Breadcrumb
                    links={breadcrumbLinks}
                />
            </div>

            <div className="bg-white">
                <DataTable
                    columns={columns}
                    data={tableData}
                    filterColumn="caption"
                    filterPlaceholder="Search deleted galleries by caption..."
                    onRowSelectionChange={(rows) => setSelectedRows(rows as Gallery[])}
                    pagination={{
                        currentPage: 1,
                        totalPages: 1,
                        totalItems: tableData.length,
                        itemsPerPage: tableData.length,
                        onPageChange: () => { },
                    }}
                    elements={
                        <div className="flex gap-2">
                            {selectedRows.length > 0 && (
                                <Button
                                    variant="outline"
                                    className="rounded-sm hover:shadow-md transition-shadow text-green-600 hover:bg-green-50 hover:border-green-600"
                                    onClick={handleRecoverAll}
                                    disabled={isRecovering}
                                >
                                    <Icon icon="solar:refresh-bold" className="mr-2" width="20" />
                                    Recover ({selectedRows.length})
                                </Button>
                            )}

                            {selectedRows.length > 0 && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="destructive"
                                            disabled={isDestroying}
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
                                                        delete Galleries
                                                    </AlertDialogTitle>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {selectedRows.length} gallery(s)
                                                    </p>
                                                </div>
                                            </div>
                                            <AlertDialogDescription className="text-gray-600">
                                                This will permanently delete the selected galleries. This action cannot be undone. Are you sure you want to proceed?
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
                                                delete
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
                                            disabled={isRecovering}
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
                                                        Recover All Galleries
                                                    </AlertDialogTitle>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {tableData.length} gallery(s)
                                                    </p>
                                                </div>
                                            </div>
                                            <AlertDialogDescription className="text-gray-600">
                                                This will restore all {tableData.length} deleted galleries and make them available again in the system. Are you sure you want to proceed?
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel className="rounded-lg">
                                                Cancel
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                                className="bg-green-500 hover:bg-green-600 rounded-lg"
                                                onClick={handleRecoverAllGalleries}
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
                />
            </div>
        </div>
    );
}
