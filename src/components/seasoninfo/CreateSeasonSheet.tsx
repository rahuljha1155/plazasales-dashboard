import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useParams, useNavigate } from "react-router-dom";
import { useCreateSeasonInfo } from "@/hooks/useSeasonInfo";
import { Loader, X } from "lucide-react";
import RichTextEditor from "../RichTextEditor";
import { Icon } from "@iconify/react/dist/iconify.js";

interface RequirementData {
  title: string;
  description: string;
}

interface CreateRequirementSheetProps {
  id: string;
  onClose?: () => void;
}

export default function CreateSeasonSheet({
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
  });
  const [errors, setErrors] = useState<Partial<RequirementData>>({});
  const { mutateAsync: createSeasonInfo, isPending: isUpdating } =
    useCreateSeasonInfo();

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
      formDataToSend.append("package", params.id || "");

      await createSeasonInfo(
        { formData: formDataToSend },
        {
          onSuccess: () => {
            toast.success("Season created successfully");
            setFormData({
              title: "",
              description: "",
            });
            handleClose();
          },
          onError: (error: any) => {
            toast.error("Failed to create season");
          },
        }
      );
    } catch (error) {
      toast.error("Failed to create season");
    }
  };

  return (
    <div className="p-6 w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Create Season Info</h1>
          <p className="text-muted-foreground">
            Add a new season for this package
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

        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={isUpdating}>
            {isUpdating ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Season Info"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
