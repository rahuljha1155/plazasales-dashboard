"use client";
import * as React from "react";
import "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

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

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  showItemsPerPage = true,
  showPageInput = true,
  showPageInfo = true,
}: PaginationProps) {
  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const page = e.target.value ? Number(e.target.value) : 1;
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <div className="flex items-center justify-between ">
      {showPageInfo && (
        <div className="text-sm text-muted-foreground">
          Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} to{" "}
          {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
          {totalItems} items
        </div>
      )}

      <div className="flex pl-5 items-center justify-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          {"<<"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          {"<"}
        </Button>

        {showPageInput && (
          <div className="flex   items-center justify-center  px-4 gap-4">
            <span className="text-sm">Page</span>
            <Input
              type="number"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={handlePageInputChange}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const page = (e.target as HTMLInputElement).value ? Number((e.target as HTMLInputElement).value) : 1;
                  if (page >= 1 && page <= totalPages) {
                    onPageChange(page);
                  }
                }
              }}
              className="w-16 h-fit text-center"
            />
            <span className="text-sm">of {totalPages}</span>
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          {">"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
        >
          {">>"}
        </Button>

        {showItemsPerPage && onItemsPerPageChange && (
          <div className="flex items-center space-x-2 ml-4">
            <span className="text-sm">Show:</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => onItemsPerPageChange(Number(value))}
            >
              <SelectTrigger className="w-20 h-8">
                <SelectValue placeholder={itemsPerPage} />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 30, 50, 100].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
}
