import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Icon } from "@iconify/react/dist/iconify.js";
import type { ISeoMetadata } from "@/types/ISeoMetadata";
import { EntityType } from "@/types/ISeoMetadata";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "../data-table-column-header";

interface CreateSeoColumnsProps {
  onEdit: (seo: ISeoMetadata) => void;
  onView: (seo: ISeoMetadata) => void;
  onDelete: (id: string) => void;
  isDeletePending: boolean;
  onWholeSiteEdit?: (seo: ISeoMetadata) => void;
}

export const createSeoColumns = ({
  onWholeSiteEdit,
  onEdit,
  onView,
  onDelete,
  isDeletePending,
}: CreateSeoColumnsProps): ColumnDef<ISeoMetadata>[] => [
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
          className="translate-y-[2px] ml-2"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Title" />
      ),
      cell: ({ row }) => {
        const title = row.getValue("title") as string;
        return (
          <div className="flex flex-col gap-1">
            <span className="font-medium text-sm ">{title}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "slug",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Entity Type" />
      ),
      cell: ({ row }) => {
        const entityType = row.getValue("slug") as string;
        return (
          <code >
            {entityType}
          </code>
        );
      },
    },
    {
      accessorKey: "isIndexable",
      header: "Indexable",
      cell: ({ row }) => {
        const isIndexable = row.getValue("isIndexable") as boolean;
        return <span className={`flex items-center -ml-3 ${isIndexable ? "text-green-500" : "text-red-500"}`}>{isIndexable ? <Icon icon="icon-park-outline:dot" className="mr-2" width="20" /> : <Icon icon="icon-park-outline:dot" className="mr-2" width="20" />} {isIndexable ? "Indexable" : "Not Indexable"}</span>
      }
    },
    {
      accessorKey: "isOptimized",
      header: "Optimized",
      cell: ({ row }) => {
        const isOptimized = row.getValue("isOptimized") as boolean;
        return <span className={`flex items-center -ml-3 ${isOptimized ? "text-green-500" : "text-red-500"}`}>{isOptimized ? <Icon icon="icon-park-outline:dot" className="mr-2" width="20" /> : <Icon icon="icon-park-outline:dot" className="mr-2" width="20" />} {isOptimized ? "Optimized" : "Not Optimized"}</span>
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as string;
        return (
          <span className="text-sm text-muted-foreground">
            {format(new Date(date), "MMM dd, yyyy")}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const seo = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <Icon icon="solar:menu-dots-bold" width="20" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onView(seo)}>
                <Icon icon="solar:eye-bold" className="mr-2" width="16" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                if (seo.entityType === EntityType.SITE || !seo.entityType) {
                  onWholeSiteEdit?.(seo);
                } else {
                  onEdit(seo);
                }
              }}>
                <Icon icon="solar:pen-bold" className="mr-2" width="16" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(seo.id)}
                disabled={isDeletePending}
                className="text-red-600 focus:text-red-600"
              >
                <Icon icon="solar:trash-bin-minimalistic-bold" className="mr-2" width="16" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
