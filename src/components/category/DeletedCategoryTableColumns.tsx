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
import type { IDeletedCategory } from "@/types/ICategory";

interface DeletedCategoryTableColumnsProps {
  onRecover: (id: string) => void;
  onDestroyPermanently: (id: string) => void;
  isRecoverPending: boolean;
  isDestroyPending: boolean;
}

export const createDeletedCategoryColumns = ({
  onRecover,
  onDestroyPermanently,
  isRecoverPending,
  isDestroyPending,
}: DeletedCategoryTableColumnsProps): ColumnDef<IDeletedCategory>[] => [
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
          Category Name
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="px-4 flex gap-2 items-center">
          <div className="font-semibold text-gray-900">{row.original.title}</div>
        </div>
      ),
    },
    {
      accessorKey: "brand",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-semibold text-gray-700 hover:text-gray-900"
        >
          Brand
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="px-4 text-gray-600">
          {row.original.brand?.name || "N/A"}
        </div>
      ),
    },
    {
      accessorKey: "deletedAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-semibold text-gray-700 hover:text-gray-900"
        >
          Deleted At
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="px-4 text-gray-600">
          {new Date(row.original.deletedAt).toLocaleDateString("en-US", {
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
        const category = row.original;

        return (
          <div className="flex items-center gap-2">
            {/* Recover Button */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-sm text-green-600 hover:bg-green-50 hover:text-green-700 hover:border-green-600 transition-colors"
                  disabled={isRecoverPending}
                >
                  <Icon icon="solar:refresh-bold" className="mr-1.5" width="16" />
                  Recover
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
                        Recover Category
                      </AlertDialogTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        {category.title}
                      </p>
                    </div>
                  </div>
                  <AlertDialogDescription className="text-gray-600">
                    This will restore the category and make it available again in the system.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-lg">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-green-500 hover:bg-green-600 rounded-lg"
                    onClick={() => onRecover(category.id)}
                  >
                    <Icon icon="solar:refresh-bold" className="mr-2" width="16" />
                    Recover Category
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Permanently Delete Button */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-sm text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-600 transition-colors"
                  disabled={isDestroyPending}
                >
                  <Icon icon="solar:trash-bin-trash-bold" className="mr-1.5" width="16" />
                  Delete Forever
                </Button>
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
                        {category.title}
                      </p>
                    </div>
                  </div>
                  <AlertDialogDescription className="text-gray-600">
                    <span className="font-semibold text-red-600">Warning:</span> This action cannot be undone.
                    This will <span className="font-semibold">permanently delete</span> the category
                    and all associated data from the system forever.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-lg">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-500 hover:bg-red-600 rounded-lg"
                    onClick={() => onDestroyPermanently(category.id)}
                  >
                    <Icon icon="solar:trash-bin-trash-bold" className="mr-2" width="16" />
                    Delete Forever
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
  ];
