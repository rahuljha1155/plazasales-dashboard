import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowLeftIcon, Loader, UploadCloud, Trash2 } from "lucide-react";
import slugify from "react-slugify";
import { toast } from "sonner";
import { useSelectionStore } from "@/store/selectionStore";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import RichTextEditor from "@/components/RichTextEditor";
import FieldOptionalText from "@/components/dashboard/FieldOptionalText";
import { useCreateSubCategory, useUpdateSubCategory } from "@/services/subcategory";

// Form schemas
const createFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().regex(/^([a-z0-9-]+)$/i, "Invalid slug format"),
  description: z.string().default("").optional(),
  categoryId: z.string().min(1, "Category ID is required"),
  addToHome: z.boolean().default(false),
  sortOrder: z.coerce.number().default(0),
  image: z.any(),
});

const editFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().regex(/^([a-z0-9-]+)$/i, "Invalid slug format"),
  description: z.string().default("").optional(),
  addToHome: z.boolean().default(false),
  sortOrder: z.coerce.number().default(0),
  image: z.any().optional(),
});

interface SubCategoryFormProps {
  mode: "create" | "edit";
  initialData?: any;
  onClose: () => void;
}

export function SubCategoryForm({
  mode,
  initialData,
  onClose,
}: SubCategoryFormProps) {
  const selectedBrandId = useSelectionStore((state) => state.selectedBrandId);
  const selectedCategoryId = useSelectionStore((state) => state.selectedCategoryId);
  
  const schema = mode === "create" ? createFormSchema : editFormSchema;
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema) as any,
    defaultValues: initialData || {
      name: "",
      slug: "",
      description: "",
      categoryId: selectedCategoryId || "",
      addToHome: true,
      sortOrder: 0,
      image: null,
    },
  });

  const [value, setValue] = useState(initialData?.description || "");
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialData?.image || null
  );
  const [file, setFile] = useState<File | null>(null);

  const { mutate: createSubCategory, isPending: isCreating } = useCreateSubCategory();
  const { mutate: updateSubCategory, isPending: isUpdating } = useUpdateSubCategory(
    initialData?.id || ""
  );

  const isSubmitting = isCreating || isUpdating;

  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        image: null,
      });
      setValue(initialData.description || "");
      setPreviewUrl(initialData.image || null);
    }
  }, [initialData, form]);

  // Auto-generate slug from name
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "name") {
        const slug = value.name ? slugify(value.name, {}) : "";
        form.setValue("slug", slug, { shouldValidate: true });
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  useEffect(() => {
    form.setValue("description", value);
  }, [value, form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const MAX_SIZE_MB = 2;
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    if (selectedFile.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`File exceeds ${MAX_SIZE_MB}MB limit.`);
      return;
    }

    setFile(selectedFile);
    form.setValue("image", selectedFile, { shouldValidate: true });

    const fileUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(fileUrl);
  };

  const removeImage = () => {
    setFile(null);
    setPreviewUrl(null);
    form.setValue("image", null, { shouldValidate: true });

    const fileInput = document.getElementById("image-upload") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const onSubmit = (values: z.infer<typeof schema>) => {
    const formData = new FormData();

    Object.entries(values).forEach(([key, value]) => {
      if (key !== "image" && value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    // Add brandId from store
    if (selectedBrandId) {
      formData.append("brandId", selectedBrandId);
    }

    if (file) {
      formData.append("image", file);
    } else if (initialData?.image && !previewUrl) {
      formData.append("removeImage", "true");
    }

    const onSuccess = () => {
      toast.success(
        `Sub Category ${mode === "create" ? "created" : "updated"} successfully`
      );
      onClose();
    };

    const onError = (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "An error occurred";
      toast.error(
        errorMessage.includes("duplicate key")
          ? "Slug must be unique"
          : errorMessage
      );
    };

    if (mode === "create") {
      createSubCategory(formData as any, { onSuccess, onError });
    } else {
      updateSubCategory(formData as any, { onSuccess, onError });
    }
  };

  return (
    <div className="mx-auto rounded-sm pb-24 px-4">

      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={onClose}>
          <ArrowLeftIcon className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-semibold">
          {mode === "create" ? "Add" : "Edit"} SubCategory
        </h1>
      </div>

      <div className="bg-white rounded-xl p-8 shadow-sm">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Category Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Above 5K" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Slug <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="above-5k" {...field} readOnly />
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
                      <Input placeholder="0" type="number" min={0} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={() => (
                <FormItem>
                  <FormLabel>
                    Description <FieldOptionalText />
                  </FormLabel>
                  <FormControl>
                    <RichTextEditor
                      initialContent={value}
                      onChange={(content) => setValue(content || "")}
                      placeholder="Write something..."
                      className="h-64 pb-10"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={() => (
                <FormItem>
                  <FormLabel>
                    Image {!previewUrl && <span className="text-red-500">*</span>}{" "}
                    <span className="text-primary">(Aspect Ratio 16/9) 1920 × 1080 px</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative w-full border-2 border-dashed rounded-lg overflow-hidden p-4">
                      {previewUrl ? (
                        <div className="relative">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="h-60 w-full object-contain rounded-lg bg-muted/30"
                          />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full p-2 shadow transition-all"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center relative h-60 bg-muted/30 rounded-lg">
                          <UploadCloud className="text-primary w-6 h-6 absolute z-0" />
                          <div className="flex flex-col items-center justify-center mt-20">
                            <p className="text-sm font-medium">Drag and drop or click to upload</p>
                            <p className="text-xs text-muted-foreground">Max file size: 2MB</p>
                          </div>
                          <Input
                            id="image-upload"
                            accept="image/*"
                            onChange={handleFileChange}
                            type="file"
                            className="absolute inset-0 opacity-0 h-full w-full cursor-pointer z-10"
                          />
                        </div>
                      )}
                    </div>
                  </FormControl>
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
                    <FormLabel>Add to home</FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4">
              <Button variant="outline" onClick={onClose} type="button">
                Cancel
              </Button>
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting && <Loader size={16} className="animate-spin mr-2" />}
                {mode === "create" ? "Create SubCategory" : "Update SubCategory"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
