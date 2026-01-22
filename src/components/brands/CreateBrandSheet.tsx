import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import RichTextEditor from "@/components/ui/texteditor";
import { Loader } from "lucide-react";
import { Icon } from "@iconify/react/dist/iconify.js";
import slugify from "react-slugify";
import { PostBrandSchema, type IPostBrand } from "@/schema/brand";
import ImageColorPalette from "@/components/color-thief";
import { createBrand as createBrandFn, updateBrand as updateBrandFn } from "@/services/brand";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ImageUpload, MultiImageUpload } from "@/components/ImageUpload";

interface BrandFormProps {
  mode?: "create" | "edit";
  brand?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export function BrandForm({ mode = "create", brand, onSuccess, onCancel }: BrandFormProps) {
  const form = useForm({
    resolver: zodResolver(PostBrandSchema),
    defaultValues: {
      name: "",
      slug: "",
      themeColor: "#000000",
      description: "",
      isAuthorizedDistributor: false,
      usp: "",
      certificate: "",
      logoUrl: "",
      bannerUrls: [],
      indoorImage: "",
      outdoorImage: "",
      brandImageUrls: "",
      playStoreUrl: "",
      appStoreUrl: "",
    },
  });

  const [description, setDescription] = useState("");
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [bannerPreviews, setBannerPreviews] = useState<string[]>([]);
  const [indoorPreview, setIndoorPreview] = useState<string>("");
  const [outdoorPreview, setOutdoorPreview] = useState<string>("");
  const [certificatePreview, setCertificatePreview] = useState<string>("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFiles, setBannerFiles] = useState<File[]>([]);
  const [indoorFile, setIndoorFile] = useState<File | null>(null);
  const [outdoorFile, setOutdoorFile] = useState<File | null>(null);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [brandImageFile, setBrandImageFile] = useState<File | null>(null);
  const [brandImagePreview, setBrandImagePreview] = useState<string>("");
  const [removedBanners, setRemovedBanners] = useState<string[]>([]);

  const queryClient = useQueryClient();

  const { mutateAsync: createBrand, isPending: isCreatePending } = useMutation({
    mutationFn: (data: any) => createBrandFn(data),
    onSuccess: (data) => {
      // Invalidate and refetch brands list
      queryClient.invalidateQueries({ queryKey: ["getBrands"] });
      toast.success(data.message || "Brand created successfully", {
        position: "bottom-right",
        description: "The brand has been created successfully."
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create brand", {
        position: "bottom-right",
        description: "An error occurred while creating the brand."
      });
    }
  });

  const { mutateAsync: updateBrand, isPending: isUpdatePending } = useMutation({
    mutationFn: (data: any) => updateBrandFn(brand?.id || "", data),
    onSuccess: (data) => {
      // Invalidate and refetch brands list
      queryClient.invalidateQueries({ queryKey: ["getBrands"] });
      toast.success(data.message || "Brand updated successfully", {
        position: "bottom-right",
        description: "The brand has been updated successfully."
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update brand", {
        position: "bottom-right",
        description: "An error occurred while updating the brand."
      });
    }
  });

  useEffect(() => {
    if (brand) {
      // Handle brandImageUrls as array or string from backend
      const brandImageUrl = Array.isArray(brand.brandImageUrls)
        ? brand.brandImageUrls[0] || ""
        : brand.brandImageUrls || "";

      form.reset({
        name: brand.name || "",
        slug: brand.slug || "",
        themeColor: brand.themeColor || "#000000",
        description: brand.description || "",
        isAuthorizedDistributor: brand.isAuthorizedDistributor ?? false,
        usp: brand.usp || "",
        certificate: brand.certificate || "",
        logoUrl: brand.logoUrl || "",
        bannerUrls: brand.bannerUrls || [],
        indoorImage: brand.indoorImage || "",
        outdoorImage: brand.outdoorImage || "",
        brandImageUrls: brandImageUrl,
        playStoreUrl: brand.playStoreUrl || "",
        appStoreUrl: brand.appStoreUrl || "",
      });
      setDescription(brand.description || "");
      setLogoPreview(brand.logoUrl || "");
      setBannerPreviews(brand.bannerUrls || []);
      setIndoorPreview(brand.indoorImage || "");
      setOutdoorPreview(brand.outdoorImage || "");
      setCertificatePreview(brand.certificate || "");
      setBrandImagePreview(brandImageUrl);
      setRemovedBanners([]);
    }
  }, [brand, form]);

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "name" && value.name) {
        const slug = slugify(value.name, {});
        form.setValue("slug", slug, { shouldValidate: true });
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  useEffect(() => {
    form.setValue("description", description);
  }, [description, form]);

  const handleColorSelect = (color: string) => {
    form.setValue("themeColor", color, { shouldValidate: true });
    toast.success(`Theme color set to ${color}`);
  };

  const onSubmit: SubmitHandler<IPostBrand> = async (values) => {
    try {
      const formData = new FormData();

      formData.append("name", values.name);
      formData.append("slug", values.slug);
      formData.append("themeColor", values.themeColor);

      if (values.description) {
        formData.append("description", values.description);
      }

      formData.append("isAuthorizedDistributor", String(values.isAuthorizedDistributor ?? false));
      formData.append("usp", values.usp || "");

      if (values.playStoreUrl) {
        formData.append("playStoreUrl", values.playStoreUrl);
      }

      if (values.appStoreUrl) {
        formData.append("appStoreUrl", values.appStoreUrl);
      }

      // Append logo file
      if (logoFile) {
        formData.append("logoUrl", logoFile);
      }

      // Append banner files
      if (bannerFiles.length > 0) {
        bannerFiles.forEach((file) => {
          formData.append("bannerUrls", file);
        });
      }

      // Append optional image files
      if (indoorFile) {
        formData.append("indoorImage", indoorFile);
      }

      if (outdoorFile) {
        formData.append("outdoorImage", outdoorFile);
      }

      if (certificateFile) {
        formData.append("certificate", certificateFile);
      }

      if (brandImageFile) {
        formData.append("brandImageUrls", brandImageFile);
      }

      // Append removed banner URLs for edit mode - always send as array
      if (mode === "edit" && removedBanners.length > 0) {
        removedBanners.forEach((url) => {
          formData.append("removedBanners[]", url);
        });
      }

      if (mode === "edit") {
        await updateBrand(formData as any);
      } else {
        await createBrand(formData as any);
      }

      onSuccess();
    } catch (error: any) {
      if (error?.response?.data?.message?.includes("duplicate key")) {
        toast.error("Slug must be unique");
      } else {
        toast.error(error.message || "An error occurred. Please try again.");
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      form.handleSubmit(onSubmit)();
    }
  };


  return (
    <div className="">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          onKeyDown={handleKeyDown}
          className="space-y-6 max-w-7xl"
        >
          {/* Name and Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-900 mb-2 block">
                    Brand Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter brand name"
                      {...field}
                      className="h-12 text-sm border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
                    />
                  </FormControl>
                  <FormMessage className="text-xs mt-1.5" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-900 mb-2 block">
                    Brand Slug <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      readOnly
                      placeholder="brand-slug"
                      {...field}
                      className="h-12 text-sm bg-gray-50/50 border-gray-200 text-gray-600"
                    />
                  </FormControl>
                  <FormMessage className="text-xs mt-1.5" />
                </FormItem>
              )}
            />
          </div>

          {/* Logo Upload with Color Thief */}
          <div className="space-y-3">
            <FormField
              control={form.control}
              name="logoUrl"
              render={() => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-900 mb-2 block">
                    Brand Logo <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="grid lg:grid-cols-2 gap-5 mt-2">
                      <ImageUpload
                        preview={logoPreview}
                        onFileChange={(file) => {
                          if (file) {
                            setLogoFile(file);
                            const previewUrl = URL.createObjectURL(file);
                            setLogoPreview(previewUrl);
                            form.setValue("logoUrl", "file", { shouldValidate: true });
                          }
                        }}
                        onRemove={() => {
                          setLogoPreview("");
                          setLogoFile(null);
                          form.setValue("logoUrl", "");
                        }}
                        placeholder="Click to upload logo"
                        maxSize={2}
                      />

                      {/* Color Thief - Auto-detect colors from logo */}
                      {logoPreview && (
                        <div className="space-y-2 -translate-y-7">
                          <FormLabel className="text-sm font-semibold text-gray-900  ">
                            Theme Color <span className="text-red-500">*</span>
                          </FormLabel>

                          <div className="border border-gray-200 rounded-sm mt-1 p-4 bg-white space-y-3">
                            {/* Color Palette Selection */}
                            <div className="space-y-2">
                              <p className="text-xs text-gray-600">
                                Pick from logo
                              </p>
                              <ImageColorPalette
                                src={logoPreview}
                                colorCount={6}
                                onColorSelect={handleColorSelect}
                              />
                            </div>

                            {/* Divider */}
                            <div className="relative">
                              <div className="absolute inset-0 z-10 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                              </div>
                              <div className=" flex justify-center">
                                <span className="px-2 bg-white text-xs text-gray-400">
                                  or
                                </span>
                              </div>
                            </div>

                            {/* Color Picker and Input */}
                            <FormField
                              control={form.control}
                              name="themeColor"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <div className="flex gap-2 items-center">
                                      <Input
                                        {...field}
                                        type="color"
                                        className="h-11  w-full p-0 border-none border-gray-200 cursor-pointer rounded"
                                      />

                                      <div className="bg-gray-50 border border-gray-200 rounded px-3 h-10 flex items-center min-w-[90px]">
                                        <span className="text-xs font-mono text-gray-700">
                                          {form.watch("themeColor").toUpperCase()}
                                        </span>
                                      </div>
                                    </div>
                                  </FormControl>
                                  <FormMessage className="text-xs mt-1.5" />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs mt-1.5" />
                </FormItem>
              )}
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            {/* Authorized Distributor Checkbox */}
            <FormField
              control={form.control}
              name="isAuthorizedDistributor"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3.5 space-y-0 border border-gray-200 rounded-sm p-4 bg-white hover:border-gray-300 transition-colors">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="size-6 mt-1"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-semibold text-gray-900 cursor-pointer">
                      Authorized Distributor
                    </FormLabel>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Check if this brand has authorized distributor status
                    </p>
                  </div>
                </FormItem>
              )}
            />

            {/* USP Type Input */}
            <FormField
              control={form.control}
              name="usp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-900 mb-2 block">
                    USP Type <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter USP type (e.g., SaaS, Hardware, Others)"
                      {...field}
                      className="h-12 text-sm border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
                    />
                  </FormControl>
                  <FormMessage className="text-xs mt-1.5" />
                </FormItem>
              )}
            />
          </div>

          {/* App Store URLs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="playStoreUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-900 mb-2 block">
                    Play Store URL <span className="text-gray-500 font-normal text-xs">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Icon icon="logos:google-play-icon" className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5" />
                      <Input
                        placeholder="https://play.google.com/store/apps/..."
                        {...field}
                        className="h-12 pl-10 text-sm border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs mt-1.5" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="appStoreUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-900 mb-2 block">
                    App Store URL <span className="text-gray-500 font-normal text-xs">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Icon icon="logos:apple-app-store" className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5" />
                      <Input
                        placeholder="https://apps.apple.com/app/..."
                        {...field}
                        className="h-12 pl-10 text-sm border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs mt-1.5" />
                </FormItem>
              )}
            />
          </div>

          {/* Brand Feature Image */}
          <FormField
            control={form.control}
            name="brandImageUrls"
            render={() => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-gray-900 mb-2 block">
                  Brand Feature Image <span className="text-gray-500 font-normal text-xs">(optional)</span>
                </FormLabel>
                <FormControl>
                  <div className="mt-2">
                    <ImageUpload
                      preview={brandImagePreview}
                      onFileChange={(file) => {
                        if (file) {
                          setBrandImageFile(file);
                          const previewUrl = URL.createObjectURL(file);
                          setBrandImagePreview(previewUrl);
                          form.setValue("brandImageUrls", "file", { shouldValidate: true });
                        }
                      }}
                      onRemove={() => {
                        if (mode === "edit" && brandImagePreview && !brandImagePreview.startsWith("blob:")) {
                          setRemovedBanners(prev => [...prev, brandImagePreview]);
                        }
                        setBrandImagePreview("");
                        setBrandImageFile(null);
                        form.setValue("brandImageUrls", "");
                      }}
                      height="h-52"
                      placeholder="Upload brand feature image"
                      icon="solar:camera-bold-duotone"
                      maxSize={2}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-xs mt-1.5" />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={() => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-gray-900 mb-2 block">
                  Description <span className="text-gray-500 font-normal text-xs">(optional)</span>
                </FormLabel>
                <FormControl>
                  <div className="mt-2">
                    <RichTextEditor
                      value={description}
                      onChange={(content) => setDescription(content || "")}
                      placeholder="Write brand description..."
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-xs mt-1.5" />
              </FormItem>
            )}
          />

