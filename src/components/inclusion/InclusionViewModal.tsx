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
} from "lucide-react";

interface Inclusion {
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

interface InclusionViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  inclusionData: Inclusion | null;
}

export function InclusionViewModal({
  isOpen,
  onClose,
  inclusionData,
}: InclusionViewModalProps) {
  if (!inclusionData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto [&>button]:top-2 [&>button]:right-2 [&>button]:z-10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            {inclusionData.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Inclusion Image */}
          {inclusionData.image && (
            <div className="relative rounded-sm overflow-hidden h-64">
              <img
                src={inclusionData.image}
                alt={inclusionData.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {/* Inclusion Description */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Description</h3>
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: inclusionData.description,
                  }}
                />
              </div>
            </div>

            {/* Sidebar with Inclusion Information */}
            <div className="space-y-6">
              <div className="bg-muted/50 p-4 rounded-sm space-y-4">
                <h3 className="text-lg font-semibold">Inclusion Details</h3>
                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Days:</span>{" "}
                      {inclusionData.days}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Sort Order:</span>{" "}
                      {inclusionData.sortOrder}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Package ID:</span>{" "}
                      {inclusionData.package}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Created:</span>{" "}
                      {format(new Date(inclusionData.createdAt), "PPP")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Updated:</span>{" "}
                      {format(new Date(inclusionData.updatedAt), "PPP")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Image Information */}
              {inclusionData.image && (
                <div className="bg-muted/50 p-4 rounded-sm space-y-4">
                  <h3 className="text-lg font-semibold">Image Information</h3>
                  <Separator />
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Image URL:</span>{" "}
                      <a
                        href={inclusionData.image}
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
