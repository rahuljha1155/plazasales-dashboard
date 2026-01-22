import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader, Save, Plus, Trash2, Upload } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { IconCategory } from "@/components/svg-icons/IconCategory";
import slugify from "react-slugify";
import { useParams } from "react-router-dom";
import RichTextEditor from "@/components/RichTextEditor";

import { useCreatePackage } from "@/hooks/usePackage";
// Extended form schema to include all related models
const formSchema = z.object({
  subCategoryId: z.string().min(1, "Sub-category is required"),
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  overview: z.string().min(1, "Overview is required"),
  coverImage: z.any(),
  elevation: z.coerce
    .number()
    .min(0, "Elevation cannot be negative")
    .optional(),
  distance: z.coerce.number().min(0, "Distance cannot be negative").optional(),
  note: z.string().optional(),
  routeMap: z.any(),
  addToHome: z.boolean(),
  isPopular: z.boolean().default(false),
  sortOrder: z.coerce.number().default(0),
  slug: z.string().regex(/^([a-z0-9-]+)$/i, "Invalid slug format"),
  location: z.string().min(1, "Location is required"),
  duration: z.string().min(1, "Duration is required"),
  activity: z.string().optional(),
  groupSize: z.string().optional(),
  vehicle: z.string().optional(),
  difficulty: z.string().optional(),
  accommodation: z.string().optional(),
  meal: z.string().optional(),
});

