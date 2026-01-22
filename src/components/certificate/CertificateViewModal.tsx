import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { Award, Calendar, FileText } from "lucide-react";
import type { certificate } from "@/types/certificate";

interface CertificateViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificateData: certificate | null;
}

export function CertificateViewModal({
  isOpen,
  onClose,
  certificateData,
}: CertificateViewModalProps) {
  if (!certificateData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto [&>button]:top-2 [&>button]:right-2 [&>button]:z-10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Award className="h-6 w-6" />
            {certificateData.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Certificate Image */}
          {certificateData.image && (
            <div className="flex justify-center">
              <div className="relative rounded-sm overflow-hidden border shadow-lg max-w-md">
                <img
                  src={certificateData.image}
                  alt={certificateData.name}
                  className="w-full h-auto"
                />
              </div>
            </div>
          )}

          {/* Certificate Details */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Description
              </h3>
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{
                  __html: certificateData.description,
                }}
              />
            </div>
          </div>

          <Separator />

          {/* Metadata */}
          <div className="bg-muted/50 p-4 rounded-sm">
            <h3 className="text-lg font-semibold mb-3">Certificate Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-medium">Created:</span>{" "}
                  {format(new Date(certificateData.createdAt), "PPP")}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-medium">Updated:</span>{" "}
                  {format(new Date(certificateData.updatedAt), "PPP")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
