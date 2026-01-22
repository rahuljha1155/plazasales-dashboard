import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCreateGear } from "@/hooks/useGear";
import { Loader } from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";

interface GearData {
  title: string;
  description: string;
}

export default function CreateGearSheet({
  id,
  editId,
  onClose,
}: {
  id: string;
  editId?: string | null;
  onClose?: () => void;
}) {
  const [formData, setFormData] = useState<GearData>({
    title: "",
    description: "",
  });
  const [errors, setErrors] = useState<Partial<GearData>>({});

  const { mutateAsync: createGear, isPending: isUpdating } = useCreateGear();

  const validateForm = () => {
    const newErrors: Partial<GearData> = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!id) {
      toast.error("Package ID is missing");
      return;
    }

    try {
      await createGear({ packageId: id, body: formData });

      toast.success(
        editId ? "Gear updated successfully" : "Gear created successfully"
      );
      if (onClose) onClose();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create gear";
      toast.error(message);
    }
  };

  return (
    <div className="w-full  rounded-sm">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">
          {editId ? "Update Gear" : "Create Gear"}
        </h1>
        <p className="text-sm text-gray-600">
          {editId
            ? "Modify this gear item"
            : "Add a new gear item for this package"}
        </p>
      </header>

      <form className="grid gap-6" onSubmit={handleSubmit}>
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

        {/* Description */}
        <div className="grid gap-1">
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
        <div className="flex justify-end">
          <Button
            variant={"outline"}
            type="button"
            disabled={isUpdating}
            className="mr-2 border"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                {editId ? "Updating..." : "Creating..."}
              </>
            ) : editId ? (
              "Update Gear"
            ) : (
              "Create Gear"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
