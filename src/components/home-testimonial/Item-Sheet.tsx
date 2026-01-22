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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import type { HomeTestimonialType } from "@/types/HomeTestimonialType";
import {
  useCreateHomeTestimonial,
  useUpdateHomeTestimonial,
} from "@/hooks/useHomeTestimonial";
import RichTextEditor from "../RichTextEditor";

const formSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  comment: z.string().min(1, "Comment is required"),
  rating: z
    .number()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5"),
  sortOrder: z.number().min(0, "Sort order must be 0 or greater"),
  isActive: z.boolean(),
});

interface TestimonialFormProps {
  testimonial?: HomeTestimonialType;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TestimonialForm({
  testimonial,
  onSuccess,
  onCancel,
}: TestimonialFormProps) {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    testimonial?.image || null
  );

  const { mutate: updateTestimonial, isPending: isUpdatePending } =
    useUpdateHomeTestimonial(testimonial?._id as string);
  const { mutate: addTestimonial, isPending: isAddPending } =
    useCreateHomeTestimonial();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: testimonial?.fullName || "",
      comment: testimonial?.comment || "",
      rating: testimonial?.rating || 5,
      sortOrder: testimonial?.sortOrder || 0,
      isActive: testimonial?.isActive ?? true,
    },
  });

  useEffect(() => {
    if (testimonial) {
      form.reset({
        fullName: testimonial.fullName || "",
        comment: testimonial.comment || "",
        rating: testimonial.rating || 5,
        sortOrder: testimonial.sortOrder || 0,
        isActive: testimonial.isActive ?? true,
      });
      setImagePreview(testimonial.image || null);
    } else {
      form.reset({
        fullName: "",
        comment: "",
        rating: 5,
        sortOrder: 0,
        isActive: true,
      });
      setImagePreview(null);
    }
    setImage(null);
  }, [testimonial, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const formData = new FormData();
      formData.append("fullName", values.fullName);
      formData.append("comment", values.comment);
      formData.append("rating", values.rating.toString());
      formData.append("sortOrder", values.sortOrder.toString());
      formData.append("isActive", values.isActive.toString());
      if (image) formData.append("image", image);

      const action = testimonial ? updateTestimonial : addTestimonial;

      action(formData, {
        onSuccess: () => {
          toast.success(
            `Testimonial ${testimonial ? "updated" : "created"} successfully`
          );
          onSuccess();
        },
        onError: () => {
          toast.error(
            `Failed to ${testimonial ? "update" : "create"} testimonial`
          );
        },
      });
    } catch (error) {
      toast.error(`Failed to ${testimonial ? "update" : "create"} testimonial`);
    }
  };

  const renderStars = (
    rating: number,
    onRatingChange: (rating: number) => void
  ) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onRatingChange(i + 1)}
          className={`text-2xl ${i < rating ? "text-yellow-400" : "text-gray-300"
            } hover:text-yellow-400 transition-colors`}
        >
          ★
        </button>
      ));
  };

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter full name"
                      {...field}
                      className="bg-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Avatar Image</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setImage(file);
                    setImagePreview(file ? URL.createObjectURL(file) : null);
                  }}
                  className="bg-white flex items-center cursor-pointer pt-3"
                />
              </FormControl>
              <p className="text-xs text-muted-foreground mt-1">
                Max 3MB image. JPG or PNG preferred.
              </p>
              <FormMessage />
            </FormItem>
          </div>

          {imagePreview && (
            <div className="w-full">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-full shadow-md border mb-4"
              />
            </div>
          )}

          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rating</FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-1">
                    {renderStars(field.value, field.onChange)}
                    <span className="ml-2 text-sm text-gray-600">
                      ({field.value}/5)
                    </span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Comment</FormLabel>
                <FormControl>
                  <RichTextEditor
                    initialContent={field.value}
                    onChange={(content) => field.onChange(content || "")}
                    placeholder="Write category description..."
                    className="h-auto"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="sortOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sort Order</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className="bg-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-[2px] border p-4">
                  <FormControl>
                    <Checkbox
                      className="mt-1"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Active Status</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Make this testimonial visible on the website
                    </p>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end items-center gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isAddPending || isUpdatePending}>
              {testimonial
                ? isUpdatePending
                  ? "Updating..."
                  : "Update"
                : isAddPending
                  ? "Creating..."
                  : "Create"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
