import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProductDownload } from "@/types/IDownload";

interface ProductDownloadViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  download: ProductDownload;
}

export function ProductDownloadViewModal({
  open,
  onOpenChange,
  download,
}: ProductDownloadViewModalProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Download Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">{download.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{download.summary}</p>
          </div>

          {/* File Preview */}
          <div className="p-4 rounded-lg bg-muted">
            <p className="text-xs font-medium text-gray-500 mb-3">File Preview</p>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {download.fileType.match(/jpg|jpeg|png|gif|webp/i) ? (
                  <img src={download.downloadUrl} alt="Preview" className="w-24 h-24 object-cover rounded" />
                ) : (
                  <div className="flex items-center justify-center w-24 h-24 bg-white text-zinc-400 rounded">
                    <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 14 14" className="size-20">
                      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.3}>
                        <path d="M12.5 12.5a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1H9L12.5 4z"></path>
                        <path d="M8.5.5v4h4"></path>
                      </g>
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-primary truncate">{download.title}</p>
                <div className="mt-2 space-y-1 text-xs text-gray-600">
                  <p>Size: {formatFileSize(download.sizeBytes)}</p>
                  <p>Type: {download.fileType.toUpperCase()}</p>
                  {download.releasedOn && (
                    <p>Released: {new Date(download.releasedOn).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Version</p>
              <Badge variant="outline" className="mt-1">
                {download.version}
              </Badge>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">File Size</p>
              <p className="mt-1 text-sm font-semibold">
                {formatFileSize(download.sizeBytes)}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">File Type</p>
              <Badge variant="secondary" className="mt-1">
                {download.fileType.toUpperCase()}
              </Badge>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Released On</p>
              <p className="mt-1 text-sm">
                {new Date(download.releasedOn as string).toLocaleDateString()}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Min OS Version</p>
              <p className="mt-1 text-sm">{download.minOsVersion}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Sort Order</p>
              <p className="mt-1 text-sm">{download.sortOrder}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">Status</p>
            <div className="flex gap-2">
              {download.isActive ? (
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
              {download.deprecated && (
                <Badge variant="destructive">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Deprecated
                </Badge>
              )}
            </div>
          </div>

          {download.platforms.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Platforms</p>
              <div className="flex flex-wrap gap-2">
                {download.platforms.map((platform) => (
                  <Badge key={platform} variant="secondary">
                    {platform}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {download.extra?.language && download.extra.language.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Languages</p>
              <div className="flex flex-wrap gap-2">
                {download.extra.language.map((lang) => (
                  <Badge key={lang} variant="outline">
                    {lang}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-gray-500">Download URL</p>
            <code className="mt-1 text-xs bg-gray-100 px-2 py-1 rounded block overflow-auto">
              {download.downloadUrl}
            </code>
          </div>

          {download.sha256 && (
            <div>
              <p className="text-sm font-medium text-gray-500">SHA256 Hash</p>
              <code className="mt-1 text-xs bg-gray-100 px-2 py-1 rounded block overflow-auto">
                {download.sha256}
              </code>
            </div>
          )}

          {download.mirrors && download.mirrors.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Mirror Links</p>
              <div className="space-y-2">
                {download.mirrors.map((mirror, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded"
                  >
                    <div>
                      <p className="font-medium text-sm">{mirror.label}</p>
                      <p className="text-xs text-gray-600">{mirror.url}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(mirror.url, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {download.extra?.note && (
            <div>
              <p className="text-sm font-medium text-gray-500">Note</p>
              <p className="mt-1 text-sm bg-blue-50 p-3 rounded">
                {download.extra.note}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Product ID</p>
              <code className="mt-1 text-xs bg-gray-100 px-2 py-1 rounded block">
                {download.productId}
              </code>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Category ID</p>
              <code className="mt-1 text-xs bg-gray-100 px-2 py-1 rounded block">
                {download.categoryId}
              </code>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm font-medium text-gray-500">Created At</p>
              <p className="mt-1 text-sm">
                {download.createdAt
                  ? new Date(download.createdAt).toLocaleString()
                  : "-"}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Updated At</p>
              <p className="mt-1 text-sm">
                {download.updatedAt
                  ? new Date(download.updatedAt).toLocaleString()
                  : "-"}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
