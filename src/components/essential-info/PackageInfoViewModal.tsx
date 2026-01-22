import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { Calendar, FileText, Hash, Info, Eye } from "lucide-react";

interface PackageInfo {
  _id: string;
  package: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface PackageInfoViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageInfoData: PackageInfo | null;
}

export function PackageInfoViewModal({
  isOpen,
  onClose,
  packageInfoData,
}: PackageInfoViewModalProps) {
  if (!packageInfoData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto [&>button]:top-2 [&>button]:right-2 [&>button]:z-10">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Info className="h-6 w-6" />
              Package Information
            </DialogTitle>
            <Badge
              variant="secondary"
              className={
                packageInfoData.isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }
            >
              {packageInfoData.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {/* Package Info Description */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Description</h3>
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: packageInfoData.description,
                  }}
                />
              </div>
            </div>

            {/* Sidebar with Package Info Details */}
            <div className="space-y-6">
              <div className="bg-muted/50 p-4 rounded-sm space-y-4">
                <h3 className="text-lg font-semibold">Package Info Details</h3>
                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Package ID:</span>{" "}
                      {packageInfoData.package}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Sort Order:</span>{" "}
                      {packageInfoData.sortOrder}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Status:</span>{" "}
                      {packageInfoData.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Created:</span>{" "}
                      {format(new Date(packageInfoData.createdAt), "PPP")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Updated:</span>{" "}
                      {format(new Date(packageInfoData.updatedAt), "PPP")}
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
