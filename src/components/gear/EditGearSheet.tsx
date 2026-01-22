import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

import { FilePenLine, Loader, Upload, X } from "lucide-react";
import { api } from "@/services/api";
import { toast } from "sonner";
import { useParams } from "react-router-dom";
import { useUpdateGear } from "@/hooks/useGear";
import RichTextEditor from "@/components/RichTextEditor";
import { Icon } from "@iconify/react/dist/iconify.js";

interface GearData {
  title: string;
  description: string;
}

interface EditGearSheetProps {
  id: string;
  onClose: () => void;
}

export default function EditGearSheet({ id, onClose }: EditGearSheetProps) {
  const params = useParams();
  const [formData, setFormData] = useState<GearData>({
    title: "",
    description: "",
  });
  const [errors, setErrors] = useState<Partial<GearData>>({});
  const { mutateAsync: updateGear, isPending: isUpdating } = useUpdateGear(id);

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await api.get(`/gear/${id}`);
        const fetchedData = response.data.data;
        setFormData({
          title: fetchedData.title || "",
          description: fetchedData.description || "",
        });
      } catch (error) {
        toast.error("Failed to fetch gear data");
        onClose();
      }
    };

    if (id) {
      getData();
    }
  }, [id, onClose]);

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

    try {
      await updateGear({
        body: {
          title: formData.title,
          description: formData.description,
        },
        packageId: params.id as string,
      });
      toast.success("Gear updated successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to update gear");
    }
  };

  return (
    <div className="p-6 w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Edit Gear</h1>
          <p className="text-muted-foreground">Update the gear details below</p>
        </div>
        <Button
          onClick={onClose}
          variant="outline"
          className="text-red-500 flex items-center gap-2 cursor-pointer"
        >
          <Icon icon="solar:exit-bold-duotone" width="24" height="24" />
          Exit
        </Button>
      </div>
      <form onSubmit={handleSubmit} className="grid gap-4 py-4">
        {/* Title */}
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

        {/* Description */}
        <div className="grid gap-2">
          <label htmlFor="description" className="text-sm font-medium">
            Description
          </label>
          <RichTextEditor
            initialContent={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e })}
            className="flex min-h-[60px] w-full rounded-[2px] border px-3 py-2 text-sm shadow-sm"
            placeholder="Enter description"
          />
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button onClick={handleSubmit} disabled={isUpdating} className="w-full">
          {isUpdating ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Update Gear"
          )}
        </Button>
      </form>
    </div>
  );
}
