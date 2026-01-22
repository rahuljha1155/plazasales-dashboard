import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash2, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "../data-table-column-header";
import { toast } from "sonner";
import { TableShimmer } from "../table-shimmer";
import type { certificate } from "@/types/certificate";
import { CertificateViewModal } from "./CertificateViewModal";
import { useDeleteCertificate } from "@/hooks/useCertificate";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Icon } from "@iconify/react/dist/iconify.js";

interface CertificateTableProps {
  certificates: certificate[];
  isLoading: boolean;
  onEdit: (certificate: certificate) => void;
}

export function CertificateTable({
  certificates,
  isLoading,
  onEdit,
}: CertificateTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [certificateToDelete, setCertificateToDelete] =
    useState<certificate | null>(null);
  const [certificateToView, setCertificateToView] =
    useState<certificate | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const { mutate: deleteCertificate, isPending } = useDeleteCertificate();
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const handleDelete = async (cId: string) => {
    await deleteCertificate(cId, {
      onSuccess: () => {
        toast("Certificate deleted successfully");
        setDeleteDialogOpen(false);
      },
      onError: () => {
        toast("Failed to delete Certificate");
      },
    });
  };

  const columns: ColumnDef<any>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
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
      accessorKey: "sn",
      header: ({ column }) => <div className="w-14 text-center">S.N.</div>,
      cell: ({ row }) => (
        <div className=" px-4">{row.index + 1}</div>
      ),
    },
    {
      accessorKey: "title",
      header: "Job Title",
      cell: ({ row }) => (
        <h2>{row.original.title}</h2>
      ),
    },
    {
      accessorKey: "location",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Location" />
      ),
      cell: ({ row }) => (
        <div className=" line-clamp-1 w-full max-w-2xl">{row.original.location}</div>
      ),
    },
    {
      accessorKey: "jobType",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Job Type" />
      ),
      cell: ({ row }) => (
        <div className=" line-clamp-1 w-full max-w-2xl">{row.original.jobType}</div>
      ),
    },
    {
      accessorKey: "salaryRange",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Salary Range" />
      ),
      cell: ({ row }) => (
        <div className=" line-clamp-1 w-full max-w-2xl">{row.original.salaryRange}</div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setCertificateToView(row.original);
              setViewDialogOpen(true);
            }}
          >
            <Icon
              icon="mynaui:eye"
              width="16"
              height="16"
              className="text-zinc-400 hover:text-primary"
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(row.original)}
          >
            <Icon
              icon="mynaui:edit-one"
              width="16"
              height="16"
              className="text-zinc-400 hover:text-primary"
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setCertificateToDelete(row.original);
              setDeleteDialogOpen(true);
            }}
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
    <>


      <DataTable
        columns={columns}
        data={certificates}
        filterColumn="name"
        filterPlaceholder="Filter certificates..."
        pagination={{
          totalItems: pagination.total,
          currentPage: pagination.page,
          itemsPerPage: pagination.limit,
          onPageChange: (page) => page,
          totalPages: pagination.totalPages,
        }}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. It will permanently delete the selected item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={() =>
                certificateToDelete && handleDelete(certificateToDelete._id)
              }
            >
              {"Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {certificateToView && (
        <CertificateViewModal
          isOpen={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          certificateData={certificateToView}
        />
      )}
    </>
  );
}
