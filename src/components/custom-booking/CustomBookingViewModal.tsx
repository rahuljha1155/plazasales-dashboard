import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import {
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  Users,
  DollarSign,
  FileText,
} from "lucide-react";
import type { Booking } from "@/types/booking";

interface CustomBookingViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingData: any | null;
}

export function CustomBookingViewModal({
  isOpen,
  onClose,
  bookingData,
}: CustomBookingViewModalProps) {
  if (!bookingData) return null;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto [&>button]:top-2 [&>button]:right-2 [&>button]:z-10">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl font-bold">
              Custom Booking Details
            </DialogTitle>
            <Badge
              variant="secondary"
              className={getStatusColor(bookingData.status)}
            >
              {bookingData.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Information */}
            <div className="bg-muted/50 p-4 rounded-sm space-y-4">
              <h3 className="text-lg font-semibold">Customer Information</h3>
              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">Name:</span>{" "}
                    {bookingData?.firstName} {bookingData.lastName}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">Email:</span>{" "}
                    <a
                      href={`mailto:${bookingData.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {bookingData.email}
                    </a>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">Phone:</span>{" "}
                    {bookingData.countryCode} {bookingData.phoneNumber}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">Country:</span>{" "}
                    {bookingData.country}
                  </span>
                </div>
              </div>
            </div>

            {/* Booking Information */}
            <div className="bg-muted/50 p-4 rounded-sm space-y-4">
              <h3 className="text-lg font-semibold">Booking Information</h3>
              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">Travel Date:</span>{" "}
                    {bookingData.travelDate}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">Travelers:</span>{" "}
                    {bookingData.numberOfTravelers}
                  </span>
                </div>

                {bookingData.totalPrice && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Total Price:</span> $
                      {bookingData.totalPrice}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">Booked:</span>{" "}
                    {format(new Date(bookingData.createdAt), "PPP")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Package Information */}
          {bookingData.packageId && (
            <div className="bg-muted/50 p-4 rounded-sm">
              <h3 className="text-lg font-semibold mb-3">Package Details</h3>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-medium">Package ID:</span>{" "}
                  {bookingData.packageId}
                </span>
              </div>
            </div>
          )}

          {/* Special Requests */}
          {bookingData.message && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Message</h3>
              <div className="bg-gray-50 p-4 rounded-sm border-l-4 border-blue-500">
                <p className="text-sm whitespace-pre-wrap">
                  {bookingData.message}
                </p>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex gap-2">
            <a
              href={`mailto:${bookingData.email}?subject=Custom Booking Inquiry - ${bookingData.firstName} ${bookingData.lastName}`}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-[2px] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Mail className="h-4 w-4 mr-2" />
              Contact Customer
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
