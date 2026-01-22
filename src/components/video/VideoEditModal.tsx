import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useUpdateVideo } from "@/hooks/useVideo";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { Video } from "@/hooks/useVideo";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  productModelNumber: z.string().min(1, "Model number is required"),
  youtubeVideoId: z.string().min(1, "YouTube video URL/ID is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface VideoEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  video: Video;
  productId?: string;
}

export function VideoEditModal({ open, onOpenChange, video, productId }: VideoEditModalProps) {
  const updateMutation = useUpdateVideo();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: video.title || "",
      productModelNumber: video.productModelNumber || "",
      youtubeVideoId: video.youtubeVideoId || "",
    },
  });

  // Update form when video changes
  useEffect(() => {
    if (video) {
      form.reset({
        title: video.title || "",
        productModelNumber: video.productModelNumber || "",
        youtubeVideoId: video.youtubeVideoId || "",
      });
    }
  }, [video, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      const submitData = {
        ...values,
        productId: productId || video.productId,
      };
      await updateMutation.mutateAsync({
        videoId: video.id,
        data: submitData,
      });
      toast.success("Video updated successfully");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update video");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Video</DialogTitle>
          <DialogDescription>
            Update the video information. All fields are required.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="MacBook Air M3 — Official Overview"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="productModelNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Model Number</FormLabel>
                  <FormControl>
                    <Input placeholder="A3113" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="youtubeVideoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>YouTube Video URL or ID</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Update Video
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
