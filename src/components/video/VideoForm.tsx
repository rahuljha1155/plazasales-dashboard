import { useEffect } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateVideo, useUpdateVideo, type Video } from "@/hooks/useVideo";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
    title: z.string().min(1, "Title is required"),
    productModelNumber: z.string().optional(),
    youtubeVideoId: z.string().min(1, "YouTube video URL/ID is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface VideoFormProps {
    mode: "create" | "edit";
    video?: Video;
    productId: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function VideoForm({ mode, video, productId, onSuccess, onCancel }: VideoFormProps) {
    const createMutation = useCreateVideo();
    const updateMutation = useUpdateVideo();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: video?.title || "",
            productModelNumber: video?.productModelNumber || "",
            youtubeVideoId: video?.youtubeVideoId || "",
        },
    });

    useEffect(() => {
        if (video && mode === "edit") {
            form.reset({
                title: video.title || "",
                productModelNumber: video.productModelNumber || "",
                youtubeVideoId: video.youtubeVideoId || "",
            });
        }
    }, [video, mode, form]);

    const onSubmit = async (values: FormValues) => {
        try {
            const submitData = {
                ...values,
                productId: productId,
            };

            if (mode === "edit" && video) {
                await updateMutation.mutateAsync({
                    videoId: video.id,
                    data: submitData,
                });
                toast.success("Video updated successfully");
            } else {
                await createMutation.mutateAsync(submitData);
                toast.success("Video created successfully");
                form.reset();
            }

            onSuccess?.();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || `Failed to ${mode} video`);
        }
    };

    const isLoading = createMutation.isPending || updateMutation.isPending;

    return (
        <Card>
            <CardHeader>
                <CardTitle>{mode === "edit" ? "Edit Video" : "Create New Video"}</CardTitle>
            </CardHeader>
            <CardContent>
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
                                onClick={onCancel}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {mode === "edit" ? "Update Video" : "Create Video"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
