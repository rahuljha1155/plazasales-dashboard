import React, { useState, useEffect, useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Loader, MoreHorizontal, Trash2, Eye, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

import Breadcrumb from "@/components/dashboard/Breadcumb";
import { useParams, useSearchParams } from "react-router-dom";
import CreatePackageInfoSheet from "./CreatePackageInfoSheet";
import {
  useDeletePackageInfo,
  useGetPackageInfos,
} from "@/hooks/usePackageInfo";
import { TableShimmer } from "@/components/table-shimmer";
import { DataTable } from "../ui/data-table";
import { PackageInfoViewModal } from "./PackageInfoViewModal";

interface PackageInfo {
  _id: string;
  package: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export default function PackageInfoListPage() {
  const params = useParams();
  const [deletingId, setDeletingId] = useState<string>("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editingPackageInfo, setEditingPackageInfo] =
    useState<PackageInfo | null>(null);
  const [viewingPackageInfo, setViewingPackageInfo] =
    useState<PackageInfo | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
  });

  const { data: packageInfoData, isLoading } = useGetPackageInfos(
    params.id as string
  );

  // Calculate pagination values
  const itemsPerPage = 10; // Fixed items per page
  const totalItems = packageInfoData?.length || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const currentPage = Math.min(Math.max(1, pagination.currentPage), totalPages);

  // Calculate paginated data
  const paginatedData = useMemo(() => {
    if (!packageInfoData || packageInfoData.length === 0) return [];
    const start = (currentPage - 1) * itemsPerPage;
    return packageInfoData.slice(start, start + itemsPerPage);
  }, [packageInfoData, currentPage, itemsPerPage]);

  // Reset to first page if data changes and current page is invalid
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setPagination((prev) => ({
        ...prev,
        currentPage: 1,
      }));
    }
  }, [totalPages, currentPage]);
  const { mutateAsync: deletePackageInfo, isPending: isDeleting } =
    useDeletePackageInfo();

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

    { label: "Package Info", isActive: true },
  ];

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await deletePackageInfo(id);
      toast.success("Item deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete item");
    } finally {
      setDeletingId("");
    }
  };

  const handleEditClick = (packageInfo: PackageInfo) => {
    setEditId(packageInfo._id);
    setEditingPackageInfo(packageInfo);
  };

  const handleAddNew = () => {
    setEditId("");
    setEditingPackageInfo(null);
  };

  const columns: ColumnDef<PackageInfo>[] = [
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
    // {
    //   accessorKey: "title",
    //   header: "Title",
    // },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div
          className="prose prose-sm max-w-md line-clamp-1"
          dangerouslySetInnerHTML={{ __html: row.original.description || "" }}
        />
      ),
    },
    {
      accessorKey: "sortOrder",
      header: "Order",
    },
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
              <DropdownMenuItem
                onClick={() => setViewingPackageInfo(item)}
                className="cursor-pointer"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Package Info
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleEditClick(item)}
                className="cursor-pointer"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Essential Info
              </DropdownMenuItem>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    className="cursor-pointer text-red-500 focus:bg-red-100"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Item
                  </DropdownMenuItem>
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

  return (
    <div className="w-full flex flex-col">
      <div className="flex flex-col sm:flex-row items-end justify-between py-4 gap-4">
        <Breadcrumb links={links} />
        <Button onClick={handleAddNew}>Add Essential Info</Button>
      </div>

      {editId !== null ? (
        <CreatePackageInfoSheet
          id={params.id || ""}
          editId={editId}
          packageInfo={editingPackageInfo}
          onClose={() => {
            setEditId(null);
            setEditingPackageInfo(null);
          }}
        />
      ) : (
        <div className="rounded-[2px] border">
          <DataTable
            columns={columns}
            data={paginatedData}
            pagination={{
              totalPages,
              currentPage,
              totalItems,
              itemsPerPage: itemsPerPage,
              onPageChange: (page) => {
                setPagination((prev) => ({
                  ...prev,
                  currentPage: page,
                }));
              },
              onItemsPerPageChange: (newItemsPerPage) => {
                setPagination({
                  currentPage: 1,
                  itemsPerPage: newItemsPerPage,
                });
              },
              showItemsPerPage: false, // Hide items per page selector since we're fixing it to 10
              showPageInfo: true,
            }}
          />
        </div>
      )}
      <PackageInfoViewModal
        isOpen={!!viewingPackageInfo}
        onClose={() => setViewingPackageInfo(null)}
        packageInfoData={viewingPackageInfo}
      />
    </div>
  );
}
