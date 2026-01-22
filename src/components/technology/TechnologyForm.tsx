import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useCreateTechnology, useUpdateTechnology } from "@/services/technology";
import { type ITechnology } from "@/types/ITechnology";
import Breadcrumb from "@/components/dashboard/Breadcumb";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageUpload, MultiImageUpload } from "@/components/ImageUpload";
import { toast } from "sonner";
import RichTextEditor from "../ui/texteditor";

const technologySchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    coverImage: z.string().min(1, "Cover image is required"),
    bannerUrls: z.array(z.string()).min(1, "At least one banner image is required"),
});

type TechnologyFormData = z.infer<typeof technologySchema>;

interface TechnologyFormProps {
    mode: "create" | "edit";
    technology?: ITechnology;
    isLoading?: boolean;
}

export default function TechnologyForm({ mode, technology, isLoading }: TechnologyFormProps) {
    const navigate = useNavigate();
    const createMutation = useCreateTechnology();
    const updateMutation = useUpdateTechnology();

    const [coverPreview, setCoverPreview] = useState<string>("");
    const [bannerPreviews, setBannerPreviews] = useState<string[]>([]);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [bannerFiles, setBannerFiles] = useState<File[]>([]);
    const [removedBanners, setRemovedBanners] = useState<string[]>([]);
    const [originalBannerGallery, setOriginalBannerGallery] = useState<Array<{ id: string; url: string }>>([]);
    const [originalCoverImage, setOriginalCoverImage] = useState<string>("");
    const [removedBannerIds, setRemovedBannerIds] = useState<string[]>([]);
    const [removedCoverUrl, setRemovedCoverUrl] = useState<string[]>([]);

    const form = useForm<TechnologyFormData>({
        resolver: zodResolver(technologySchema),
        defaultValues: {
            title: "",
            description: "",
            coverImage: "",
            bannerUrls: [],
        },
    });

    useEffect(() => {
        if (technology && mode === "edit") {
            form.reset({
                title: technology.title,
                description: technology.description,
                coverImage: technology.coverImage,
                bannerUrls: technology.bannerUrls || [],
            });
            setCoverPreview(technology.coverImage || "");
            setOriginalCoverImage(technology.coverImage || "");
            setBannerPreviews(technology.bannerUrls || []);
            setRemovedBanners([]);

            // Initialize original banner gallery
            if (technology.bannerGallery && technology.bannerGallery.length > 0) {
                setOriginalBannerGallery(technology.bannerGallery.map(banner => ({ id: banner.id, url: banner.url })));
            } else {
                // Fallback if bannerGallery is not provided (backward compatibility)
                setOriginalBannerGallery([]);
            }

            setRemovedBannerIds([]);
            setRemovedCoverUrl([]);
        }
    }, [technology, mode, form]);

    const onSubmit = async (data: TechnologyFormData) => {
        try {
            const formData = new FormData();

            formData.append("title", data.title);
            formData.append("description", data.description);

            // Append cover image file
            if (coverFile) {
                formData.append("coverImage", coverFile);
            }

            // Append banner files
            if (bannerFiles.length > 0) {
                bannerFiles.forEach((file) => {
                    formData.append("bannerUrls", file);
                });
            }

            // Send removed media IDs
            if (mode === "edit" && removedBannerIds.length > 0) {
                removedBannerIds.forEach((id) => {
                    formData.append("removedMediaIds[]", id);
                });
            }

            // Send removed banner URLs
            if (mode === "edit" && removedBanners.length > 0) {
                removedBanners.forEach((url) => {
                    formData.append("removeUrls[]", url);
                });
            }

            // Send removed cover URL
            if (mode === "edit" && removedCoverUrl.length > 0) {
                removedCoverUrl.forEach((url) => {
                    formData.append("removeUrls[]", url);
                });
            }

            if (mode === "create") {
                await createMutation.mutateAsync(formData as any);
            } else if (technology) {
                await updateMutation.mutateAsync({ id: technology.id, data: formData as any });
            }
            navigate("/dashboard/technology");
        } catch (error) {
            // Failed to save technology
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <Breadcrumb
                    links={[
                        { label: "Technologies", isActive: false, href: "/dashboard/technology" },
                        { label: mode === "create" ? "Create" : "Edit", isActive: true },
                    ]}
                />

            </div>

            <Card>
                <CardHeader className="px-0">
                    <CardTitle>{mode === "create" ? "Create Technology" : "Edit Technology"}</CardTitle>
                </CardHeader>
                <CardContent className="px-0">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter technology title" {...field} />
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
                                        <FormLabel>Description *</FormLabel>
                                        <FormControl>
                                            <RichTextEditor
                                                placeholder="Enter technology description"
                                                value={field.value}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="coverImage"
                                render={() => (
                                    <FormItem>
                                        <FormLabel>Cover Image *</FormLabel>
                                        <FormControl>
                                            <ImageUpload
                                                preview={coverPreview}
                                                onFileChange={(file) => {
                                                    if (file) {
                                                        setCoverFile(file);
                                                        const previewUrl = URL.createObjectURL(file);
                                                        setCoverPreview(previewUrl);
                                                        form.setValue("coverImage", "file", { shouldValidate: true });
                                                    }
                                                }}
                                                onRemove={() => {
                                                    // Track original cover image for removal
                                                    if (mode === "edit" && originalCoverImage && coverPreview === originalCoverImage) {
                                                        setRemovedCoverUrl((prev) => [...prev, originalCoverImage]);
                                                    }
                                                    setCoverPreview("");
                                                    setCoverFile(null);
                                                    form.setValue("coverImage", "");
                                                }}
                                                placeholder="Click to upload cover image"
                                                maxSize={2}
                                                height="h-64"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="bannerUrls"
                                render={() => (
                                    <FormItem>
                                        <FormLabel>
                                            Banner Images *
                                            <span className="text-xs text-gray-500 font-normal ml-2">
                                                (Recommended: 1-5 high-quality images)
                                            </span>
                                        </FormLabel>
                                        <FormControl>
                                            <MultiImageUpload
                                                previews={bannerPreviews}
                                                onFilesChange={(files) => {
                                                    const newUrls = files.map((file) => URL.createObjectURL(file));
                                                    const updatedBanners = [...bannerPreviews, ...newUrls];
                                                    const updatedFiles = [...bannerFiles, ...files];

                                                    setBannerPreviews(updatedBanners);
                                                    setBannerFiles(updatedFiles);
                                                    form.setValue(
                                                        "bannerUrls",
                                                        updatedBanners.map(() => "file"),
                                                        { shouldValidate: true }
                                                    );
                                                    toast.success(
                                                        `${files.length} banner${files.length > 1 ? "s" : ""} added successfully`
                                                    );
                                                }}
                                                onRemove={(index) => {
                                                    const removedUrl = bannerPreviews[index];

                                                    // Track removed banner by gallery ID
                                                    if (mode === "edit" && removedUrl && !removedUrl.startsWith("blob:")) {
                                                        const bannerInGallery = originalBannerGallery.find(banner => banner.url === removedUrl);
                                                        if (bannerInGallery) {
                                                            setRemovedBannerIds((prev) => [...prev, bannerInGallery.id]);
                                                        }
                                                        setRemovedBanners((prev) => [...prev, removedUrl]);
                                                    }

                                                    const updated = bannerPreviews.filter((_, i) => i !== index);
                                                    const updatedFiles = bannerFiles.filter((_, i) => i !== index);
                                                    setBannerPreviews(updated);
                                                    setBannerFiles(updatedFiles);
                                                    form.setValue(
                                                        "bannerUrls",
                                                        updated.map(() => "file"),
                                                        { shouldValidate: true }
                                                    );
                                                }}
                                                maxImages={5}
                                                maxSize={2}
                                                placeholder="Upload Technology Banners"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end gap-4 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate("/dashboard/technology")}
                                    className="h-11 px-6"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={createMutation.isPending || updateMutation.isPending}
                                    className="h-10 px-6"
                                >
                                    {(createMutation.isPending || updateMutation.isPending) && (
                                        <Icon icon="svg-spinners:180-ring" className="w-4 h-4 mr-2" />
                                    )}
                                    {mode === "create" ? "Create Technology" : "Update Technology"}
                                </Button>

                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
