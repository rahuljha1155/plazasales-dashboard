import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  useCreateInclusion,
  useGetInclusion,
  useUpdateInclusion,
} from "@/hooks/useInclusion";
import { Loader } from "lucide-react";
import RichTextEditor from "../RichTextEditor";

interface InclusionData {
  title: string;
  description: string;
  image?: string;
  days?: string;
  sortOrder?: number;
  isActive?: boolean;
  imageFile?: File | null;
}

export default function CreateInclusionSheet({
  id,
  editId,
  onClose,
}: {
  id: string;
  editId?: string | null;
  onClose?: () => void;
}) {
  const [formData, setFormData] = useState<InclusionData>({
    title: "",
    description: "",
    days: "",
    sortOrder: 0,
    isActive: true,
  });

  const { data: existingInclusion } = useGetInclusion(editId || "");

  useEffect(() => {
    if (editId && existingInclusion) {
      setFormData({
        title: existingInclusion.title || "",
        description: existingInclusion.description || "",
        days: existingInclusion.days || "",
        sortOrder: existingInclusion.sortOrder || 0,
        isActive: existingInclusion.isActive ?? true,
      });
    }
  }, [editId, existingInclusion]);
  const [errors, setErrors] = useState<Partial<InclusionData>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutateAsync: createInclusion, isPending: isCreating } =
    useCreateInclusion();
  const { mutateAsync: updateInclusion, isPending: isUpdating } =
    useUpdateInclusion(editId || "");

  const validateForm = () => {
    const newErrors: Partial<InclusionData> = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isLoading = isCreating || isUpdating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      if (formData.days) formDataToSend.append("days", formData.days);
      if (formData.sortOrder !== undefined)
        formDataToSend.append("sortOrder", formData.sortOrder.toString());
      if (formData.isActive !== undefined)
        formDataToSend.append("isActive", formData.isActive.toString());
      if (formData.imageFile) {
        formDataToSend.append("image", formData.imageFile);
      }

      if (editId) {
        // Update existing inclusion
        await updateInclusion(formDataToSend);
        toast.success("Inclusion updated successfully");
      } else {
        // Create new inclusion
        await createInclusion({
          packageId: id,
          formData: formDataToSend,
        });
        toast.success("Inclusion created successfully");
      }

      // Reset form
      if (!editId) {
        setFormData({
          title: "",
          description: "",
          days: "",
          sortOrder: 0,
          isActive: true,
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }

      onClose?.();
    } catch (error: any) {
   
      toast.error(
        error.message || `Failed to ${editId ? "update" : "create"} inclusion`
      );
    }
  };

  return (
    <div className="w-full p-4 rounded-sm">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">
          {editId ? "Update Inclusion" : "Create Inclusion"}
        </h1>
        <p className="text-sm text-gray-600">
          {editId
            ? "Modify this inclusion"
            : "Add a new inclusion for this package"}
        </p>
      </header>

      <form className="grid gap-6" onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-2 gap-4 items-center">
          {/* Title */}
          <div className="grid gap-1">
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
              className="h-10 w-full rounded-[2px] border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter title"
              aria-invalid={!!errors.title}
              aria-describedby="title-error"
            />
            {errors.title && (
              <p id="title-error" className="text-sm text-red-500">
                {errors.title}
              </p>
            )}
          </div>

          {/* Sort Order */}
          <div className="space-y-2">
            <label htmlFor="sortOrder" className="text-sm font-medium">
              Sort Order
            </label>
            <input
              id="sortOrder"
              type="number"
              value={formData.sortOrder}
              onChange={(e) =>
                setFormData({ ...formData, sortOrder: Number(e.target.value) })
              }
              className="h-10 w-full rounded-[2px] border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter sort order"
            />
          </div>
        </div>

        {/* Is Active */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive ?? true}
            onChange={(e) =>
              setFormData({ ...formData, isActive: e.target.checked })
            }
            className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
          />
          <label htmlFor="isActive" className="text-sm font-medium">
            Is Active
          </label>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">
            Description
          </label>
          <RichTextEditor
            initialContent={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e })}
            className="min-h-[80px] w-full rounded-[2px] border border-gray-300 px-3 py-2 text-sm shadow-sm resize-y focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Enter description"
            aria-invalid={!!errors.description}
            aria-describedby="description-error"
          />
          {errors.description && (
            <p id="description-error" className="text-sm text-red-500">
              {errors.description}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end items-center">
          <Button
            variant={"outline"}
            type="button"
            disabled={isUpdating}
            className="mr-2 border"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button type="submit" className="w-fit " disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                {editId ? "Updating..." : "Creating..."}
              </>
            ) : editId ? (
              "Update Inclusion"
            ) : (
              "Create Inclusion"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
