import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FilePenLine, Loader, Upload } from "lucide-react";
import { api } from "@/services/api";
import { toast } from "sonner";
import { useUpdateAttraction } from "@/hooks/useAttraction";
import RichTextEditor from "../RichTextEditor";

interface AttractionData {
  title: string;
  description: string;
  image?: string;
  days?: string;
  imageFile?: File;
}

export default function EditAttractionSheet({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const [formData, setFormData] = useState<AttractionData>({
    title: "",
    description: "",
    image: "",
    days: "",
  });
  const [errors, setErrors] = useState<Partial<AttractionData>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [data, setData] = useState<AttractionData | null>(null);
  const { mutateAsync: updateAttraction, isPending } = useUpdateAttraction(id);

  useEffect(() => {
    if (data) {
      setFormData({
        title: data.title || "",
        description: data.description || "",
        image: data.image || "",
        days: data.days || "",
      });
    }
  }, [data]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/attraction/${id}`);
        if (response.data?.data) {
          const attractionData = response.data.data;
          setData({
            title: attractionData.title || "",
            description: attractionData.description || "",
            image: attractionData.image || "",
            days: attractionData.days || "",
          });
        } else {
          toast.error("Failed to load attraction data");
        }
      } catch (error) {
      }
    };

    fetchData();
  }, [id]);

  const validateForm = () => {
    const newErrors: Partial<AttractionData> = {};

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
      formDataToSend.append("days", formData.days || "");

      if (formData.imageFile) {
        formDataToSend.append("image", formData.imageFile);
      }

      updateAttraction(formDataToSend, {
        onSuccess: () => {
          toast.success("Attraction updated successfully");
          setFormData({
            title: "",
            description: "",
            days: "",
            imageFile: undefined,
          });
          setIsOpen(false);
        },
        onError: () => {
          toast.error("Failed to update attraction");
        },
      });
    } catch (error) {
    }
  };

  return (
    <div>
      <div className="">
        <div className="text-lg font-semibold flex justify-between">
          <div>
            <span>Edit Attraction</span>
          </div>
          <Button onClick={onClose} variant="outline">
            close
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
            <RichTextEditor
              initialContent={formData.description}
              onChange={(content) =>
                setFormData({ ...formData, description: content })
              }
              className="flex min-h-[60px] w-full rounded-[2px] border px-3 py-2 text-sm shadow-sm"
              placeholder="Enter description"
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button onClick={onClose} variant="outline" disabled={isPending}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Update Attraction"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
