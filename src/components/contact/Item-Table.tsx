import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
} from "@/components/ui/alert-dialog";

import { DataTableColumnHeader } from "../data-table-column-header";

import { toast } from "sonner";
import { TableShimmer } from "../table-shimmer";
import type { Contact } from "@/types/contact";
// import { Contact, useDeleteContact } from "@/hooks/contact/useContact";

interface TableProps {
  Datas: Contact[];
  isLoading: boolean;
}

export function ItemTable({ Datas, isLoading }: TableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<Contact | null>(null);
  const [dataToDelete, setDataToDelete] = useState<Contact | null>(null);
  // const [editDialogOpen, setEditDialogOpen] = useState(false);

  // const { mutate: deleteData, isPending } = useDeleteContact();

  const handleDelete = async (dataId: string) => {
    // await deleteData(dataId, {
    //   onSuccess: () => {
    //     toast("CostIncludes deleted successfully");
    //     setDeleteDialogOpen(false);
    //   },
    //   onError: () => {
    //     toast("Failed to delete CostIncludes");
    //   },
    // });
  };

  const columns: ColumnDef<Contact>[] = [
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
      accessorKey: "fullName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="fullName" />
      ),
      cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      cell: ({ row }) => <div>{row.original.email}</div>,
    },

    // {
    //   accessorKey: "phone",
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} title="Phone" />
    //   ),
    //   cell: ({ row }) => <div>{row.original.phone}</div>,
    // },
    {
      accessorKey: "message",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Message" />
      ),
      cell: ({ row }) => <div>{row.original.message}</div>,
    },

    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedData(row.original);
              // setEditDialogOpen(true);
            }}
          >
            <Edit className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setDataToDelete(row.original);
              setDeleteDialogOpen(true);
            }}
          >
            <Trash2 className="h-5 w-5" />
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
        data={Datas}
        filterColumn="fullName"
        filterPlaceholder="Filter packages..."
        pagination={{
          currentPage: 1,
          totalPages: 1,
          totalItems: 1,
          itemsPerPage: 10,
          onPageChange: () => { },
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
              // disabled={isPending}
              onClick={() => dataToDelete && handleDelete(dataToDelete._id)}
            >
              {"Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* {selectedData && (
        <ItemSheet
          open={editDialogOpen}
          onOpenChange={(open) => {
            setEditDialogOpen(open);
            if (!open) {
              setSelectedData(null);
            }
          }}
          Data={selectedData}
          onSuccess={() => {
            setEditDialogOpen(false);
            setSelectedData(null);
          }}
        />
      )} */}
    </>
  );
}
