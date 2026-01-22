import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Calendar, Users, Mountain, Ruler, Clock } from "lucide-react";

interface PackageViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageData: {
    _id: string;
    name: string;
    overview: string;
    location: string;
    duration: string;
    elevation: number;
    distance: number;
    activity: string;
    groupSize: string;
    coverImage: string;
    routeMap: string;
    isPopular: boolean;
    addToHome: boolean;
    createdAt: string;
  } | null;
}

export function PackageViewModal({
  isOpen,
  onClose,
  packageData,
}: PackageViewModalProps) {
  if (!packageData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto [&>button]:top-2 [&>button]:right-2 [&>button]:z-10">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl font-bold">
              {packageData.name}
            </DialogTitle>
            <div className="flex gap-2">
              {packageData.isPopular && (
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  Popular
                </Badge>
              )}
              {packageData.addToHome && (
                <Badge
                  variant="secondary"
                  className="bg-orange-100 text-orange-800"
                >
                  Featured
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cover Image */}
          {packageData.coverImage && (
            <div className="relative rounded-sm overflow-hidden h-64">
              <img
                src={packageData.coverImage}
                alt={packageData.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Package Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {/* Overview */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Overview</h3>
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: packageData.overview }}
                />
              </div>

              {/* Route Map */}
              {packageData.routeMap && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Route Map</h3>
                  <div className="border rounded-sm overflow-hidden">
                    <img
                      src={packageData.routeMap}
                      alt="Route Map"
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar with Key Information */}
            <div className="space-y-6">
              <div className="bg-muted/50 p-4 rounded-sm space-y-4">
                <h3 className="text-lg font-semibold">Trip Information</h3>
                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Location:</span>{" "}
                      {packageData.location}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Duration:</span>{" "}
                      {packageData.duration}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Mountain className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Elevation:</span>{" "}
                      {packageData.elevation} meters
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Ruler className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Distance:</span>{" "}
                      {packageData.distance} km
                    </span>
                  </div>

                  {packageData.groupSize && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <span className="font-medium">Group Size:</span>{" "}
                        {packageData.groupSize}
                      </span>
                    </div>
                  )}

                  {packageData.activity && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <span className="font-medium">Activity:</span>{" "}
                        {packageData.activity}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
