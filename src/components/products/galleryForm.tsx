import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  useCreateGallery,
  useUpdateGallery,
  type Gallery,
} from "@/hooks/useGallery";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { X, Upload } from "lucide-react";

const formSchema = z.object({
  caption: z.string().min(1, "Caption is required"),
  isHome: z.boolean(),
  mediaAsset: z.any().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface GalleryFormProps {
  productId: string;
  gallery?: Gallery;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function GalleryForm({
  productId,
  gallery,
  onSuccess,
  onCancel,
}: GalleryFormProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const createMutation = useCreateGallery(productId);
  const updateMutation = useUpdateGallery(gallery?.id || "", productId);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      caption: gallery?.caption || "",
      isHome: gallery?.isHome || false,
      mediaAsset: undefined,
    },
  });

  useEffect(() => {
    if (gallery?.mediaAsset) {
      setPreviewUrls(gallery.mediaAsset);
    }
  }, [gallery]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);

    // Create preview URLs
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);

    // Clean up old URLs
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newUrls = previewUrls.filter((_, i) => i !== index);

    setSelectedFiles(newFiles);
    setPreviewUrls(newUrls);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const formData = new FormData();
      formData.append("caption", values.caption);
      formData.append("isHome", values.isHome.toString());
      formData.append("productId", productId);

      // Append files
      selectedFiles.forEach((file) => {
        formData.append("mediaAsset", file);
      });

      if (gallery) {
        await updateMutation.mutateAsync(formData);
        toast.success("Gallery updated successfully");
      } else {
        await createMutation.mutateAsync(formData);
        toast.success("Gallery created successfully");
      }

      onSuccess();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
        `Failed to ${gallery ? "update" : "create"} gallery`
      );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="caption"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Caption</FormLabel>
              <FormControl>
                <Input placeholder="Enter gallery caption" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isHome"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Display on Home Page</FormLabel>
                <FormDescription>
                  Check this to show gallery on the home page
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mediaAsset"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Images</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="cursor-pointer"
                    />
                    <Upload className="w-4 h-4 text-gray-400" />
                  </div>

                  {previewUrls.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {previewUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </FormControl>
              <FormDescription>
                Upload one or more images for the gallery
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending
              ? "Saving..."
              : gallery
                ? "Update Gallery"
                : "Create Gallery"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
