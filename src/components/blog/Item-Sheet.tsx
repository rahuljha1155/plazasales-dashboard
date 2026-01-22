import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { IBlog } from "@/types/IBlog";
import { blogPostFormSchema, type BlogPostFormData } from "@/schema/blog";
import { X } from "lucide-react";
import { usePublishBlog, useUpdateBlog } from "@/services/blog";
import RichTextEditor from "../ui/texteditor";
import { Icon } from "@iconify/react/dist/iconify.js";

// Form default values
const defaultValues: BlogPostFormData = {
  title: "",
  slug: "",
  excerpt: "",
  description: "",
  estimatedReadTime: "5",
  isPublished: false,
  coverImage: undefined,
  mediaUtils: undefined,
};

interface BlogFormProps {
  blog?: IBlog;
  onSuccess: () => void;
  onCancel: () => void;
}

export function BlogForm({ blog, onSuccess, onCancel }: BlogFormProps) {
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    blog?.coverImage || null
  );
  const [originalCoverImage, setOriginalCoverImage] = useState<string | null>(
    blog?.coverImage || null
  );
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>(
    blog?.mediaAssets?.map(asset => asset.fileUrl) || []
  );
  const [originalMediaAssets, setOriginalMediaAssets] = useState<Array<{ id: string, fileUrl: string }>>(
    blog?.mediaAssets?.map(asset => ({ id: asset.id, fileUrl: asset.fileUrl })) || []
  );
  const [description, setDescription] = useState(blog?.description || "");

  const { mutate: publishBlog, isPending: isPublishing } = usePublishBlog();
  const { mutate: updateBlog, isPending: isUpdating } = useUpdateBlog();

  const form = useForm<BlogPostFormData>({
    resolver: zodResolver(blogPostFormSchema) as any,
    defaultValues: blog
      ? {
        title: blog.title || "",
        slug: blog.slug || "",
        excerpt: blog.excerpt || "",
        description: blog.description || "",
        estimatedReadTime: blog.estimatedReadTime?.toString() || "5",
        isPublished: blog.isPublished || false,
        coverImage: undefined,
        mediaUtils: undefined,
      }
      : defaultValues,
  });

  // Reset form when blog prop changes
  useEffect(() => {
    if (blog) {
      form.reset({
        title: blog.title || "",
        slug: blog.slug || "",
        excerpt: blog.excerpt || "",
        description: blog.description || "",
        estimatedReadTime: blog.estimatedReadTime?.toString() || "5",
        isPublished: blog.isPublished || false,
        coverImage: undefined,
        mediaUtils: undefined,
      });
      setDescription(blog.description || "");
      setCoverImagePreview(blog.coverImage || null);
      setOriginalCoverImage(blog.coverImage || null);
      const mediaUrls = blog.mediaAssets?.map(asset => asset.fileUrl) || [];
      setMediaPreviews(mediaUrls);
      setOriginalMediaAssets(blog.mediaAssets?.map(asset => ({ id: asset.id, fileUrl: asset.fileUrl })) || []);
    } else {
      form.reset(defaultValues);
      setDescription("");
      setCoverImagePreview(null);
      setOriginalCoverImage(null);
      setMediaPreviews([]);
      setOriginalMediaAssets([]);
    }
    setCoverImage(null);
    setMediaFiles([]);
  }, [blog, form]);

  useEffect(() => {
    form.setValue("description", description, { shouldValidate: true });
  }, [description, form]);

  const handleDescriptionChange = (content: string) => {
    setDescription(content);
  };

  // Auto-generate slug from title
  const handleTitleChange = (value: string) => {
    form.setValue("title", value);
    if (!blog) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      form.setValue("slug", slug);
    }
  };

  const handleMediaFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setMediaFiles(prev => [...prev, ...files]);

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setMediaPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeMediaFile = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: BlogPostFormData) => {
    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("slug", values.slug);
    formData.append("excerpt", values.excerpt);
    formData.append("description", description);
    formData.append("estimatedReadTime", values.estimatedReadTime.toString());
    formData.append("isPublished", values.isPublished ? "true" : "false");

    if (coverImage) {
      formData.append("coverImage", coverImage);
    }

    // Append media files
    mediaFiles.forEach((file) => {
      formData.append("mediaUrls", file);
    });

    if (blog) {
      // Handle removed media assets
      const removedAssets = originalMediaAssets.filter(
        asset => !mediaPreviews.includes(asset.fileUrl)
      );
      if (removedAssets.length > 0) {
        removedAssets.forEach((asset) => {
          formData.append("removedMediaIds", asset.id);
        });
      }

      // Handle removed cover image
      if (originalCoverImage && !coverImagePreview) {
        formData.append("removeUrls[]", originalCoverImage);
      }
    }

    if (blog) {
      // Update existing blog
      updateBlog(
        { blogId: blog.id, data: formData },
        {
          onSuccess: () => {
            onSuccess();
          },
        }
      );
    } else {
      // Create new blog
      publishBlog(formData, {
        onSuccess: () => {
          onSuccess();
        },
      });
    }
  };

  return (
    <div className="mt-10 mx-auto">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit as any)}
          className="space-y-8 bg-muted/80 p-6 rounded-xl"
        >
          {/* Title and Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control as any}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Title <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter blog title"
                      {...field}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="rounded-sm border-gray-300 focus:ring-2 focus:ring-orange-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Slug <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="blog-post-url-slug"
                      {...field}
                      disabled={!!blog}
                      className="rounded-sm border-gray-300 focus:ring-2 focus:ring-orange-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Excerpt */}
          <FormField
            control={form.control as any}
            name="excerpt"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  Excerpt <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Brief summary of the blog post"
                    {...field}
                    rows={3}
                    className="rounded-sm border-gray-300 focus:ring-2 focus:ring-orange-500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Estimated Read Time and Published Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control as any}
              name="estimatedReadTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Estimated Read Time (minutes) <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      placeholder="5"
                      {...field}
                      className="rounded-sm border-gray-300 focus:ring-2 focus:ring-orange-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="isPublished"
              render={({ field }) => (
                <FormItem className="flex flex-col justify-end">
                  <div className="flex items-center space-x-2">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Published
                    </FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Cover Image Upload */}
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-700">
              Cover Image
            </FormLabel>
            <FormControl>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setCoverImage(file || null);
                  setCoverImagePreview(
                    file ? URL.createObjectURL(file) : null
                  );
                }}
                className="cursor-pointer rounded-sm border-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-[2px] file:border-0 file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
              />
            </FormControl>
            <p className="text-xs text-gray-500 mt-1">
              Recommended size: 1200 × 630px
            </p>
            <FormMessage />
          </FormItem>

          {/* Cover Image Preview */}
          {coverImagePreview && (
            <div className="flex justify-start">
              <div className="relative">
                <img
                  src={coverImagePreview}
                  alt="Cover preview"
                  className="w-full max-w-md h-48 object-cover rounded-[2px] shadow-sm border border-gray-200"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute text-white hover:scale-105 top-2 right-2 h-6 w-6"
                  onClick={() => {
                    setCoverImage(null);
                    setCoverImagePreview(null);
                  }}
                >
                  <Icon icon={"ic:baseline-delete"} className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Media Files Upload */}
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-700">
              Media Assets (Images/Videos)
            </FormLabel>
            <FormControl>
              <Input
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleMediaFilesChange}
                className="cursor-pointer rounded-sm border-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-[2px] file:border-0 file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
              />
            </FormControl>
            <p className="text-xs text-gray-500 mt-1">
              You can select multiple files
            </p>
            <FormMessage />
          </FormItem>

          {/* Media Previews */}
          {mediaPreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {mediaPreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Media ${index + 1}`}
                    className="w-full h-32 object-cover rounded-[2px] shadow-sm border border-gray-200"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute text-white top-1 right-1 h-6 w-6"
                    onClick={() => removeMediaFile(index)}
                  >
                    <Icon icon={"ic:baseline-delete"} className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Rich Text Editor for Description */}
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-700">
              Description <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <RichTextEditor
                value={description}
                onChange={handleDescriptionChange}
                placeholder="Write your blog content here..."
              />
            </FormControl>
            <FormMessage>
              {form.formState.errors.description?.message}
            </FormMessage>
          </FormItem>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="rounded-sm border-gray-300 hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-sm bg-primary hover:bg-orange-700 text-white"
              disabled={isPublishing || isUpdating}
            >
              {isPublishing || isUpdating
                ? "Submitting..."
                : blog
                  ? "Update Blog"
                  : "Create Blog"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