          {/* Banner Images */}
          <FormField
            control={form.control}
            name="bannerUrls"
            render={() => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-gray-900 block">
                  Banner Images <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 font-normal ml-2">(Recommended: 1-5 high-quality images)</span>
                </FormLabel>
                <FormControl>
                  <div className="mt-2">
                    <MultiImageUpload
                      previews={bannerPreviews}
                      onFilesChange={(files) => {
                        const newUrls = files.map(file => URL.createObjectURL(file));
                        const updatedBanners = [...bannerPreviews, ...newUrls];
                        const updatedFiles = [...bannerFiles, ...files];

                        setBannerPreviews(updatedBanners);
                        setBannerFiles(updatedFiles);
                        form.setValue("bannerUrls", updatedBanners.map(() => "file"), { shouldValidate: true });
                      }}
                      onRemove={(index) => {
                        const removedUrl = bannerPreviews[index];
                        if (mode === "edit" && removedUrl && !removedUrl.startsWith("blob:")) {
                          setRemovedBanners(prev => [...prev, removedUrl]);
                        }
                        const updated = bannerPreviews.filter((_, i) => i !== index);
                        const updatedFiles = bannerFiles.filter((_, i) => i !== index);
                        setBannerPreviews(updated);
                        setBannerFiles(updatedFiles);
                        form.setValue("bannerUrls", updated.map(() => "file"), { shouldValidate: true });
                      }}
                      maxImages={5}
                      maxSize={2}
                      placeholder="Upload Brand Banners"
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-xs mt-1.5" />
              </FormItem>
            )}
          />

          {/* Indoor & Outdoor Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="indoorImage"
              render={() => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-900 mb-2 block">
                    Indoor Image <span className="text-gray-500 font-normal text-xs">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <div className="mt-2">
                      <ImageUpload
                        preview={indoorPreview}
                        onFileChange={(file) => {
                          if (file) {
                            setIndoorFile(file);
                            const previewUrl = URL.createObjectURL(file);
                            setIndoorPreview(previewUrl);
                            form.setValue("indoorImage", "file", { shouldValidate: true });
                          }
                        }}
                        onRemove={() => {
                          if (mode === "edit" && indoorPreview && !indoorPreview.startsWith("blob:")) {
                            setRemovedBanners(prev => [...prev, indoorPreview]);
                          }
                          setIndoorPreview("");
                          setIndoorFile(null);
                          form.setValue("indoorImage", "");
                        }}
                        height="h-40"
                        placeholder="Indoor photo"
                        icon="solar:home-2-line-duotone"
                        maxSize={2}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs mt-1.5" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="outdoorImage"
              render={() => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-900 mb-2 block">
                    Outdoor Image <span className="text-gray-500 font-normal text-xs">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <div className="mt-2">
                      <ImageUpload
                        preview={outdoorPreview}
                        onFileChange={(file) => {
                          if (file) {
                            setOutdoorFile(file);
                            const previewUrl = URL.createObjectURL(file);
                            setOutdoorPreview(previewUrl);
                            form.setValue("outdoorImage", "file", { shouldValidate: true });
                          }
                        }}
                        onRemove={() => {
                          if (mode === "edit" && outdoorPreview && !outdoorPreview.startsWith("blob:")) {
                            setRemovedBanners(prev => [...prev, outdoorPreview]);
                          }
                          setOutdoorPreview("");
                          setOutdoorFile(null);
                          form.setValue("outdoorImage", "");
                        }}
                        height="h-40"
                        placeholder="Outdoor photo"
                        icon="solar:sun-2-line-duotone"
                        maxSize={2}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs mt-1.5" />
                </FormItem>
              )}
            />
          </div>



          {/* Certificate Upload - shown only if authorized distributor */}
          {form.watch("isAuthorizedDistributor") && (
            <FormField
              control={form.control}
              name="certificate"
              render={() => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-900 mb-2 block">
                    Authorization Certificate <span className="text-gray-500 font-normal text-xs">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <div className="mt-2">
                      <ImageUpload
                        preview={certificatePreview}
                        onFileChange={(file) => {
                          if (file) {
                            setCertificateFile(file);
                            const previewUrl = URL.createObjectURL(file);
                            setCertificatePreview(previewUrl);
                            form.setValue("certificate", "file", { shouldValidate: true });
                          }
                        }}
                        onRemove={() => {
                          if (mode === "edit" && certificatePreview && !certificatePreview.startsWith("blob:")) {
                            setRemovedBanners(prev => [...prev, certificatePreview]);
                          }
                          setCertificatePreview("");
                          setCertificateFile(null);
                          form.setValue("certificate", "");
                          toast.success("Certificate removed");
                        }}
                        height="h-40"
                        placeholder="Upload authorization certificate"
                        icon="solar:document-line-duotone"
                        maxSize={2}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs mt-1.5" />
                </FormItem>
              )}
            />
          )}

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isCreatePending || isUpdatePending}
              className="h-11 px-6 text-sm font-medium border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreatePending || isUpdatePending}
              className="h-11 px-6 text-sm font-medium bg-primary/90  hover:bg-primary  rounded-md transition-colors"
            >
              {isCreatePending || isUpdatePending ? (
                <Loader size={16} className="animate-spin mr-2" />
              ) : (
                <Icon icon="solar:save-bold-duotone" className="mr-2 h-5 w-5" />
              )}
              {mode === "edit" ? "Update Brand" : "Create Brand"}
            </Button>
          </div>
        </form>
      </Form>
    </div >
  );
}
