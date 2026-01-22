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
import { useUpdateVideoReview } from "@/hooks/useVideoReview";
import type { VideoReviewItem } from "@/types/viewReview";
import { useState, useEffect } from "react";
import { Loader2, Video, X } from "lucide-react";
import { isYouTubeUrl, getYouTubeEmbedUrl } from "@/lib/video-utils";
import { cn } from "@/lib/utils";
import RichTextEditor from "@/components/RichTextEditor";

const formSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    _id: z.string(),
    videoUrl: z.string().optional(),
    videoFile: z.any().optional(),
  })
  .refine((data) => data.videoUrl || data.videoFile?.[0], {
    message: "Either a video file or YouTube URL is required",
    path: ["videoUrl"],
  })
  .refine((data) => !(data.videoUrl && data.videoFile?.[0]), {
    message: "Cannot upload both a video file and a YouTube URL",
    path: ["videoUrl"],
  });

interface EditVideoFormProps {
  item: VideoReviewItem;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EditVideoForm({
  item,
  onSuccess,
  onCancel,
}: EditVideoFormProps) {
  const { mutate: updateVideo, isPending } = useUpdateVideoReview(item._id);

  const [previewUrl, setPreviewUrl] = useState<string | null>(
    item.videoUrl
      ? isYouTubeUrl(item.videoUrl)
        ? getYouTubeEmbedUrl(item.videoUrl)
        : item.videoUrl
      : null
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: item.title,
      description: item.description || "",
      _id: item._id,
      videoUrl: item.videoUrl,
      videoFile: undefined,
    },
  });

  const videoUrl = form.watch("videoUrl");
  const videoFile = form.watch("videoFile");

  useEffect(() => {
    if (videoFile?.[0]) {
      const file = videoFile[0];
      setPreviewUrl(URL.createObjectURL(file));
      form.setValue("videoUrl", "");
    } else if (videoUrl) {
      if (isYouTubeUrl(videoUrl)) {
        const embedUrl = getYouTubeEmbedUrl(videoUrl);
        setPreviewUrl(embedUrl);
      } else {
        setPreviewUrl(videoUrl);
      }
      form.setValue("videoFile", undefined);
    } else {
      setPreviewUrl(null);
    }

    return () => {
      if (videoFile?.[0]) {
        URL.revokeObjectURL(URL.createObjectURL(videoFile[0]));
      }
    };
  }, [videoUrl, videoFile, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const formData = new FormData();
    formData.append("title", values.title);
    if (values.description) formData.append("description", values.description);
    formData.append("_id", values._id);

    if (values.videoFile?.[0]) {
      formData.append("videoFile", values.videoFile[0]);
    } else if (values.videoUrl) {
      formData.append("videoUrl", values.videoUrl);
    }

    updateVideo(formData, {
      onSuccess: () => {
        onSuccess();
      },
    });
  };

  return (
    <div className="w-full mx-auto">
      <h2 className="text-2xl font-bold mb-6">Edit Video Review</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />


          <div className="space-y-4">
            <div className="space-y-2">
              <FormLabel>Video Source</FormLabel>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <FormField
                    control={form.control}
                    name="videoFile"
                    render={({ field: { value, onChange, ...field } }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex items-center">
                            <label
                              htmlFor="video-upload"
                              className={cn(
                                "flex-1 cursor-pointer border border-dashed rounded-[2px] p-4 text-center",
                                value?.[0]
                                  ? "border-green-500 bg-green-50"
                                  : "border-gray-300"
                              )}
                            >
                              <Video className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                              <p className="text-sm text-gray-600">
                                {value?.[0]?.name ||
                                  "Click to upload video file"}
                              </p>
                              <input
                                id="video-upload"
                                type="file"
                                accept="video/*"
                                className="hidden"
                                onChange={(e) =>
                                  onChange(
                                    e.target.files ? [e.target.files[0]] : []
                                  )
                                }
                                {...field}
                              />
                            </label>
                            {value?.[0] && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="ml-2"
                                onClick={() => {
                                  form.setValue("videoFile", undefined);
                                  form.setValue("videoUrl", "");
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="text-sm text-gray-500">OR</div>
                <div className="flex-1">
                  <FormField
                    control={form.control}
                    name="videoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Or enter YouTube URL"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => {
                              field.onChange(e);
                              if (e.target.value) {
                                form.setValue("videoFile", undefined);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {previewUrl && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Preview</h4>
                {isYouTubeUrl(previewUrl) ? (
                  <div className="aspect-video w-full">
                    <iframe
                      src={previewUrl}
                      className="w-full h-full rounded-[2px]"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <video
                    src={previewUrl}
                    controls
                    className="max-w-full max-h-64 rounded-[2px]"
                  />
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Review
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
