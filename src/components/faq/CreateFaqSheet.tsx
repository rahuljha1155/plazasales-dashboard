import { useState } from "react";
import { Button } from "@/components/ui/button";

import { Loader, X } from "lucide-react";
import { toast } from "sonner";
import { useParams } from "react-router-dom";
import { useCreateFaq } from "@/hooks/useFaq";
import { useQueryClient } from "@tanstack/react-query";
import RichTextEditor from "../RichTextEditor";
import { Icon } from "@iconify/react/dist/iconify.js";

interface ItineraryData {
  title: string;
  description: string;
  image?: string;
  imageFile?: File;
}

interface CreateFaqSheetProps {
  id: string;
  onClose?: () => void;
}

export default function CreateFaqSheet({ id, onClose }: CreateFaqSheetProps) {
  const queryClient = useQueryClient();
  const params = useParams();
  const [formData, setFormData] = useState<ItineraryData>({
    title: "",
    description: "",
    image: "",
  });
  const [errors, setErrors] = useState<Partial<ItineraryData>>({});

  const { mutateAsync: createFaq, isPending: isUpdating } = useCreateFaq();
  const validateForm = () => {
    const newErrors: Partial<ItineraryData> = {};

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

      await createFaq(
        { packageId: params.id ?? "", formData: formDataToSend },
        {
          onSuccess: () => {
            toast.success("Faq created successfully");
            queryClient.invalidateQueries({ queryKey: ["faqs"] });
            setFormData({
              title: "",
              description: "",
              imageFile: undefined,
            });
            if (onClose) onClose();
          },
          onError: (error) => {
            toast.error(error.message || "Failed to create faq");
          },
        }
      );
    } catch (error) {
      toast.error("Failed to create faq");
    }
  };

  const handleClose = () => {
    setFormData({ title: "", description: "", imageFile: undefined });
    if (onClose) onClose();
  };

  return (
    <div className="p-6 w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Add FAQ</h1>
          <p className="text-muted-foreground">
            Add a new FAQ for this package
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
            Question
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
            Answer
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
            <p className="text-sm text-red-500">{errors.description}</p>
          )}
        </div>

        <div className="grid gap-2">
          <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Faq"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
