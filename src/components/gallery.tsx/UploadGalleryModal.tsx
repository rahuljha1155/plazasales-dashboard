import { useState, useRef, useEffect } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface UploadGalleryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (
    file: File | null,
    caption: string,
    isEdit?: boolean
  ) => Promise<boolean>;
  uploading: boolean;
  uploadProgress: number;
  editData?: {
    id: string;
    imageUrl: string;
    caption: string;
    sortOrder: number;
    isActive: boolean;
  } | null;
}

export const UploadGalleryModal: React.FC<UploadGalleryModalProps> = ({
  open,
  onOpenChange,
  onUpload,
  uploading,
  uploadProgress,
  editData = null,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditMode = Boolean(editData);

  // Initialize form with edit data when in edit mode
  useEffect(() => {
    if (editData) {
      setCaption(editData.caption || "");
      setSortOrder(editData.sortOrder || 0);
      setIsActive(editData.isActive ?? true);
      setImagePreview(editData.imageUrl);
    } else {
      setCaption("");
      setSortOrder(0);
      setIsActive(true);
      setSelectedFile(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [editData, open]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setSelectedFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!isEditMode && !selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    try {
      const success = await onUpload(
        selectedFile,
        JSON.stringify({
          caption,
          sortOrder: Number(sortOrder) || 0,
          isActive,
        }),
        isEditMode
      );

      if (success) {
        // Reset form on successful operation
        if (!isEditMode) {
          setSelectedFile(null);
          setImagePreview(null);
          setCaption("");
          setSortOrder(0);
          setIsActive(true);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }
      }
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Small delay to allow the modal to close before resetting the form
    setTimeout(() => {
      if (!isEditMode) {
        setSelectedFile(null);
        setImagePreview(null);
        setCaption("");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }, 300);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) handleClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Image" : "Upload New Image"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the image or caption"
              : "Add a new image to your gallery"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <label htmlFor="pb-2">Image  <span className="text-primary">(Aspect Ratio 16/9) 1920 × 1080 px</span></label>
          <div
            className={cn(
              "border-2 mt-2 border-dashed rounded-sm p-6 text-center transition-colors",
              imagePreview ? "border-transparent" : "border-border"
            )}
          >
            {imagePreview ? (
              <div className="relative group">
                <div className="relative w-full h-64 overflow-hidden rounded-[2px]">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                  {!uploading && (
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1.5 bg-black/70 text-white rounded-full hover:bg-black/90 transition-colors"
                      disabled={uploading}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {selectedFile && (
                  <p className="mt-2 text-sm text-muted-foreground truncate">
                    {selectedFile.name}
                  </p>
                )}
              </div>
            ) : (
              <>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                  ref={fileInputRef}
                  disabled={uploading}
                />
                <label
                  htmlFor="file-upload"
                  className={cn(
                    "cursor-pointer flex flex-col items-center justify-center h-40",
                    uploading && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Upload className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
                  <p className="font-medium">Click to select an image</p>
                  <p className="text-sm text-muted-foreground">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </label>
              </>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="caption">
                Caption {!isEditMode && "(Optional)"}
              </Label>
              <Input
                id="caption"
                placeholder="Enter image caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                disabled={uploading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  placeholder="Sort order"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
                  disabled={uploading}
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="active"
                      name="status"
                      checked={isActive}
                      onChange={() => setIsActive(true)}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                      disabled={uploading}
                    />
                    <Label
                      htmlFor="active"
                      className="text-sm font-medium text-gray-700"
                    >
                      Active
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="inactive"
                      name="status"
                      checked={!isActive}
                      onChange={() => setIsActive(false)}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                      disabled={uploading}
                    />
                    <Label
                      htmlFor="inactive"
                      className="text-sm font-medium text-gray-700"
                    >
                      Inactive
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {uploading && (
            <div className="space-y-2">
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={(!isEditMode && !selectedFile) || uploading}
          >
            {uploading
              ? isEditMode
                ? "Updating..."
                : "Uploading..."
              : isEditMode
                ? "Update Image"
                : "Upload Image"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UploadGalleryModal;
