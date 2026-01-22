import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash2, Eye, Check, X } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "../data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { TableShimmer } from "../table-shimmer";
import { HomeTestimonialViewModal } from "./HomeTestimonialViewModal";
import type { HomeTestimonialType } from "@/types/HomeTestimonialType";
import { useDeleteHomeTestimonial } from "@/hooks/useHomeTestimonial";
import { api } from "@/services/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Icon } from "@iconify/react/dist/iconify.js";

interface TestimonialTableProps {
  testimonials: HomeTestimonialType[];
  isLoading: boolean;
  onEdit: (testimonial: HomeTestimonialType) => void;
  onRefetch: () => void;
}

export function TestimonialTable({
  testimonials,
  isLoading,
  onEdit,
  onRefetch,
}: TestimonialTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] =
    useState<HomeTestimonialType | null>(null);
  const [testimonialToDelete, setTestimonialToDelete] =
    useState<HomeTestimonialType | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { mutate: deleteTestimonial, isPending } = useDeleteHomeTestimonial();

  const handleDelete = async (id: string) => {
    await deleteTestimonial(id, {
      onSuccess: () => {
        toast.success("Testimonial deleted successfully");
        setDeleteDialogOpen(false);
        onRefetch();
      },
      onError: () => {
        toast.error("Failed to delete testimonial");
      },
    });
  };

  const handleUpdateStatus = async (
    testimonial: HomeTestimonialType,
    isActive: boolean
  ) => {
    try {
      setIsUpdating(true);
      await api.patch(`/home-testimonial/${testimonial._id}`, { isActive });
      toast.success(
        `Testimonial ${isActive ? "activated" : "deactivated"} successfully`
      );
      onRefetch();
    } catch (error) {
      toast.error("Failed to update testimonial status");
    } finally {
      setIsUpdating(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <span
          key={i}
          className={`text-lg ${i < rating ? "text-yellow-400" : "text-gray-300"
            }`}
        >
          ★
        </span>
      ));
  };

  const columns: ColumnDef<HomeTestimonialType>[] = [
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
      header: ({ column }) => <div className="w-14 ">S.N.</div>,
      cell: ({ row }) => (
        <div className="font-medium ">{row.index + 1}</div>
      ),
    },
    {
      accessorKey: "image",
      header: "Avatar",
      cell: ({ row }) => (
        <div className="h-10 w-10 rounded-[2px] bg-gray-100 flex items-center justify-center overflow-hidden">
          {row.original.image ? (
            <img
              src={row.original.image}
              alt={row.original.fullName}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-gray-600 font-medium">
              {row.original.fullName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "fullName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.fullName}</div>
          {/* <div className="text-sm text-gray-500">
            {format(new Date(row.original.createdAt), "MMM d, yyyy")}
          </div> */}
        </div>
      ),
    },
    {
      accessorKey: "rating",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Rating" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center">
          {renderStars(row.original.rating)}
          <span className="ml-2 text-sm text-gray-600">
            ({row.original.rating}/5)
          </span>
        </div>
      ),
    },
    {
      accessorKey: "comment",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Comment" />
      ),
      cell: ({ row }) => (
        <div className="max-w-xs">
          <p
            className="line-clamp-1 text-sm"
            dangerouslySetInnerHTML={{ __html: row.original.comment }}
          ></p>
        </div>
      ),
    },
    // {
    //   accessorKey: "isActive",
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} title="Status" />
    //   ),
    //   cell: ({ row }) => (
    //     <Badge
    //       variant={row.original.isActive ? "default" : "secondary"}
    //       className={
    //         row.original.isActive
    //           ? "bg-green-100 text-green-800"
    //           : "bg-red-100 text-red-800"
    //       }
    //     >
    //       {row.original.isActive ? "Active" : "Inactive"}
    //     </Badge>
    //   ),
    // },
    {
      id: "actions",
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => (
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedTestimonial(row.original);
              setViewDialogOpen(true);
            }}
            className="h-8 w-8 p-0"
            title="View details"
          >
            <Icon
              icon="mynaui:eye"
              width="16"
              height="16"
              className="text-zinc-400 hover:text-red-500"
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(row.original)}
            className="h-8 w-8 p-0"
            title="Edit"
          >
            <Icon
              icon="mynaui:edit-one"
              width="16"
              height="16"
              className="text-zinc-400 hover:text-red-500"
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              handleUpdateStatus(row.original, !row.original.isActive)
            }
            disabled={isUpdating}
            className="h-8 w-8 p-0"
            title={row.original.isActive ? "Deactivate" : "Activate"}
          >
            {row.original.isActive ? (
              <X className="h-4 w-4 text-zinc-400" />
            ) : (
              <Check className="h-4 w-4 text-green-500" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setTestimonialToDelete(row.original);
              setDeleteDialogOpen(true);
            }}
            className="h-8 w-8 p-0"
            title="Delete"
          >
            <Icon
              icon="ic:baseline-delete"
              width="16"
              height="16"
              className="text-zinc-400 hover:text-red-500"
            />
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <TableShimmer />;
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={testimonials}
        filterColumn="fullName"
        filterPlaceholder="Filter testimonials..."
        pagination={{
          currentPage: 0,
          totalPages: 1,
          totalItems: testimonials.length,
          itemsPerPage: testimonials.length,
          onPageChange: () => { },
        }}
      />

      <HomeTestimonialViewModal
        isOpen={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        testimonialData={selectedTestimonial}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
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
              className="bg-red-500 hover:bg-red-600"
              onClick={() =>
                testimonialToDelete && handleDelete(testimonialToDelete._id)
              }
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
