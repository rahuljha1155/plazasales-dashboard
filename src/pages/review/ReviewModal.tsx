import { X } from "lucide-react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { TestimonialType } from "@/types/TestimonialType";

interface ReviewModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  review: TestimonialType | null;
}

export function ReviewModal({
  isOpen,
  onOpenChange,
  review,
}: ReviewModalProps) {
  if (!review) return null;

  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`w-5 h-5 ${
            i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
        />
      ));
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <div className="flex justify-between items-center">
            <AlertDialogTitle>Review Details</AlertDialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </AlertDialogHeader>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {review.image ? (
                  <img
                    src={review.image}
                    alt={review.fullName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-2xl text-gray-500">
                    {review.fullName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{review.fullName}</h3>
                <div className="flex items-center">
                  <div className="flex">{renderStars(review.rating)}</div>
                  <span className="ml-2 text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="mt-2">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    review.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {review.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-500">Comment</h4>
            <p className="mt-1 text-gray-700 whitespace-pre-line">
              {review.comment}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
            <div>
              <span className="text-gray-500">Package:</span>
              <p className="font-medium">{review.packageId.name}</p>
            </div>
            <div>
              <span className="text-gray-500">Created:</span>
              <p className="font-medium">
                {new Date(review.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Last Updated:</span>
              <p className="font-medium">
                {new Date(review.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
