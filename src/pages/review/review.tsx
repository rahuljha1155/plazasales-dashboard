import { useEffect, useState } from "react";
import { TableShimmer } from "@/components/table-shimmer";
import Breadcrumb from "@/components/dashboard/Breadcumb";
import { api } from "@/services/api";
import { toast } from "sonner";
import { Star, Eye, Trash2, MoreVertical, Check, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ReviewViewModal } from "./ReviewViewModal";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Pagination } from "@/components/Pagination";

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TestimonialType {
  _id: string;
  packageId: {
    _id: string;
    name: string;
  };
  fullName: string;
  image?: string;
  rating: number;
  comment: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const links = [{ label: "Reviews", isActive: true }];

export default function ReviewPage() {
  const [testimonials, setTestimonials] = useState<TestimonialType[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [averageRating, setAverageRating] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTestimonial, setSelectedTestimonial] =
    useState<TestimonialType | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<TestimonialType | null>(
    null
  );

  const fetchTestimonials = async (page: number = 1, limit: number = 10) => {
    try {
      setIsLoading(true);
      const response = await api.get(`/testimonial`, {
        params: { page, limit },
      });

      if (response.data) {
        const { data, pagination } = response.data;
        setTestimonials(data);
        setPagination({
          total: pagination.total,
          page: pagination.currentPage,
          limit: pagination.itemsPerPage,
          totalPages: pagination.totalPages,
        });

        if (data.length > 0) {
          const totalRating = data.reduce(
            (sum: number, item: TestimonialType) => sum + item.rating,
            0
          );
          setAverageRating(totalRating / data.length);
        }
      }
    } catch (error) {
      toast.error("Failed to load testimonials");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTestimonial = async () => {
    if (!selectedTestimonial) return;

    try {
      setIsDeleting(true);
      await api.delete(`/testimonial/${selectedTestimonial._id}`);
      toast.success("Review deleted successfully");
      fetchTestimonials(pagination.page, pagination.limit);
    } catch (error) {
      toast.error("Failed to delete review");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setSelectedTestimonial(null);
    }
  };

  const handleUpdateStatus = async (
    testimonial: TestimonialType,
    isActive: boolean
  ) => {
    try {
      setIsUpdating(true);
      await api.patch(`/testimonial/${testimonial._id}`, { isActive });
      toast.success(
        `Review ${isActive ? "approved" : "rejected"} successfully`
      );
      fetchTestimonials(pagination.page, pagination.limit);
    } catch (error) {
      toast.error("Failed to update review status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleViewDetails = (testimonial: TestimonialType) => {
    setSelectedReview(testimonial);
    setShowViewModal(true);
  };

  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`w-5 h-5 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-primary"
            }`}
        />
      ));
  };

  const columns: ColumnDef<TestimonialType>[] = [
    {
      accessorKey: "fullName",
      header: "Reviewer",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
            {row.original.image ? (
              <img
                src={row.original.image}
                alt={row.original.fullName}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <span className="text-gray-600 font-medium">
                {row.original.fullName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <p className="font-medium">{row.original.fullName}</p>
            <p className="text-sm text-gray-500">
              {format(new Date(row.original.createdAt), "MMM d, yyyy")}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "packageId.name",
      header: "Package",
    },
    {
      accessorKey: "rating",
      header: "Rating",
      cell: ({ row }) => (
        <div className="flex items-center">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${i < row.original.rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
                  }`}
              />
            ))}
        </div>
      ),
    },
    {
      accessorKey: "comment",
      header: "Comment",
      cell: ({ row }) => (
        <p className="line-clamp-2 max-w-xs">{row.original.comment}</p>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant={row.original.isActive ? "default" : "secondary"}
          className={
            row.original.isActive
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }
        >
          {row.original.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleViewDetails(row.original)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                handleUpdateStatus(row.original, !row.original.isActive)
              }
            >
              {row.original.isActive ? (
                <X className="mr-2 h-4 w-4" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              {row.original.isActive ? "Deactivate" : "Activate"}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => {
                setSelectedTestimonial(row.original);
                setShowDeleteDialog(true);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  useEffect(() => {
    fetchTestimonials();
  }, []);

  return (
    <div className="container mx-auto py-4">
      <div className="flex items-center justify-between ">
        <Breadcrumb links={links} />
      </div>

      {/* <div className="bg-white rounded-sm border p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Customer Reviews</h2>
            <p className="text-gray-500">
              Manage and moderate customer testimonials
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
            <div className="flex justify-center mt-1">
              {renderStars(Math.round(averageRating))}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {pagination.total} total reviews
            </p>
          </div>
        </div>
      </div> */}

      <div className="bg-white  overflow-hidden">
        {isLoading ? (
          <TableShimmer />
        ) : (
          // In your review.tsx or wherever you use DataTable
          <DataTable
            columns={columns}
            data={testimonials}
            filterColumn="fullName"
            pagination={{
              currentPage: pagination.page - 1, // Convert to 0-based if needed
              totalPages: pagination.totalPages,
              totalItems: pagination.total,
              itemsPerPage: pagination.limit,
              onPageChange: (page: number) =>
                fetchTestimonials(page + 1, pagination.limit),
              onItemsPerPageChange: (limit: number) =>
                fetchTestimonials(1, limit),
            }}
          />
        )}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              review.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDeleteTestimonial}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ReviewViewModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        reviewData={selectedReview}
      />
    </div>
  );
}
