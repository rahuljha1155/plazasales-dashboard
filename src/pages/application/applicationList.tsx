import { Suspense, useState, useEffect } from "react";
import { ArrowLeft, Reply } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Skeleton } from "@/components/ui/skeleton";
import { TableShimmer } from "@/components/table-shimmer";
import type { IApplication } from "@/types/IApplication";
import { ApplicationTable } from "@/components/application/ApplicationTable";
import { ViewApplication } from "@/components/application/ViewApplication";
import { useApplicationsByCareer, useApplication, useDeleteApplication, useUpdateApplication } from "@/services/application";
import Breadcrumb from "@/components/dashboard/Breadcumb";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { useUserStore } from "@/store/userStore";

export default function ApplicationListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const careerId = searchParams.get("id");
  const positionFilter = searchParams.get("position");

  // Get page from URL or default to 1
  const pageFromUrl = parseInt(searchParams.get("page") || "1", 10);
  const limitFromUrl = parseInt(searchParams.get("limit") || "10", 10);

  const [pagination, setPagination] = useState({
    page: pageFromUrl,
    limit: limitFromUrl,
  });

  // Update URL when pagination changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pagination.page.toString());
    params.set("limit", pagination.limit.toString());
    setSearchParams(params, { replace: true });
  }, [pagination.page, pagination.limit]);

  // Sync pagination state with URL on mount and when URL changes
  useEffect(() => {
    setPagination({
      page: pageFromUrl,
      limit: limitFromUrl,
    });
  }, [pageFromUrl, limitFromUrl]);

  const { user } = useUserStore()

  const { data: applicationsData, isLoading, refetch } = useApplicationsByCareer(careerId || "", pagination);
  const [itemToView, setItemToView] = useState<IApplication | null>(null);
  const { mutate: deleteApplication } = useDeleteApplication();
  const [updatingApplicationId, setUpdatingApplicationId] = useState<string | null>(null);
  const { mutate: updateApplication } = useUpdateApplication(updatingApplicationId || "");
  const [selectedRows, setSelectedRows] = useState<IApplication[]>([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

  // Fetch full application details when viewing
  const { data: viewApplicationData, isLoading: isLoadingView } = useApplication(
    itemToView?.id || "",
    !!itemToView
  );

  const applications = applicationsData?.data?.applications || [];

  const handleDelete = (id: string) => {
    deleteApplication([id], {
      onSuccess: () => {
        refetch();
        setSelectedRows(prev => prev.filter(row => row.id !== id));
      },
    });
  };

  const handleBulkDeleteConfirm = () => {
    if (selectedRows.length === 0) return;
    const ids = selectedRows.map(row => row.id);
    deleteApplication(ids, {
      onSuccess: () => {
        refetch();
        setSelectedRows([]);
        setShowBulkDeleteDialog(false);
      },
    });
  };

  const handleUpdateStatus = (id: string, status: string) => {
    setUpdatingApplicationId(id);
    updateApplication({ status: status as any }, {
      onSuccess: () => {
        refetch();
        setUpdatingApplicationId(null);
      },
      onError: () => {
        setUpdatingApplicationId(null);
      },
    });
  };

  return (
    <div className="container mx-auto py-2">
      <div className="flex flex-col mb-5 sm:flex-row sm:items-center sm:justify-between gap-4 pb-2to-transparent">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Job Applications
            {positionFilter && <span className="text-primary"> - {positionFilter}</span>}
          </h1>
          <p className="text-sm text-gray-500">
            Manage job applications and candidate details
          </p>
        </div>
        <Breadcrumb
          links={[
            { label: "Applications", isActive: false, href: "/dashboard/career" },
            { label: "View All", isActive: true },
          ]}
        />
      </div>

      {itemToView ? (
        <div>
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-xl text-primary font-bold">
              View Application
            </h1>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => navigate(`/dashboard/applications/${itemToView.id}/reply`)}
                className="flex items-center gap-2 bg-primary hover:bg-primary"
              >
                <Reply className="h-4 w-4" />
                Send Reply
              </Button>
              <Button
                onClick={() => setItemToView(null)}
                variant="outline"
                className="flex items-center gap-2 cursor-pointer rounded-full"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to List
              </Button>
            </div>
          </div>
          {isLoadingView ? (
            <div className="space-y-6">
              <div className="space-y-4">
                <Skeleton className="h-8 w-[300px]" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
              <Skeleton className="h-48 w-full" />
            </div>
          ) : viewApplicationData?.data ? (
            <ViewApplication application={viewApplicationData.data} />
          ) : (
            <div className="text-center text-gray-500">Application not found</div>
          )}
        </div>
      ) : (
        <>

          <Suspense fallback={<TableShimmer />}>
            <ApplicationTable
              applications={applications}
              isLoading={isLoading}
              onView={setItemToView}
              onDelete={handleDelete}
              onUpdateStatus={handleUpdateStatus}
              onRowSelectionChange={setSelectedRows}
              element={
                <div className="flex gap-2">
                  {selectedRows.length > 0 && (
                    <Button
                      variant="destructive"
                      className="rounded-sm flex gap-2"
                      onClick={() => setShowBulkDeleteDialog(true)}
                    >
                      <Icon icon="solar:trash-bin-minimalistic-bold" width="18" />
                      delete ({selectedRows.length})
                    </Button>
                  )}
                  {user?.role === "SUDOADMIN" && (<Button
                    variant="destructive"
                    onClick={() => {
                      const params = new URLSearchParams();
                      if (careerId) params.set("id", careerId);
                      if (positionFilter) params.set("position", positionFilter);
                      navigate(`/dashboard/deleted-applications?${params.toString()}`);
                    }}
                  >
                    <Icon icon="solar:trash-bin-minimalistic-bold" className="mr-2" width="20" />
                    View Deleted
                  </Button>)}
                </div>
              }
              onReply={undefined}
              pagination={{
                currentPage: applicationsData?.data?.page || 1,
                totalPages: applicationsData?.data?.totalPages || 1,
                totalItems: applicationsData?.data?.total || 0,
                itemsPerPage: pagination.limit,
                onPageChange: (page) => setPagination((prev) => ({ ...prev, page })),
                onItemsPerPageChange: (limit) => setPagination((prev) => ({ ...prev, page: 1, limit })),
              }}
            />
          </Suspense>
        </>
      )}

      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>delete Applications?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedRows.length} selected job application(s)? This action can be undone from the deleted applications page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDeleteConfirm}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
