import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  useCreatePackageInfo,
  useUpdatePackageInfo,
} from "@/hooks/usePackageInfo";
import { Loader } from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";

interface PackageInfo {
  _id: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
}

interface CreateInclusionSheetProps {
  id: string;
  editId?: string | null;
  packageInfo?: PackageInfo | null;
  onClose?: () => void;
}

export default function CreatePackageInfoSheet({
  id,
  editId,
  packageInfo,
  onClose,
}: CreateInclusionSheetProps) {
  const [formData, setFormData] = useState({
    description: "",
    sortOrder: 0,
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { mutateAsync: createPackageInfo, isPending: isCreating } =
    useCreatePackageInfo();
  const { mutateAsync: updatePackageInfo, isPending: isUpdating } =
    useUpdatePackageInfo(editId || "");

  // Initialize form data when packageInfo changes (edit mode)
  useEffect(() => {
    if (packageInfo) {
      setFormData({
        description: packageInfo.description || "",
        sortOrder: packageInfo.sortOrder || 0,
        isActive: packageInfo.isActive ?? true,
      });
    } else {
      // Reset form when not in edit mode
      setFormData({
        description: "",
        sortOrder: 0,
        isActive: true,
      });
    }
  }, [packageInfo]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim() || formData.description === "<p></p>") {
      newErrors.description = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("description", formData.description);
      formDataToSend.append("sortOrder", formData.sortOrder.toString());
      formDataToSend.append("isActive", formData.isActive.toString());

      if (editId && packageInfo) {
        // Update existing package info
        await updatePackageInfo(formDataToSend);
        toast.success("Package Info updated successfully");
      } else {
        // Create new package info
        await createPackageInfo({
          packageId: id,
          formData: formDataToSend,
        });
        toast.success("Package Info created successfully");
      }

      // Reset form and close
      setFormData({ description: "", sortOrder: 0, isActive: true });
      if (onClose) onClose();
    } catch (error: any) {
      toast.error(
        error.message ||
        `Failed to ${editId ? "update" : "create"} package info`
      );
    }
  };

  return (
    <div className="w-full p-4 rounded-sm">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">
          {editId ? "Update Package Info" : "Create Package Info"}
        </h1>
        <p className="text-sm text-gray-600">
          {editId
            ? "Modify this package info"
            : "Add a new package info for this package"}
        </p>
      </header>

      <form className="grid gap-6" onSubmit={handleSubmit}>
        {/* Description */}
        <div className="grid gap-1">
          <label htmlFor="description" className="text-sm font-medium">
            Essential Info
          </label>
          <div className="rounded-[2px] border border-gray-300">
            <RichTextEditor
              initialContent={formData.description}
              onChange={(content) =>
                setFormData({ ...formData, description: content })
              }
              placeholder="Enter essential info description..."
            />
          </div>
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description}</p>
          )}
        </div>

        {/* Sort Order */}
        <div className="grid gap-1">
          <label htmlFor="sortOrder" className="text-sm font-medium">
            Sort Order
          </label>
          <input
            type="number"
            id="sortOrder"
            value={formData.sortOrder}
            onChange={(e) =>
              setFormData({ ...formData, sortOrder: Number(e.target.value) })
            }
            className="w-full rounded-[2px] border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Active Status */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) =>
              setFormData({ ...formData, isActive: e.target.checked })
            }
            className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
          />
          <label htmlFor="isActive" className="text-sm font-medium">
            Active
          </label>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isCreating || isUpdating}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isCreating || isUpdating}>
            {isCreating || isUpdating ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                {editId ? "Updating..." : "Creating..."}
              </>
            ) : editId ? (
              "Update Essential Info"
            ) : (
              "Create Essential Info"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
