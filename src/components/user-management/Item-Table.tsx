"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/ui/data-table";
import { useDeleteUser, type User } from "@/hooks/useAdmin";
import { TableShimmer } from "@/components/table-shimmer";
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
import { toast } from "sonner";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useUserStore } from "@/store/userStore";


interface TableProps {
  users: User[];
  isLoading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
  onViewUser: (user: User) => void;
  onEditUser: (user: User) => void;
  element?: React.ReactNode;
  onRowSelectionChange?: (selectedRows: User[]) => void;
}

export function UserTable({ users, isLoading, pagination, onPageChange, onViewUser, onEditUser, element, onRowSelectionChange }: TableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dataToDelete, setDataToDelete] = useState<User | null>(null);
  const { mutateAsync: deleteUser, isPending } = useDeleteUser();
  const { user } = useUserStore()

  const handleDeleteUser = async (id: string) => {
    await deleteUser(id, {
      onSuccess: () => {
        toast("User deleted successfully");
        setDeleteDialogOpen(false);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to delete user");
      },
    });
  };

  const columns: ColumnDef<User>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          className="ml-3"
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
          className="ml-3"
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => <div>{row.original.email}</div>,
    },
    {
      accessorKey: "firstname",
      header: "First Name",
      cell: ({ row }) => <div>{row.original.firstname}</div>,
    },
    {
      accessorKey: "lastname",
      header: "Last Name",
      cell: ({ row }) => <div>{row.original.lastname}</div>,
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => <div>{row.original.phone}</div>,
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <span className={`font- ${row.original.role.toLowerCase() === "admin" ? "" : ""} capitalize`}>{row.original.role.toLocaleLowerCase()}</span>
      ),
    },
    {
      accessorKey: "isVerified",
      header: "Verified",
      cell: ({ row }) => (
        <>
          {row.original.isVerified ? (
            <span className="text-green-500 flex gap-2 items-center "><Icon icon="garden:check-badge-fill-12" width="16" height="16" className=" size-5 ml-1" /></span>
          ) : (
              <span className="text-red-500 flex gap-2 items-center "><Icon icon="zondicons:close-solid" width="16" height="16" className=" size-5 ml-1" /></span>
          )}
        </>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-center items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onViewUser(row.original)}
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
            onClick={() => onEditUser(row.original)}
          >
            <Icon
              icon="mynaui:edit-one"
              width="16"
              height="16"
              className="text-zinc-400 hover:text-red-500"
            />
          </Button>
          {
            user?.role.toLocaleLowerCase() === "admin" && (
              <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setDataToDelete(row.original);
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
            )
          }
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
        data={users}
        elements={element}
        onRowClick={(user) => onViewUser(user)}
        onRowSelectionChange={onRowSelectionChange}
        filterColumn="email"
        filterPlaceholder="Filter users..."
        pagination={{
          totalItems: pagination.total,
          itemsPerPage: pagination.limit,
          totalPages: pagination.totalPages,
          currentPage: pagination.page,
          onPageChange: onPageChange,
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
              onClick={() =>
                dataToDelete && handleDeleteUser(dataToDelete?.id)
              }
            >
              {"Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
