import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Loader, MoreHorizontal, Trash2, FilePenLine, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { toast } from "sonner";
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

import Breadcumb from "@/components/dashboard/Breadcumb";
import { useParams, useSearchParams } from "react-router-dom";
import CreateAttractionSheet from "./CreateAttractionSheet";
import EditAttractionSheet from "./EditAttractionSheet";
import { useDeleteAttraction, useGetAttractions } from "@/hooks/useAttraction";
import { TableShimmer } from "@/components/table-shimmer";
import { DataTable } from "../ui/data-table";
import { AttractionViewModal } from "./AttractionViewModal";

interface Attraction {
  _id: string;
  title: string;
  description: string;
  image: string;
  days: string;
  package: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export default function AttractionListPage() {
  const params = useParams();

  const [deletingId, setDeletingId] = useState<string>("");
  const [showCreatePage, setShowCreatePage] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingAttraction, setViewingAttraction] = useState<Attraction | null>(null);

  const { data: attractionData = [], isLoading } = useGetAttractions(
    params.id as string
  );
  const { mutateAsync: deleteAttraction, isPending: isDeleting } =
    useDeleteAttraction();

  // ============= search params ===============///
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category");
  const subCategory = searchParams.get("subcategory");
  const packagename = searchParams.get("package");

  const links = [
    { label: "package" },
    { label: category || "Category" },
    { label: subCategory || "Subcategory" },
    { label: packagename || "Package" },

    { label: "Attraction", isActive: true },
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const totalPages = Math.max(
    1,
    Math.ceil((attractionData?.length || 0) / itemsPerPage)
  );
  // Ensure currentPage is within valid range
  const validCurrentPage = Math.min(currentPage, totalPages);
  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await deleteAttraction(id, {
        onSuccess: () => toast.success("Attraction deleted successfully"),
        onError: () => toast.error("Failed to delete attraction"),
      });
    } catch {
      toast.error("Unexpected error while deleting");
    } finally {
      setDeletingId("");
    }
  };

  const columns: ColumnDef<Attraction>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
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
    },
    {
      header: "S.N.",
      cell: ({ row }) => <div>{parseInt(row.id) + 1}</div>,
    },
    {
      accessorKey: "title",
      header: "Title",
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div
          className="line-clamp-1 max-w-md"
          dangerouslySetInnerHTML={{ __html: row.original.description || "" }}
        />
      ),
    },
    // {
    //   accessorKey: "days",
    //   header: "Days",
    // },

    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        return <span>{date.toLocaleDateString()}</span>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                {deletingId === item._id && isDeleting ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <MoreHorizontal className="h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => setViewingAttraction(item)}
              >
                <Eye className="h-4 w-4" />
                View Attraction
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => setEditingId(item._id)}
              >
                <FilePenLine className="h-4 w-4" />
                Edit Attraction
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <span className="flex cursor-pointer items-center text-sm text-red-500 gap-2 p-2 hover:bg-red-100 rounded">
                    <Trash2 className="w-4 h-4" />
                    Delete Item
                  </span>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. It will permanently delete the selected item.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-500 hover:bg-red-600"
                      onClick={() => handleDelete(item._id)}
                    >
                      Confirm
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (isLoading) return <TableShimmer />;

  if (showCreatePage) {
    return (
      <CreateAttractionSheet
        id={params.id || ""}
        onClose={() => setShowCreatePage(false)}
        onOpen={() => setShowCreatePage(true)}
      />
    );
  }

  if (editingId) {
    return (
      <EditAttractionSheet id={editingId} onClose={() => setEditingId(null)} />
    );
  }

  return (
    <div className="w-full flex flex-col">
      <Breadcumb links={links} />

      <div className="flex flex-col sm:flex-row items-center justify-end gap-4">
        <Button onClick={() => setShowCreatePage(true)}>
          + Create Attraction
        </Button>
      </div>

      <div className="">
        <DataTable
          data={attractionData || []}
          columns={columns}
          filterColumn="title"
          filterPlaceholder="Search attractions..."
          pagination={{
            itemsPerPage: itemsPerPage,
            currentPage: validCurrentPage - 1, // Convert to 0-based for the Pagination component
            totalItems: attractionData?.length || 0,
            totalPages: totalPages,
            onPageChange: (page) => setCurrentPage(page + 1), // Convert back to 1-based
            onItemsPerPageChange: (newItemsPerPage) => {
              setItemsPerPage(newItemsPerPage);
              setCurrentPage(1);
            },
            showItemsPerPage: true,
            showPageInput: true,
            showPageInfo: true,
          }}
        />

        <AttractionViewModal
          isOpen={!!viewingAttraction}
          onClose={() => setViewingAttraction(null)}
          attractionData={viewingAttraction}
        />
      </div>
    </div>
  );
}
