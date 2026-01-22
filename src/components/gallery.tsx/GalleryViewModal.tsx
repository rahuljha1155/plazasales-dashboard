import { useEffect, useCallback, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { GalleryType } from "@/types/galleryType";
import { cn } from "@/lib/utils";

interface GalleryViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: GalleryType[];
  currentIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onNavigate?: (index: number) => void;
}

export function GalleryViewModal({
  isOpen,
  onClose,
  images,
  currentIndex,
  onNext,
  onPrev,
  onNavigate,
}: GalleryViewModalProps) {
  const currentImage = images?.[currentIndex];
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [imageLoading, setImageLoading] = useState(true);

  // Minimum swipe distance
  const minSwipeDistance = 50;

  // Touch handlers
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentIndex < images.length - 1) {
      onNext();
    }
    if (isRightSwipe && currentIndex > 0) {
      onPrev();
    }
  };

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          if (currentIndex > 0) onPrev();
          break;
        case "ArrowRight":
          event.preventDefault();
          if (currentIndex < images.length - 1) onNext();
          break;
        case "Escape":
          event.preventDefault();
          onClose();
          break;
      }
    },
    [isOpen, onNext, onPrev, onClose, currentIndex, images.length]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Reset loading state when image changes
  useEffect(() => {
    setImageLoading(true);
  }, [currentIndex]);

  const handleThumbnailClick = (index: number) => {
    if (onNavigate) {
      onNavigate(index);
    }
  };

  if (!isOpen || !images?.length || !currentImage) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-[95vw] sm:w-[90vw] p-0 bg-black/90 border-none">
        <div className="relative w-full h-[90vh] flex flex-col">
          {/* Header */}
          <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
            <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
              <span className="text-white text-sm font-medium">
                {currentIndex + 1} / {images.length}
              </span>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Main Image */}
          <div
            className="flex-1 relative flex items-center justify-center"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <img
              src={currentImage.imageUrl}
              alt={currentImage.caption || "Gallery image"}
              className={cn(
                "max-h-full max-w-full object-contain transition-opacity duration-300",
                imageLoading ? "opacity-0" : "opacity-100"
              )}
              loading="eager"
              onLoad={() => setImageLoading(false)}
              onError={() => setImageLoading(false)}
            />

            {/* Loading spinner */}
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              </div>
            )}

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <Button
                  onClick={onPrev}
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "absolute left-4 top-1/2 -translate-y-1/2 z-10",
                    "h-12 w-12 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white",
                    "transition-all duration-200",
                    currentIndex === 0 && "opacity-50 cursor-not-allowed"
                  )}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>

                <Button
                  onClick={onNext}
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "absolute right-4 top-1/2 -translate-y-1/2 z-10",
                    "h-12 w-12 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white",
                    "transition-all duration-200",
                    currentIndex === images.length - 1 && "opacity-50 cursor-not-allowed"
                  )}
                  disabled={currentIndex === images.length - 1}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="h-24 bg-black/30 backdrop-blur-sm border-t border-white/10">
              <div className="flex items-center justify-center h-full px-4">
                <div className="flex gap-2 overflow-x-auto max-w-full py-2">
                  {images.map((img, index) => (
                    <button
                      key={img._id}
                      onClick={() => handleThumbnailClick(index)}
                      className={cn(
                        "flex-shrink-0 w-16 h-16 rounded-md overflow-hidden transition-all duration-200",
                        "border-2 hover:border-white/50",
                        index === currentIndex
                          ? "border-white ring-2 ring-white/30"
                          : "border-transparent opacity-70 hover:opacity-100"
                      )}
                    >
                      <img
                        src={img.imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Dots Indicator (for smaller screens) */}
          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 md:hidden">
              <div className="flex gap-2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleThumbnailClick(index)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all duration-200",
                      index === currentIndex
                        ? "bg-white"
                        : "bg-white/40 hover:bg-white/60"
                    )}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Caption (if exists) */}
          {currentImage.caption && (
            <div className="absolute top-5 left-1/2 -translate-x-1/2 z-10 max-w-2xl px-4 hidden md:block">
              <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 text-xl text-center">
                <p className="text-white capitalize">{currentImage.caption}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
