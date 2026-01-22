import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { FileText, Calendar, User, Clock, Eye, Hash } from "lucide-react";
import type { IBlog } from "@/types/IBlog";

interface BlogViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  blogData: IBlog | null;
}

export function BlogViewModal({
  isOpen,
  onClose,
  blogData,
}: BlogViewModalProps) {
  if (!blogData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto [&>button]:top-2 [&>button]:right-2 [&>button]:z-10">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6" />
              {blogData.title}
            </DialogTitle>
            <Badge
              variant="secondary"
              className={
                blogData.isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }
            >
              {blogData.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Banner Image */}
          {blogData.banner && (
            <div className="relative rounded-sm overflow-hidden h-64">
              <img
                src={blogData.banner}
                alt={blogData.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {/* Blog Content */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Content</h3>
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: blogData.description }}
                />
              </div>
            </div>

            {/* Sidebar with Blog Information */}
            <div className="space-y-6">
              <div className="bg-muted/50 p-4 rounded-sm space-y-4">
                <h3 className="text-lg font-semibold">Blog Information</h3>
                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Author:</span>{" "}
                      {typeof blogData.author === 'string' ? blogData.author : `${blogData.author.firstname} ${blogData.author.lastname}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Slug:</span> /
                      {blogData.slug}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Read Time:</span>{" "}
                      {blogData.estimatedReadTime} min
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Sort Order:</span>{" "}
                      {blogData.sortOrder}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Created:</span>{" "}
                      {format(new Date(blogData.createdAt), "PPP")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Updated:</span>{" "}
                      {format(new Date(blogData.updatedAt), "PPP")}
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
