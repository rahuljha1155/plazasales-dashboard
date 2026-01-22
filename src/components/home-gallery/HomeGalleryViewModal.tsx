import {
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { HomeGalleryType } from "@/types/homegalleryType";

interface HomeGalleryViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: HomeGalleryType[];
  currentIndex: number;
  onNext: () => void;
  onPrev: () => void;
}

export function HomeGalleryViewModal({
  isOpen,
  onClose,
  images,
  currentIndex,
  onNext,
  onPrev,
}: HomeGalleryViewModalProps) {
  if (!isOpen || !images.length) return null;

  const currentImage = images[currentIndex];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden! p-0 bg-transparent border-none shadow-2xl [&>button]:top-2 [&>button]:right-2 [&>button]:z-10">
        <Card className="border-0 bg-card/95 backdrop-blur-sm overflow-hidden max-h-[60vh]!  flex flex-col">
          <div className="relative">
            {/* Header with image info */}
            <div className="absolute top-4 left-4 right-4 z-10 flex items-start justify-between">
              <div className="bg-background/80 backdrop-blur-sm rounded-sm p-3 shadow-lg">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">
                    {currentIndex + 1} of {images.length}
                  </span>
                  <Separator orientation="vertical" className="h-4" />
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <ImageIcon className="h-4 w-4" />
                    <span className="text-xs">
                      {format(new Date(currentImage.createdAt), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>

              </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    
                  </TooltipTrigger>
                  <TooltipContent>Close (Esc)</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Navigation Arrows */}
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onPrev();
              }}
              variant="ghost"
              size="icon"
              className={cn(
                "absolute left-4 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full",
                "bg-background/80 backdrop-blur-sm hover:bg-background/60 transition-all",
                "shadow-lg hover:scale-105",
                currentIndex === 0 && "opacity-0 pointer-events-none"
              )}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>

            <Button
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              variant="ghost"
              size="icon"
              className={cn(
                "absolute right-4 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full",
                "bg-background/80 backdrop-blur-sm hover:bg-background/60 transition-all",
                "shadow-lg hover:scale-105",
                currentIndex === images.length - 1 &&
                "opacity-0 pointer-events-none"
              )}
              disabled={currentIndex === images.length - 1}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>

            {/* Image */}
            <div className="flex items-center relative justify-center max-h-[40vh]! aspect-video overflow-hidden! bg-gradient-to-br from-muted/20 to-muted/30">
              <img
                src={currentImage.centerImage}
                alt="Gallery image"
                className="max-h-full max-w-full object-contain h-[500px]! overflow-hidden! transition-opacity duration-300"
                style={{
                  opacity: 0,
                  transition: "opacity 0.3s ease-in-out",
                }}
              />
            </div>

            {/* Image Info Footer */}
            <CardFooter className="bg-background/80 backdrop-blur-sm p-3 border-t">
              <div className="w-full grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[2px] bg-muted/50">
                          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {currentImage.sortOrder || 0}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>Sort Order</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div className="flex items-center justify-end col-span-2">
                  <div className="text-xs text-muted-foreground">
                    {format(
                      new Date(currentImage.createdAt),
                      "MMM d, yyyy • h:mm a"
                    )}
                  </div>
                </div>
              </div>
            </CardFooter>
          </div>

          {/* Thumbnail Strip */}
          <div className="relative px-4 pb-4">
            <div className="absolute inset-x-0 top-0 h-6 bg-gradient-to-t from-background/0 to-background pointer-events-none" />
            <div className="flex overflow-x-auto gap-3 pb-2 pt-1 -mx-4 px-4 scrollbar-hide">
              {images.map((img, index) => (
                <button
                  key={img.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Navigate to the clicked image
                    const target = e.target as HTMLButtonElement;
                    target.scrollIntoView({
                      behavior: "smooth",
                      block: "nearest",
                      inline: "center",
                    });
                  }}
                  className={cn(
                    "relative flex-shrink-0 w-16 h-16 rounded-sm overflow-hidden transition-all duration-200",
                    "border-2 hover:border-primary/50",
                    index === currentIndex
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-transparent hover:scale-105"
                  )}
                >
                  <img
                    src={img?.centerImage}
                    alt=""
                    className={cn(
                      "w-full h-full object-cover transition-all duration-200",
                      index !== currentIndex && "opacity-80 hover:opacity-100"
                    )}
                  />
                </button>
              ))}
            </div>
            <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-b from-background/0 to-background pointer-events-none" />
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
