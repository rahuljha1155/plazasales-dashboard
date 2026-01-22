import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import type { Video } from "@/hooks/useVideo";

interface VideoViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  video: Video;
}

export function VideoViewModal({ open, onOpenChange, video }: VideoViewModalProps) {
  // Extract YouTube video ID from URL
  const extractYouTubeId = (url: string) => {
    if (!url) return null;
    
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    if (url.length === 11 && !url.includes('/') && !url.includes('?')) {
      return url;
    }

    return null;
  };

  const videoId = extractYouTubeId(video.youtubeVideoId);
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Video Details</DialogTitle>
          <DialogDescription>
            View complete video information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Video Player */}
          {embedUrl ? (
            <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
              <iframe
                width="100%"
                height="100%"
                src={embedUrl}
                title={video.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="aspect-video w-full rounded-lg bg-gray-100 flex items-center justify-center">
              <p className="text-gray-500">Invalid YouTube URL</p>
            </div>
          )}

          {/* Video Information */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Title</h3>
              <p className="text-lg font-semibold">{video.title}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Model Number</h3>
                <Badge variant="outline" className="font-mono">
                  {video.productModelNumber}
                </Badge>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Product ID</h3>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded block break-all">
                  {video.productId}
                </code>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">YouTube URL</h3>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1 break-all">
                  {video.youtubeVideoId}
                </code>
                {videoId && (
                  <a
                    href={`https://www.youtube.com/watch?v=${videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {video.createdAt && (
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Created At</h3>
                  <p className="text-sm">
                    {new Date(video.createdAt).toLocaleString()}
                  </p>
                </div>
                {video.updatedAt && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Updated At</h3>
                    <p className="text-sm">
                      {new Date(video.updatedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
