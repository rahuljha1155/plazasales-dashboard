import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api2 } from "@/services/api";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useSelectedDataStore } from "@/store/selectedStore";
import Breadcrumb from "../dashboard/Breadcumb";
import { useUserStore } from "@/store/userStore";
import { UserRole } from "@/components/LoginPage";
import { DataTable } from "@/components/ui/data-table";
import { createSharableColumns } from "./SharableTableColumns";
import SharableCreateModal from "./SharableCreateModal";
import SharableEditModal from "./SharableEditModal";
import SharableViewPage from "./SharableViewPage";

type EntityType = "product" | "brand" | "category" | "subcategory";

interface SharableListProps {
    entityType: EntityType;
    entityId: string;
    entityName?: string;
}

interface ISharable {
    id: string;
    productId?: string;
    kind: string;
    title: string;
    fileType: string;
    isActive: boolean;
    sortOrder: number;
    extra: string;
    mediaAsset: {
        id: string;
        fileUrl: string;
        type: string;
        sortOrder: number;
        createdAt: string;
        updatedAt: string;
    };
    createdAt: string;
    updatedAt: string;
}

type ViewMode = "list" | "view" | "edit" | "create";

export default function SharableList({ entityType, entityId, entityName }: SharableListProps) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user } = useUserStore();
    const { selectedBrand, selectedCategory, selectedSubcategory, selectedProduct } = useSelectedDataStore();

    const [deleteIds, setDeleteIds] = useState<string[]>([]);
    const [selectedRows, setSelectedRows] = useState<ISharable[]>([]);
    const [viewMode, setViewMode] = useState<ViewMode>("list");
    const [selectedSharable, setSelectedSharable] = useState<ISharable | null>(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
    });

    const { data, isLoading } = useQuery({
        queryKey: ["getSharables", entityId],
        queryFn: async () => {
            const url = entityId 
                ? `/shareable/get-all-shareables?productId=${entityId}`
                : `/shareable/get-all-shareables`;
            const res = await api2.get<{ 
                status: number; 
                message: string;
                data: {
                    shareables: ISharable[];
                    total: number;
                    page: number;
                    limit: number;
                    totalPages: number;
                }
            }>(url);
            return res.data.data;
        },
    });

    const sharables = Array.isArray(data?.shareables) ? data.shareables : [];

    const handleDelete = async () => {
        if (deleteIds.length === 0) return;

        try {
            if (user?.role === UserRole.SUDOADMIN) {
                // Permanently delete for SUDOADMIN
                await api2.delete(`/shareable/destroy-shareables/${deleteIds.join(",")}`);
                toast.success("Sharable permanently deleted");
            } else {
                // Soft delete for regular users
                await api2.delete(`/shareable/delete-shareable/${deleteIds.join(",")}`);
                toast.success("Sharable deleted successfully");
            }
            setDeleteIds([]);
            setSelectedRows([]);
            queryClient.invalidateQueries({ queryKey: ["getSharables", entityId] });
            queryClient.invalidateQueries({ queryKey: ["getDeletedSharables", entityId] });
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to delete sharable");
        }
    };

    const handleBulkDelete = () => {
        if (selectedRows.length > 0) {
            setDeleteIds(selectedRows.map(s => s.id));
        }
    };

    const handleView = (sharable: ISharable) => {
        setSelectedSharable(sharable);
        setViewMode("view");
    };

    const handleEdit = (sharable: ISharable) => {
        setSelectedSharable(sharable);
        setViewMode("edit");
    };

    const handleBackToList = () => {
        setViewMode("list");
        setSelectedSharable(null);
        // Refetch the data
        queryClient.invalidateQueries({ queryKey: ["getSharables", entityId] });
    };

    const breadcrumbLinks = [
        { label: selectedBrand?.name || "Brands", href: "/dashboard/brands" },
        { label: selectedCategory?.title || "Product Types", href: `/dashboard/category/${selectedBrand?.slug || ""}` },
        { label: selectedSubcategory?.title || "Categories", href: `/dashboard/category/${selectedBrand?.slug || ""}/subcategory/${selectedCategory?.slug || ""}` },
        { label: selectedProduct?.name || "Products", href: `/dashboard/category/${selectedBrand?.slug || ""}/subcategory/${selectedCategory?.slug || ""}/products/${selectedSubcategory?.slug || selectedSubcategory?.original?.slug || ""}` },
        { label: "Sharables", isActive: true },
    ];

    const columns = createSharableColumns({
        onEdit: handleEdit,
        onView: handleView,
        onDelete: (id) => setDeleteIds([id]),
    });

    const tableData = sharables || [];

    // Show view page
    if (viewMode === "view" && selectedSharable) {
        return <SharableViewPage sharable={selectedSharable} onBack={handleBackToList} />;
    }

    // Show edit page
    if (viewMode === "edit" && selectedSharable) {
        return (
            <SharableEditModal
                sharable={selectedSharable}
                onSuccess={handleBackToList}
                onCancel={handleBackToList}
            />
        );
    }

    // Show create page
    if (viewMode === "create") {
        return (
            <SharableCreateModal
                productId={entityId || undefined}
                onSuccess={handleBackToList}
                onCancel={handleBackToList}
            />
        );
    }

    return (
        <div className="space-y-6">
            <Breadcrumb links={breadcrumbLinks} />

            <div>
                {isLoading ? (
                    <div className="rounded-xs border">
                        <div className="p-4 flex justify-between items-center border-b">
                            <div className="h-8 w-48 bg-gray-200 animate-pulse rounded" />
                            <div className="flex gap-2">
                                <div className="h-9 w-32 bg-gray-200 animate-pulse rounded" />
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="space-y-3">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="flex items-center gap-4 p-3 border rounded">
                                        <div className="h-4 w-4 bg-gray-200 animate-pulse rounded" />
                                        <div className="h-4 w-8 bg-gray-200 animate-pulse rounded" />
                                        <div className="h-4 w-40 bg-gray-200 animate-pulse rounded" />
                                        <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
                                        <div className="h-4 w-28 bg-gray-200 animate-pulse rounded" />
                                        <div className="h-6 w-16 bg-gray-200 animate-pulse rounded" />
                                        <div className="h-4 w-16 bg-gray-200 animate-pulse rounded" />
                                        <div className="ml-auto h-8 w-8 bg-gray-200 animate-pulse rounded" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <DataTable
                        columns={columns}
                        data={tableData}
                        onRowSelectionChange={setSelectedRows}
                        filterColumn="title"
                        filterPlaceholder="Filter sharables..."
                        pagination={{
                            itemsPerPage: pagination.limit,
                            currentPage: pagination.page,
                            totalItems: tableData.length,
                            totalPages: Math.ceil(tableData.length / pagination.limit),
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
                            <div className="flex justify-end items-center gap-2">
                                {selectedRows.length > 0 && (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={handleBulkDelete}
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete ({selectedRows.length})
                                    </Button>
                                )}
                                {user?.role === UserRole.SUDOADMIN && (
                                    <Button
                                        variant="destructive"
                                        onClick={() => navigate(`/dashboard/products/${entityId}/sharable/deleted`)}
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        View Deleted
                                    </Button>
                                )}
                                <Button onClick={() => setViewMode("create")}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Sharable
                                </Button>
                            </div>
                        }
                    />
                )}
            </div>

            {/* Delete Alert Dialog */}
            <AlertDialog open={deleteIds.length > 0} onOpenChange={() => setDeleteIds([])}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {user?.role === UserRole.SUDOADMIN ? "Permanently Delete?" : "Are you sure?"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {user?.role === UserRole.SUDOADMIN 
                                ? `This action cannot be undone. This will permanently delete ${deleteIds.length} sharable(s) from the database.`
                                : `This action will move ${deleteIds.length} sharable(s) to trash.`
                            }
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            {user?.role === UserRole.SUDOADMIN ? "Delete Permanently" : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
