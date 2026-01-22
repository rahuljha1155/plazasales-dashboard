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
import { UpdateSeoMetadata, UpdateWholeSiteSeoMetadata } from "./UpdateSeoMetadata.js";
import { SeoDetailView } from "./SeoDetailView.js";
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

interface SeoListState {
  seoToEdit: string | null;
  viewingSeo: string | null;
  seoToDelete: string | null;
  wholeSiteSeo: string | null;
}

export default function GetAllSeo() {
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

  const [state, setState] = useState<SeoListState>({
    seoToEdit: null,
    viewingSeo: null,
    seoToDelete: null,
    wholeSiteSeo: null,
  });
  const [selectedRows, setSelectedRows] = useState<ISeoMetadata[]>([]);

  const { mutateAsync: deleteSeo, isPending: isDeletePending } = useDeleteSeo();

  const handleDeleteClick = (id: string) => {
    setState((prev) => ({ ...prev, seoToDelete: id }));
  };

  const handleBulkDeleteClick = () => {
    if (selectedRows.length === 0) return;
    const ids = selectedRows.map((r) => r.id).join(",");
    setState((prev) => ({ ...prev, seoToDelete: ids }));
  };

  const handleDeleteConfirm = async () => {
    if (!state.seoToDelete) return;

    try {
      await deleteSeo(state.seoToDelete);
      setState((prev) => ({ ...prev, seoToDelete: null }));
      setSelectedRows([]);
    } catch (error) {
    }
  };

  const handleDeleteCancel = () => {
    setState((prev) => ({ ...prev, seoToDelete: null }));
  };

  const handleEdit = (seo: ISeoMetadata) => {
    setState((prev) => ({ ...prev, seoToEdit: seo.id }));
  };

  const handleView = (seo: ISeoMetadata) => {
    setState((prev) => ({ ...prev, viewingSeo: seo.id }));
  };

  const handleWholeSiteEdit = (seo: ISeoMetadata) => {
    setState((prev) => ({ ...prev, wholeSiteSeo: seo.id }));
  };

  const handleFormSuccess = () => {
    setState({ seoToEdit: null, viewingSeo: null, seoToDelete: null, wholeSiteSeo: null });
  };

  const handleFormCancel = () => {
    setState((prev) => ({ ...prev, seoToEdit: null, wholeSiteSeo: null }));
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

  if (state.seoToEdit) {
    return (
      <UpdateSeoMetadata
        seoId={state.seoToEdit}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />
    );
  }

  if (state.wholeSiteSeo) {
    return (
      <UpdateWholeSiteSeoMetadata
        seoId={state.wholeSiteSeo}
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
    <>
      <div className="w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 ">
          <Breadcrumb
            links={[
              { label: "SEO Metadata", isActive: false, href: "/dashboard/seo-metadata", handleClick: () => navigate("/dashboard/seo-metadata") },
              { label: "View All", isActive: true },
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
      <AlertDialog open={!!state.seoToDelete} onOpenChange={(open) => !open && handleDeleteCancel()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {state.seoToDelete?.includes(",")
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
