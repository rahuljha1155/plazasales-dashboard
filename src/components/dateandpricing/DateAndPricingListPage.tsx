import React, { useState } from "react";
import { format } from "date-fns";
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
import {
  ChevronLeft,
  ChevronRight,
  FilePenLine,
  Loader,
  MoreHorizontal,
  Trash2,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useParams, useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
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
import CreateDateAndPricingSheet from "./CreateDateAndPricingSheet";
import { useDeleteFixedDate, useGetFixedDates } from "@/hooks/useDate";
import { TableShimmer } from "@/components/table-shimmer";
import EditDateAndPricingSheet from "./EditDateAndPricingSheet";
import { FixedDatesViewModal } from "./FixedDatesViewModal";

export default function DateAndPricingListPage() {
  const params = useParams();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState<string | null>(null);
  const [viewingData, setViewingData] = useState<any | null>(null);
  const {
    data: collection,
    isLoading,
    refetch,
  } = useGetFixedDates(params.id as string);
  const { mutateAsync: deleteFixedDate, isPending: isDeleting } =
    useDeleteFixedDate();

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

    { label: "Date and Pricing", isActive: true },
  ];

  const deletePackage = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteFixedDate(id, {
        onSuccess: () => {
          toast.success("Date range deleted successfully");
          refetch();
        },
        onError: (error) => {
          toast.error(error.message || "Failed to delete date range");
        },
      });
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setDeletingId(null);
    }
  };

  const columns: ColumnDef<any>[] = [
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
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "startDate",
      header: "Start Date",
      cell: ({ row }) => (
        <div className="capitalize">
          {format(new Date(row.getValue("startDate")), "PPP")}
        </div>
      ),
    },
    {
      accessorKey: "endDate",
      header: "End Date",
      cell: ({ row }) => (
        <div className="capitalize">
          {format(new Date(row.getValue("endDate")), "PPP")}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("status")}</div>
      ),
    },
    {
      accessorKey: "numberOfPerson",
      header: "Persons",
      cell: ({ row }) => <div>{row.getValue("numberOfPerson")}</div>,
    },
    {
      accessorKey: "pricePerPerson",
      header: "Price Per Person",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("pricePerPerson"));


        return <div>US$ {amount}</div>;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => setViewingData(item)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={(e) => {
                  e.stopPropagation();
                  if (item?._id) {
                    setEditingId(item._id);
                  } else {
                    toast.error("Could not find item ID for editing");
                  }
                }}
              >
                <FilePenLine className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <div className="px-1 py-1">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
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
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => deletePackage(item._id)}
                        disabled={isDeleting && deletingId === item._id}
                      >
                        {isDeleting && deletingId === item._id ? (
                          <Loader className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Confirm
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: Array.isArray(collection) ? collection : [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  if (isLoading) {
    return <TableShimmer />;
  }

  if (editingId) {
    return (
      <div className="container mx-auto p-6">
        <EditDateAndPricingSheet
          id={editingId}
          onClose={() => {
            setEditingId(null);
            refetch();
          }}
        />
      </div>
    );
  }

  if (isCreating) {
    return (
      <div className="container mx-auto p-6">
        <CreateDateAndPricingSheet
          id={isCreating}
          onClose={() => {
            setIsCreating(null);
            refetch();
          }}
        />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col justify-between">
      <div>
        <Breadcumb links={links} />
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between py-4">
          <Input
            placeholder="Filter by date..."
            value={
              (table.getColumn("startDate")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("startDate")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />

          <div className="flex items-center gap-4">
            <Button
              onClick={() => setIsCreating(params.id as string)}
              className="justify-start gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M18 12.998h-5v5a1 1 0 0 1-2 0v-5H6a1 1 0 0 1 0-2h5v-5a1 1 0 0 1 2 0v5h5a1 1 0 0 1 0 2"
                />
              </svg>
              Dates and Pricing
            </Button>{" "}
          </div>
        </div>
        <div className="rounded-[2px] border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
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
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <FixedDatesViewModal
        isOpen={!!viewingData}
        onClose={() => setViewingData(null)}
        dateData={viewingData}
      />
    </div>
  );
}
