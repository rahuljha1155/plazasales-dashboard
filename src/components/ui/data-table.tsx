"use client";

import * as React from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pagination } from "../Pagination";
import { ChevronDown } from "lucide-react";
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  showItemsPerPage?: boolean;
  showPageInput?: boolean;
  showPageInfo?: boolean;
}
interface DataTableProps<TData, TValue, TMeta = unknown> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  elements?: React.ReactNode;
  filterColumn?: string;
  filterPlaceholder?: string;
  pagination: PaginationProps;
  title?: string;
  DraggableRow?: React.ComponentType<{
    id: string;
    company: TData;
    children: React.ReactNode;
  }>;
  getRowClassName?: (row: TData) => string;
  meta?: TMeta;
  onRowClick?: (row: TData) => void;
  onRowSelectionChange?: (selectedRows: TData[]) => void;
}

export function DataTable<TData extends { _id?: string; id?: string }, TValue, TMeta = unknown>({
  columns,
  data,
  title,
  elements,
  filterColumn,
  filterPlaceholder = "Filter...",
  DraggableRow,
  reorderMode,
  pagination,
  getRowClassName,
  meta,
  onRowClick,
  onRowSelectionChange,
}: DataTableProps<TData, TValue, TMeta> & { reorderMode?: boolean }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    manualPagination: true, // Enable manual pagination
    pageCount: pagination.totalPages, // Total number of pages from server
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex: pagination.currentPage - 1, // Convert to 0-based index
        pageSize: pagination.itemsPerPage,
      },
    },
    meta: meta as any,
  });

  // Notify parent of selection changes
  React.useEffect(() => {
    if (onRowSelectionChange) {
      const selectedRows = table.getFilteredSelectedRowModel().rows.map(row => row.original);
      onRowSelectionChange(selectedRows);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowSelection]);

  // Use all data if reorderMode, else use paginated data
  const rows = reorderMode
    ? table.getPrePaginationRowModel().rows
    : table.getRowModel().rows;

  return (
    <div className="space-y-4">
      <div className="flex justify-end p- pb-0  items-center gap-3">
        <div className="flex gap-2 w-full justify-between  items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 rounded-sm">
                <ChevronDown className="mr-2 h-4 w-4" />
                Columns Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" && column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex gap-4 items-center">
            {filterColumn && (
              <div className="flex items-center ">
                <Input
                  placeholder={filterPlaceholder}
                  value={
                    (table.getColumn(filterColumn)?.getFilterValue() as string) ?? ""
                  }
                  onChange={(event) =>
                    table.getColumn(filterColumn)?.setFilterValue(event.target.value)
                  }
                  className="w-xs rounded-sm py-1 bg-white"
                />
              </div>
            )}

            {elements}
          </div>
        </div>
      </div>
      <div className="border bg-white rounded-md overflow-hidden">
        <Table>
          <TableHeader className="">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} >
                {DraggableRow && (
                  <TableHead className="w-8 bg-zinc-50/70 p-1"></TableHead>
                )}
                {headerGroup.headers.map((header) => {
                  const isSelectOrDrag = header.id === 'select' || header.id === 'drag' || header.id === 'id';
                  return (
                    <TableHead 
                      key={header.id} 
                      className={`bg-zinc-50/70 p-2 ${isSelectOrDrag ? 'px-1' : 'px-3'}`}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="px-10">
            {rows.length ? (
              rows.map((row) => {
                const rowData = row.original;
                const rowClass = getRowClassName
                  ? getRowClassName(rowData)
                  : "";

                const handleRowClick = (e: React.MouseEvent) => {
                  // Don't trigger row click if clicking on interactive elements
                  const target = e.target as HTMLElement;
                  const isInteractiveElement = target.closest('button, a, input, select, textarea, [role="button"], [role="menuitem"]');

                  if (!isInteractiveElement && onRowClick) {
                    onRowClick(row.original);
                  }
                };

                if (DraggableRow) {
                  return (
                    <DraggableRow
                      key={row.id}
                      id={row.original._id || row.original.id || row.id}
                      company={row.original}

                    >
                      {row.getVisibleCells().map((cell) => {
                        const isSelectOrDrag = cell.column.id === 'select' || cell.column.id === 'drag' || cell.column.id === 'id';
                        return (
                          <TableCell
                            onClick={handleRowClick}
                            key={cell.id} 
                            className={`py-2 cursor-pointer ${isSelectOrDrag ? 'px-1' : 'px-3'}`}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        );
                      })}
                    </DraggableRow>
                  );
                }

                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={`hover:bg-zinc-50 ${onRowClick ? 'cursor-pointer' : ''} ${rowClass}`}
                    onClick={handleRowClick}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const isSelectOrDrag = cell.column.id === 'select' || cell.column.id === 'drag' || cell.column.id === 'id';
                      return (
                        <TableCell 
                          key={cell.id} 
                          className={`py-2 cursor-pointer ${isSelectOrDrag ? 'px-1' : 'px-3'}`}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (DraggableRow ? 1 : 0)}
                  className="h-24 text-center text-zinc-500"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between ">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center ">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            itemsPerPage={pagination.itemsPerPage}
            onPageChange={pagination.onPageChange}
            onItemsPerPageChange={pagination.onItemsPerPageChange}
          />
        </div>
      </div>
    </div>
  );
}
