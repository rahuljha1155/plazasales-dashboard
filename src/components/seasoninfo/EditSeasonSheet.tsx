import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader, Upload, X } from "lucide-react";
import { api } from "@/services/api";
import { toast } from "sonner";
import {
  useUpdateSeasonInfo,
  useGetSeasonInfoById,
} from "@/hooks/useSeasonInfo";
import { useNavigate } from "react-router-dom";
import RichTextEditor from "../RichTextEditor";
import { Icon } from "@iconify/react/dist/iconify.js";

interface RequirementData {
  title: string;
  description: string;
}

interface EditRequirementSheetProps {
  id: string;
  onClose?: () => void;
}

export default function EditSeasonSheet({
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
  });
  const [errors, setErrors] = useState<Partial<RequirementData>>({});
  const { mutateAsync: updateSeasonInfo, isPending: isUpdating } =
    useUpdateSeasonInfo(id);
  const { data: requirementData } = useGetSeasonInfoById(id);

  useEffect(() => {
    if (requirementData) {
      setFormData({
        title: requirementData.title,
        description: requirementData.description,
      });
    }
  }, [requirementData]);

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

      await updateSeasonInfo(formDataToSend, {
        onSuccess: () => {
          toast.success("Season updated successfully");
          setFormData({
            title: "",
            description: "",
          });
          setErrors({});
          handleClose();
        },
        onError: (error: any) => {
          toast.error("Failed to update season");
        },
      });
    } catch (error) {
      toast.error("Failed to update season");
    }
  };

  return (
    <div className="p-6 w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Edit Season</h1>
          <p className="text-muted-foreground">
            Update season details for this package
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
              // Focus the editor when clicking anywhere in the description area
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
                setFormData({ ...formData, description: value })
              }
              className="flex min-h-[60px] w-full rounded-[2px] border px-3 py-2 text-sm shadow-sm"
              placeholder="Enter description"
            />
          </div>
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description}</p>
          )}
        </div>

        <Button onClick={handleSubmit} disabled={isUpdating} className="w-full">
          {isUpdating ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Update Season Info"
          )}
        </Button>
      </div>
    </div>
  );
}
