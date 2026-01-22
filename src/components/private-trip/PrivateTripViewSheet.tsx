"use client";

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
  FileText,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";
import type { privateTripData } from "@/hooks/usePrivateTrip";

interface PrivateTripViewSheetProps {
  trip: privateTripData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PrivateTripViewSheet({
  trip,
  open,
  onOpenChange,
}: PrivateTripViewSheetProps) {
  if (!trip) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto [&>button]:top-2 [&>button]:right-2 [&>button]:z-10">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl font-bold">
              Private Trip Details
            </DialogTitle>
            <Badge
              variant="secondary"
              className={
                trip.termsAndAgreement
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }
            >
              {trip.termsAndAgreement ? "Terms Accepted" : "Pending Agreement"}
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
                    <span className="font-medium">Lead Traveller:</span>{" "}
                    <span className="text-primary font-semibold">
                      {trip.leadTravellerName}
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">Email:</span>{" "}
                    <a
                      href={`mailto:${trip.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {trip.email}
                    </a>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">Phone:</span>{" "}
                    <span className="text-primary font-semibold">
                      {trip.phone}
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">Country:</span>{" "}
                    <span className="text-primary font-semibold">
                      {trip.country}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Trip Information */}
            <div className="bg-muted/50 p-4 rounded-sm space-y-4">
              <h3 className="text-lg font-semibold">Trip Information</h3>
              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">Package:</span>{" "}
                    <span className="text-primary font-semibold">
                      {trip.package.name}
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">Arrival Date:</span>{" "}
                    <span className="text-primary font-semibold">
                      {format(new Date(trip.date), "MMMM d, yyyy")}
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">Number of Travellers:</span>{" "}
                    <span className="text-primary font-semibold">
                      {trip.numberOfTraveller}
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">How did you reach us:</span>{" "}
                    <span className="text-primary font-semibold">
                      {trip.howDidYouReachUs}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Message */}
          {trip.message && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Message</h3>
              <div className="bg-gray-50 p-4 rounded-sm border-l-4 border-orange-500">
                <p className="text-sm whitespace-pre-wrap">{trip.message}</p>
              </div>
            </div>
          )}

          {/* Terms & Agreement */}
          <div className="bg-muted/50 p-4 rounded-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2
                className={`h-5 w-5 ${trip.termsAndAgreement
                  ? "text-green-600"
                  : "text-yellow-600"
                  }`}
              />
              <span className="text-sm font-medium">
                Terms & Agreement:{" "}
                <span
                  className={
                    trip.termsAndAgreement
                      ? "text-green-600"
                      : "text-yellow-600"
                  }
                >
                  {trip.termsAndAgreement ? "Accepted" : "Not accepted"}
                </span>
              </span>
            </div>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-muted/50 p-3 rounded-sm">
              <p className="text-xs text-muted-foreground">Created At</p>
              <p className="text-sm font-medium">
                {format(new Date(trip.createdAt), "PPpp")}
              </p>
            </div>
            <div className="bg-muted/50 p-3 rounded-sm">
              <p className="text-xs text-muted-foreground">Updated At</p>
              <p className="text-sm font-medium">
                {format(new Date(trip.updatedAt), "PPpp")}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <a
              href={`mailto:${trip.email}?subject=Private Trip Inquiry - ${trip.leadTravellerName}&body=Dear ${trip.leadTravellerName},%0D%0A%0D%0AThank you for your interest in ${trip.package.name}.%0D%0A%0D%0A`}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-primary rounded-[2px] hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
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

export default PrivateTripViewSheet;
