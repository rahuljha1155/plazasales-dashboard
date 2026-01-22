import { useState, useRef, useEffect } from "react";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import { href, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { api } from "@/services/api";
import Breadcrumb from "@/components/dashboard/Breadcumb";

const HomeGalleryCreate = () => {
  const navigate = useNavigate();
  const [centerImage, setCenterImage] = useState<File | null>(null);
  const [sideImages, setSideImages] = useState<File[]>([]);
  const [sortOrder, setSortOrder] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const centerImageInputRef = useRef<HTMLInputElement>(null);
  const sideImagesInputRef = useRef<HTMLInputElement>(null);

  const links = [
    { label: "Home-Gallery", href: "/dashboard/home-gallery" },
    { label: "Create", isActive: true },
  ];

  const handleCenterImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setCenterImage(file);
  };

  const handleSideImagesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select only image files");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Each image size should be less than 5MB");
        return;
      }
    }

    setSideImages(prev => [...prev, ...files]);
  };

  const removeCenterImage = () => {
    setCenterImage(null);
    if (centerImageInputRef.current) {
      centerImageInputRef.current.value = "";
    }
  };

  const removeSideImage = (index: number) => {
    setSideImages(prev => prev.filter((_, i) => i !== index));
  };

  const getImagePreview = (image: File): string => {
    return URL.createObjectURL(image);
  };

  const handleSubmit = async () => {
    if (!centerImage) {
      toast.error("Please select a center image");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("centerImage", centerImage);

      sideImages.forEach((image) => {
        formData.append("sideImages", image);
      });

      formData.append("sortOrder", sortOrder.toString());

      await api.post(`/home-gallery/create-home-gallery`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Gallery created successfully");
      window.dispatchEvent(new Event("homeGallery:refetch"));
      navigate("/dashboard/home-gallery");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to create gallery";
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className=" mx-auto ">
      <div className="flex items-center justify-between mb-6">
        <Breadcrumb links={links} />
      </div>

      <div className="bg-white rounded-sm border p-6 max-w-4xl">
        <h2 className="text-2xl font-semibold mb-6">Create New Gallery</h2>

        <div className="space-y-6">
          {/* Center Image */}
          <div className="space-y-2">
            <Label>Center Image *</Label>
            <div
              className={cn(
                "border-2 border-dashed rounded-sm p-6 text-center transition-colors",
                centerImage ? "border-transparent" : "border-border"
              )}
            >
              {centerImage ? (
                <div className="relative group">
                  <div className="relative w-full h-64 overflow-hidden rounded-[2px]">
                    <img
                      src={getImagePreview(centerImage)}
                      alt="Center Preview"
                      className="w-full h-full object-contain"
                    />
                    {!uploading && (
                      <button
                        type="button"
                        onClick={removeCenterImage}
                        className="absolute top-2 right-2 p-1.5 bg-black/70 text-white rounded-full hover:bg-black/90 transition-colors"
                        disabled={uploading}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground truncate">
                    {centerImage.name}
                  </p>
                </div>
              ) : (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCenterImageSelect}
                    className="hidden"
                    id="center-image-upload"
                    ref={centerImageInputRef}
                    disabled={uploading}
                  />
                  <label
                    htmlFor="center-image-upload"
                    className={cn(
                      "cursor-pointer flex flex-col items-center justify-center h-40",
                      uploading && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <Upload className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
                    <p className="font-medium">Click to select center image</p>
                    <p className="text-sm text-muted-foreground">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </label>
                </>
              )}
            </div>
          </div>

          {/* Side Images */}
          <div className="space-y-2">
            <Label>Side Images</Label>
            <div className="border-2 border-dashed rounded-sm p-6 transition-colors border-border">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleSideImagesSelect}
                className="hidden"
                id="side-images-upload"
                ref={sideImagesInputRef}
                disabled={uploading}
              />
              <label
                htmlFor="side-images-upload"
                className={cn(
                  "cursor-pointer flex flex-col items-center justify-center py-6",
                  uploading && "opacity-50 cursor-not-allowed"
                )}
              >
                <Upload className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
                <p className="font-medium">Click to add side images</p>
                <p className="text-sm text-muted-foreground">
                  PNG, JPG, GIF up to 5MB each (Multiple files allowed)
                </p>
              </label>

              {sideImages.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {sideImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="relative w-full h-32 overflow-hidden rounded-[2px] border">
                        <img
                          src={getImagePreview(image)}
                          alt={`Side ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {!uploading && (
                          <button
                            type="button"
                            onClick={() => removeSideImage(index)}
                            className="absolute top-1 right-1 p-1 bg-black/70 text-white rounded-full hover:bg-black/90 transition-colors"
                            disabled={uploading}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground truncate">
                        {image.name}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <label htmlFor="sortorder">Sort Order</label>
            <Input
              id="sortorder"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              disabled={uploading}
            />
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

        <div className="flex justify-end gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/dashboard/home-gallery")}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!centerImage || uploading}
          >
            {uploading ? "Creating..." : "Create Gallery"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HomeGalleryCreate;
