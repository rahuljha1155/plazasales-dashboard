import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { useGetDeletedInquiries, useRecoverInquiries, useDestroyInquiriesPermanently } from "@/services/inquiry";
import type { IInquiry } from "@/types/IInquiry";
import { format } from "date-fns";
import { toast } from "sonner";
import { TableShimmer } from "@/components/table-shimmer";
import Breadcrumb from "@/components/dashboard/Breadcumb";
import { DataTable } from "@/components/ui/data-table";
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
import { useUserStore } from "@/store/userStore";
import { UserRole } from "@/components/LoginPage";
import { Icon } from "@iconify/react/dist/iconify.js";

export default function DeletedInquiries() {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });
  const { data: response, isLoading } = useGetDeletedInquiries(pagination.page, pagination.limit);
  const [selectedRows, setSelectedRows] = useState<IInquiry[]>([]);
  const [inquiryToDelete, setInquiryToDelete] = useState<IInquiry | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { mutateAsync: recoverInquiries, isPending: isRecovering } = useRecoverInquiries();
  const { mutateAsync: destroyInquiries, isPending: isDestroying } = useDestroyInquiriesPermanently();

  const isSudoAdmin = user?.role === UserRole.SUDOADMIN;

  const handleRecover = async (id: string) => {
    try {
      await recoverInquiries([id]);
      setSelectedRows([]);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to recover inquiry");
    }
  };

  const handleRecoverSelected = async () => {
    if (selectedRows.length === 0) {
      toast.error("Please select at least one inquiry to recover");
      return;
    }

    try {
      const ids = selectedRows.map((inquiry) => inquiry.id);
      await recoverInquiries(ids);
      setSelectedRows([]);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to recover inquiries");
    }
  };

  const handleRecoverAll = async () => {
    if (!response?.data?.inquiries || response.data.inquiries.length === 0) {
      toast.error("No deleted inquiries to recover");
      return;
    }

    try {
      const ids = response.data.inquiries.map((inquiry: IInquiry) => inquiry.id);
      await recoverInquiries(ids);
      setSelectedRows([]);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to recover inquiries");
    }
  };

  const handlePermanentDelete = async () => {
    if (!inquiryToDelete?.id) return;

    try {
      await destroyInquiries([inquiryToDelete.id]);
      setDeleteDialogOpen(false);
      setInquiryToDelete(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete inquiry permanently");
    }
  };

  const columns: ColumnDef<IInquiry>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(!!value);
            if (value) {
              setSelectedRows(response?.data?.inquiries || []);
            } else {
              setSelectedRows([]);
            }
          }}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedRows.some((r) => r.id === row.original.id)}
          onCheckedChange={(value) => {
            if (value) {
              setSelectedRows([...selectedRows, row.original]);
            } else {
              setSelectedRows(selectedRows.filter((r) => r.id !== row.original.id));
            }
          }}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Full Name" />
      ),
      cell: ({ row }) => (
        <div className="font-medium max-w-xs truncate">
          {row.original.name}
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      cell: ({ row }) => (
        <div className="text-sm">{row.original.email || "N/A"}</div>
      ),
    },


    {
      accessorKey: "brand",
      header: "Brand",
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.brand?.name || "N/A"}
        </div>
      ),
    },
    {
      accessorKey: "isHandled",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        <div className="text-sm">
          <span className={`px-2 py-1 rounded-full text-xs ${row.original.isHandled ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
            {row.original.isHandled ? "Handled" : "Unresolved"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Deleted At" />
      ),
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.updatedAt
            ? format(new Date(row.original.updatedAt), "MMM dd, yyyy")
            : "N/A"}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-1 ">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRecover(row.original.id)}
            title="Recover"
            disabled={isRecovering}
            className="hover:bg-green-50 hover:border-green-500 hover:text-green-600 py-4 rounded-sm"
          >
            <Icon icon="solar:refresh-bold" width="16" className="mr-1" />
            Recover
          </Button>

          {isSudoAdmin && (


            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setInquiryToDelete(row.original);
                setDeleteDialogOpen(true);
              }}
              title="Delete permanently"
              disabled={isDestroying}
              className="rounded-sm w-fit px-2 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-600 transition-colors"
            >
              <Icon icon="solar:trash-bin-trash-bold" className="mr-1.5" width="16" />
              Delete Forever
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <TableShimmer />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Deleted Inquiries
          </h1>
          <p className="text-sm text-gray-500">
            View and recover deleted inquiries
          </p>
        </div>
        <Breadcrumb
          links={[
            { label: "Inquiries", isActive: false },
            { label: "Deleted Inquiries", isActive: true },
          ]}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 flex-wrap items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="rounded-sm hover:shadow-md transition-shadow"
            onClick={() => navigate("/dashboard/inquiries")}
          >
            <Icon icon="akar-icons:arrow-left" className="mr-2" width="20" />
            Back to Inquiries
          </Button>
        </div>

        <div className="flex gap-2">
          {selectedRows.length > 0 && (
            <Button
              variant="outline"
              className="rounded-sm hover:shadow-md transition-shadow text-green-600 hover:bg-green-50 hover:border-green-600"
              onClick={handleRecoverSelected}
              disabled={isRecovering}
            >
              <Icon icon="solar:refresh-bold" className="mr-2" width="20" />
              Recover Selected ({selectedRows.length})
            </Button>
          )}

          {response?.data?.inquiries && response.data.inquiries.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  className="rounded-sm bg-green-600 hover:bg-green-700 hover:shadow-md transition-shadow"
                  disabled={isRecovering}
                >
                  <Icon icon="solar:refresh-bold" className="mr-2" width="20" />
                  Recover All Inquiries
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
                        Recover All Inquiries
                      </AlertDialogTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        {response?.data?.total} inquiry(ies)
                      </p>
                    </div>
                  </div>
                  <AlertDialogDescription className="text-gray-600">
                    This will restore all {response?.data?.total} deleted inquiries and make them available again in the system. Are you sure you want to proceed?
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
      </div>

      {/* Table Section */}
      <div className="bg-white">
        <DataTable
          columns={columns}
          data={response?.data?.inquiries || []}
          filterColumn="name"
          filterPlaceholder="Search deleted inquiries by name..."
          pagination={{
            currentPage: response?.data?.page || 1,
            totalPages: response?.data?.totalPages || 1,
            totalItems: response?.data?.total || 0,
            itemsPerPage: pagination.limit,
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
      {!isLoading && (!response?.data?.inquiries || response.data.inquiries.length === 0) && (
        <div className="text-center py-12">
          <Icon
            icon="solar:trash-bin-minimalistic-bold"
            className="mx-auto text-gray-400 mb-4"
            width="64"
          />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Deleted Inquiries
          </h3>
          <p className="text-gray-500 mb-6">
            There are no deleted inquiries at the moment.
          </p>
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/inquiries")}
          >
            <Icon icon="solar:arrow-left-bold" className="mr-2" width="20" />
            Go to Inquiries
          </Button>
        </div>
      )}

      {/* Delete Permanently Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the inquiry
              from "{inquiryToDelete?.name}" from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDestroying}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePermanentDelete}
              disabled={isDestroying}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDestroying ? "Deleting..." : "Delete Permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
