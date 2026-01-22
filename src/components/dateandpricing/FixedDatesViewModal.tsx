import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { Calendar, Clock, DollarSign, Users } from "lucide-react";

interface FixedDatesData {
  _id: string;
  startDate: Date;
  endDate: Date;
  status: "available" | "booked" | "cancelled";
  duration: string;
  pricePerPerson: number;
  packageId?: string;

}

interface FixedDatesViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateData: FixedDatesData | null;
}

export function FixedDatesViewModal({
  isOpen,
  onClose,
  dateData,
}: FixedDatesViewModalProps) {
  if (!dateData) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "booked":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto [&>button]:top-2 [&>button]:right-2 [&>button]:z-10">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              Fixed Date Details
            </DialogTitle>
            <Badge
              variant="secondary"
              className={getStatusColor(dateData.status)}
            >
              {dateData.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Date Range */}
          <div className="bg-muted/50 p-4 rounded-sm space-y-4">
            <h3 className="text-lg font-semibold">Trip Schedule</h3>
            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-medium">Start Date:</span>{" "}
                  {format(new Date(dateData.startDate), "PPP")}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-medium">End Date:</span>{" "}
                  {format(new Date(dateData.endDate), "PPP")}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-medium">Duration:</span>{" "}
                  {dateData.duration}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm">
                  <span className="font-medium">Price:</span> US$ {dateData.pricePerPerson}
                </span>
              </div>
            </div>
          </div>

          {/* Status Information */}
          <div className="bg-muted/50 p-4 rounded-sm">
            <h3 className="text-lg font-semibold mb-3">Availability Status</h3>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                This trip is currently{" "}
                <span className="font-medium">{dateData.status}</span>
              </span>
            </div>

            {dateData.status === "available" && (
              <p className="text-sm text-green-600 mt-2">
                This date is available for booking.
              </p>
            )}

            {dateData.status === "booked" && (
              <p className="text-sm text-blue-600 mt-2">
                This date has been booked and is no longer available.
              </p>
            )}

            {dateData.status === "cancelled" && (
              <p className="text-sm text-red-600 mt-2">
                This trip date has been cancelled.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
