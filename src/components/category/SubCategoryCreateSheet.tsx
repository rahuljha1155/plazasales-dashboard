import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader, Save, Trash2, UploadCloud } from "lucide-react";
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
import slugify from "react-slugify";
import FieldOptionalText from "@/components/dashboard/FieldOptionalText";
import { api } from "@/services/api";
import RichTextEditor from "@/components/RichTextEditor";

// Define the form data type
interface SubCategoryFormData {
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  addToHome: boolean;
  sortOrder: number;
  image: File[];
}

// Define the form schema with proper types and defaults
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().regex(/^([a-z0-9-]+)$/i, "Invalid slug format"),
  description: z.string().default(""),
  categoryId: z.string().min(1, "Category ID is required"),
  addToHome: z.boolean().default(false),
  sortOrder: z.coerce.number().default(0),
  image: z
    .any()
    .refine(
      (val) =>
        Array.isArray(val) && (val.length === 0 || val[0] instanceof File),
      { message: "Must be an array of files" }
    )
    .default(() => [] as File[]),
});

export default function CategoryCreateSheet({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  const form = useForm<SubCategoryFormData>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      categoryId: id,
      addToHome: true,
      sortOrder: 0,
      image: [],
    },
  });

  const [value, setValue] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  // Add keydown handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      form.handleSubmit(onSubmit)();
    }
  };
  const slug = slugify(form.watch("name"));
  React.useEffect(() => {
    form.setValue("slug", slug);
    form.setValue("description", value);
  }, [slug, value]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const MAX_SIZE_MB = 2;

    const newFiles = Array.from(e.target.files || []).filter((file) => {
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        toast.error(`${file.name} exceeds 2MB limit.`);
        return false;
      }
      return true;
    });

    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
    form.setValue("image", updatedFiles, { shouldValidate: true });

    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrl((prev) => [...prev, ...newPreviews]);
  };

  const onSubmit = async (values: SubCategoryFormData) => {
    setIsCreating(true);
    try {
      const formData = new FormData();

      // Append all non-file fields
      formData.append("name", values.name);
      formData.append("slug", values.slug);
      formData.append("description", values.description);
      formData.append("categoryId", values.categoryId);
      formData.append("addToHome", String(values.addToHome));
      formData.append("sortOrder", String(values.sortOrder));

      // Append image files
      files.forEach((file) => {
        formData.append("image", file);
      });

      const { data } = await api.post("subcategory", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      form.reset();
      setFiles([]);
      setPreviewUrl([]);
      setValue("");
      setIsSheetOpen(false);
      toast.success("Sub Category created successfully");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message?.includes("duplicate key")
          ? "Slug must be unique"
          : error?.message || "An error occurred."
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div>
      <div className=" mx-auto  rounded-sm pb-24 px-4">
        <div className="text-2xl font-semibold mb-4">Add SubCategory</div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            onKeyDown={handleKeyDown}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Above 5K" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Slug *</FormLabel>
                    <FormControl>
                      <Input placeholder="above-5k" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sortOrder"
                render={({ field }) => (
                  <FormItem className="flex-1">
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
              render={({ field }) => (
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
                  <FormLabel>Images * <span className="text-primary">(Aspect Ratio 16/9) 1920 × 1080 px</span></FormLabel>
                  <FormControl>
                    <div className="relative w-full border border-dashed rounded-[2px] overflow-hidden p-4">
                      <div className="flex items-center justify-center relative h-60 bg-muted/30 rounded-[2px] ">
                        <UploadCloud className="text-primary w-6 h-6 absolute z-0" />
                        <div className="flex flex-col items-center justify-center mt-20">
                          <p>Drag and drop or click to upload</p>
                          <p>Max file size: 2MB</p>
                        </div>
                        <Input
                          accept="image/*"
                          onChange={handleFileChange}
                          type="file"
                          multiple
                          className="absolute inset-0 opacity-0 h-full w-full cursor-pointer z-10"
                        />
                      </div>

                      {previewUrl.length > 0 && (
                        <div className="flex gap-3 mt-4 overflow-x-auto max-w-full">
                          {previewUrl.map((url, idx) => (
                            <div key={idx} className="relative group">
                              <img
                                src={url}
                                alt="preview"
                                className="h-40 w-auto object-cover rounded shadow"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  // remove image from files & previews
                                  const updatedFiles = files.filter(
                                    (_, i) => i !== idx
                                  );
                                  const updatedPreviews = previewUrl.filter(
                                    (_, i) => i !== idx
                                  );
                                  setFiles(updatedFiles);
                                  setPreviewUrl(updatedPreviews);
                                  form.setValue("image", updatedFiles, {
                                    shouldValidate: true,
                                  });
                                }}
                                className="absolute top-1 right-1 bg-white/80 hover:bg-white rounded-full p-1 shadow transition-all"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </button>
                            </div>
                          ))}
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
                    <FormLabel>Use this image as background?</FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <Button variant="outline" onClick={() => setIsSheetOpen(false)}>
                Cancel
              </Button>
              <Button disabled={isCreating} type="submit">
                {isCreating ? (
                  <Loader size={16} className="animate-spin mr-2" />
                ) : (
                  <Save size={16} className="mr-2" />
                )}
                Create SubCategory
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
