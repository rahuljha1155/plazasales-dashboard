import { useState, useEffect } from "react";
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
  ChevronsLeft,
  ChevronsRight,
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
import CreatePaxSheet from "./CreatePaxSheet.tsx";
import EditPaxSheet from "./EditPaxSheet.tsx";
import { useDeletePax, useGetPaxes } from "@/hooks/usePax";
import { TableShimmer } from "@/components/table-shimmer.tsx";
import { PaxViewModal } from "./PaxViewModal";

export default function PaxListPage() {
  const params = useParams();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  // const [paxData, setPaxData] = useState<PaxData[]>([]);
  const [deletingId, setDeletingId] = useState<string>("");
  const [isCreatePaxOpen, setIsCreatePaxOpen] = useState(false);
  const [editingPaxId, setEditingPaxId] = useState<string | null>(null);
  const [viewingPax, setViewingPax] = useState<PaxData | null>(null);
  const {
    data: paxData,
    isLoading,
    refetch,
  } = useGetPaxes(params.id as string);

  const { mutateAsync: deletePax, isPending: isDeleting } = useDeletePax();

  interface PaxData {
    _id: string;
    min: number;
    max: number;
    discount: number;
    createdAt: string;
    updatedAt: string;
  }

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

    { label: "Pax", isActive: true },
  ];

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);

      await deletePax(id, {
        onSuccess: () => {
          setDeletingId("");

          toast.success("Pax deleted successfully");
        },
        onError: (error: any) => {
          toast.error("Failed to delete pax");
        },
      });
    } catch (error: any) {
      toast.error("Failed to delete pax");
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() &&
            table.getIsSomePageRowsSelected()
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
      accessorKey: "min",
      header: "Min",
      cell: ({ row }) => (
        <div className="flex items-center">
          <span>{row.getValue("min")}</span>
        </div>
      ),
    },
    {
      accessorKey: "max",
      header: "Max",
      cell: ({ row }) => (
        <div className="flex items-center">
          <span>{row.getValue("max")}</span>
        </div>
      ),
    },
    {
      accessorKey: "discount",
      header: "Price Per Person",
      cell: ({ row }) => (
        <div className="flex items-center">
          <span>US$ {row.getValue("discount")}</span>
        </div>
      ),
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
      accessorKey: "S.N.",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            S.N.
          </Button>
        );
      },
      cell: ({ row }) => <div>{parseInt(row.id) + 1}</div>,
    },

    {
      id: "actions",
      header: "Actions",
      enableHiding: false,
      cell: ({ row }) => {
        const item = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                {deletingId === item.id && isDeleting ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <MoreHorizontal className="h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="max-h-[400px] overflow-y-hidden"
            >
              <DropdownMenuLabel className="">Actions</DropdownMenuLabel>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => setViewingPax(item)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Pax
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => setEditingPaxId(item._id)}
              >
                <FilePenLine className="h-4 w-4 mr-2" />
                Edit
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <span className=" flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-red-500/90 gap-2 group">
                    <span className=" bg-red-600/10 group-hover:bg-red-600/20 p-1 rounded-full">
                      <Trash2 className="w-4 h-4" />
                    </span>{" "}
                    Delete Item
                  </span>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. It will permanently delete
                      the selected item.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className=" bg-red-500/90 hover:bg-red-500"
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
    data: paxData,
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

  if (isCreatePaxOpen) {
    return (
      <div className="container mx-auto p-6">
        <CreatePaxSheet
          id={params.id as string}
          isOpen={isCreatePaxOpen}
          onClose={() => setIsCreatePaxOpen(false)}
        />
      </div>
    );
  }

  // Show edit form if editing
  if (editingPaxId) {
    return (
      <div className="container mx-auto p-6">
        <EditPaxSheet
          id={editingPaxId}
          onClose={() => {
            setEditingPaxId(null);
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
            placeholder="Filter by item name..."
            value={
              (table.getColumn("discount")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("discount")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setIsCreatePaxOpen(true)}
              className="justify-start gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                className="w-4 h-4"
              >
                <path
                  fill="currentColor"
                  d="M18 12.998h-5v5a1 1 0 0 1-2 0v-5H6a1 1 0 0 1 0-2h5v-5a1 1 0 0 1 2 0v5h5a1 1 0 0 1 0 2"
                />
              </svg>
              Create Pax
            </Button>
          </div>
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
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex overflow-x-auto sm:justify-center">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronsLeft size={20} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft size={20} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight size={20} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <ChevronsRight size={20} />
              </Button>
              <span className="flex items-center gap-1">
                <div className="text-muted-foreground">Page</div>
                <div>
                  {table.getState().pagination.pageIndex + 1} of{" "}
                  {table.getPageCount()}
                </div>
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                | Go to page:
                <input
                  type="number"
                  min="1"
                  max={table.getPageCount()}
                  defaultValue={table.getState().pagination.pageIndex + 1}
                  onChange={(e) => {
                    table.getPageCount();
                    const page = e.target.value
                      ? Number(e.target.value) - 1
                      : 0;
                    page;
                    page < Number(table.getPageCount()) &&
                      table.setPageIndex(page);
                  }}
                  className=" p-1 rounded w-16 text-black dark:text-black  "
                />
              </span>
            </div>
          </div>
        </div>
      </div>

      <PaxViewModal
        paxData={viewingPax}
        isOpen={!!viewingPax}
        onClose={() => setViewingPax(null)}
      />
    </div>
  );
}
