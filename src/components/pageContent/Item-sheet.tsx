"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import RichTextEditor from "../RichTextEditor";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { PageContent } from "@/types/pages";
import { useCreatePage, useUpdatePage } from "@/hooks/usePages";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subTitle: z.string().optional(),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  subDescription: z.string().optional(),
  metaTitle: z.string().min(1, "Meta title is required"),
  metadescription: z.string().min(1, "Meta description is required"),
  metaKeywords: z.string().min(1, "Meta keywords are required"),
  status: z.enum(["draft", "published", "archived"], {
    required_error: "Status is required",
  }),
  publishDate: z.date().optional(),
});

interface PageFormProps {
  page?: PageContent;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PageForm({ page, onSuccess, onCancel }: PageFormProps) {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    page?.image || null
  );

  const { mutate: updatePage, isPending: isUpdatePending } = useUpdatePage(
    page?._id as string
  );
  const { mutate: addPage, isPending: isAddPending } = useCreatePage();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: page?.title || "",
      subTitle: page?.subTitle || "",
      slug: page?.slug || "",
      description: page?.description || "",
      subDescription: page?.subDescription || "",
      metaTitle: page?.metaTitle || "",
      metadescription: page?.metaDescription || "",
      metaKeywords: page?.metaKeywords?.join(", ") || "",
      status: page?.status || "draft",
      publishDate: page?.publishDate ? new Date(page.publishDate) : undefined,
    },
  });

  useEffect(() => {
    if (page) {
      form.reset({
        title: page.title || "",
        subTitle: page.subTitle || "",
        slug: page.slug || "",
        description: page.description || "",
        subDescription: page.subDescription || "",
        metaTitle: page.metaTitle || "",
        metadescription: page.metaDescription || "",
        metaKeywords: page.metaKeywords?.join(", ") || "",
        status: page.status || "draft",
        publishDate: page.publishDate ? new Date(page.publishDate) : undefined,
      });
      setImagePreview(page.image || null);
    } else {
      form.reset();
      setImagePreview(null);
    }
    setImage(null);
  }, [page]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const formData = new FormData();
      formData.append("title", values.title);
      if (values.subTitle) formData.append("subTitle", values.subTitle);
      formData.append("slug", values.slug);
      if (values.description)
        formData.append("description", values.description);
      if (values.subDescription)
        formData.append("subDescription", values.subDescription);
      formData.append("metaTitle", values.metaTitle);
      formData.append("metadescription", values.metadescription);

      // Convert comma-separated keywords to array
      const keywords = values.metaKeywords
        .split(",")
        .map((keyword) => keyword.trim());
      keywords.forEach((keyword, index) => {
        formData.append(`metaKeywords[${index}]`, keyword);
      });

      formData.append("status", values.status);
      if (values.publishDate) {
        formData.append("publishDate", values.publishDate.toISOString());
      }

      if (image) {
        formData.append("image", image);
      }

      if (page?._id) {
        updatePage(formData, {
          onSuccess: () => {
            toast(`Page updated successfully`);
            onSuccess();
          },
          onError: () => {
            toast(`Failed to update page`);
          },
        });
      } else {
        addPage(formData, {
          onSuccess: () => {
            toast(`Page created successfully`);
            onSuccess();
          },
          onError: () => {
            toast(`Failed to create page`);
          },
        });
      }
    } catch (error) {
      toast(`Failed to ${page ? "update" : "create"} page`);
    }
  };

  // Generate slug from title
  const generateSlug = (title: string): string => {
    return title
      .trim() // Remove leading/trailing spaces
      .toLowerCase()
      .normalize("NFD") // Normalize accented characters
      .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters except space and hyphen
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with a single one
      .replace(/^-|-$/g, ""); // Remove starting/ending hyphens
  };

  return (
    <div className="mt-6 px-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Page title"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        if (
                          !form.getValues("slug") ||
                          form.getValues("slug") === generateSlug(field.value)
                        ) {
                          form.setValue("slug", generateSlug(e.target.value));
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subtitle (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Page subtitle" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="page-slug"
                      {...field}
                      value={field.value}
                      onChange={(e) => {
                        const value = e.target.value;
                        form.setValue("slug", generateSlug(value));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      initialContent={field.value || ""}
                      onChange={(content) => field.onChange(content)}
                      placeholder="Page description"
                      className="min-h-[120px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sub Description (Optional)</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      initialContent={field.value || ""}
                      onChange={(content) => field.onChange(content)}
                      placeholder="Page sub description"
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">SEO Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="metaTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Meta title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="metadescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Meta description"
                        {...field}
                        rows={2}
                        className="resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="metaKeywords"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Keywords (comma separated)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="keyword1, keyword2, keyword3"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Publishing Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="publishDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Publish Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div>
            <div className="mb-2">
              <label className="block text-sm font-medium">
                Featured Image (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-[2px] file:border-0
                  file:text-sm file:font-semibold
                  file:bg-orange-50 file:text-orange-700
                  hover:file:bg-orange-100"
                onChange={(e) => {
                  setImage(e.target.files?.[0] || null);
                  setImagePreview(
                    e.target.files?.[0]
                      ? URL.createObjectURL(e.target.files[0])
                      : null
                  );
                }}
              />
            </div>
            {imagePreview && (
              <div className="mt-2">
                <img
                  src={imagePreview || "/placeholder.svg"}
                  alt="Image preview"
                  className="w-full h-40 object-cover rounded-[2px]"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-8">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isAddPending || isUpdatePending}>
              {page ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
