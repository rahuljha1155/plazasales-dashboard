import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Trash2, FileText, FileSpreadsheet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { useGetAllInquiries, useDeleteInquiry, useDeleteBulkInquiries } from "@/services/inquiry";
import type { IInquiry } from "@/types/IInquiry";
import { format } from "date-fns";
import { api2 } from "@/services/api";
import { toast } from "sonner";
import { TableShimmer } from "@/components/table-shimmer";
import Breadcrumb from "@/components/dashboard/Breadcumb";
import { DataTable } from "@/components/ui/data-table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, AlertDialogPortal, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useUserStore } from "@/store/userStore";
import { UserRole } from "@/components/LoginPage";
import { ExportConfigDialog } from "@/components/ExportConfigDialog";


export default function ListInquiries() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const pageFromUrl = parseInt(searchParams.get("page") || "1", 10);
  const [page, setPage] = useState(pageFromUrl);
  const [limit] = useState(10);

  const { user } = useUserStore();
  const { data: response, isLoading } = useGetAllInquiries(page, limit);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [inquiryToDelete, setInquiryToDelete] = useState<IInquiry | null>(null);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"excel" | "pdf">("excel");

  const isSudoAdmin = user?.role === UserRole.SUDOADMIN;
  const { mutateAsync: deleteBulkInquiries, isPending: isBulkDeleting } = useDeleteBulkInquiries();

  const { mutate: deleteInquiry, isPending: isDeleting } = useDeleteInquiry(
    inquiryToDelete?.id || ""
  );

  const handleBulkDelete = async () => {
    try {
      const ids = selectedRows.map(row => row.id);
      await deleteBulkInquiries(ids);
      setShowBulkDeleteDialog(false);
      setSelectedRows([]);
    } catch (error: any) {
    }
  };

  const handleDelete = () => {
    if (!inquiryToDelete?.id) return;

    deleteInquiry(undefined, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setInquiryToDelete(null);
      },
    });
  };

  const handleExportPDF = () => {
    setExportFormat("pdf");
    setExportDialogOpen(true);
  };

  const handleExportExcel = () => {
    setExportFormat("excel");
    setExportDialogOpen(true);
  };


  const handleView = (inquiry: IInquiry) => {
    navigate(`/dashboard/inquiries/${inquiry.id}`);
  };




  const columns: ColumnDef<IInquiry>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          className="ml-2"
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
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
      accessorKey: "message",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Message" />
      ),
      cell: ({ row }) => (
        <div className="text-sm max-w-sm line-clamp-1">{row.original.message || "N/A"}</div>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      cell: ({ row }) => (
        <div className="text-sm hover:underline hover:text-primary"><Link to={`mailto:${row?.original?.email}`}>{row.original.email || "N/A"}</Link></div>
      ),
    },
    {
      accessorKey: "product",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Product" />
      ),
      cell: ({ row }) => <div className="text-sm line-clamp-1!">{row.original?.product?.name || "N/A"}</div>
    },
    // {
    //   accessorKey: "createdAt",
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} title="Created At" />
    //   ),
    //   cell: ({ row }) => (
    //     <div className="text-sm">
    //       {row.original.createdAt
    //         ? format(new Date(row.original.createdAt), "MMM dd, yyyy")
    //         : "N/A"}
    //     </div>
    //   ),
    // },
    {
      id: "actions",
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => (
        <div className="flex   gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleView(row.original)}
            title="View details"
          >
            <Icon
              icon="mynaui:eye"
              width="16"
              height="16"
              className="text-zinc-400 hover:text-red-500"
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setInquiryToDelete(row.original);
              setDeleteDialogOpen(true);
            }}
            title="Delete"
          >
            <Icon
              icon="ic:baseline-delete"
              width="16"
              height="16"
              className="text-zinc-400 hover:text-red-500"
            />
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <TableShimmer />;
  }


  return (
    <div className="">
      <div className="flex justify-between items-center pb-4">
        <Breadcrumb
          links={[
            { label: "Inquiries", isActive: false },
            { label: "View All", isActive: true },
          ]}
        />
      </div>

      <div className="bg-white rounded-lg ">
        <div className="">
          <DataTable
            columns={columns}
            data={response?.data?.inquiries || []}
            onRowClick={(inquiry) => handleView(inquiry)}
            getRowClassName={(contact) => contact?.isHandled === false ? "bg-zinc-100 font-bold border-b border-zinc-200" : ""}
            filterColumn="name"
            filterPlaceholder="Search by subject..."
            onRowSelectionChange={(rows: any) => setSelectedRows(rows)}
            elements={
              <div className="flex gap-2">
                {selectedRows.length > 0 && (
                  <Button
                    variant="destructive"
                    className="rounded-sm hover:shadow-md transition-shadow"
                    onClick={() => setShowBulkDeleteDialog(true)}
                  >
                    <Icon icon="solar:trash-bin-minimalistic-bold" className="mr-2" width="20" />
                    delete ({selectedRows.length})
                  </Button>
                )}
                {isSudoAdmin && (
                  <Button
                    variant="destructive"
                    onClick={() => navigate("/dashboard/inquiries/deleted")}
                  >
                    <Icon icon="solar:trash-bin-minimalistic-bold" className="mr-2" width="20" />
                    View Deleted
                  </Button>
                )}
                <Button
                  onClick={handleExportPDF}
                  variant="outline"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Icon icon={"material-icon-theme:pdf"} className="h-4 w-4 text-red-600" />
                  Export PDF
                </Button>
                <Button
                  onClick={handleExportExcel}
                  variant="outline"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Icon icon={"vscode-icons:file-type-excel"} className="h-4 w-4 text-green-600" />
                  Export Excel
                </Button>
              </div>
            }
            pagination={{
              currentPage: page,
              totalPages: response?.data?.totalPages || 1,
              totalItems: response?.data?.total || 0,
              itemsPerPage: limit,
              onPageChange: (newPage) => {
                setPage(newPage);
                setSearchParams({ page: newPage.toString() });
              },
            }}
          />
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              inquiry "{inquiryToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>delete Items?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedRows.length} selected item(s)? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isBulkDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isBulkDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ExportConfigDialog
        isOpen={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        resource="inquiry"
        exportFormat={exportFormat}
        title="Export Inquiries"
      />
    </div>
  );
}
