import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HomeGalleryType } from "@/types/homegalleryType";

interface HomeGalleryViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  gallery: HomeGalleryType | null;
}

export const HomeGalleryViewModal: React.FC<HomeGalleryViewModalProps> = ({
  isOpen,
  onClose,
  gallery,
}) => {
  if (!gallery) return null;

  const allImages = [
    { url: gallery.centerImage, label: "Center Image" },
    ...gallery.sideImages.map((img, idx) => ({
      url: img,
      label: `Side Image ${idx + 1}`,
    })),
  ];

  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
    }
  }, [isOpen]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % allImages.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[90vh] p-0">
        <div className="relative w-full h-full flex flex-col">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Main Image */}
          <div className="flex-1 relative bg-black flex items-center justify-center">
            <img
              src={allImages[currentIndex].url}
              alt={allImages[currentIndex].label}
              className="max-w-full max-h-full object-contain"
            />

            {/* Navigation Buttons */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-black/50 text-white rounded-full text-sm">
              {allImages[currentIndex].label} ({currentIndex + 1} / {allImages.length})
            </div>
          </div>

          {/* Thumbnails */}
          <div className="bg-gray-100 p-4 overflow-x-auto">
            <div className="flex gap-2">
              {allImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    currentIndex === index
                      ? "border-primary ring-2 ring-primary"
                      : "border-transparent hover:border-gray-400"
                  }`}
                >
                  <img
                    src={img.url}
                    alt={img.label}
                    className="w-full h-full object-cover"
                  />
                  {index === 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-primary/80 text-white text-[10px] text-center py-0.5">
                      Center
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
