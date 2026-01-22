"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
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
import { PageContentViewModal } from "./PageContentViewModal";
import type { PageContent } from "@/types/pages";
import { useDeletePage } from "@/hooks/usePages";
import { Icon } from "@iconify/react/dist/iconify.js";

interface PageTableProps {
  pages: PageContent[];
  isLoading: boolean;
  onEdit: (page: PageContent) => void;
}

export function PageTable({ pages, isLoading, onEdit }: PageTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<PageContent | null>(null);
  const [viewingPage, setViewingPage] = useState<PageContent | null>(null);
  const { mutate: deletePage, isPending } = useDeletePage();
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    total: 0,
  });

  const handleDelete = async (pageId: string) => {
    await deletePage(pageId, {
      onSuccess: () => {
        toast("Page deleted successfully");
        setDeleteDialogOpen(false);
      },
      onError: () => {
        toast("Failed to delete page");
      },
    });
  };

  const formatDate = (date?: Date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "draft":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "archived":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
      default:
        return "bg-orange-100 text-orange-800 hover:bg-orange-100";
    }
  };

  const columns: ColumnDef<PageContent>[] = [
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
      accessorKey: "image",
      header: "Image",
      cell: ({ row }) => (
        <div className="w-10 h-10 relative">
          <img
            src={row.original.image || "/placeholder.svg?height=40&width=40"}
            alt={row.original.title}
            width={40}
            height={40}
            className="h-10 w-10 object-cover rounded"
          />
        </div>
      ),
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Title" />
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.original.title}</div>
      ),
    },
    {
      accessorKey: "slug",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Slug" />
      ),
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">{row.original.slug}</div>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        <Badge
          className={getStatusColor(row.original.status)}
          variant="outline"
        >
          {row.original.status || "draft"}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      cell: ({ row }) => <div>{formatDate(row.original.createdAt)}</div>,
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Updated" />
      ),
      cell: ({ row }) => <div>{formatDate(row.original.updatedAt)}</div>,
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewingPage(row.original)}
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
            onClick={() => onEdit(row.original)}
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
              setPageToDelete(row.original);
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
        data={pages}
        filterColumn="title"
        filterPlaceholder="Filter pages..."
        pagination={{
          currentPage: pagination.page,
          totalItems: pagination.total,
          itemsPerPage: pagination.limit,
          totalPages: pagination.totalPages,
          onPageChange: (page) => {
            setPagination({ ...pagination, page });
          },
        }}
      />

      <PageContentViewModal
        isOpen={!!viewingPage}
        onClose={() => setViewingPage(null)}
        pageData={viewingPage as any}
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
              onClick={() =>
                pageToDelete?._id && handleDelete(pageToDelete._id)
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
