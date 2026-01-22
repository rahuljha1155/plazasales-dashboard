import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react/dist/iconify.js";
import { TableShimmer } from "@/components/table-shimmer";
import { DataTable } from "../ui/data-table";
import Breadcrumb from "@/components/dashboard/Breadcumb";
import { useNavigate, useParams } from "react-router-dom";
import { useGetAllSeo, useDeleteSeo } from "@/hooks/useSeoMetadata";
import { createSeoColumns } from "./SeoTableColumns";
import type { ISeoMetadata } from "@/types/ISeoMetadata";
import { UpdateSeoMetadata } from "./UpdateSeoMetadata";
import { SeoDetailView } from "./SeoDetailView";
import { EntityType } from "@/types/ISeoMetadata";

export default function CategorySeoList() {
    const navigate = useNavigate();
    const { id: categoryId } = useParams();
    const [pagination, setPagination] = useState({ page: 1, limit: 10 });

    const { data, isLoading } = useGetAllSeo({
        page: pagination.page,
        limit: pagination.limit,
        entityType: EntityType.CATEGORY,
    });

    const [state, setState] = useState<{ seoToEdit: string | null; viewingSeo: string | null }>({
        seoToEdit: null,
        viewingSeo: null,
    });

    const { mutateAsync: deleteSeo, isPending: isDeletePending } = useDeleteSeo();

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this SEO metadata?")) {
            try {
                await deleteSeo(id);
            } catch (error) {
            }
        }
    };

    const handleEdit = (seo: ISeoMetadata) => {
        setState((prev) => ({ ...prev, seoToEdit: seo.id }));
    };

    const handleView = (seo: ISeoMetadata) => {
        setState((prev) => ({ ...prev, viewingSeo: seo.id }));
    };

    const handleFormSuccess = () => {
        setState({ seoToEdit: null, viewingSeo: null });
    };

    const handleFormCancel = () => {
        setState((prev) => ({ ...prev, seoToEdit: null }));
    };

    const columns = createSeoColumns({
        onEdit: handleEdit,
        onView: handleView,
        onDelete: handleDelete,
        isDeletePending,
    });

    const tableData = categoryId
        ? (data?.data?.records || []).filter((seo) => seo.entityId === categoryId)
        : data?.data?.records || [];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <TableShimmer />
            </div>
        );
    }

    if (state.seoToEdit) {
        return (
            <UpdateSeoMetadata
                seoId={state.seoToEdit}
                onSuccess={handleFormSuccess}
                onCancel={handleFormCancel}
            />
        );
    }

    if (state.viewingSeo) {
        return (
            <SeoDetailView
                seoId={state.viewingSeo}
                onBack={() => setState((prev) => ({ ...prev, viewingSeo: null }))}
            />
        );
    }

    return (
        <div className="w-full space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6">
                <Breadcrumb
                    links={[
                        { label: "Categories", isActive: false },
                        { label: "SEO Optimization", isActive: true },
                    ]}
                />
            </div>

            <div className="bg-white">
                <DataTable
                    columns={columns as any}
                    data={tableData}
                    filterColumn="title"
                    filterPlaceholder="Search by title..."
                    pagination={{
                        itemsPerPage: pagination.limit,
                        currentPage: data?.data?.page || 1,
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
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="rounded-sm hover:shadow-md transition-shadow"
                                onClick={() => navigate(-1)}
                            >
                                <Icon icon="solar:arrow-left-bold" className="mr-2" width="20" />
                                Back
                            </Button>
                            {categoryId && (
                                <Button
                                    className="rounded-sm hover:shadow-md transition-shadow"
                                    onClick={() => navigate(`/dashboard/categories/${categoryId}/seo/create?entityType=CATEGORY&entityId=${categoryId}`)}
                                >
                                    <Icon icon="solar:add-circle-bold" className="mr-2" width="20" />
                                    Create SEO
                                </Button>
                            )}
                        </div>
                    }
                />
            </div>
        </div>
    );
}
