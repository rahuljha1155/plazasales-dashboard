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

interface DeletedGalleryTableColumnsProps {
  onView: (gallery: HomeGalleryType) => void;
  onDestroy: (id: string) => void;
  onRecover: (id: string) => void;
  isDestroyPending: boolean;
  isRecoverPending: boolean;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

export const createDeletedGalleryColumns = ({
  onView,
  onDestroy,
  onRecover,
  isDestroyPending,
  isRecoverPending,
  selectedIds,
  onSelectionChange,
}: DeletedGalleryTableColumnsProps): ColumnDef<HomeGalleryType>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => {
          table.toggleAllPageRowsSelected(!!value);
          if (value) {
            const allIds = table.getRowModel().rows.map((row) => row.original.id);
            onSelectionChange(allIds);
          } else {
            onSelectionChange([]);
          }
        }}
        aria-label="Select all"
        className="ml-2"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={selectedIds.includes(row.original.id)}
        onCheckedChange={(value) => {
          const id = row.original.id;
          if (value) {
            onSelectionChange([...selectedIds, id]);
          } else {
            onSelectionChange(selectedIds.filter((selectedId) => selectedId !== id));
          }
        }}
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
        <div className="h-16 w-20 rounded-sm overflow-hidden border opacity-60">
          <img
            src={row.original.centerImage}
            alt="Center"
            className="h-full w-full object-cover"
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
        <div className="flex -space-x-2 opacity-60">
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
    accessorKey: "deletedAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="font-semibold text-gray-700 hover:text-gray-900"
      >
        Deleted Date
        <CaretSortIcon className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="px-4 text-gray-600">
        {row.original.deletedAt
          ? format(new Date(row.original.deletedAt), "MMM dd, yyyy")
          : "-"}
      </div>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-end font-semibold text-gray-700">Actions</div>,
    enableHiding: false,
    cell: ({ row }) => (
      <div className="flex justify-end items-center gap-4 pr-4 w-full">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onRecover(row.original.id);
          }}
          className=" text-green-600 w-fit! hover:text-green-700 hover:bg-green-50"
          title="Recover Gallery"
          disabled={isRecoverPending}
        >
          {isRecoverPending ? (
            <span className="border flex gap-3 items-center px-4 rounded-full py-1">Recovering <Icon icon="svg-spinners:90-ring-with-bg" className="h-4 w-4" /></span>
          ) : (
              <span className="border flex gap-3 items-center px-4 rounded-full py-1">Recover <Icon icon="solar:restart-bold" className="h-4 w-4" /></span>
          )}
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => e.stopPropagation()}
              className="w-fit! text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Destroy Permanently"
              disabled={isDestroyPending}
            >
              {isDestroyPending ? (
                <span className="border flex gap-3 items-center px-4 rounded-full py-1">Deleting<Icon icon="svg-spinners:90-ring-with-bg" className="h-4 w-4" /></span>
              ) : (
                  <span className="border flex gap-3 items-center px-4 rounded-full py-1">Delete <Icon icon="solar:trash-bin-minimalistic-bold" className="h-4 w-4" /></span>
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Permanently Destroy Gallery?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. The gallery will be permanently deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.stopPropagation();
                  onDestroy(row.original.id);
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                Destroy Forever
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    ),
  },
];
