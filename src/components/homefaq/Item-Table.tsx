import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "../data-table-column-header";
import { toast } from "sonner";
import { TableShimmer } from "../table-shimmer";
import { ViewInfoSheet } from "./ViewInfoSheet";
import type { homefaq } from "@/types/homefaq";
import { useDeleteHomefaq } from "@/hooks/homefaq";
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

interface TableProps {
  pkgs: homefaq[];
  isLoading: boolean;
  onEdit: (item: homefaq) => void; // New prop
}

export function ItemTable({ pkgs, isLoading, onEdit }: TableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedInfo, setSelectedInfo] = useState<homefaq | null>(null);
  const [itemToDelete, setItemToDelete] = useState<homefaq | null>(null);
  const { mutate: deleteInfo, isPending } = useDeleteHomefaq();
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const handleDelete = async (Id: string) => {
    await deleteInfo(Id, {
      onSuccess: () => {
        toast("Info deleted successfully");
        setDeleteDialogOpen(false);
      },
      onError: () => {
        toast("Failed to delete info");
      },
    });
  };

  const columns: ColumnDef<homefaq>[] = [
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
      accessorKey: "name",
      header: ({ column }) => <div className="w-20 text-center">S.N.</div>,
      cell: ({ row }) => (
        <div className="font-medium text-center">{row.index + 1}</div>
      ),
    },

    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Title" />
      ),
      cell: ({ row }) => (
        <div className="font-medium line-clamp-1 w-64">{row.original.name}</div>
      ),
    },
    {
      accessorKey: "category",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category" />
      ),
      cell: ({ row }) => (
        <div className="capitalize">{row.original.category}</div>
      ),
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Description" />
      ),
      cell: ({ row }) => (
        <div className="line-clamp-1">{row.original.description}</div>
      ),
    },

    {
      id: "actions",
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => (
        <div className="w-40 mx-auto flex items-center justify-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            title="View details"
            onClick={() => {
              setSelectedInfo(row.original);
              setViewDialogOpen(true);
            }}
          >
            <Eye className="h-5 w-5 text-primary hover:scale-110 cursor-pointer" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Edit"
            onClick={() => onEdit(row.original)}
          >
            <Edit className="h-5 w-5 text-primary hover:scale-110 cursor-pointer" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setItemToDelete(row.original);
              setDeleteDialogOpen(true);
            }}
          >
            <Trash2 className="h-5 w-5 text-red-500 hover:scale-110 cursor-pointer" />
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
        data={pkgs}
        filterColumn="name"
        filterPlaceholder="Filter info..."
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
              onClick={() => itemToDelete && handleDelete(itemToDelete._id)}
            >
              {"Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {selectedInfo && (
        <ViewInfoSheet
          info={selectedInfo}
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
          onEdit={() => {
            setViewDialogOpen(false);
            onEdit(selectedInfo);
          }}
        />
      )}
    </>
  );
}
