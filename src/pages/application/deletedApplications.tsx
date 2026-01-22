import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Icon } from "@iconify/react/dist/iconify.js";
import { TableShimmer } from "@/components/table-shimmer";
import { DataTable } from "@/components/ui/data-table";
import {
  useGetDeletedApplications,
  useRecoverApplications,
  useDestroyApplicationPermanently
} from "@/services/application";
import Breadcrumb from "@/components/dashboard/Breadcumb";
import { createDeletedApplicationColumns } from "@/components/application/DeletedApplicationTableColumns";
import type { IDeletedApplication } from "@/types/IApplication";
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

interface PaginationState {
  page: number;
  limit: number;
}

export default function DeletedApplicationList() {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
  });

  const [selectedRows, setSelectedRows] = useState<IDeletedApplication[]>([]);

  const { data, isLoading } = useGetDeletedApplications(pagination.page, pagination.limit);
  const { mutateAsync: recoverApplications, isPending: isRecoverPending } = useRecoverApplications();
  const { mutateAsync: destroyApplicationPermanently, isPending: isDestroyPending } = useDestroyApplicationPermanently();

  // Check if user is sudo admin
  const isSudoAdmin = user?.role === UserRole.SUDOADMIN;

  // Redirect if not sudo admin
  if (!isSudoAdmin && !isLoading) {
    navigate("/dashboard/applications");
    toast.error("Access denied. Only sudo admins can access this page.");
    return null;
  }

  const handleRecover = async (id: string) => {
    try {
      await recoverApplications([id]);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const handleRecoverAll = async () => {
    if (selectedRows.length === 0) {
      toast.error("Please select at least one application to recover");
      return;
    }

    try {
      const ids = selectedRows.map((app) => app.id);
      await recoverApplications(ids);
      setSelectedRows([]);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const handleRecoverAllApplications = async () => {
    if (!data?.data?.applications || data.data.applications.length === 0) {
      toast.error("No deleted applications to recover");
      return;
    }

    try {
      const ids = data.data.applications.map((app: any) => app.id);
      await recoverApplications(ids);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const handleDestroyPermanently = async (id: string) => {
    try {
      await destroyApplicationPermanently(id);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const columns = createDeletedApplicationColumns({
    onRecover: handleRecover,
    onDestroyPermanently: handleDestroyPermanently,
    isRecoverPending,
    isDestroyPending,
  });

  const tableData = (data?.data.applications || []).map((app: any) => ({
    ...app,
    _id: app.id,
  }));

  if (isLoading) {
    return (
      <div className="flex ">
        <TableShimmer />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ">

        <Breadcrumb
          links={[
            { label: "Applications", isActive: false, href: "/dashboard/career" },
            { label: "Deleted Applications", isActive: true },
          ]}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 flex-wrap items-center justify-between">


      </div>

      {/* Table Section */}
      <div className="bg-white">
        <DataTable
          columns={columns as any}
          data={tableData}
          filterColumn="name"
          filterPlaceholder="Search deleted applications by name..."
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
                  Recover Selected ({selectedRows.length})
                </Button>
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
                            Recover All Applications
                          </AlertDialogTitle>
                          <p className="text-sm text-gray-500 mt-1">
                            {data?.data.total} application(s)
                          </p>
                        </div>
                      </div>
                      <AlertDialogDescription className="text-gray-600">
                        This will restore all {data?.data.total} deleted applications and make them available again in the system. Are you sure you want to proceed?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-lg">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-green-500 hover:bg-green-600 rounded-lg"
                        onClick={handleRecoverAllApplications}
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

      {/* Empty State */}
      {!isLoading && tableData.length === 0 && (
        <div className="text-center py-12">
          <Icon
            icon="solar:trash-bin-minimalistic-bold"
            className="mx-auto text-gray-400 mb-4"
            width="64"
          />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Deleted Applications
          </h3>
          <p className="text-gray-500 mb-6">
            There are no deleted applications at the moment.
          </p>
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/applications")}
          >
            <Icon icon="solar:arrow-left-bold" className="mr-2" width="20" />
            Go to Applications
          </Button>
        </div>
      )}
    </div>
  );
}
