import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { Star, User, Calendar, MessageSquare, Eye } from "lucide-react";

interface ReviewData {
  _id: string;
  name: string;
  email: string;
  rating: number;
  review: string;
  status: "approved" | "pending" | "rejected";
  createdAt: string;
  updatedAt: string;
}

interface ReviewViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviewData: any | null;
}

export function ReviewViewModal({
  isOpen,
  onClose,
  reviewData,
}: ReviewViewModalProps) {
  if (!reviewData) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${index < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
      />
    ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto [&>button]:top-2 [&>button]:right-2 [&>button]:z-10">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <MessageSquare className="h-6 w-6" />
              Customer Review
            </DialogTitle>
            <Badge
              variant="secondary"
              className={getStatusColor(reviewData.status)}
            >
              {reviewData.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-muted/50 p-4 rounded-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{reviewData.name}</span>
              </div>
              <div className="flex items-center gap-1">
                {renderStars(reviewData.rating)}
                <span className="ml-2 text-sm text-muted-foreground">
                  ({reviewData.rating}/5)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {reviewData.email}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-medium">Submitted:</span>{" "}
                  {format(new Date(reviewData.createdAt), "PPP")}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-medium">Status:</span>{" "}
                  {reviewData.status}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Review Content */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Review</h3>
            <div className="bg-gray-50 p-4 rounded-sm border-l-4 border-blue-500">
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: reviewData.review }}
              />
            </div>
          </div>

          {/* Rating Breakdown */}
          <div className="bg-muted/50 p-4 rounded-sm">
            <h3 className="text-lg font-semibold mb-3">Rating Details</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{reviewData.rating}</span>
                <div className="flex items-center gap-1">
                  {renderStars(reviewData.rating)}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {reviewData.rating >= 4
                  ? "Excellent"
                  : reviewData.rating >= 3
                    ? "Good"
                    : reviewData.rating >= 2
                      ? "Fair"
                      : "Poor"}{" "}
                rating
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
