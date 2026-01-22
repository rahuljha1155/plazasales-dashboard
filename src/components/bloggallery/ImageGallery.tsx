import { useEffect, useState, useRef } from "react";
import {
  Image as ImageIcon,
  Trash2,
  Copy,
  Check,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api";

interface ImageData {
  _id: string;
  url: string;
  publicId: string;
  originalName: string;
  size: number;
  width: number;
  height: number;
  altText: string;
  createdAt: string;
  [key: string]: any;
}

const ImageGallery = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<{
    id: string;
    publicId: string;
  } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await api.get("/images");
      setImages(response.data.data);
    } catch (error) {
      toast.error("Failed to load images");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, publicId: string) => {
    try {
      setDeletingId(id);
      await api.delete(`/images/${id}`, { data: { publicId } });
      setImages(images.filter((img) => img._id !== id));
      toast.success("Image deleted successfully");
    } catch (error) {
      toast.error("Failed to delete image");
    } finally {
      setDeletingId(null);
      setShowDeleteModal(false);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success("Image URL copied to clipboard");
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      toast.error("Failed to copy URL");
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("altText", `Uploaded image: ${file.name}`);

    try {
      setUploading(true);
      setUploadProgress(0);

      const response = await api.post("/images/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setUploadProgress(progress);
        },
      });

      setImages([response.data.data, ...images]);
      toast.success("Image uploaded successfully");
      setShowUploadModal(false);
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Image Gallery</h1>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 bg-primary hover:bg-orange-700 text-white px-4 py-2 rounded-sm transition-colors"
        >
          <Upload size={18} />
          Upload Image
        </button>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => !uploading && setShowUploadModal(false)}
        >
          <div
            className={`bg-white rounded-sm p-6 w-full max-w-md ${uploading ? "pointer-events-none" : ""
              }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Upload Image</h2>
              <button
                onClick={() => !uploading && setShowUploadModal(false)}
                disabled={uploading}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div
              className={`border-2 border-dashed rounded-sm p-8 text-center cursor-pointer transition-colors ${dragActive
                ? "border-orange-500 bg-orange-50"
                : "border-gray-300 hover:border-orange-400 hover:bg-orange-50"
                }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">
                {dragActive
                  ? "Drop the image here"
                  : "Drag & drop an image here, or click to select"}
              </p>
              <p className="text-sm text-gray-500">
                Supports JPG, PNG, GIF up to 5MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileInput}
                disabled={uploading}
              />
            </div>

            {uploading && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-primary h-2.5 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2 text-center">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => !uploading && setShowUploadModal(false)}
                disabled={uploading}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-sm disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-4 py-2 bg-primary text-white rounded-sm hover:bg-orange-700 disabled:opacity-50"
              >
                Select File
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4  gap-4">
        {images.map((image) => (
          <div
            key={image._id}
            className="relative group bg-white rounded-sm shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            onClick={() => setSelectedImage(image)}
          >
            <div className="aspect-w-16 aspect-h-9 bg-gray-100">
              <img
                src={image.url}
                alt={image.altText}
                className="w-full h-48 object-cover"
                loading="lazy"
              />
            </div>
            <div className="p-3">
              <p className="text-sm font-medium text-gray-900 truncate">
                {image.originalName}
              </p>
              <p className="text-xs text-gray-500">
                {image.width}x{image.height} • {formatFileSize(image.size)}
              </p>
            </div>
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(image.url, image._id);
                }}
                className="text-white bg-primary hover:bg-orange-700 rounded-full p-2 transition-colors"
                title="Copy URL"
              >
                {copiedId === image._id ? (
                  <Check size={16} />
                ) : (
                  <Copy size={16} />
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setImageToDelete({ id: image._id, publicId: image.publicId });
                  setShowDeleteModal(true);
                }}
                disabled={deletingId === image._id}
                className={`text-white rounded-full p-2 transition-colors ${deletingId === image._id
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700"
                  }`}
                title="Delete image"
              >
                {deletingId === image._id ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Trash2 size={16} />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && imageToDelete && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="bg-white rounded-sm p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Are you absolutely sure?</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              This action cannot be undone. It will permanently delete the selected item.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-sm"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (imageToDelete) {
                    await handleDelete(
                      imageToDelete.id,
                      imageToDelete.publicId
                    );
                  }
                }}
                disabled={!!deletingId}
                className={`px-4 py-2 text-white rounded-sm flex items-center gap-2 ${deletingId
                  ? "bg-red-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700"
                  }`}
              >
                {deletingId === imageToDelete?.id && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {deletingId === imageToDelete?.id ? "Confirming..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
