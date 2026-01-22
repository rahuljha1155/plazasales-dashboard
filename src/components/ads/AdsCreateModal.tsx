import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useCreateAd } from "@/hooks/useAds";
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
import { ArrowLeft, Loader2, Upload, X, ImageIcon } from "lucide-react";
import type { ICreateAdRequest } from "@/types/IAds";
import { toast } from "sonner";
import Breadcrumb from "../dashboard/Breadcumb";

export default function AdsCreateModal() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const createAdMutation = useCreateAd();
    const [bannerPreviews, setBannerPreviews] = useState<string[]>([]);
    const [bannerFiles, setBannerFiles] = useState<File[]>([]);

    const productId = searchParams.get("productId") || undefined;
    const brandId = searchParams.get("brandId") || undefined;
    const categoryId = searchParams.get("categoryId") || undefined;
    const subcategoryId = searchParams.get("subcategoryId") || undefined;

    // Get current date-time in local timezone for min attribute
    const getCurrentDateTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    };

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<ICreateAdRequest>({
        defaultValues: {
            title: "",
            description: "",
            targetUrl: "",
            isActive: true,
            sortOrder: 0,
            productId,
            brandId,
            categoryId,
            subcategoryId,
        },
    });

    const isActive = watch("isActive");
    const startAt = watch("startAt");

    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        // Validate file types and sizes
        const validFiles: File[] = [];
        const maxSize = 5 * 1024 * 1024; // 5MB

        for (const file of files) {
            if (!file.type.startsWith("image/")) {
                toast.error(`${file.name} is not an image file`);
                continue;
            }
            if (file.size > maxSize) {
                toast.error(`${file.name} exceeds 5MB limit`);
                continue;
            }
            validFiles.push(file);
        }

        if (validFiles.length > 0) {
            const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
            setBannerPreviews((prev) => [...prev, ...newPreviews]);
            setBannerFiles((prev) => [...prev, ...validFiles]);
        }

        // Reset input
        e.target.value = "";
    };

    const removeBanner = (index: number) => {
        // Revoke object URL to prevent memory leaks
        URL.revokeObjectURL(bannerPreviews[index]);
        setBannerPreviews((prev) => prev.filter((_, i) => i !== index));
        setBannerFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const onSubmit = async (data: ICreateAdRequest) => {
        try {
            // Validate banner files
            if (bannerFiles.length === 0) {
                toast.error("Please upload at least one banner image");
                return;
            }

            // Validate dates
            const start = new Date(data.startAt);
            const end = new Date(data.endAt);
            const now = new Date();

            if (start < now) {
                toast.error("Start date cannot be in the past");
                return;
            }

            if (end <= start) {
                toast.error("End date must be after start date");
                return;
            }

            // Create FormData
            const formData = new FormData();

            // Add required fields
            formData.append("title", data.title.trim());
            formData.append("description", data.description.trim());
            formData.append("targetUrl", data.targetUrl.trim());
            formData.append("isActive", String(data.isActive));
            formData.append("startAt", data.startAt);
            formData.append("endAt", data.endAt);
            formData.append("sortOrder", String(data.sortOrder));

            // Add banner files
            bannerFiles.forEach((file) => {
                formData.append("bannerUrls", file);
            });

            // Only add entity IDs if they have values
            if (data.productId) formData.append("productId", data.productId);
            if (data.brandId) formData.append("brandId", data.brandId);
            if (data.categoryId) formData.append("categoryId", data.categoryId);
            if (data.subcategoryId) formData.append("subcategoryId", data.subcategoryId);

            await createAdMutation.mutateAsync(formData);

            toast.success("Advertisement created successfully");

            navigate("/dashboard/ads");
        } catch (error) {
            toast.error("Failed to create advertisement. Please try again.");
        }
    };

    return (
        <div className="space-y-6">

            <Breadcrumb links={[
                {
                    label: "Ads",
                    href: "/dashboard/ads",
                },
                {
                    label: "Create",
                    href: "/dashboard/ads/create",
                }
            ]} />


            <Card>
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
                                        message: "Title must be at least 3 characters"
                                    },
                                    maxLength: {
                                        value: 200,
                                        message: "Title must not exceed 200 characters"
                                    }
                                })}
                                placeholder="Enter ad title"
                                className={errors.title ? "border-red-500" : ""}
                            />
                            {errors.title && (
                                <p className="text-sm text-red-500">{errors.title.message}</p>
                            )}
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">
                                Description <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                                id="description"
                                {...register("description", {
                                    required: "Description is required",
                                    minLength: {
                                        value: 10,
                                        message: "Description must be at least 10 characters"
                                    },
                                    maxLength: {
                                        value: 1000,
                                        message: "Description must not exceed 1000 characters"
                                    }
                                })}
                                placeholder="Enter ad description"
                                rows={4}
                                className={errors.description ? "border-red-500" : ""}
                            />
                            {errors.description && (
                                <p className="text-sm text-red-500">
                                    {errors.description.message}
                                </p>
                            )}
                        </div>

                        {/* Banner Images */}
                        <div className="space-y-2">
                            <Label htmlFor="banners">
                                Banner Images <span className="text-red-500">*</span>
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Upload one or more banner images (Max 5MB. Recommended size: 1283x223px)
                            </p>
                            <div className="border-2 border-dashed rounded-lg p-6 hover:border-primary/50 transition-colors">
                                <Input
                                    id="banners"
                                    type="file"
                                    accept="image/jpeg,image/png,image/gif,image/webp"
                                    multiple
                                    onChange={handleBannerChange}
                                    className="hidden"
                                />
                                <div className="flex flex-col items-center justify-center gap-2">
                                    <div className="p-3 bg-primary/10 rounded-full">
                                        <ImageIcon className="w-6 h-6 text-primary" />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => document.getElementById("banners")?.click()}
                                    >
                                        <Upload className="w-4 h-4 mr-2" />
                                        Choose Banner Images
                                    </Button>
                                    <p className="text-xs text-muted-foreground">
                                        or drag and drop files here
                                    </p>
                                </div>
                            </div>
                            {bannerPreviews.length > 0 && (
                                <div className="mt-4">
                                    <p className="text-sm font-medium mb-2">
                                        Selected Images ({bannerPreviews.length})
                                    </p>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {bannerPreviews.map((preview, index) => (
                                            <div key={index} className="relative group">
                                                <div className="aspect-video rounded-lg border-2 border-gray-200 overflow-hidden">
                                                    <img
                                                        src={preview}
                                                        alt={`Banner ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => removeBanner(index)}
                                                >
                                                    <X className="w-3 h-3" />
                                                </Button>
                                                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                                                    {index + 1}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {bannerFiles.length === 0 && (
                                <p className="text-sm text-red-500">At least one banner image is required</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="targetUrl">
                                Target URL <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="targetUrl"
                                type="url"
                                {...register("targetUrl", {
                                    required: "Target URL is required",
                                    pattern: {
                                        value: /^https?:\/\/.+/,
                                        message: "Please enter a valid URL starting with http:// or https://"
                                    }
                                })}
                                placeholder="https://example.com"
                                className={errors.targetUrl ? "border-red-500" : ""}
                            />
                            {errors.targetUrl && (
                                <p className="text-sm text-red-500">{errors.targetUrl.message}</p>
                            )}
                        </div>

                        {/* Date Range */}
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startAt">
                                    Start Date & Time <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="startAt"
                                    type="datetime-local"
                                    min={getCurrentDateTime()}
                                    {...register("startAt", {
                                        required: "Start date is required",
                                        validate: (value) => {
                                            const selectedDate = new Date(value);
                                            const now = new Date();
                                            if (selectedDate < now) {
                                                return "Start date cannot be in the past";
                                            }
                                            return true;
                                        }
                                    })}
                                    className={errors.startAt ? "border-red-500" : ""}
                                />
                                {errors.startAt && (
                                    <p className="text-sm text-red-500">{errors.startAt.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endAt">
                                    End Date & Time <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="endAt"
                                    type="datetime-local"
                                    min={startAt || getCurrentDateTime()}
                                    {...register("endAt", {
                                        required: "End date is required",
                                        validate: (value) => {
                                            if (!startAt) return true;
                                            const start = new Date(startAt);
                                            const end = new Date(value);
                                            if (end <= start) {
                                                return "End date must be after start date";
                                            }
                                            return true;
                                        }
                                    })}
                                    className={errors.endAt ? "border-red-500" : ""}
                                />
                                {errors.endAt && (
                                    <p className="text-sm text-red-500">{errors.endAt.message}</p>
                                )}
                            </div>

                            {/* Sort Order */}
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
                                            message: "Sort order must be 0 or greater"
                                        }
                                    })}
                                    placeholder="0"
                                />
                            </div>

                            {/* Is Active */}
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
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate(-1)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={createAdMutation.isPending}
                            >
                                {createAdMutation.isPending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    "Create Ad"
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
