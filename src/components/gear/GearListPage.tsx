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
import {
  ChevronLeft,
  ChevronRight,
  Loader,
  MoreHorizontal,
  Trash2,
  Eye,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

import Breadcrumb from "@/components/dashboard/Breadcumb";
import { useParams, useSearchParams } from "react-router-dom";
import CreateGearSheet from "./CreateGearSheet";
import EditGearSheet from "./EditGearSheet";
import { useDeleteGear, useGetGear } from "@/hooks/useGear";
import { TableShimmer } from "@/components/table-shimmer";
import type { Gear } from "@/types/gear";
import { GearViewModal } from "./GearViewModal";

export default function GearListPage() {
  const params = useParams();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [deletingId, setDeletingId] = useState<string>("");
  const [editId, setEditId] = useState<string | null>(null);
  const [viewingGear, setViewingGear] = useState<Gear | null>(null);

  const { data: gearData, isLoading } = useGetGear(params.id as string);
  const { mutateAsync: deleteGear, isPending: isDeleting } = useDeleteGear();

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
    { label: "Gear", isActive: true },
  ];

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await deleteGear(id);
      toast.success("Gear deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete gear");
    } finally {
      setDeletingId("");
    }
  };

  const columns: ColumnDef<Gear>[] = [
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
          className="prose prose-sm max-w-md line-clamp-1"
          dangerouslySetInnerHTML={{ __html: row.original.description || "" }}
        />
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
                className="cursor-pointer"
                onClick={() => setViewingGear(item)}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Gear
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setViewingGear(null);
                  setEditId(item._id);
                }}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Edit className="h-4 w-4" />
                Edit
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

  const table = useReactTable({
    data: gearData || [],
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

  if (isLoading) return <TableShimmer />;

  return (
    <div className="w-full flex flex-col">
      <Breadcrumb links={links} />


      {editId === "" ? (
        <CreateGearSheet
          id={params.id as string}
          onClose={() => setEditId(null)}
        />
      ) : editId ? (
        <EditGearSheet id={editId} onClose={() => setEditId(null)} />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
            <Input
              placeholder="Filter by title..."
              value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
              onChange={(e) =>
                table.getColumn("title")?.setFilterValue(e.target.value)
              }
              className="max-w-sm"
            />
            <Button onClick={() => setEditId("")}>Add Gear</Button>
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
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() ? "selected" : undefined}
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
        </>
      )}

      <div className="flex items-center justify-end space-x-2 py-4">
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

      <GearViewModal
        isOpen={!!viewingGear}
        onClose={() => setViewingGear(null)}
        gearData={viewingGear}
      />
    </div>
  );
}
