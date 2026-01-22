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
import type { Category } from "@/hooks/useDownloadCategory";
import { useNavigate } from "react-router-dom";

interface DownloadCategoryTableColumnsProps {
  onEdit: (category: Category) => void;
  onView: (category: Category) => void;
  onDelete: (id: string) => void;
  isDeletePending: boolean;
  productId: string;
}

export const createDownloadCategoryColumns = ({
  onEdit,
  onView,
  onDelete,
  isDeletePending,
  productId,
}: DownloadCategoryTableColumnsProps): ColumnDef<Category>[] => [
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
        <div className="text-start font-semibold text-gray-700">S.N</div>
      ),
      cell: ({ row }) => (
        <div className="font-medium text-gray-600">{row.index + 1}</div>
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
          Title
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
      accessorKey: "subtitle",
      header: () => (
        <div className="font-semibold text-gray-700">Subtitle</div>
      ),
      cell: ({ row }) => (
        <div className="text-sm text-gray-600">{row.original.subtitle || "-"}</div>
      ),
    },
    {
      accessorKey: "kind",
      header: () => (
        <div className="font-semibold text-gray-700">Kind</div>
      ),
      cell: ({ row }) => (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
          {row.original.kind}
        </span>
      ),
    },
    {
      id: "contents",
      header: () => (
        <div className="font-semibold text-gray-700">View Content</div>
      ),
      enableHiding: false,
      cell: ({ row }) => {
        const navigate = useNavigate();
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <Button
              onClick={() => navigate(`/dashboard/download-category/${row.original.id}/contents/${productId}`)}
              variant="outline"
              size="sm"
              className="rounded-sm text-neutral-500 hover:bg-primary hover:text-white cursor-pointer hover:border-primary transition-colors"
            >
              <Icon icon="solar:eye-bold" className="mr-1.5" width="16" />
              View Downloads
            </Button>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="font-semibold text-gray-700">Actions</div>,
      enableHiding: false,
      cell: ({ row }) => {
        const category = row.original;

        return (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors"
                >
                  <Icon
                    icon="solar:menu-dots-bold"
                    width="18"
                    height="18"
                    className="text-gray-500"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>More Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="flex gap-2 items-center"
                  onClick={() => onView(category)}
                >
                  <Icon
                    icon="solar:eye-bold"
                    width="18"
                    height="18"
                    className="text-gray-500 hover:text-blue-600"
                  />
                  View Details
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="flex gap-2 items-center"
                  onClick={() => onEdit(category)}
                >
                  <Icon
                    icon="solar:pen-bold"
                    width="18"
                    height="18"
                    className="text-gray-500 hover:text-orange-600"
                  />
                  Edit Details
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <div className="flex cursor-pointer select-none items-center px-2 py-1.5 text-sm text-red-600 hover:bg-accent rounded-sm">
                      <Icon icon="solar:trash-bin-trash-bold" className="mr-2" width="16" />
                      Delete Category
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
                            Delete Download Category
                          </AlertDialogTitle>
                          <p className="text-sm text-gray-500 mt-1">
                            {category.title}
                          </p>
                        </div>
                      </div>
                      <AlertDialogDescription className="text-gray-600">
                        This action cannot be undone. This will permanently delete the
                        download category and all associated data from the system.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-lg">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-500 hover:bg-red-600 rounded-lg"
                        onClick={() => onDelete(category.id)}
                        disabled={isDeletePending}
                      >
                        <Icon icon="solar:trash-bin-trash-bold" className="mr-2" width="16" />
                        Delete Category
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
