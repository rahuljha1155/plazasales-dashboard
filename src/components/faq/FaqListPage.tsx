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
import CreateFaqSheet from "./CreateFaqSheet";
import EditFaqSheet from "./EditFaqSheet";
import { useDeleteFaq, useGetFaqs } from "@/hooks/useFaq";
import { TableShimmer } from "@/components/table-shimmer";
import { FaqViewModal } from "./FaqViewModal";
interface Faq {
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

export default function FaqListPage() {
  const [showCreatePage, setShowCreatePage] = useState(false);
  const [editingId, setEditingId] = useState<string>("");
  const params = useParams();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [deletingId, setDeletingId] = useState<string>("");
  const [viewingFaq, setViewingFaq] = useState<Faq | null>(null);
  const { data: itineraryData, isLoading } = useGetFaqs(params.id as string);
  const { mutateAsync: deleteFaq, isPending: isDeleting } = useDeleteFaq();
  // const { data: allFaqs, isLoading: isLoadingAllFaqs } = useGetAllFaqs({
  //   page: 1,
  //   limit: 1000,
  // });

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

    { label: "Faq", isActive: true },
  ];

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);

      await deleteFaq(id, {
        onSuccess: () => {
          toast.success("Item deleted successfully");
        },
        onError: (error) => {
          toast.error("Failed to delete itinerary");
        },
      });
      toast.success("Item deleted successfully");
    } catch (error: any) {
      toast.error("Failed to delete itinerary");
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
    },
    {
      header: "S.N.",
      cell: ({ row }) => <div>{parseInt(row.id) + 1}</div>,
    },
    {
      accessorKey: "title",
      header: "Question",
    },
    {
      accessorKey: "description",
      header: "Answer",
      cell: ({ row }) => (
        <div
          className="prose prose-sm max-w-sm line-clamp-1"
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
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={() => setViewingFaq(item)}
              >
                <Eye className="w-4 h-4" />
                View FAQ
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={() => setEditingId(item._id)}
              >
                <Edit className="w-4 h-4" />
                Edit FAQ
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
    data: itineraryData,
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

  if (showCreatePage) {
    return (
      <CreateFaqSheet
        id={params.id || ""}
        onClose={() => setShowCreatePage(false)}
      />
    );
  }
  if (editingId) {
    return <EditFaqSheet id={editingId} onClose={() => setEditingId("")} />;
  }
  return (
    <div className="w-full flex flex-col">
      <Breadcumb links={links} />
      {/* <pre>{JSON.stringify(allFaqs, null, 2)}</pre> */}
      <div className="flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
        <Input
          placeholder="Filter by title..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(e) =>
            table.getColumn("title")?.setFilterValue(e.target.value)
          }
          className="max-w-sm"
        />
        <Button onClick={() => setShowCreatePage(true)} variant="default">
          Add FAQ
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
      {/* Pagination Controls (Optional) */}
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

      <FaqViewModal
        isOpen={!!viewingFaq}
        onClose={() => setViewingFaq(null)}
        faqData={viewingFaq}
      />
    </div>
  );
}
