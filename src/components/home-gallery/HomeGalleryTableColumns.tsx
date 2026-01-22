import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { Icon } from "@iconify/react/dist/iconify.js";
import { format } from "date-fns";
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
import type { HomeGalleryType } from "@/types/homegalleryType";
import { Badge } from "@/components/ui/badge";

interface GalleryTableColumnsProps {
  onEdit: (gallery: HomeGalleryType) => void;
  onView: (gallery: HomeGalleryType) => void;
  onDelete: (id: string) => void;
  isDeletePending: boolean;
}

export const createGalleryColumns = ({
  onEdit,
  onView,
  onDelete,
  isDeletePending,
}: GalleryTableColumnsProps): ColumnDef<HomeGalleryType>[] => [
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
      accessorKey: "centerImage",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-semibold text-gray-700 hover:text-gray-900"
        >
          Center Image
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center px-2">
          <div className="h-16 w-20 rounded-sm overflow-hidden border">
            <img
              src={row.original.centerImage}
              alt="Center"
              className="h-full w-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onView(row.original);
              }}
            />
          </div>
        </div>
      ),
    },
    {
      accessorKey: "sideImages",
      header: () => (
        <div className="font-semibold text-gray-700">Side Images</div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2 px-4">
          <Badge variant="outline" className="font-medium">
            {row.original.sideImages.length} images
          </Badge>
          <div className="flex -space-x-2">
            {row.original.sideImages.slice(0, 3).map((img, idx) => (
              <div
                key={idx}
                className="h-8 w-8 rounded-full overflow-hidden border-2 border-white"
              >
                <img
                  src={img}
                  alt={`Side ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
            {row.original.sideImages.length > 3 && (
              <div className="h-8 w-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                +{row.original.sideImages.length - 3}
              </div>
            )}
          </div>
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
          Created Date
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="px-4 text-gray-600">
          {format(new Date(row.original.createdAt), "MMM dd, yyyy")}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-end font-semibold text-gray-700">Actions</div>,
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex justify-end items-center gap-1 pr-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onView(row.original);
            }}
            className="h-8 w-8 text-zinc-400 hover:text-zinc-800"
            title="View Gallery"
          >
            <Icon icon="solar:eye-bold" className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(row.original);
            }}
            className="h-8 w-8 text-zinc-400 hover:text-zinc-800"
            title="Edit Gallery"
          >
            <Icon icon="solar:pen-bold" className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => e.stopPropagation()}
                className="h-8 w-8 text-zinc-400 hover:text-red-700 hover:bg-red-50"
                title="Delete Gallery"
                disabled={isDeletePending}
              >
                {isDeletePending ? (
                  <Icon icon="svg-spinners:90-ring-with-bg" className="h-4 w-4" />
                ) : (
                  <Icon icon="solar:trash-bin-minimalistic-bold" className="h-4 w-4" />
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Gallery?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will move the gallery to deleted items. You can recover it later.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(row.original.id);
                  }}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ];
