import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader, Upload, X } from "lucide-react";
import { api } from "@/services/api";
import { toast } from "sonner";
import { useUpdateRequirement } from "@/hooks/useRequirement";
import { useNavigate } from "react-router-dom";
import RichTextEditor from "../RichTextEditor";
import { Icon } from "@iconify/react/dist/iconify.js";

interface RequirementData {
  title: string;
  description: string;
  image?: string;
  imageFile?: File;
}

interface EditRequirementSheetProps {
  id: string;
  onClose?: () => void;
}

export default function EditRequirementSheet({
  id,
  onClose,
}: EditRequirementSheetProps) {
  const navigate = useNavigate();
  const handleClose = () => {
    if (onClose) onClose();
    else navigate(-1); // Go back if no onClose provided
  };
  const [formData, setFormData] = useState<RequirementData>({
    title: "",
    description: "",
    image: "",
  });
  const [errors, setErrors] = useState<Partial<RequirementData>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutateAsync: updateRequirement, isPending: isUpdating } =
    useUpdateRequirement(id);

  const validateForm = () => {
    const newErrors: Partial<RequirementData> = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);

      if (formData.imageFile) {
        formDataToSend.append("image", formData.imageFile);
      }

      await updateRequirement(formDataToSend, {
        onSuccess: () => {
          toast.success("Requirement updated successfully");
          setFormData({
            title: "",
            description: "",
            image: "",
            imageFile: undefined,
          });
          setErrors({});
          handleClose();
        },
        onError: (error: any) => {
          toast.error("Failed to update requirement");
        },
      });
    } catch (error) {
      toast.error("Failed to update requirement");
    }
  };

  const fetchRequirement = async () => {
    try {
      const { data } = await api.get(`requirement/${id}`);
      setFormData(data?.data || {});
    } catch (error: any) {
      toast.error("Failed to load requirement data");
    }
  };

  // Cleanup object URLs when they're no longer needed
  useEffect(() => {
    return () => {
      if (formData.image && formData.image.startsWith('blob:')) {
        URL.revokeObjectURL(formData.image);
      }
    };
  }, [formData.image]);

  useEffect(() => {
    fetchRequirement();
  }, [id]);

  return (
    <div className="p-6 w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Edit Requirement</h1>
          <p className="text-muted-foreground">
            Update requirement details for this package
          </p>
        </div>
        <Button
                              onClick={handleClose}
                              variant="outline"
                              className="text-red-500 flex items-center gap-2 cursor-pointer"
                            >
                              <Icon icon="solar:exit-bold-duotone" width="24" height="24" />
                              Exit
                            </Button>
      </div>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <label htmlFor="title" className="text-sm font-medium">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="flex h-10 w-full rounded-[2px] border px-3 py-2 text-sm shadow-sm"
            placeholder="Enter title"
          />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title}</p>
          )}
        </div>

        <div className="grid gap-2">
          <label htmlFor="description" className="text-sm font-medium">
            Description
          </label>
          <div
            onClick={(e) => {
              e.stopPropagation();
              const editor = document.querySelector(".ProseMirror");
              if (editor) {
                (editor as HTMLElement).focus();
              }
            }}
            className="cursor-text"
          >
            <RichTextEditor
              initialContent={formData.description}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  description: value,
                })
              }
              className="flex min-h-[60px] w-full rounded-[2px] border px-3 py-2 text-sm shadow-sm"
              placeholder="Enter description"
            />
          </div>
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description}</p>
          )}
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium">Image</label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-sm p-4 text-center cursor-pointer hover:border-gray-400 transition-colors"
          >
            {formData.image ? (
              <div className="mt-4">
                <img
                  src={formData.image}
                  alt="Current requirement"
                  className="max-h-40 mx-auto mb-2 rounded"
                />
                <p className="text-sm text-gray-600">Current image</p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFormData({ ...formData, image: "" });
                  }}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-6 w-6 text-gray-400" />
                <p className="text-sm text-gray-500">
                  Click to select an image
                </p>
                <p className="text-xs text-gray-400">
                  Supported formats: PNG, JPG, JPEG, GIF
                </p>
              </div>
            )}
            {formData.imageFile && (
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  New file: {formData.imageFile.name}
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFormData({ ...formData, imageFile: undefined });
                  }}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const imageUrl = URL.createObjectURL(file);
                setFormData((prev) => ({
                  ...prev,
                  imageFile: file,
                  image: imageUrl, // Set preview URL for the new image
                }));
              }
            }}
          />
        </div>

        <Button onClick={handleSubmit} disabled={isUpdating} className="w-full">
          {isUpdating ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Update Requirement"
          )}
        </Button>
      </div>
    </div>
  );
}
