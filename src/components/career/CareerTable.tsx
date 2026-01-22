import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
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
import type { ICareer } from "@/types/ICareer";
import { useDeleteCareer } from "@/services/career";
import { toast } from "sonner";
import { careerTableColumns } from "./CareerTableColumns";
import { Icon } from "@iconify/react";

// Define the meta type for DataTable
interface CareerTableMeta {
  onEdit: (career: ICareer) => void;
  onView: (career: ICareer) => void;
  setDeleteId: (id: string) => void;
}
import { Pagination } from "../Pagination";
import { TableShimmer } from "../table-shimmer";
import { useNavigate } from "react-router-dom";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
}

interface CareerTableProps {
  careers: ICareer[];
  isLoading: boolean;
  onEdit: (career: ICareer) => void;
  onView: (career: ICareer) => void;
  pagination: PaginationProps;
  elements?: React.ReactNode;
}

export function CareerTable({ careers, isLoading, onEdit, onView, pagination, elements }: CareerTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<ICareer[]>([]);
  const { mutate: deleteCareer, isPending: isDeleting } = useDeleteCareer();
  const navigate = useNavigate();

  const handleDelete = () => {
    if (!deleteId) return;

    deleteCareer(deleteId, {
      onSuccess: () => {
        toast.success(deleteId.includes(",") ? "Careers deleted successfully" : "Career deleted successfully");
        setDeleteId(null);
        setSelectedRows([]);
      },
      onError: (error: any) => {
        const message = error?.response?.data?.message || "Failed to delete career";
        toast.error(message);
      },
    });
  };

  const handleBulkDelete = () => {
    const ids = selectedRows.map((row) => row.id).join(",");
    setDeleteId(ids);
  };

  if (isLoading) {
    return (
      <TableShimmer />
    );
  }


  return (
    <>
      <div className="rounded-xs mt-6">
        <DataTable<ICareer, unknown, CareerTableMeta>
          columns={careerTableColumns}
          data={careers}
          onRowClick={(career) => onView(career)}
          pagination={pagination}
          onRowSelectionChange={setSelectedRows}
          meta={{ onEdit, onView, setDeleteId }}
          elements={
            <div className="flex items-center gap-2">
              {selectedRows.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="rounded-sm flex items-center gap-2"
                >
                  <Icon icon="solar:trash-bin-minimalistic-bold" width="18" />
                  delete ({selectedRows.length})
                </Button>
              )}
              {elements}
            </div>
          }
        />
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the {deleteId?.includes(",") ? "selected careers" : "career posting"}.
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
    </>
  );
}
