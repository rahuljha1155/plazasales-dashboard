import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@iconify/react/dist/iconify.js";
import type { ISeoMetadata } from "@/types/ISeoMetadata";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "../data-table-column-header";

interface CreateDeletedSeoColumnsProps {
  onRecover: (ids: string[]) => void;
  onDestroy: (id: string) => void;
  isRecoverPending: boolean;
  isDestroyPending: boolean;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

export const createDeletedSeoColumns = ({
  onRecover,
  onDestroy,
  isRecoverPending,
  isDestroyPending,
  selectedIds,
  onSelectionChange,
}: CreateDeletedSeoColumnsProps): ColumnDef<ISeoMetadata>[] => [
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
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Title" />
      ),
      cell: ({ row }) => {
        const title = row.getValue("title") as string;
        return (
          <div className="flex flex-col gap-1">
            <span className="font-medium text-sm">{title}</span>
            <span className="text-xs text-muted-foreground">{row.original.slug}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "entityType",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Entity Type" />
      ),
      cell: ({ row }) => {
        const entityType = row.getValue("entityType") as string;
        const colorMap: Record<string, string> = {
          PRODUCT: "bg-blue-100 text-blue-800",
          BRAND: "bg-purple-100 text-purple-800",
          CATEGORY: "bg-green-100 text-green-800",
          SUBCATEGORY: "bg-yellow-100 text-yellow-800",
          BLOG: "bg-pink-100 text-pink-800",
        };
        return (
          <Badge className={colorMap[entityType] || "bg-gray-100 text-gray-800"}>
            {entityType || "Whole Site"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const description = row.getValue("description") as string;
        return (
          <div className="max-w-[300px] truncate text-sm text-muted-foreground">
            {description}
          </div>
        );
      },
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Deleted At" />
      ),
      cell: ({ row }) => {
        const date = row.getValue("updatedAt") as string;
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
              <DropdownMenuItem
                onClick={() => onRecover([seo.id])}
                disabled={isRecoverPending}
              >
                <Icon icon="solar:restart-bold" className="mr-2" width="16" />
                Recover
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDestroy(seo.id)}
                disabled={isDestroyPending}
                className="text-red-600 focus:text-red-600"
              >
                <Icon icon="solar:trash-bin-minimalistic-bold" className="mr-2" width="16" />
                Delete Forever
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
