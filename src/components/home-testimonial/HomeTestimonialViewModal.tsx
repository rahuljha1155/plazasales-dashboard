import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { Star, User, Calendar, MessageSquare, Eye, Hash } from "lucide-react";
import type { HomeTestimonialType } from "@/types/HomeTestimonialType";

interface HomeTestimonialViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  testimonialData: HomeTestimonialType | null;
}

export function HomeTestimonialViewModal({
  isOpen,
  onClose,
  testimonialData,
}: HomeTestimonialViewModalProps) {
  if (!testimonialData) return null;

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
          <div className="flex justify-between mt-4 items-center">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <MessageSquare className="h-6 w-6" />
              Home Testimonial
            </DialogTitle>
            <Badge
              variant="secondary"
              className={
                testimonialData.isActive
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-800"
              }
            >
              {testimonialData.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className=" gap-6">
            <div className="md:col-span-2 space-y-6">
              {/* Testimonial Content */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Testimonial</h3>
                <div className="bg-gray-50 p-4 rounded-sm border-l-4 border-blue-500">
                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: testimonialData.comment,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Sidebar with Customer Information */}
            <div className="space-y-6 mt-4">
              {/* Customer Image */}
              {testimonialData.image && (
                <div className="flex ">
                  <div className="relative  overflow-hidden w-40 xl:w-52">
                    <img
                      src={testimonialData.image}
                      alt={testimonialData.fullName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              <div className="bg-muted/50 p-4 rounded-sm space-y-4">
                <h3 className="text-lg font-semibold">Customer Information</h3>
                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Name:</span>{" "}
                      {testimonialData.fullName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Rating:</span>
                    </span>
                    <div className="flex items-center gap-1 ml-2">
                      {renderStars(testimonialData.rating)}
                      <span className="ml-2 text-sm text-muted-foreground">
                        ({testimonialData.rating}/5)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Sort Order:</span>{" "}
                      {testimonialData.sortOrder}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Status:</span>{" "}
                      {testimonialData.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Created:</span>{" "}
                      {format(new Date(testimonialData.createdAt), "PPP")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Updated:</span>{" "}
                      {format(new Date(testimonialData.updatedAt), "PPP")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rating Breakdown */}
              <div className="bg-muted/50 p-4 rounded-sm">
                <h3 className="text-lg font-semibold mb-3">Rating Details</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">
                      {testimonialData.rating}
                    </span>
                    <div className="flex items-center gap-1">
                      {renderStars(testimonialData.rating)}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {testimonialData.rating >= 4
                      ? "Excellent"
                      : testimonialData.rating >= 3
                        ? "Good"
                        : testimonialData.rating >= 2
                          ? "Fair"
                          : "Poor"}{" "}
                    rating
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
