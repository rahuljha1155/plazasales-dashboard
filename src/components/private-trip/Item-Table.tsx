"use client";
import { useState, Suspense } from "react";
import type { privateTripData } from "@/hooks/usePrivateTrip";
import {
  useGetPrivateTrips,
  useDeletePrivateTrip,
  useDeleteManyPrivateTrips,
} from "@/hooks/usePrivateTrip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { TableShimmer } from "@/components/table-shimmer";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  type ColumnFiltersState,
  flexRender,
} from "@tanstack/react-table";
import { format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import PrivateTripViewSheet from "./PrivateTripViewSheet";
import { Icon } from "@iconify/react/dist/iconify.js";

interface TableProps {
  trips: privateTripData[];
  isLoading: boolean;
}

export function PrivateTripTable({ trips, isLoading }: TableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<privateTripData | null>(null);

  const { mutate: deleteOne, isPending: deleting } = useDeletePrivateTrip();
  const { mutate: deleteMany, isPending: deletingMany } =
    useDeleteManyPrivateTrips();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const [viewOpen, setViewOpen] = useState(false);
  const [viewTrip, setViewTrip] = useState<privateTripData | null>(null);

  const handleDelete = (id: string) => {
    deleteOne(id, {
      onSuccess: () => {
        toast("Private trip deleted");
        setDeleteDialogOpen(false);
      },
      onError: () => toast("Failed to delete"),
    });
  };

  const columns: ColumnDef<privateTripData>[] = [
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
      accessorKey: "sn",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="S.N." />
      ),
      cell: ({ row }) => (
        <div className="font-mono text-sm font-medium text-zinc-500">
          {row.index + 1}
        </div>
      ),
    },
    {
      accessorKey: "leadTravellerName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Lead Traveller" />
      ),
      cell: ({ row }) => (
        <div className="font-medium text-zinc-700 capitalize">
          {row.original.leadTravellerName}
        </div>
      ),
    },
    {
      accessorKey: "numberOfTraveller",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Package Name" />
      ),
      cell: ({ row }) => (
        <div className="text-sm text-gray-900">
          {row.original.package.name}
        </div>
      ),
    },

    {
      accessorKey: "phone",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Phone" />
      ),
      cell: ({ row }) => (
        <div className="text-sm text-zinc-600">{row.original.phone}</div>
      ),
    },
    {
      accessorKey: "country",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Country" />
      ),
      cell: ({ row }) => (
        <div className="text-sm text-zinc-600">{row.original.country}</div>
      ),
    },
    {
      accessorKey: "date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Arrival Date" />
      ),
      cell: ({ row }) => (
        <div className="text-sm text-gray-900">
          {format(new Date(row.original.date), "MMM d, yyyy")}
        </div>
      ),
    },
    {
      accessorKey: "numberOfTraveller",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="No. Of Travellers" />
      ),
      cell: ({ row }) => (
        <div className="text-sm text-gray-900">
          {row.original.numberOfTraveller}
        </div>
      ),
    },

    {
      id: "actions",
      header: () => <div className="text-left">Actions</div>,
      cell: ({ row }) => {
        const trip = row.original;
        return (
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-transparent text-zinc-400 hover:text-blue-600 cursor-pointer"
                    onClick={() => {
                      setViewTrip(trip);
                      setViewOpen(true);
                    }}
                  >
                    <Icon icon="mdi:eye" width="16" height="16" />
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
                    className="hover:bg-transparent text-zinc-400 hover:text-red-500 cursor-pointer"
                    onClick={() => {
                      setTripToDelete(trip);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Icon icon="ic:baseline-delete" width="16" height="16" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: trips,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  if (isLoading) return <TableShimmer />;

  return (
    <>
      {
        viewOpen ? <PrivateTripViewSheet
          trip={viewTrip}
          open={viewOpen}
          onOpenChange={setViewOpen}
        /> : (
          <div className="space-y-4">
            <div className="flex items-end justify-between">
              <div className="flex items-center justify-between ">
                <h1 className="text-xl font-bold tracking-tight">
                  Private Trips
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Filter by country..."
                  value={
                    (table.getColumn("country")?.getFilterValue() as string) ?? ""
                  }
                  onChange={(event) =>
                    table.getColumn("country")?.setFilterValue(event.target.value)
                  }
                  className="max-w-sm"
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

            <div className="flex items-center justify-end">
              <div className="flex-1 text-sm text-muted-foreground">
                {table.getFilteredSelectedRowModel().rows.length} of{" "}
                {table.getFilteredRowModel().rows.length} row(s) selected.
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  className="bg-red-500 hover:bg-red-600 text-white"
                  size="sm"
                  disabled={
                    table.getFilteredSelectedRowModel().rows.length === 0 ||
                    deletingMany
                  }
                  onClick={() => {
                    const ids = table
                      .getFilteredSelectedRowModel()
                      .rows.map((r) => r.original._id);
                    deleteMany(ids, {
                      onSuccess: () => toast("Selected items deleted"),
                      onError: () => toast("Failed to delete"),
                    });
                  }}
                >
                  delete
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.firstPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  « First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  ‹ Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  Next ›
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.lastPage()}
                  disabled={!table.getCanNextPage()}
                >
                  Last »
                </Button>
              </div>
            </div>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete private trip</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the
                    selected private trip.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    disabled={deleting}
                    onClick={() => setDeleteDialogOpen(false)}
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 hover:bg-red-700 text-white"
                    disabled={!tripToDelete || deleting}
                    onClick={() => tripToDelete && handleDelete(tripToDelete._id)}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )
      }


    </>
  );
}

export default function PrivateTripTableContainer() {
  const { data, isLoading } = useGetPrivateTrips();
  return (
    <Suspense fallback={<TableShimmer />}>
      <PrivateTripTable trips={(data || []) as privateTripData[]} isLoading={isLoading} />
    </Suspense>
  );
}
