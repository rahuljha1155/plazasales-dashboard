import { useState } from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Loader, MoreHorizontal, Trash2, Eye, FilePenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import EditImportantSheet from "./EditInsuranceSheet";
import CreateImportantNoticeSheet from "./CreateInsuranceSheet";
import {
  useDeleteInsurance,
  useGetInsuranceByPackageId,
  type Insurance,
} from "@/hooks/useInsurance";
import { TableShimmer } from "@/components/table-shimmer";
import { InsuranceViewModal } from "./InsuranceViewModal";

export default function InsuranceListPage() {
  const params = useParams();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [deletingId, setDeletingId] = useState<string>("");
  const [showCreatePage, setShowCreatePage] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingSeason, setViewingSeason] = useState<any | null>(null);
  const { data: response, isLoading } = useGetInsuranceByPackageId(
    params.id as string,
    pagination.pageIndex + 1,
    pagination.pageSize
  );

  // Get the data from the paginated response
  const importantNotices = response?.data || [];
  const paginationMeta = response?.pagination;
  const { mutateAsync: deleteRequirement, isPending: isDeleting } =
    useDeleteInsurance();

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

    { label: "Insurance", isActive: true },
  ];

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await deleteRequirement(id, {
        onSuccess: () => {
          toast.success("Insurance deleted successfully");
        },
        onError: (error) => {
          toast.error(error.message || "Failed to delete insurance");
        },
      });
      toast.success(" Item deleted successfully");
    } catch (error: any) {
      toast.error("Failed to delete insurance");
    }
  };

  const columns: ColumnDef<Insurance>[] = [
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
          className="prose prose-sm max-w-sm line-clamp-1"
          dangerouslySetInnerHTML={{ __html: row.original.description || "" }}
        />
      ),
    },

    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <div className="flex items-center">
          <div
            className={`h-2.5 w-2.5 rounded-full mr-2 ${row.original.isActive ? "bg-green-500" : "bg-gray-300"
              }`}
          ></div>
          {row.original.isActive ? "Active" : "Inactive"}
        </div>
      ),
    },
    // {
    //   accessorKey: "sortOrder",
    //   header: "Sort Order",
    //   cell: ({ row }) => row.getValue("sortOrder") || 0,
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
                variant="ghost"
                size="sm"
                onClick={() => setViewingSeason(item)}
                className="w-full justify-start"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingId(item._id)}
                className="w-full justify-start"
              >
                <FilePenLine className="h-4 w-4 mr-2" />
                Edit
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

  const table = useReactTable({
    data: importantNotices,
    columns,
    pageCount: paginationMeta?.totalPages || 0,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    manualPagination: true,
  });

  if (isLoading) {
    return <TableShimmer />;
  }

  // Show create form
  if (showCreatePage) {
    return (
      <div className="w-full flex flex-col">
        <Breadcumb links={links} />
        <CreateImportantNoticeSheet
          id={params.id || ""}
          onClose={() => setShowCreatePage(false)}
        />
      </div>
    );
  }

  // Show edit form if editing
  if (editingId) {
    return (
      <div className="w-full flex flex-col">
        <Breadcumb links={links} />
        <EditImportantSheet id={editingId} onClose={() => setEditingId(null)} />
      </div>
    );
  }
  return (
    <div className="w-full flex flex-col">
      <Breadcumb links={links} />

      <div className="flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
        <Input
          placeholder="Filter by title..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(e) =>
            table.getColumn("title")?.setFilterValue(e.target.value)
          }
          className="max-w-sm"
        />
        <Button
          onClick={() => setShowCreatePage(true)}
          variant="default"
          className=" justify-start gap-2"
        >
          <FilePenLine className="h-4 w-4" />
          Add Insurance
        </Button>
      </div>
      <div className="rounded-[2px] border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center h-24"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between px-2 py-4">
        <div className="text-sm text-muted-foreground">
          Showing{" "}
          {paginationMeta ? pagination.pageIndex * pagination.pageSize + 1 : 0}{" "}
          -{" "}
          {paginationMeta
            ? Math.min(
              (pagination.pageIndex + 1) * pagination.pageSize,
              paginationMeta.total
            )
            : 0}{" "}
          of {paginationMeta?.total || 0} items
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <div className="flex items-center gap-1">
            <span className="text-sm">
              Page {paginationMeta?.currentPage || 1} of{" "}
              {paginationMeta?.totalPages || 1}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>

      <InsuranceViewModal
        isOpen={!!viewingSeason}
        onClose={() => setViewingSeason(null)}
        insuranceData={viewingSeason}
      />
    </div>
  );
}
