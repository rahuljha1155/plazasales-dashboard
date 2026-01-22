import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react/dist/iconify.js";
import { TableShimmer } from "@/components/table-shimmer";
import { DataTable } from "../ui/data-table";
import Breadcrumb from "@/components/dashboard/Breadcumb";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "@/store/userStore";
import { UserRole } from "@/components/LoginPage";
import { useGetAllSeo, useDeleteSeo } from "@/hooks/useSeoMetadata";
import { createSeoColumns } from "./SeoTableColumns";
import { type ISeoMetadata } from "@/types/ISeoMetadata";
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

interface PaginationState {
    page: number;
    limit: number;
}

export default function SeoListPage() {
    const navigate = useNavigate();
    const { user } = useUserStore();
    const [pagination, setPagination] = useState<PaginationState>({
        page: 1,
        limit: 10,
    });
    const [selectedEntityType, setSelectedEntityType] = useState<string>("ALL");
    const { data, isLoading } = useGetAllSeo({
        page: pagination.page,
        limit: pagination.limit,
        entityType: selectedEntityType === "ALL" ? undefined : selectedEntityType,
    });

    const [seoToDelete, setSeoToDelete] = useState<string | null>(null);
    const [selectedRows, setSelectedRows] = useState<ISeoMetadata[]>([]);
    const { mutateAsync: deleteSeo, isPending: isDeletePending } = useDeleteSeo();

    const handleDeleteClick = (id: string) => {
        setSeoToDelete(id);
    };

    const handleBulkDeleteClick = () => {
        if (selectedRows.length === 0) return;
        const ids = selectedRows.map((r) => r.id).join(",");
        setSeoToDelete(ids);
    };

    const handleDeleteConfirm = async () => {
        if (!seoToDelete) return;
        try {
            await deleteSeo(seoToDelete);
            setSeoToDelete(null);
            setSelectedRows([]);
        } catch (error) { }
    };

    const handleDeleteCancel = () => {
        setSeoToDelete(null);
    };

    const handleEdit = (seo: ISeoMetadata) => {
        navigate(`/dashboard/seo-metadata/edit/${seo.id}`);
    };

    const handleView = (seo: ISeoMetadata) => {
        navigate(`/dashboard/seo-metadata/view/${seo.id}`);
    };

    const handleWholeSiteEdit = (seo: ISeoMetadata) => {
        navigate(`/dashboard/seo-metadata/whole-site/edit/${seo.id}`);
    };

    const columns = createSeoColumns({
        onWholeSiteEdit: handleWholeSiteEdit,
        onEdit: handleEdit,
        onView: handleView,
        onDelete: handleDeleteClick,
        isDeletePending,
    });

    const tableData = data?.data?.records || [];
    const isSudoAdmin = user?.role === UserRole.SUDOADMIN;

    if (isLoading) {
        return (
            <div className="">
                <TableShimmer />
            </div>
        );
    }

    return (
        <>
            <div className="w-full space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6">
                    <Breadcrumb
                        links={[
                            {
                                label: "SEO Metadata",
                                isActive: true,
                            },
                        ]}
                    />
                </div>

                <div className="bg-white">
                    <DataTable
                        columns={columns as any}
                        data={tableData}
                        onRowClick={(seo) => handleView(seo)}
                        filterColumn="title"
                        filterPlaceholder="Search by title..."
                        onRowSelectionChange={setSelectedRows}
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
                            <div className="flex gap-2 items-center">
                                {selectedRows.length > 0 && (
                                    <Button
                                        variant="destructive"
                                        className="rounded-sm"
                                        onClick={handleBulkDeleteClick}
                                    >
                                        <Icon icon="solar:trash-bin-minimalistic-bold" className="mr-2" width="20" />
                                        delete ({selectedRows.length})
                                    </Button>
                                )}
                                {isSudoAdmin && (
                                    <Button
                                        variant="destructive"
                                        onClick={() => navigate("/dashboard/deleted-seo")}
                                    >
                                        <Icon icon="solar:trash-bin-minimalistic-bold" className="mr-2" width="20" />
                                        View Deleted
                                    </Button>
                                )}
                                <Button
                                    className="rounded-sm hover:shadow-md transition-shadow"
                                    onClick={() => navigate("/dashboard/seo-metadata/create/whole-site")}
                                >
                                    <Icon icon="solar:add-circle-bold" className="mr-2" width="20" />
                                    Site SEO
                                </Button>
                            </div>
                        }
                    />
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!seoToDelete} onOpenChange={(open) => !open && handleDeleteCancel()}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {seoToDelete?.includes(",")
                                ? `This action cannot be undone. This will permanently delete ${selectedRows.length} SEO metadata items.`
                                : "This action cannot be undone. This will permanently delete the SEO metadata."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleDeleteCancel} disabled={isDeletePending}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            disabled={isDeletePending}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        >
                            {isDeletePending ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
