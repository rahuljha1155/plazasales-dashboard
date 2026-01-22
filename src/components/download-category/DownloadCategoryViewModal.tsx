import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";
import type { DownloadCategory } from "@/types/IDownload";

interface DownloadCategoryViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: DownloadCategory;
}

export function DownloadCategoryViewModal({
  open,
  onOpenChange,
  category,
}: DownloadCategoryViewModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Download Category Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Title</p>
              <p className="mt-1 text-sm font-semibold">{category.title}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Subtitle</p>
              <p className="mt-1 text-sm">{category.subtitle || "-"}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Kind</p>
              <Badge variant="outline" className="mt-1">
                {category.kind}
              </Badge>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <div className="mt-1">
                {category.isActive ? (
                  <Badge className="bg-green-500">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <XCircle className="w-3 h-3 mr-1" />
                    Inactive
                  </Badge>
                )}
              </div>
            </div>


            <div>
              <p className="text-sm font-medium text-gray-500">Update Channel</p>
              <p className="mt-1 text-sm">
                {category.extra?.updateChannel || "-"}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Product ID</p>
            <code className="mt-1 text-xs bg-gray-100 px-2 py-1 rounded block">
              {category.productId}
            </code>
          </div>

          {category.extra?.platforms && category.extra.platforms.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">
                Platforms
              </p>
              <div className="flex flex-wrap gap-2">
                {category.extra.platforms.map((platform) => (
                  <Badge key={platform} variant="secondary">
                    {platform}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {category.extra && Object.keys(category.extra).filter(
            (key) => !["platforms", "updateChannel"].includes(key)
          ).length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">
                Additional Data
              </p>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                {JSON.stringify(
                  Object.fromEntries(
                    Object.entries(category.extra).filter(
                      ([key]) => !["platforms", "updateChannel"].includes(key)
                    )
                  ),
                  null,
                  2
                )}
              </pre>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm font-medium text-gray-500">Created At</p>
              <p className="mt-1 text-sm">
                {category.createdAt
                  ? new Date(category.createdAt).toLocaleString()
                  : "-"}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Updated At</p>
              <p className="mt-1 text-sm">
                {category.updatedAt
                  ? new Date(category.updatedAt).toLocaleString()
                  : "-"}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
