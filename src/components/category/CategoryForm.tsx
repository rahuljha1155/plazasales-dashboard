import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader, ArrowLeftIcon, UploadCloud, Trash2 } from "lucide-react";
import { Icon } from "@iconify/react/dist/iconify.js";
import slugify from "react-slugify";
import { categoryEditSchema, type CategoryEditData } from "@/schema/category";
import { useCreateCategory, useUpdateCategory } from "@/services/category";

import { Textarea } from "../ui/textarea";
import { useSelectedDataStore } from "@/store/selectedStore";

interface CategoryFormProps {
  category?: any;
  onSuccess: () => void;
  onCancel: () => void;
  mode: "create" | "edit";
}

export function CategoryForm({ category, onSuccess, onCancel, mode }: CategoryFormProps) {
  const { selectedBrand } = useSelectedDataStore();
  const form = useForm<CategoryEditData>({
    resolver: zodResolver(categoryEditSchema),
    defaultValues: {
      title: "",
      slug: "",
      brandId: selectedBrand?.id || "",
      coverImage: undefined,
      description: "",
    },
  });

  const [coverPreview, setCoverPreview] = useState<string>("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [originalCoverImage, setOriginalCoverImage] = useState<string>("");
  const [isCoverImageRemoved, setIsCoverImageRemoved] = useState<boolean>(false);


  const { mutateAsync: createCategory, isPending: isCreatePending } = useCreateCategory();
  const { mutateAsync: updateCategory, isPending: isUpdatePending } = useUpdateCategory(category?.id || "");

  const isSubmitting = isCreatePending || isUpdatePending;

  useEffect(() => {
    if (category && mode === "edit") {
      form.reset({
        title: category.title || "",
        slug: category.slug || "",
        brandId: category.brandId || selectedBrand?.id || "",
        coverImage: undefined,
        description: category.description || "",
      });
      setCoverPreview(category.coverImage || "");
      setOriginalCoverImage(category.coverImage || "");
      setIsCoverImageRemoved(false);
    }
  }, [category, mode, form, selectedBrand?.id]);

  // Auto-generate slug from title
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "title" && value.title) {
        const slug = slugify(value.title, {});
        form.setValue("slug", slug, { shouldValidate: true });
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE_MB = 5;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`File exceeds ${MAX_SIZE_MB}MB limit.`);
      return;
    }

    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error("Only JPEG, PNG, and WebP images are allowed");
      return;
    }

    setCoverFile(file);
    form.setValue("coverImage", file, { shouldValidate: true });

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setCoverPreview(previewUrl);
  };

  const removeCoverImage = () => {
    setCoverFile(null);
    setCoverPreview("");
    form.setValue("coverImage", undefined as any, { shouldValidate: true });

    // Mark as removed if there was an original image
    if (originalCoverImage) {
      setIsCoverImageRemoved(true);
    }

    // Reset file input
    const fileInput = document.getElementById("cover-image-upload") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const onSubmit: SubmitHandler<CategoryEditData> = async (values) => {
    try {
      const formData = new FormData();

      // Append text fields
      formData.append("title", values.title);
      formData.append("slug", values.slug);
      formData.append("brandId", values.brandId);
      formData.append("description", values.description ?? "");

      if (coverFile) {
        formData.append("coverImage", coverFile);
      } else if (mode === "edit" && isCoverImageRemoved && originalCoverImage) {
        formData.append("removeUrls[]", originalCoverImage);
      }

      if (mode === "create") {
        await createCategory(formData as any);
      } else {
        await updateCategory(formData as any);
      }

      onSuccess();
    } catch (error: any) {
      if (error?.response?.data?.message?.includes("duplicate key")) {
        toast.error("Slug must be unique");
      } else {
        toast.error(error.message || "An error occurred. Please try again.");
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      form.handleSubmit(onSubmit)();
    }
  };

  return (
    <div className=" rounded-sm pb-24  max-w-4xl">

      <div className="space-y-4   rounded-xl">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, err => {
              const firstError = Object.values(err)[0];
              if (firstError && firstError.message) {
                toast.error(firstError.message.toString());
              }
            })}
            onKeyDown={handleKeyDown}
            className="space-y-6"
          >
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Category Title <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter category title"
                      {...field}
                      className="bg-white mt-2"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Slug */}
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Category Slug <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl className="mt-2">
                    <Input
                      readOnly
                      placeholder="category-slug"
                      {...field}
                      className="bg-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />


            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter category description"
                      {...field}
                      className="bg-white mt-2"
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cover Image */}
            <FormField
              control={form.control}
              name="coverImage"
              render={() => (
                <FormItem>
                  <FormLabel>
                    Cover Image
                    <span className="text-primary"> (Max 5MB - JPEG, PNG, WebP  in Square Aspect Ratio)</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative w-full border-2 border-dashed rounded-lg overflow-hidden mt-2">
                      {coverPreview ? (
                        <div className="relative">
                          <img
                            src={coverPreview}
                            alt="Cover Preview"
                            className="h-80 w-full object-cover rounded-lg bg-muted/30"
                          />
                          <button
                            type="button"
                            onClick={removeCoverImage}
                            className="absolute top-4 right-4 bg-red-500 hover:scale-105 cursor-pointer text-white rounded-full p-2 shadow-lg transition-all"
                          >
                            <Icon icon={"ic:baseline-delete"} className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="relative h-80 w-full rounded-lg border-2 border-dashed border-zinc-300 hover:border-primary/50 transition-colors bg-zinc-50/50">
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none z-10">
                            <div className="bg-zinc-100 p-4 rounded-full mb-4">
                              <UploadCloud className="text-primary w-8 h-8" />
                            </div>
                            <p className="text-sm text-zinc-600 mb-1">
                              <span className="font-medium text-primary">
                                Click to upload cover image
                              </span>
                            </p>
                            <p className="text-xs font-medium text-primary">
                              JPEG, PNG, or WebP (max. 5MB)
                            </p>
                          </div>
                          <Input
                            id="cover-image-upload"
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            className="absolute inset-0 w-full h-full cursor-pointer opacity-0 z-20"
                            onChange={handleCoverImageUpload}
                          />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                className="text-red-300 hover:text-red-500 cursor-pointer"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader size={16} className="animate-spin mr-2" />
                ) : (
                  <Icon icon="solar:save-bold-duotone" className="mr-2 h-4 w-4" />
                )}
                {mode === "create" ? "Create Category" : "Update Category"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
