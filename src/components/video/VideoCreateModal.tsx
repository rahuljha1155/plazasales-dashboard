import React from "react";
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
import { useCreateVideo } from "@/hooks/useVideo";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  productModelNumber: z.string().min(1, "Model number is required"),
  youtubeVideoId: z.string().min(1, "YouTube video URL/ID is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface VideoCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
}

export function VideoCreateModal({ open, onOpenChange, productId }: VideoCreateModalProps) {
  const createMutation = useCreateVideo();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      productModelNumber: "",
      youtubeVideoId: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const submitData = {
        ...values,
        productId: productId || "",
      };
      await createMutation.mutateAsync(submitData);
      toast.success("Video created successfully");
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to create video");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Video</DialogTitle>
          <DialogDescription>
            Add a new YouTube video for a product. Fill in all the required fields.
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
                disabled={createMutation.isPending}
              >
                {createMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Video
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
