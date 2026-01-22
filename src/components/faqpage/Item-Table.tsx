import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash2, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "../data-table-column-header";
import { toast } from "sonner";
import { TableShimmer } from "../table-shimmer";
import type { usefulInfo } from "@/types/usefulinfo";
import { useDeleteUsefulInfo } from "@/hooks/usefulInfo";

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
import type { IFAQ } from "@/types/IFaq";
import { useNavigate } from "react-router-dom";

interface PaginationProps {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

interface TableProps {
  pkgs: IFAQ[];
  isLoading: boolean;
  onView: (item: IFAQ) => void;
  onEdit: (item: IFAQ) => void;
  onRefetch?: () => void;
  pagination: PaginationProps;
  element?: React.ReactNode;
  onRowSelectionChange?: (selectedRows: IFAQ[]) => void;
}

export function ItemTable({ pkgs, isLoading, onView, onEdit, onRefetch, pagination, element, onRowSelectionChange }: TableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<IFAQ | null>(null);
  const { mutate: deleteInfo, isPending } = useDeleteUsefulInfo();
  const navigate = useNavigate();

  const handleDelete = async (Id: string) => {
    await deleteInfo(Id, {
      onSuccess: () => {
        toast("Info deleted successfully");
        setDeleteDialogOpen(false);
        onRefetch?.();
      },
      onError: () => {
        toast("Failed to delete info");
      },
    });
  };

  const columns: ColumnDef<IFAQ>[] = [
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
      accessorKey: "sno",
      header: ({ column }) => <div className="w-20 ">S.N.</div>,
      cell: ({ row, table }) => {
        const currentPage = table.getState().pagination?.pageIndex || 0;
        const pageSize = table.getState().pagination?.pageSize || 10;
        return (
          <div className="font-medium  ">
            {currentPage * pageSize + row.index + 1}
          </div>
        );
      },
    },

    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Title" />
      ),
      cell: ({ row }) => (
        <div className="font-medium line-clamp-1 w-96">{row.original.title}</div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => (
        <div className="w-32 mx-auto flex items-center justify-center ">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onView(row.original)}
            className="hover:bg-transparent cursor-pointer"
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
            onClick={() => onEdit(row.original)} // Use the onEdit prop
            className="cursor-pointer"
          >
            <Icon
              icon="mynaui:edit-one"
              width="16"
              height="16"
              className="text-zinc-400 hover:text-red-500"
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setItemToDelete(row.original);
              setDeleteDialogOpen(true);
            }}
            className="cursor-pointer"
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
        data={pkgs}
        elements={element}
        onRowClick={(faq) => onView(faq)}
        onRowSelectionChange={onRowSelectionChange}
        filterColumn="title"
        filterPlaceholder="Filter FAQs..."
        pagination={{
          totalItems: pagination.totalItems,
          currentPage: pagination.currentPage,
          itemsPerPage: pagination.itemsPerPage,
          onPageChange: pagination.onPageChange,
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
              className="bg-red-500 hover:bg-red-600"
              onClick={() => itemToDelete && handleDelete(itemToDelete.id)}
            >
              {"Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
