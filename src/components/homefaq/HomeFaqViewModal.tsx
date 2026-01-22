import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { HelpCircle, Calendar, Tag } from "lucide-react";
import type { homefaq } from "@/types/homefaq";

interface HomeFaqViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  faqData: homefaq | null;
}

export function HomeFaqViewModal({
  isOpen,
  onClose,
  faqData,
}: HomeFaqViewModalProps) {
  if (!faqData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto [&>button]:top-2 [&>button]:right-2 [&>button]:z-10">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <HelpCircle className="h-6 w-6" />
              {faqData.name}
            </DialogTitle>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <Tag className="h-3 w-3 mr-1" />
              {faqData.category}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* FAQ Content */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Answer</h3>
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: faqData.description }}
            />
          </div>

          <Separator />

          {/* FAQ Details */}
          <div className="bg-muted/50 p-4 rounded-sm">
            <h3 className="text-lg font-semibold mb-3">FAQ Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-medium">Category:</span>{" "}
                  {faqData.category}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-medium">Created:</span>{" "}
                  {format(new Date(faqData.createdAt), "PPP")}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-medium">Updated:</span>{" "}
                  {format(new Date(faqData.updatedAt), "PPP")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
