import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { Calendar, FileText, Hash, Sun } from "lucide-react";

interface WhyLoveData {
  _id: string;
  title: string;
  description: string;
  package: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface WhyLoveViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  importantNoticeData: WhyLoveData | null;
}

export function ImportantNoticeViewModal({
  isOpen,
  onClose,
  importantNoticeData,
}: WhyLoveViewModalProps) {
  if (!importantNoticeData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto [&>button]:top-2 [&>button]:right-2 [&>button]:z-10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Sun className="h-6 w-6" />
            {importantNoticeData.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {/* Season Info Description */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Description</h3>
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: importantNoticeData.description,
                  }}
                />
              </div>
            </div>

            {/* Sidebar with Season Info Details */}
            <div className="space-y-6">
              <div className="bg-muted/50 p-4 rounded-sm space-y-4">
                <h3 className="text-lg font-semibold">
                  Important Notice Details
                </h3>
                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-3 w-3 rounded-full ${importantNoticeData.isActive
                          ? "bg-green-500"
                          : "bg-gray-400"
                        }`}
                    ></div>
                    <span className="text-sm">
                      <span className="font-medium">Status:</span>{" "}
                      {importantNoticeData.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Sort Order:</span>{" "}
                      {importantNoticeData.sortOrder}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Package ID:</span>{" "}
                      {importantNoticeData.package}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Created:</span>{" "}
                      {format(new Date(importantNoticeData.createdAt), "PPP")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Updated:</span>{" "}
                      {format(new Date(importantNoticeData.updatedAt), "PPP")}
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
