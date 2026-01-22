import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FilePenLine, Loader, Upload, X } from "lucide-react";
import { api } from "@/services/api";
import { toast } from "sonner";
import { useParams, useNavigate } from "react-router-dom";
import { useCreateRequirement } from "@/hooks/useRequirement";
import RichTextEditor from "../RichTextEditor";
import { Icon } from "@iconify/react/dist/iconify.js";

interface RequirementData {
  title: string;
  description: string;
  image?: string;
  imageFile?: File;
}

// Helper component for image preview
function ImagePreview({ file }: { file: File }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setSrc(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);
  if (!src) return null;
  return (
    <img
      src={src}
      alt={file.name}
      className="max-h-40 rounded border mb-2"
      style={{ objectFit: "contain" }}
    />
  );
}

interface CreateRequirementSheetProps {
  id: string;
  onClose?: () => void;
}

export default function CreateRequirementSheet({
  id,
  onClose,
}: CreateRequirementSheetProps) {
  const params = useParams();
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
  const { mutateAsync: createRequirement, isPending: isUpdating } =
    useCreateRequirement();

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

      await createRequirement(
        { packageId: params.id ?? "", formData: formDataToSend },
        {
          onSuccess: () => {
            toast.success("Requirement created successfully");
            setFormData({
              title: "",
              description: "",
              imageFile: undefined,
            });
            handleClose();
          },
          onError: (error: any) => {
            toast.error("Failed to create requirement");
          },
        }
      );
    } catch (error) {
      toast.error("Failed to create requirement");
    }
  };

  return (
    <div className="p-6 w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Create Requirement</h1>
          <p className="text-muted-foreground">
            Add a new requirement for this package
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
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-6 w-6 text-gray-400" />
              <p className="text-sm text-gray-500">Click to select an image</p>
              <p className="text-xs text-gray-400">
                Supported formats: PNG, JPG, JPEG, GIF (MAX 2MB)
              </p>
            </div>
            {formData.imageFile && (
              <div className="mt-4 flex flex-col items-center gap-2">
                {/* Image Preview */}
                <ImagePreview file={formData.imageFile} />
                <p className="text-sm text-gray-600">
                  Selected file: {formData.imageFile.name}
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
                if (file.size > 2 * 1024 * 1024) {
                  toast.error("Image size should be less than 2MB");
                  return;
                }
              }
              if (file) {
                setFormData((prev) => ({ ...prev, imageFile: file }));
              }
            }}
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={isUpdating}>
            {isUpdating ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Requirement"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
