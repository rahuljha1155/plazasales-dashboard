import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Hash, ExternalLink } from "lucide-react";
import { format } from "date-fns";

interface Attraction {
  _id: string;
  title: string;
  description: string;
  image: string;
  days: string;
  package: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface AttractionViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  attractionData: Attraction | null;
}

export function AttractionViewModal({
  isOpen,
  onClose,
  attractionData,
}: AttractionViewModalProps) {
  if (!attractionData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto [&>button]:top-2 [&>button]:right-2 [&>button]:z-10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <MapPin className="w-5 h-5 text-blue-600" />
            {attractionData.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image Section */}
          {attractionData.image && (
            <div className="relative">
              <img
                src={attractionData.image}
                alt={attractionData.title}
                className="w-full h-64 object-cover rounded-sm shadow-md"
              />
              <a
                href={attractionData.image}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-600" />
                <span className="font-medium">Days:</span>
                <Badge variant="secondary">{attractionData.days}</Badge>
              </div>

              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-purple-600" />
                <span className="font-medium">Sort Order:</span>
                <Badge variant="outline">{attractionData.sortOrder}</Badge>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="font-medium">Created:</span>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(attractionData.createdAt), "PPP")}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-orange-600" />
                <span className="font-medium">Updated:</span>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(attractionData.updatedAt), "PPP")}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Description</h3>
            <div className="bg-gray-50 p-4 rounded-sm">
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html:
                    attractionData.description || "No description available",
                }}
              />
            </div>
          </div>

          {/* Metadata */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Metadata
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">ID:</span>
                <span className="ml-2 font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                  {attractionData._id}
                </span>
              </div>
              <div>
                <span className="font-medium">Package ID:</span>
                <span className="ml-2 font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                  {attractionData.package}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
