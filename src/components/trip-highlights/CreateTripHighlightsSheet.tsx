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
import { useParams } from "react-router-dom";
import RichTextEditor from "../RichTextEditor";

interface ItineraryData {
  title: string;
  description: string;
  image?: string;
  days?: string;
  imageFile?: File;
  itineraryDetails?: string; // JSON string
  duration?: string;
  maxAltitude?: string;
  activity?: string;
  meals?: string;
  accommodation?: string;
}

export default function CreateItinerarySheet({ id }: { id: string }) {
  const params = useParams();
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState<ItineraryData>({
    title: "",
    description: "",
    image: "",
    days: "",
    itineraryDetails: "",
    duration: "",
    maxAltitude: "",
    activity: "",
    meals: "",
    accommodation: "",
  });
  const [errors, setErrors] = useState<Partial<ItineraryData>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setIsUpdating(true);

      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("days", formData.days || "");
      formDataToSend.append(
        "itineraryDetails",
        formData.itineraryDetails || ""
      );
      formDataToSend.append("duration", formData.duration || "");
      formDataToSend.append("maxAltitude", formData.maxAltitude || "");
      formDataToSend.append("activity", formData.activity || "");
      formDataToSend.append("meals", formData.meals || "");
      formDataToSend.append("accommodation", formData.accommodation || "");

      if (formData.imageFile) {
        formDataToSend.append("image", formData.imageFile);
      }

      await api.post(`/Itinerary/${params.id}`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Itinerary created successfully");

      setFormData({
        title: "",
        description: "",
        days: "",
        imageFile: undefined,
      });
    } catch (error) {
      toast.error("Failed to create itinerary");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Sheet>
      <SheetTrigger>
        <Button className="w-full justify-start gap-2">
          <FilePenLine className="h-4 w-4" />
          Create Itinerary
        </Button>
      </SheetTrigger>
      <SheetContent className="max-w-3xl h-full">
        <SheetHeader>
          <SheetTitle>Create Itinerary</SheetTitle>
          <SheetDescription>
            Add a new itinerary for this package
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4 overflow-y-auto max-h-[80vh] pr-2">
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
              onChange={(
                content // content is the HTML string directly
              ) => setFormData({ ...formData, description: content })}
              className="flex min-h-[60px] w-full rounded-[2px] border px-3 py-2 text-sm shadow-sm"
              placeholder="Enter description"
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Image</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-sm p-4 text-center cursor-pointer hover:border-gray-400 transition-colors"
            >
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-6 w-6 text-gray-400" />
                <p className="text-sm text-gray-500">
                  Click to select an image
                </p>
                <p className="text-xs text-gray-400">
                  Supported formats: PNG, JPG, JPEG, GIF (Max 2MB)
                </p>
              </div>
              {formData.imageFile && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    Selected file: {formData.imageFile.name}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, imageFile: undefined })
                    }
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (file.size > 2 * 1024 * 1024) {
                    toast.error("Image size should be less than 2MB");
                    return;
                  }
                }
                if (file) {
                  setFormData((prev) => ({ ...prev, imageFile: file }));
                }
              }}
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="days" className="text-sm font-medium">
              Days
            </label>
            <input
              id="days"
              type="text"
              value={formData.days}
              onChange={(e) =>
                setFormData({ ...formData, days: e.target.value })
              }
              className="flex h-10 w-full rounded-[2px] border px-3 py-2 text-sm shadow-sm"
              placeholder="Enter number of days (optional)"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="duration" className="text-sm font-medium">
              Duration
            </label>
            <input
              id="duration"
              type="text"
              value={formData.duration}
              onChange={(e) =>
                setFormData({ ...formData, duration: e.target.value })
              }
              className="flex h-10 w-full rounded-[2px] border px-3 py-2 text-sm shadow-sm"
              placeholder="e.g. 5 days"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="maxAltitude" className="text-sm font-medium">
              Max Altitude
            </label>
            <input
              id="maxAltitude"
              type="text"
              value={formData.maxAltitude}
              onChange={(e) =>
                setFormData({ ...formData, maxAltitude: e.target.value })
              }
              className="flex h-10 w-full rounded-[2px] border px-3 py-2 text-sm shadow-sm"
              placeholder="e.g. 4000m"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="activity" className="text-sm font-medium">
              Activity
            </label>
            <input
              id="activity"
              type="text"
              value={formData.activity}
              onChange={(e) =>
                setFormData({ ...formData, activity: e.target.value })
              }
              className="flex h-10 w-full rounded-[2px] border px-3 py-2 text-sm shadow-sm"
              placeholder="e.g. Hiking"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="meals" className="text-sm font-medium">
              Meals
            </label>
            <input
              id="meals"
              type="text"
              value={formData.meals}
              onChange={(e) =>
                setFormData({ ...formData, meals: e.target.value })
              }
              className="flex h-10 w-full rounded-[2px] border px-3 py-2 text-sm shadow-sm"
              placeholder="e.g. Breakfast, Lunch, Dinner"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="accommodation" className="text-sm font-medium">
              Accommodation
            </label>
            <input
              id="accommodation"
              type="text"
              value={formData.accommodation}
              onChange={(e) =>
                setFormData({ ...formData, accommodation: e.target.value })
              }
              className="flex h-10 w-full rounded-[2px] border px-3 py-2 text-sm shadow-sm"
              placeholder="e.g. Hotel and Tea House"
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Itinerary"
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