export default function PackageListPage({ onClose , brand}: { onClose: () => void , brand: string }) {
  const params = useParams();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // File state
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [routeMapFile, setRouteMapFile] = useState<File | null>(null);

  // Preview state
  const [previewCoverImage, setPreviewCoverImage] = useState<string>("");
  const [previewRouteMap, setPreviewRouteMap] = useState<string>("");
  const { mutateAsync: createPackage, isPending } = useCreatePackage();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subCategoryId: params.id || "",
      name: "",
      overview: "",
      elevation: 0,
      distance: 0,
      slug: "",
      location: "",
      duration: "",
      addToHome: false,
      isPopular: false,
      note: "",
      sortOrder: 0,
      activity: "",
      groupSize: "",
      vehicle: "",
      difficulty: "",
      accommodation: "",
      meal: "",
    },
  });

  // In CategoryCreateSheet.tsx
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "name") {
        const slug = value.name
          ? slugify(value.name, {
            replacement: "-", // replace spaces with -
            remove: /[^a-zA-Z0-9\s-]/g, // remove special characters
            lower: true, // convert to lowercase
          } as any)
          : "";
        form.setValue("slug", slug, { shouldValidate: true });
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // File upload handlers
  const handleFileUpload = (
    file: File,
    setFile: React.Dispatch<React.SetStateAction<File | null>>,
    setPreview: React.Dispatch<React.SetStateAction<string>>
  ) => {
    if (file) {
      setFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const maxSizeInBytes = 3 * 1024 * 1024;

    if (file) {
      if (file.size > maxSizeInBytes) {
        toast.error("Cover image must be 3MB or less");
        return;
      }

      handleFileUpload(
        file,
        setCoverImageFile as React.Dispatch<React.SetStateAction<File | null>>,
        setPreviewCoverImage
      );
    }
  };

  const handleRouteMapUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const maxSizeInBytes = 3 * 1024 * 1024;

    if (file) {
      if (file.size > maxSizeInBytes) {
        toast.error("Cover image must be 3MB or less");
        return;
      }
      handleFileUpload(
        file,
        setRouteMapFile as React.Dispatch<React.SetStateAction<File | null>>,
        setPreviewRouteMap
      );
    }
  };

  // Form submission
  const onSubmit = async (values: any) => {
    setIsCreating(isPending);
    try {
      const formData = new FormData();

      // Add basic form values (excluding arrays that need special handling)
      Object.entries(values).forEach(([key, value]) => {
        if (
          value !== undefined &&
          ![
            "coverImage",
            "routeMap",
            "pax",
            "itineraries",
            "exclusions",
            "inclusions",
            "attractions",
          ].includes(key)
        ) {
          // Convert elevation and distance to numbers
          if (key === "elevation" || key === "distance") {
            formData.append(key, String(Number(value) || 0));
          } else {
            formData.append(key, value as string);
          }
        }
      });

      // Add files correctly
      if (coverImageFile) formData.append("coverImage", coverImageFile);
      if (routeMapFile) formData.append("routeMap", routeMapFile);

      await createPackage(formData, {
        onSuccess: () => {
          toast.success("Package created successfully");
          resetForm();
          setIsSheetOpen(false);
        },
        onError: (error) => {
          toast.error(error.message || "Failed to create package");
        },
      });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to create package");
    } finally {
      setIsCreating(isPending);
    }
  };

  // Reset form and state
  const resetForm = () => {
    form.reset();
    setCoverImageFile(null);
    setRouteMapFile(null);

    setPreviewCoverImage("");
    setPreviewRouteMap("");
  };

  // Component for file upload UI
  const FileUploadField = ({ preview, handleUpload, id, label }: any) => (
    <div className="flex flex-col mt-2 items-center justify-center border-2 border-dashed rounded-sm p-4">
      {preview ? (
        <img
          src={preview}
          alt={`${label} preview`}
          className="h-48 w-full object-cover rounded-[2px] mb-2"
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-48 w-full">
          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            Click to upload or drag and drop
          </p>
        </div>
      )}
      <Input type="file" onChange={handleUpload} className="hidden" id={id} />
      <Button
        type="button"
        variant="outline"
        className="mt-2"
        onClick={() => document.getElementById(id)?.click()}
      >
        <Upload className="h-4 w-4 mr-2" />
        Upload {label}
      </Button>
    </div>
  );

  return (
    <div>
      <div className="h-screen y pb-20">
        <div className="mb-4">
          <div className="flex items-center gap-2 text-2xl font-semibold">
            Create Package <IconCategory className="h-4 w-4 text-primary" />
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-muted/70 p-4 rounded-[2px]">
              <h3 className="font-medium mb-4">Basic Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Package Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Everest Base Camp Trek"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug *</FormLabel>
                      <FormControl>
                        <Input {...field} readOnly />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sortOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sort Order</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Cover Image */}
            <FormField
              control={form.control}
              name="coverImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Image * <span className="text-primary">480px X 648px</span></FormLabel>
                  <FormControl>
                    <FileUploadField
                      preview={previewCoverImage}
                      handleUpload={handleCoverImageUpload}
                      id="coverImage"
                      label="Image"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isPopular"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Is Popular?</FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="addToHome"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Add to home ?</FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Overview */}
            <FormField
              control={form.control}
              name="overview"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Overview *</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      initialContent={field.value || ""}
                      onChange={(content) => field.onChange(content)}
                      placeholder="Write package overview..."
                      className="h-64 pb-8"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Route Map */}
            <FormField
              control={form.control}
              name="routeMap"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="!mb-4">Route Map  <span className="text-primary">(Aspect Ratio 16/9) 1920 × 1080 px</span></FormLabel>
                  <FormControl className="!mt-4">
                    <FileUploadField
                      preview={previewRouteMap}
                      handleUpload={handleRouteMapUpload}
                      id="routeMap"
                      label="Route Map"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Additional Information */}
            <div className="p-4 rounded-[2px]">
              <h3 className="font-medium mb-4">Additional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="activity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Activity</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Trekking, Hiking" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="groupSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Group Size</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 2-12 people" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vehicle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Private Vehicle, Flight"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Moderate, Challenging"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accommodation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Accommodation</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Hotel, Tea House, Camping"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="meal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meal</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Breakfast, Full Board"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="elevation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Elevation (meters)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="e.g. 5364"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="distance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Distance (kilometers)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="e.g. 130"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="e.g. 5 days"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="e.g. Nepal"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NOTE</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      initialContent={field.value || ""}
                      onChange={(content) => field.onChange(content)}
                      placeholder="Write package note..."
                      className="h-64 pb-8"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-4 z-10 pb-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  setIsSheetOpen(false);
                  onClose();
                }}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Package
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
