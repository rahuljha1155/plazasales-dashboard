import { useState, useRef, useEffect } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { HomeGalleryType } from "@/types/homegalleryType";

interface HomeGalleryFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (formData: FormData) => Promise<boolean>;
  uploading: boolean;
  editData?: HomeGalleryType | null;
}

export const HomeGalleryFormModal: React.FC<HomeGalleryFormModalProps> = ({
  open,
  onOpenChange,
  onSubmit,
  uploading,
  editData = null,
}) => {
  const [centerImage, setCenterImage] = useState<File | null>(null);
  const [sideImages, setSideImages] = useState<File[]>([]);
  const [centerImagePreview, setCenterImagePreview] = useState<string | null>(null);
  const [sideImagePreviews, setSideImagePreviews] = useState<string[]>([]);

  const centerFileInputRef = useRef<HTMLInputElement>(null);
  const sideFilesInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = Boolean(editData);

  // Initialize form with edit data when in edit mode
  useEffect(() => {
    if (editData && open) {
      // Set preview for center image from existing data
      if (editData.centerImage) {
        setCenterImagePreview(editData.centerImage);
      }

      // Set preview for side images from existing data
      if (editData.sideImages && editData.sideImages.length > 0) {
        setSideImagePreviews(editData.sideImages);
      }
    } else if (!open) {
      // Reset form when modal closes
      resetForm();
    }
  }, [editData, open]);

  const resetForm = () => {
    setCenterImage(null);
    setSideImages([]);
    setCenterImagePreview(null);
    setSideImagePreviews([]);
    if (centerFileInputRef.current) {
      centerFileInputRef.current.value = "";
    }
    if (sideFilesInputRef.current) {
      sideFilesInputRef.current.value = "";
    }
  };

  const handleCenterImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Center image size should be less than 10MB");
      return;
    }

    setCenterImage(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setCenterImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSideImagesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

    // Check if total (existing + new) exceeds 5
    const totalImages = sideImagePreviews.length + files.length;
    if (totalImages > 5) {
      toast.error("You can only upload up to 5 side images");
      return;
    }

    // Validate each file
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image file`);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB limit`);
        return;
      }
    }

    setSideImages((prev) => [...prev, ...files]);

    // Create preview URLs
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSideImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeCenterImage = () => {
    setCenterImage(null);
    setCenterImagePreview(null);
    if (centerFileInputRef.current) {
      centerFileInputRef.current.value = "";
    }
  };

  const removeSideImage = (index: number) => {
    setSideImages((prev) => prev.filter((_, i) => i !== index));
    setSideImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    // Validation
    if (!isEditMode && !centerImage) {
      toast.error("Please select a center image");
      return;
    }

    if (!isEditMode && sideImages.length === 0) {
      toast.error("Please select at least one side image");
      return;
    }

    const formData = new FormData();

    // Append center image if new one is selected
    if (centerImage) {
      formData.append("centerImage", centerImage);
    }

    // Append side images if new ones are selected
    sideImages.forEach((file) => {
      formData.append("sideImages", file);
    });

    const success = await onSubmit(formData);

    if (success) {
      resetForm();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Home Gallery" : "Create Home Gallery"}
          </DialogTitle>
          <DialogDescription>
            Upload a center image and up to 5 side images for the home gallery.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Center Image */}
          <div className="space-y-2">
            <Label htmlFor="center-image" className="text-base font-semibold">
              Center Image <span className="text-red-500">*</span>
            </Label>
            <p className="text-sm text-muted-foreground">
              Main showcase image (max 10MB)
            </p>

            <div className="space-y-4">
              {centerImagePreview ? (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
                  <img
                    src={centerImagePreview}
                    alt="Center preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={removeCenterImage}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    type="button"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => centerFileInputRef.current?.click()}
                  className="w-full aspect-video rounded-lg border-2 border-dashed border-gray-300 hover:border-primary cursor-pointer transition-colors flex flex-col items-center justify-center gap-2 bg-gray-50"
                >
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                  <p className="text-sm text-gray-600">Click to upload center image</p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                </div>
              )}

              <input
                ref={centerFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleCenterImageSelect}
                className="hidden"
                id="center-image"
              />
            </div>
          </div>

          {/* Side Images */}
          <div className="space-y-2">
            <Label htmlFor="side-images" className="text-base font-semibold">
              Side Images (Up to 5) <span className="text-red-500">*</span>
            </Label>
            <p className="text-sm text-muted-foreground">
              Supporting images for the gallery (max 5MB each)
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {sideImagePreviews.map((preview, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-lg overflow-hidden border-2 border-dashed border-gray-300"
                  >
                    <img
                      src={preview}
                      alt={`Side preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeSideImage(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      type="button"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {sideImagePreviews.length < 5 && (
                  <div
                    onClick={() => sideFilesInputRef.current?.click()}
                    className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-primary cursor-pointer transition-colors flex flex-col items-center justify-center gap-1 bg-gray-50"
                  >
                    <Upload className="w-8 h-8 text-gray-400" />
                    <p className="text-xs text-gray-600">Add images</p>
                  </div>
                )}
              </div>

              <input
                ref={sideFilesInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleSideImagesSelect}
                className="hidden"
                id="side-images"
              />

              <p className="text-xs text-gray-500">
                {sideImagePreviews.length} of 5 images selected
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              resetForm();
              onOpenChange(false);
            }}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={uploading}>
            {uploading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {isEditMode ? "Updating..." : "Creating..."}
              </div>
            ) : (
              <>{isEditMode ? "Update Gallery" : "Create Gallery"}</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
