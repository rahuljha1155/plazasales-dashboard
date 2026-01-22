import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Calendar, Clock, FileText, X, Youtube } from "lucide-react";
import { format } from "date-fns";
import { isYouTubeUrl, getYouTubeEmbedUrl } from "@/lib/video-utils";

type VideoViewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
};

export function VideoViewModal({
  isOpen,
  onClose,
  videoUrl,
  title = "Untitled Video",
  description,
  createdAt,
  updatedAt,
}: VideoViewModalProps) {
  const isYouTube = videoUrl ? isYouTubeUrl(videoUrl) : false;
  const embedUrl =
    videoUrl && isYouTube ? getYouTubeEmbedUrl(videoUrl) : videoUrl || "";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden [&>button]:top-2 [&>button]:right-2 [&>button]:z-10">
        <div className="relative">
          {/* Video Player */}
          <div className="aspect-video bg-black">
            {isYouTube ? (
              <iframe
                src={embedUrl || "placholder.jpg"}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={title}
              />
            ) : (
              <video
                src={videoUrl}
                controls
                className="w-full h-full object-contain"
                autoPlay
                controlsList="nodownload"
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>

          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-2 top-2 rounded-full bg-black/50 text-white hover:bg-black/70"
          >
            <X className="h-5 w-5" />
          </Button>

          {/* YouTube Badge */}
          {isYouTube && (
            <div className="absolute left-2 top-2">
              <span className="inline-flex items-center px-2 py-1 rounded-[2px] bg-red-600 text-white text-xs font-medium">
                <Youtube className="h-3 w-3 mr-1" />
                YouTube
              </span>
            </div>
          )}
        </div>

        {/* Video Info */}
        <div className="p-6 space-y-4">
          <div>
            <h2 className="text-xl font-semibold">{title}</h2>
            {(createdAt || updatedAt) && (
              <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-muted-foreground">
                {createdAt && (
                  <span className="flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    {format(new Date(createdAt), "MMM d, yyyy")}
                  </span>
                )}
                {updatedAt && (
                  <span className="flex items-center">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    Updated {format(new Date(updatedAt), "MMM d, yyyy")}
                  </span>
                )}
              </div>
            )}
          </div>

          {description && (
            <div className="bg-muted/50 p-4 rounded-sm">
              <div className="flex items-center gap-2 text-sm font-medium mb-2">
                <FileText className="h-4 w-4" />
                Description
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {description}
              </p>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
