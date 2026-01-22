import { useRef, useState } from "react";
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
import { Link, useParams } from "react-router-dom";
import {
  useCreateAttraction,
  useUpdateAttraction,
} from "@/hooks/useAttraction";
import RichTextEditor from "../RichTextEditor";

interface AttractionData {
  title: string;
  description: string;
  image?: string;
  days?: string;
  imageFile?: File;
}

export default function CreateAttractionSheet({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
  onOpen: () => void;
}) {
  const params = useParams();

  // const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState<AttractionData>({
    title: "",
    description: "",
    image: "",
    days: "",
  });
  const [errors, setErrors] = useState<Partial<AttractionData>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const { mutateAsync: createAttraction, isPending } = useCreateAttraction();

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

      await createAttraction(
        {
          packageId: params.id!,
          formData: formDataToSend,
        },
        {
          onSuccess: () => {
            toast.success("Attraction created successfully");
            setFormData({
              title: "",
              description: "",
              days: "",
              imageFile: undefined,
            });
            setIsOpen(false);
            onClose(); // Navigate back to list page
          },
          onError: () => {
            toast.error("Failed to create attraction");
          },
        }
      );

      // toast.success("Attraction created successfully");
      setFormData({
        title: "",
        description: "",
        days: "",
        imageFile: undefined,
      });
    } catch (error) {
      toast.error("Failed to create attraction");
    } finally {
      // setIsUpdating(isPending);
    }
  };

  return (
    <div className=" w-full  p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-2xl font-bold text-primary">Create Attraction</div>
        <Button onClick={onClose} variant={"outline"}>
          Close
        </Button>
      </div>
      {/* Title Field */}
      <div className="space-y-2">
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700"
        >
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full rounded-[2px] border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Enter title"
        />
        {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
      </div>

      {/* Description Field */}
      <div className="space-y-2">
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Description <span className="text-red-500">*</span>
        </label>
        <RichTextEditor
          initialContent={formData.description}
          onChange={(content) =>
            setFormData({ ...formData, description: content })
          }
          className="w-full rounded-[2px] border px-3 py-2 text-sm min-h-[100px] shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Enter description"
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description}</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button
          className="cursor-pointer"
          onClick={() => onClose()}
          variant={"outline"}
          disabled={isPending}
        >
          Cancel
        </Button>

        <Button onClick={handleSubmit} disabled={isPending}>
          {isPending ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Attraction"
          )}
        </Button>
      </div>
    </div>
  );
}
