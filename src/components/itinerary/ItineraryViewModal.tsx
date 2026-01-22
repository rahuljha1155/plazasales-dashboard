import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import {
  Calendar,
  FileText,
  Hash,
  Image as ImageIcon,
  Clock,
  MapPin,
  Mountain,
  Utensils,
  Bed,
  Activity,
} from "lucide-react";

interface Itinerary {
  _id: string;
  title: string;
  description: string;
  image: string;
  days: string;
  duration?: string;
  maxAltitude?: string;
  activity?: string;
  meals?: string;
  accommodation?: string;
  package: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ItineraryViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  itineraryData: Itinerary | null;
}

export function ItineraryViewModal({
  isOpen,
  onClose,
  itineraryData,
}: ItineraryViewModalProps) {
  if (!itineraryData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto [&>button]:top-2 [&>button]:right-2 [&>button]:z-10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <MapPin className="h-6 w-6" />
            {itineraryData.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Itinerary Image */}
          {itineraryData.image && (
            <div className="relative rounded-sm overflow-hidden h-64">
              <img
                src={itineraryData.image}
                alt={itineraryData.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {/* Itinerary Description */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Description</h3>
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: itineraryData.description,
                  }}
                />
              </div>
            </div>

            {/* Sidebar with Itinerary Information */}
            <div className="space-y-6">
              <div className="bg-muted/50 p-4 rounded-sm space-y-4">
                <h3 className="text-lg font-semibold">Itinerary Details</h3>
                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Days:</span>{" "}
                      {itineraryData.days}
                    </span>
                  </div>

                  {itineraryData.duration && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <span className="font-medium">Duration:</span>{" "}
                        {itineraryData.duration}
                      </span>
                    </div>
                  )}

                  {itineraryData.maxAltitude && (
                    <div className="flex items-center gap-2">
                      <Mountain className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <span className="font-medium">Max Altitude:</span>{" "}
                        {itineraryData.maxAltitude}
                      </span>
                    </div>
                  )}

                  {itineraryData.activity && (
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <span className="font-medium">Activity:</span>{" "}
                        {itineraryData.activity}
                      </span>
                    </div>
                  )}

                  {itineraryData.meals && (
                    <div className="flex items-center gap-2">
                      <Utensils className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <span className="font-medium">Meals:</span>{" "}
                        {itineraryData.meals}
                      </span>
                    </div>
                  )}

                  {itineraryData.accommodation && (
                    <div className="flex items-center gap-2">
                      <Bed className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <span className="font-medium">Accommodation:</span>{" "}
                        {itineraryData.accommodation}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Sort Order:</span>{" "}
                      {itineraryData.sortOrder}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Created:</span>{" "}
                      {format(new Date(itineraryData.createdAt), "PPP")}
                    </span>
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
