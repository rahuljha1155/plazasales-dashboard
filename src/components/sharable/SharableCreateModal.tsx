import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Loader2, Upload, X, FileUp } from "lucide-react";
import { toast } from "sonner";
import { api2 } from "@/services/api";
import { useQueryClient } from "@tanstack/react-query";

interface ISharableForm {
    productId?: string;
    kind: string;
    title: string;
    fileType: string;
    isActive: boolean;
    sortOrder: number;
    extra: string;
}

interface SharableCreateModalProps {
    productId?: string;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function SharableCreateModal({ productId, onSuccess, onCancel }: SharableCreateModalProps) {
    const queryClient = useQueryClient();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mediaPreview, setMediaPreview] = useState<string>("");
    const [mediaFile, setMediaFile] = useState<File | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<ISharableForm>({
        defaultValues: {
            productId,
            kind: "",
            title: "",
            fileType: "",
            isActive: true,
            sortOrder: 0,
            extra: "",
        },
    });

    const isActive = watch("isActive");

    const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const maxSize = 10 * 1024 * 1024; // 10MB

        if (file.size > maxSize) {
            toast.error("File exceeds 10MB limit");
            return;
        }

        setMediaFile(file);
        setMediaPreview(URL.createObjectURL(file));
        
        // Auto-detect and set file type
        const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
        setValue("fileType", fileExtension);
        
        e.target.value = "";
    };

    const removeMedia = () => {
        if (mediaPreview) {
            URL.revokeObjectURL(mediaPreview);
        }
        setMediaPreview("");
        setMediaFile(null);
    };

    const onSubmit = async (data: ISharableForm) => {
        try {
            setIsSubmitting(true);

            if (!mediaFile) {
                toast.error("Please upload a media file");
                return;
            }

            const formData = new FormData();
            if (data.productId) {
                formData.append("productId", data.productId);
            }
            formData.append("kind", data.kind.trim());
            formData.append("title", data.title.trim());
            formData.append("fileType", data.fileType.trim());
            formData.append("isActive", String(data.isActive));
            formData.append("sortOrder", String(data.sortOrder));
            formData.append("extra", data.extra.trim());
            formData.append("mediaAsset", mediaFile);

            await api2.post("/shareable/create-shareable", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            toast.success("Sharable created successfully");
            queryClient.invalidateQueries({ queryKey: ["getSharables"] });
            onSuccess();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to create sharable");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <Button variant="outline" size="sm" onClick={onCancel}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
            </Button>

            <Card>
                <CardHeader className="px-0">
                    <CardTitle>Create Sharable</CardTitle>
                    <CardDescription>Add a new sharable item</CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Title */}
                        <div className="space-y-2">
                            <Label htmlFor="title">
                                Title <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="title"
                                {...register("title", {
                                    required: "Title is required",
                                    minLength: {
                                        value: 3,
                                        message: "Title must be at least 3 characters",
                                    },
                                })}
                                placeholder="Enter title"
                                className={errors.title ? "border-red-500" : ""}
                            />
                            {errors.title && (
                                <p className="text-sm text-red-500">{errors.title.message}</p>
                            )}
                        </div>

                        {/* Kind */}
                        <div className="space-y-2">
                            <Label htmlFor="kind">
                                Kind <span className="text-red-500">*</span>
                            </Label>
                            <select
                                id="kind"
                                {...register("kind", {
                                    required: "Kind is required",
                                })}
                                className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.kind ? "border-red-500" : ""}`}
                            >
                                <option value="">Select kind</option>
                                <option value="LOGO">Logo</option>
                                <option value="BROCHURE">Brochure</option>
                                <option value="MANUAL">Manual</option>
                                <option value="PRICE_LIST">Price List</option>
                                <option value="OTHER">Other</option>
                            </select>
                            {errors.kind && (
                                <p className="text-sm text-red-500">{errors.kind.message}</p>
                            )}
                        </div>

                        {/* Media Asset */}
                        <div className="space-y-2">
                            <Label htmlFor="mediaAsset">
                                Media Asset <span className="text-red-500">*</span>
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Upload media file (Max 10MB)
                            </p>
                            <div className="border-2 border-dashed rounded-lg p-6 hover:border-primary/50 transition-colors">
                                <Input
                                    id="mediaAsset"
                                    type="file"
                                    accept="image/*,video/*,application/pdf"
                                    onChange={handleMediaChange}
                                    className="hidden"
                                />
                                <div className="flex flex-col items-center justify-center gap-2">
                                    <div className="p-3 bg-primary/10 rounded-full">
                                        <FileUp className="w-6 h-6 text-primary" />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => document.getElementById("mediaAsset")?.click()}
                                    >
                                        <Upload className="w-4 h-4 mr-2" />
                                        Choose Media File
                                    </Button>
                                    <p className="text-xs text-muted-foreground text-center">
                                        Supports images, videos, PDFs and more
                                    </p>
                                </div>
                            </div>
                            {mediaPreview && (
                                <div className="mt-4">
                                    <p className="text-sm font-medium mb-2">Selected Media</p>
                                    <div className="relative group w-fit">
                                        <div className="w-40 h-40 rounded-lg border-2 border-gray-200 overflow-hidden">
                                            <img
                                                src={mediaPreview}
                                                alt="Media preview"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-lg"
                                            onClick={removeMedia}
                                        >
                                            <X className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                            {!mediaFile && (
                                <p className="text-sm text-red-500">Media file is required</p>
                            )}
                        </div>

                        {/* File Type - Auto-generated, Read-only */}
                        <div className="space-y-2">
                            <Label htmlFor="fileType">
                                File Type <span className="text-muted-foreground text-xs">(Auto-detected)</span>
                            </Label>
                            <Input
                                id="fileType"
                                {...register("fileType")}
                                placeholder="Upload a file to auto-detect type"
                                className="bg-muted"
                                readOnly
                                disabled
                            />
                            {/* <p className="text-xs text-muted-foreground">
                                File type is automatically detected from the uploaded file
                            </p> */}
                        </div>

                        {/* Extra */}
                        <div className="space-y-2">
                            <Label htmlFor="extra">Extra Information</Label>
                            <Textarea
                                id="extra"
                                {...register("extra")}
                                placeholder="Additional information (optional)"
                                rows={3}
                            />
                        </div>

                        {/* Sort Order and Status */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="sortOrder">Sort Order</Label>
                                <Input
                                    id="sortOrder"
                                    type="number"
                                    min="0"
                                    {...register("sortOrder", {
                                        valueAsNumber: true,
                                        min: {
                                            value: 0,
                                            message: "Sort order must be 0 or greater",
                                        },
                                    })}
                                    placeholder="0"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="isActive">Status</Label>
                                <div className="flex items-center space-x-2 h-10">
                                    <Switch
                                        id="isActive"
                                        checked={isActive}
                                        onCheckedChange={(checked) => setValue("isActive", checked)}
                                    />
                                    <Label htmlFor="isActive" className="cursor-pointer">
                                        {isActive ? "Active" : "Inactive"}
                                    </Label>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end gap-4">
                            <Button type="button" variant="outline" onClick={onCancel}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    "Create Sharable"
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
