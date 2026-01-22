import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { FileText, Calendar, Link as LinkIcon, Eye } from "lucide-react";

interface PageContentData {
  _id: string;
  title: string;
  slug: string;
  content: string;
  status: "published" | "draft";
  createdAt: string;
  updatedAt: string;
}

interface PageContentViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageData: PageContentData | null;
}

export function PageContentViewModal({
  isOpen,
  onClose,
  pageData,
}: PageContentViewModalProps) {
  if (!pageData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto [&>button]:top-2 [&>button]:right-2 [&>button]:z-10">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6" />
              {pageData.title}
            </DialogTitle>
            <Badge
              variant="secondary"
              className={
                pageData.status === "published"
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }
            >
              {pageData.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Page Info */}
          <div className="bg-muted/50 p-4 rounded-sm space-y-3">
            <div className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <span className="font-medium">Slug:</span> /{pageData.slug}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <span className="font-medium">Status:</span> {pageData.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-medium">Created:</span>{" "}
                  {format(new Date(pageData.createdAt), "PPP")}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-medium">Updated:</span>{" "}
                  {format(new Date(pageData.updatedAt), "PPP")}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Page Content */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Content</h3>
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: pageData.content }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
