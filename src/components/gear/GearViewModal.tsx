import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Package, Hash } from "lucide-react";
import { format } from "date-fns";

interface Gear {
  _id: string;
  title: string;
  description: string;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface GearViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  gearData: Gear | null;
}

export function GearViewModal({
  isOpen,
  onClose,
  gearData,
}: GearViewModalProps) {
  if (!gearData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto [&>button]:top-2 [&>button]:right-2 [&>button]:z-10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Package className="w-5 h-5 text-blue-600" />
            {gearData.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              {gearData.sortOrder !== undefined && (
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-purple-600" />
                  <span className="font-medium">Sort Order:</span>
                  <Badge variant="outline">{gearData.sortOrder}</Badge>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {gearData.createdAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">Created:</span>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(gearData.createdAt), "PPP")}
                  </span>
                </div>
              )}

              {gearData.updatedAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-orange-600" />
                  <span className="font-medium">Updated:</span>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(gearData.updatedAt), "PPP")}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Description</h3>
            <div className="bg-gray-50 p-4 rounded-sm">
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: gearData.description || "No description available",
                }}
              />
            </div>
          </div>

          {/* Metadata */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Metadata
            </h3>
            <div className="text-sm">
              <div>
                <span className="font-medium">ID:</span>
                <span className="ml-2 font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                  {gearData._id}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
