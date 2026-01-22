import React, { type RefObject } from "react";
import { toast } from "sonner";

export type ImageFile = {
  file: File;
  url: string;
};

type ImageUploadProps = {
  images: ImageFile[];
  setImages: React.Dispatch<React.SetStateAction<ImageFile[]>>;
  fileInputRef: RefObject<HTMLInputElement | null>;
  imageslabel?: string;
};

const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  setImages,
  fileInputRef,
  imageslabel = "Upload Images",
}) => {
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleImageUpload(e.dataTransfer.files);
  };

  const handleBrowse = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = (files: FileList | null) => {
    if (!files) {
      toast.error("No files selected.");
      return;
    }

    const validImages: ImageFile[] = [];

    Array.from(files).forEach((file) => {
      if (!["image/jpeg", "image/png", "image/svg+xml"].includes(file.type)) {
        toast.error(`${file.name} is not a supported image type.`);
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 2MB size limit.`);
        return;
      }

      validImages.push({ file, url: URL.createObjectURL(file) });
    });

    if (validImages.length > 0) {
      setImages((prev) => [...prev, ...validImages]);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-2 text-gray-700">
        {imageslabel} <span className="text-red-500">*</span>
      </label>

      <div className="flex flex-col md:flex-row gap-6 justify-center">
        <div
          className="w-full md:w-1/2 min-h-60 border-2 border-dashed border-gray-300 rounded-[2px] flex flex-col items-center justify-center text-gray-500 text-sm cursor-pointer hover:bg-gray-50 transition"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={handleBrowse}
        >
          <input
            type="file"
            multiple
            accept="image/png, image/jpeg, image/svg+xml"
            hidden
            ref={fileInputRef}
            onChange={(e) => handleImageUpload(e.target.files)}
          />
          <p className="text-xl font-medium">Click or drag files</p>
          <p className="text-xs text-gray-400 mt-1">
            Max 2MB • JPG / PNG / SVG
          </p>
        </div>

        {images.length > 0 && (
          <div className="w-full md:w-1/2 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {images.map((img, i) => (
              <div
                key={i}
                className="relative group border rounded-[2px] overflow-hidden shadow-sm"
              >
                <img
                  src={img.url}
                  alt={`Preview-${i}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 w-full bg-white/70 text-[10px] text-center px-1 py-0.5 truncate">
                  {img.file.name}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
