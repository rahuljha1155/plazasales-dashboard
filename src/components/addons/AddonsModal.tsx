/**
 * AddonsModal Component
 * 
 * A comprehensive modal component for creating and editing package addons with image upload functionality.
 * Features:
 * - Image upload with preview (supports PNG, JPG, GIF up to 5MB)
 * - Rich text editor for descriptions
 * - Form validation with Zod schema
 * - Upload progress tracking
 * - Error handling and success notifications
 * - Edit mode for updating existing addons
 */

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
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
import RichTextEditor from "../RichTextEditor";
import { cn } from "@/lib/utils";
import { api } from "@/services/api";

// Form schema
const addonSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    price: z.coerce.number().min(0, "Price must be positive"),
    packageId: z.string(),
    image: z.any().optional(),
});

type AddonFormValues = z.infer<typeof addonSchema>;

interface AddonsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    packageId: string;
    editData?: {
        _id: string;
        name: string;
        description: string;
        price: number;
        image?: string;
    } | null;
}

export const AddonsModal: React.FC<AddonsModalProps> = ({
    open,
    onOpenChange,
    onSuccess,
    packageId,
    editData = null,
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isEditMode = Boolean(editData);

    // Form setup
    const form = useForm<AddonFormValues>({
        resolver: zodResolver(addonSchema),
        defaultValues: {
            name: "",
            description: "",
            price: 0,
            packageId: packageId,
        },
    });

    // Initialize form with edit data when in edit mode
    useEffect(() => {
        if (editData && open) {
            form.reset({
                name: editData.name,
                description: editData.description,
                price: editData.price,
                packageId: packageId,
            });
            setImagePreview(editData.image || null);
        } else if (!editData && open) {
            form.reset({
                name: "",
                description: "",
                price: 0,
                packageId: packageId,
            });
            setSelectedFile(null);
            setImagePreview(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    }, [editData, open, packageId, form]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }

        // Check file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size should be less than 5MB");
            return;
        }

        setSelectedFile(file);

        // Create preview URL
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setSelectedFile(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const onSubmit = async (values: AddonFormValues) => {
        if (!values.name.trim()) {
            toast.error("Please enter a name for the addon");
            return;
        }

        if (!values.description.trim()) {
            toast.error("Please enter a description for the addon");
            return;
        }

        if (values.price < 0) {
            toast.error("Price cannot be negative");
            return;
        }

        setIsLoading(true);
        setUploadProgress(0);

        try {
            const formData = new FormData();
            formData.append("name", values.name.trim());
            formData.append("description", values.description);
            formData.append("price", values.price.toString());
            formData.append("packageId", values.packageId);

            if (selectedFile) {
                formData.append("image", selectedFile);
            }

            let response;
            if (isEditMode && editData) {
                response = await api.put(`/addons/${editData._id}`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    onUploadProgress: (progressEvent) => {
                        if (progressEvent.total) {
                            const progress = Math.round(
                                (progressEvent.loaded * 100) / progressEvent.total
                            );
                            setUploadProgress(progress);
                        }
                    },
                });
                toast.success("Addon updated successfully");
            } else {
                response = await api.post("/addons", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    onUploadProgress: (progressEvent) => {
                        if (progressEvent.total) {
                            const progress = Math.round(
                                (progressEvent.loaded * 100) / progressEvent.total
                            );
                            setUploadProgress(progress);
                        }
                    },
                });
                toast.success("Addon created successfully");
            }

            onSuccess();
            handleClose();
        } catch (error: any) {
            const errorMessage = error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                "Failed to save addon";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
            setUploadProgress(0);
        }
    };

    const handleClose = () => {
        onOpenChange(false);
        // Small delay to allow the modal to close before resetting the form
        setTimeout(() => {
            if (!isEditMode) {
                form.reset();
                setSelectedFile(null);
                setImagePreview(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            }
        }, 300);
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(open) => {
                onOpenChange(open);
                if (!open) handleClose();
            }}
        >
            <DialogContent className="max-w-7xl w-full max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEditMode ? "Edit Addon" : "Add New Addon"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditMode
                            ? "Update the addon information"
                            : "Add a new addon to the package"}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 gap-4 grid grid-cols-2">

                        <div className="space-y-4">
                            {/* Name Field */}
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter addon name"
                                                {...field}
                                                disabled={isLoading}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Description Field */}
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description *</FormLabel>
                                        <FormControl>
                                            <RichTextEditor
                                                initialContent={field.value}
                                                onChange={field.onChange}
                                                placeholder="Enter addon description..."
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />



                        </div>
                        <div className=" space-y-4">

                            {/* Image Upload Section */}
                            <div className="space-y-2">
                                <Label>Addon Image <span className="text-primary">(Aspect Ratio 1/1 ) Square</span></Label>
                                <div
                                    className={cn(
                                        "border-2 border-dashed rounded-sm mt-2  text-center transition-colors",
                                        imagePreview ? "border-transparent" : "border-border"
                                    )}
                                >
                                    {imagePreview ? (
                                        <div className="relative group">
                                            <div className="relative w-full h-80 overflow-hidden rounded-sm">
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                                {!isLoading && (
                                                    <button
                                                        type="button"
                                                        onClick={removeImage}
                                                        className="absolute top-2 right-2 p-1.5 bg-black/70 text-white rounded-full hover:bg-black/90 transition-colors"
                                                        disabled={isLoading}
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                            {selectedFile && (
                                                <p className="mt-2 text-sm text-muted-foreground truncate">
                                                    {selectedFile.name}
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileSelect}
                                                className="hidden"
                                                id="addon-file-upload"
                                                ref={fileInputRef}
                                                disabled={isLoading}
                                            />
                                            <label
                                                htmlFor="addon-file-upload"
                                                className={cn(
                                                    "cursor-pointer flex flex-col items-center justify-center h-40",
                                                    isLoading && "opacity-50 cursor-not-allowed"
                                                )}
                                            >
                                                <Upload className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
                                                <p className="font-medium">Click to select an image</p>
                                                <p className="text-sm text-muted-foreground">
                                                    PNG, JPG, GIF up to 5MB
                                                </p>
                                            </label>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Price Field */}
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Price (US$) *</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="Enter price"
                                                {...field}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                                disabled={isLoading}
                                                min="0"
                                                step="0.01"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />


                            {/* Upload Progress */}
                            {isLoading && (
                                <div className="space-y-2">
                                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                    <p className="text-sm text-muted-foreground text-center">
                                        {isEditMode ? "Updating" : "Uploading"}... {uploadProgress}%
                                    </p>
                                </div>
                            )}

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleClose}
                                    disabled={isLoading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    onClick={form.handleSubmit(onSubmit)}
                                    disabled={isLoading}
                                >
                                    {isLoading
                                        ? isEditMode
                                            ? "Updating..."
                                            : "Creating..."
                                        : isEditMode
                                            ? "Update Addon"
                                            : "Create Addon"}
                                </Button>
                                
                            </DialogFooter>
                        </div>


                    </form>
                </Form>


            </DialogContent>
        </Dialog>
    );
};

export default AddonsModal;
