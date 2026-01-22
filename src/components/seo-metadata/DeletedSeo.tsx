import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react/dist/iconify.js";
import { TableShimmer } from "@/components/table-shimmer";
import { DataTable } from "../ui/data-table";
import Breadcrumb from "@/components/dashboard/Breadcumb";
import { useNavigate } from "react-router-dom";
import {
  useGetDeletedSeo,
  useRecoverSeo,
  useDestroySeo,
} from "@/hooks/useSeoMetadata";
import { createDeletedSeoColumns } from "./DeletedSeoTableColumns";
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

export default function DeletedSeo() {
  const navigate = useNavigate();
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [destroyingId, setDestroyingId] = useState<string | null>(null);
  const [showBulkDestroyDialog, setShowBulkDestroyDialog] = useState(false);

  const { data, isLoading } = useGetDeletedSeo({
    page: pagination.page,
    limit: pagination.limit,
  });

  const { mutateAsync: recoverSeo, isPending: isRecoverPending } = useRecoverSeo();
  const { mutateAsync: destroySeo, isPending: isDestroyPending } = useDestroySeo();

  const handleRecover = async (ids: string[]) => {
    try {
      await recoverSeo(ids);
      setSelectedIds([]);
    } catch (error) {
    }
  };

  const handleDestroy = (id: string) => {
    setDestroyingId(id);
  };

  const confirmDestroy = async () => {
    if (!destroyingId) return;

    try {
      await destroySeo(destroyingId);
      setDestroyingId(null);
    } catch (error) {
    }
  };

  const handleRecoverSelected = () => {
    if (selectedIds.length === 0) {
      alert("Please select at least one item to recover");
      return;
    }
    handleRecover(selectedIds);
  };

  const handleDestroySelected = async () => {
    if (selectedIds.length === 0) return;

    try {
      await destroySeo(selectedIds.join(","));
      setSelectedIds([]);
      setShowBulkDestroyDialog(false);
    } catch (error) {
    }
  };

  const columns = createDeletedSeoColumns({
    onRecover: handleRecover,
    onDestroy: handleDestroy,
    isRecoverPending,
    isDestroyPending,
    selectedIds,
    onSelectionChange: setSelectedIds,
  });

  const tableData = data?.data?.records || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <TableShimmer />
      </div>
    );
  }

  return (
    <>
      <div className="w-full space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 ">
          <Breadcrumb
            links={[
              { label: "SEO Metadata", href: "/dashboard/seo-metadata" },
              { label: "Deleted", isActive: true },
            ]}
          />
        </div>

        {/* Table Section */}
        <div className="bg-white">
          <DataTable
            columns={columns as any}
            data={tableData}
            filterColumn="title"
            filterPlaceholder="Search by title..."
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

                {selectedIds.length > 0 && (
                  <>
                    <Button
                      variant="outline"
                      className="rounded-sm hover:shadow-md transition-shadow border-green-500 text-green-600 hover:bg-green-50"
                      onClick={handleRecoverSelected}
                      disabled={isRecoverPending}
                    >
                      <Icon icon="solar:restart-bold" className="mr-2" width="20" />
                      Recover Selected ({selectedIds.length})
                    </Button>
                    <Button
                      variant="destructive"
                      className="rounded-sm hover:shadow-md transition-shadow"
                      onClick={() => setShowBulkDestroyDialog(true)}
                      disabled={isDestroyPending}
                    >
                      <Icon icon="solar:trash-bin-trash-bold" className="mr-2" width="20" />
                      delete ({selectedIds.length})
                    </Button>
                  </>
                )}
              </div>
            }
          />
        </div>
      </div>

      {/* Confirmation Dialog for Permanent Delete */}
      <AlertDialog open={!!destroyingId} onOpenChange={() => setDestroyingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the SEO metadata
              from the database and it cannot be recovered.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDestroy}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation Dialog for Bulk Permanent Delete */}
      <AlertDialog open={showBulkDestroyDialog} onOpenChange={setShowBulkDestroyDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>delete Items?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete {selectedIds.length} selected item(s)?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDestroySelected}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDestroyPending}
            >
              {isDestroyPending ? "Deleting..." : "Delete Permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
