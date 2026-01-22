"use client";

import { useState, useMemo, useEffect } from "react";

import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  PaginationState,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Icon } from "@iconify/react";

import { Button } from "@/components/ui/button";

import { Checkbox } from "@/components/ui/checkbox";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  TableHead,
} from "@/components/ui/table";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

import { Badge } from "../ui/badge";

import { TableShimmer } from "../table-shimmer";

import type { Booking } from "@/types/booking";

import BookingSheet from "./Booking-Sheet";

import { useDeleteBooking } from "@/hooks/useBooking";

import { format } from "date-fns";

import { useMarkSeen } from "@/hooks/useUnseenCount";

import { Input } from "@/components/ui/input";

interface TableProps {
  pkgs: Booking[];
  isLoading: boolean;
}

const STORAGE_KEY = "booking-table-pagination";

// Helper functions for sessionStorage
const getStoredPagination = (): PaginationState | null => {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const setStoredPagination = (pagination: PaginationState) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(pagination));
  } catch {
  }
};

export function ItemTable({ pkgs, isLoading }: TableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "edit">("table");
  const { mutate: deleteBooking, isPending } = useDeleteBooking();
  const { mutateAsync: markSeenBooking } = useMarkSeen("bookings");

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  // Initialize pagination from sessionStorage
  const [pagination, setPagination] = useState<PaginationState>(() => {
    const stored = getStoredPagination();
    return stored || { pageIndex: 0, pageSize: 10 };
  });

  // Save pagination to sessionStorage whenever it changes
  useEffect(() => {
    setStoredPagination(pagination);
  }, [pagination]);

  const handleDelete = (bookingId: string) => {
    deleteBooking(bookingId, {
      onSuccess: () => {
        toast("Booking deleted successfully");
        setDeleteDialogOpen(false);
      },
      onError: () => {
        toast("Failed to delete booking");
      },
    });
  };

  const getRowClassName = (booking: Booking) => {
    return !booking.seen
      ? "!font-bold !text-black bg-gray-100"
      : "!font-medium !text-zinc-500 bg-white ";
  };

  const columns: ColumnDef<Booking>[] = useMemo(() => [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          className="ml-3"
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
          className="ml-3"
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "bookingReference",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="S.N." />
      ),
      cell: ({ row }) => (
        <div className=" text-sm ">
          {row.index + 1}
        </div>
      ),
    },
    {
      accessorKey: "package",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Package" />
      ),
      cell: ({ row }) => {
        const pkg = row.original.package;
        return (
          <div className=" line-clamp-1">
            {typeof pkg === "object" ? pkg?.name : "N/A"}
          </div>
        );
      },
      filterFn: (row, id, value) => {
        const pkg = row.original.package;
        const packageName = typeof pkg === "object" ? pkg?.name || "" : "";
        return packageName.toLowerCase().includes(value.toLowerCase());
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.original.status;
        const isUnseen = !row.original.seen;

        const badgeStyle = isUnseen
          ? "bg-primary text-white border-yellow-500"
          : status === "confirmed"
            ? "border border-green-500 text-green-500 "
            : status === "pending"
              ? "border border-orange-500 text-primary"
              : "bg-red-100 text-red-800 border-red-200";

        return (
          <Badge
            variant="outline"
            className={`py-[2px] px-3 text-xs ${badgeStyle}`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Booked On" />
      ),
      cell: ({ row }) => (
        <div className="text-sm ">
          <div>{format(new Date(row.original.createdAt), "MMM d, yyyy")}</div>
          <div className="text-xs text-muted-foreground">
            {format(new Date(row.original.createdAt), "h:mm a")}
          </div>
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-left">Actions</div>,
      cell: ({ row }) => {
        const booking = row.original; // Get the booking object for this row
        return (
          <div className="flex items-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-gray-100 cursor-pointer"
                    onClick={async () => {
                      setSelectedBooking(booking);
                      setViewMode("edit");
                      // Call markSeenBooking with the booking's _id
                      await markSeenBooking(booking._id);
                    }}
                  >
                    <Icon
                      icon="mynaui:eye"
                      width="16"
                      height="16"
                      className=" hover:text-primary"
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View details</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-red-50 cursor-pointer"
                    onClick={() => {
                      setBookingToDelete(booking);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Icon
                      icon="ic:baseline-delete"
                      width="16"
                      height="16"
                      className=" hover:text-red-500"
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete booking</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      },
    },
  ], [markSeenBooking, setSelectedBooking, setViewMode, setBookingToDelete, setDeleteDialogOpen]);

  const table = useReactTable({
    data: pkgs,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    autoResetPageIndex: false,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  });

  if (isLoading) return <TableShimmer />;

  return (
    <>
      <div className="space-y-4" style={{ display: viewMode === "table" ? "block" : "none" }}>
        <div className="flex items-end justify-between">
          <div className="flex items-center justify-between ">
            <h1 className="text-xl font-bold tracking-tight">
              Incoming Bookings
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search by package name..."
              value={
                (table.getColumn("package")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("package")?.setFilterValue(event.target.value)
              }
              className="max-w-sm lg:max-w-md"
            />
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
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => {
                  const booking = row.original;
                  return (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className={getRowClassName(booking)}
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
                  );
                })
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

        <div className="flex items-center justify-end">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.firstPage()}
              disabled={!table.getCanPreviousPage()}
            >
              {"<<"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              {"<"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              {">"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.lastPage()}
              disabled={!table.getCanNextPage()}
            >
              {">>"}
            </Button>
            <span className="text-sm">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </span>
            <span className="text-sm ml-2">| Go to page:</span>
            <Input
              type="number"
              value={table.getState().pagination.pageIndex + 1}
              onChange={(e) => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0;
                table.setPageIndex(page);
              }}
              className="w-16"
            />
          </div>
        </div>

        <AlertDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
        >
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
                  bookingToDelete && handleDelete(bookingToDelete._id)
                }
                className="bg-red-500 hover:bg-red-500"
              >
                {isPending ? "Confirming..." : "Confirm"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {selectedBooking && (
        <BookingSheet
          bookingData={selectedBooking as any}
          onOpenChange={(open: any) => {
            if (!open) {
              setSelectedBooking(null);
              setViewMode("table");
            }
          }}
        />
      )}
    </>
  );
}
