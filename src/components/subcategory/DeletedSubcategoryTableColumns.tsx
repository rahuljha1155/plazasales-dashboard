import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { Icon } from "@iconify/react/dist/iconify.js";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { IDeletedSubcategory } from "@/types/ISubcategory";
import { MoreVertical, RotateCcw, Trash2 } from "lucide-react";

interface DeletedSubcategoryTableColumnsProps {
  onRecover: (id: string) => void;
  onDestroyPermanently: (id: string) => void;
  isRecoverPending: boolean;
  isDestroyPending: boolean;
}

export const createDeletedSubcategoryColumns = ({
  onRecover,
  onDestroyPermanently,
  isRecoverPending,
  isDestroyPending,
}: DeletedSubcategoryTableColumnsProps): ColumnDef<IDeletedSubcategory>[] => [
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
          className="ml-2"
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
      accessorKey: "sortOrder",
      header: () => (
        <div className="text-start font-semibold text-gray-700">No.</div>
      ),
      cell: ({ row }) => (
        <div className="font-medium text-gray-600">{row.index + 1}</div>
      ),
    },
    {
      accessorKey: "coverImage",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-semibold text-gray-700 hover:text-gray-900"
        >
          Image
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center px-2">
          <div className="h-12 w-16 rounded-sm border border-gray-100 bg-white p-1.5 overflow-hidden">
            <img
              src={row.original.coverImage || ""}
              alt={row.original.title}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      ),
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-semibold text-gray-700 hover:text-gray-900"
        >
          Subcategory Name
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="px-4 flex gap-2 items-center cursor-pointer">
          <div className="font-semibold ">{row.original.title}</div>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-semibold text-gray-700 hover:text-gray-900"
        >
          Category
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="px-4 text-gray-600">
          {row.original.category?.title || "N/A"}
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-semibold text-gray-700 hover:text-gray-900"
        >
          Created At
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="px-4 text-gray-600">
          {new Date(row.original.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="font-semibold text-gray-700">Actions</div>,
      enableHiding: false,
      cell: ({ row }) => {
        const subcategory = row.original;

        return (
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                  <MoreVertical className="w-4 h-4 rotate-90" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onRecover(subcategory.id)}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Recover
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <div className="flex cursor-pointer select-none items-center px-2 py-1.5 text-sm text-red-600 hover:bg-accent rounded-sm">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Forever
                    </div>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                          <Icon
                            icon="solar:danger-bold"
                            className="text-red-600"
                            width="24"
                          />
                        </div>
                        <div>
                          <AlertDialogTitle className="text-lg">
                            Delete Permanently
                          </AlertDialogTitle>
                          <p className="text-sm text-gray-500 mt-1">
                            {subcategory.title}
                          </p>
                        </div>
                      </div>
                      <AlertDialogDescription className="text-gray-600">
                        <span className="font-semibold text-red-600">Warning:</span> This action cannot be undone.
                        This will <span className="font-semibold">permanently delete</span> the subcategory
                        and all associated data from the system forever.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-lg">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-500 hover:bg-red-600 rounded-lg"
                        onClick={() => onDestroyPermanently(subcategory.id)}
                      >
                        <Icon icon="solar:trash-bin-trash-bold" className="mr-2" width="16" />
                        Delete Forever
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
