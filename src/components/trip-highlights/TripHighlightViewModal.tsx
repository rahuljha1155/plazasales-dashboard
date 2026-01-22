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
  Star,
  Mountain,
  Utensils,
  Bed,
  Activity,
} from "lucide-react";

interface TripHighlight {
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

interface TripHighlightViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  highlightData: TripHighlight | null;
}

export function TripHighlightViewModal({
  isOpen,
  onClose,
  highlightData,
}: TripHighlightViewModalProps) {
  if (!highlightData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto [&>button]:top-2 [&>button]:right-2 [&>button]:z-10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Star className="h-6 w-6" />
            {highlightData.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Trip Highlight Image */}
          {highlightData.image && (
            <div className="relative rounded-sm overflow-hidden h-64">
              <img
                src={highlightData.image}
                alt={highlightData.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {/* Trip Highlight Description */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Description</h3>
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: highlightData.description,
                  }}
                />
              </div>
            </div>

            {/* Sidebar with Trip Highlight Information */}
            <div className="space-y-6">
              <div className="bg-muted/50 p-4 rounded-sm space-y-4">
                <h3 className="text-lg font-semibold">Highlight Details</h3>
                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Days:</span>{" "}
                      {highlightData.days}
                    </span>
                  </div>

                  {highlightData.duration && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <span className="font-medium">Duration:</span>{" "}
                        {highlightData.duration}
                      </span>
                    </div>
                  )}

                  {highlightData.maxAltitude && (
                    <div className="flex items-center gap-2">
                      <Mountain className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <span className="font-medium">Max Altitude:</span>{" "}
                        {highlightData.maxAltitude}
                      </span>
                    </div>
                  )}

                  {highlightData.activity && (
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <span className="font-medium">Activity:</span>{" "}
                        {highlightData.activity}
                      </span>
                    </div>
                  )}

                  {highlightData.meals && (
                    <div className="flex items-center gap-2">
                      <Utensils className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <span className="font-medium">Meals:</span>{" "}
                        {highlightData.meals}
                      </span>
                    </div>
                  )}

                  {highlightData.accommodation && (
                    <div className="flex items-center gap-2">
                      <Bed className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <span className="font-medium">Accommodation:</span>{" "}
                        {highlightData.accommodation}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Sort Order:</span>{" "}
                      {highlightData.sortOrder}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Created:</span>{" "}
                      {format(new Date(highlightData.createdAt), "PPP")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Image Information */}
              {highlightData.image && (
                <div className="bg-muted/50 p-4 rounded-sm space-y-4">
                  <h3 className="text-lg font-semibold">Image Information</h3>
                  <Separator />
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Image URL:</span>{" "}
                      <a
                        href={highlightData.image}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        View Image
                      </a>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
