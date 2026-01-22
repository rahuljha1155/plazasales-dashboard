import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader, X } from "lucide-react";
import { toast } from "sonner";
import {
  useUpdateImportantNotice,
  useGetImportantNoticeById,
} from "@/hooks/useImportantNotice";
import { useNavigate } from "react-router-dom";
import RichTextEditor from "../RichTextEditor";
import { Icon } from "@iconify/react/dist/iconify.js";

interface RequirementData {
  title: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
}

interface EditRequirementSheetProps {
  id: string;
  onClose?: () => void;
}

export default function EditImportantNoticeSheet({
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
    isActive: true,
    sortOrder: 0,
  });
  const [errors, setErrors] = useState<Partial<RequirementData>>({});
  const { mutateAsync: updateImportantNotice, isPending: isUpdating } =
    useUpdateImportantNotice(id);
  const { data: requirementData } = useGetImportantNoticeById(id);

  useEffect(() => {
    if (requirementData?.data) {
      setFormData({
        title: requirementData.data.title,
        description: requirementData.data.description,
        isActive: requirementData.data.isActive ?? true,
        sortOrder: requirementData.data.sortOrder ?? 0,
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
      formDataToSend.append("isActive", formData.isActive.toString());
      formDataToSend.append("sortOrder", formData.sortOrder.toString());

      await updateImportantNotice(formDataToSend, {
        onSuccess: () => {
          toast.success("Important Notice updated successfully");
          setFormData({
            title: "",
            description: "",
            isActive: true,
            sortOrder: 0,
          });
          setErrors({});
          handleClose();
        },
        onError: (error: any) => {
          toast.error("Failed to update important notice");
        },
      });
    } catch (error) {
      toast.error("Failed to update important notice");
    }
  };

  return (
    <div className="p-6 w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Edit Important Notice</h1>
          <p className="text-muted-foreground">
            Update important notice details for this package
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

        <div className="grid gap-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium">
              Active
            </label>
          </div>

          <div className="grid gap-1">
            <label htmlFor="sortOrder" className="text-sm font-medium">
              Sort Order
            </label>
            <input
              id="sortOrder"
              type="number"
              value={formData.sortOrder}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  sortOrder: parseInt(e.target.value) || 0,
                })
              }
              className="flex h-10 w-full rounded-[2px] border px-3 py-2 text-sm shadow-sm"
              placeholder="Enter sort order"
              min="0"
            />
          </div>
        </div>

        <Button onClick={handleSubmit} disabled={isUpdating} className="w-full">
          {isUpdating ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Update Important Notice"
          )}
        </Button>
      </div>
    </div>
  );
}
function updateImportantNotice(
  formDataToSend: FormData,
  arg1: { onSuccess: () => void; onError: (error: any) => void }
) {
  throw new Error("Function not implemented.");
}
