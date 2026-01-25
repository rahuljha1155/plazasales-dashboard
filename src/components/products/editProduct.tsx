import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useGetBrands,
  useGetProductById,
  useGetSubcategories,
  useUpdateProduct,
} from "@/hooks/useProduct";
import { productFormSchema, type ProductFormData, type DemoPlan, ProductType } from "@/schema/product";
import { BrandUSPType } from "@/types/IBrand";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, X, Loader2, Plus, Trash2, Trash } from "lucide-react";
import { toast } from "sonner";
import RichTextEditor from "../ui/texteditor";
import Breadcrumb from "../dashboard/Breadcumb";
import { useSelectedDataStore } from "@/store/selectedStore";
import { Icon } from "@iconify/react/dist/iconify.js";

export default function EditProduct() {
  const navigate = useNavigate();
  const params = useParams<{ id: string; eid: string; brandSlug?: string; categorySlug?: string; subcategorySlug?: string, pid?: string, cid?: string }>();
  const { eid } = params;

  // Get brand and subcategory from URL slugs
  const { data: brands } = useGetBrands();
  const { data: subcategories } = useGetSubcategories();
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    null
  );
  const [detailImagePreviews, setDetailImagePreviews] = useState<string[]>([]);
  const [existingDetailImages, setExistingDetailImages] = useState<string[]>([]);
  const [iconPreviews, setIconPreviews] = useState<string[]>([]);
  const [existingIcons, setExistingIcons] = useState<string[]>([]);
  const [existingCoverImage, setExistingCoverImage] = useState<string | null>(null);
  const [removeUrls, setRemoveUrls] = useState<string[]>([]);
  const [metaTagInput, setMetaTagInput] = useState("");
  const [demoPlanFeatureInputs, setDemoPlanFeatureInputs] = useState<{ [key: number]: string }>({});
  const [demoPlans, setDemoPlans] = useState<DemoPlan[]>([]);
  const coverImageRef = useRef<HTMLInputElement>(null);
  const detailImagesRef = useRef<HTMLInputElement>(null);
  const iconsRef = useRef<HTMLInputElement>(null);
  const { selectedBrand, selectedCategory, selectedSubcategory, selectedProduct } = useSelectedDataStore()

  const { data: product, isLoading: isLoadingProduct } = useGetProductById(
    eid || ""
  );
  const updateMutation = useUpdateProduct(product?.product?.id || "");

  const brandFromSlug = brands?.data?.brands?.find((b: any) => b.slug === params.brandSlug);
  const subcategoryFromSlug = subcategories?.data?.subCategories?.find((s: any) => s.slug === params.subcategorySlug);

  const brandIdFromUrl = brandFromSlug?.id;
  const subcategoryIdFromUrl = subcategoryFromSlug?.id;
  const navigateBack = () => {
    if (params.brandSlug && params.categorySlug && params.subcategorySlug) {
      navigate(`/dashboard/category/${params.brandSlug}/subcategory/${params.categorySlug}/view/${params.subcategorySlug}`);
    } else {
      navigate(-1);
    }
  };

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema) as any,
    defaultValues: {
      name: "",
      slug: "",
      model: "",
      price: "",
      mrp: "",
      shortDescription: "",
      description: "",
      technology: "",
      feature: "",
      saasFeatures: undefined,
      metaTitle: "",
      metatag: [],
      metadescription: "",
      isPublished: false,
      isPopular: false,
      productType: ProductType.PHYSICAL,
      brandId: "",
      subcategoryId: "",
    },
  });

  const productType = form.watch("productType");

  // Also check if the loaded product is SAAS type
  const isLoadedProductSaas = product?.product?.productType === ProductType.SAAS;

  useEffect(() => {
    // Only clear demo plans if user manually changes product type away from SAAS
    // Don't clear on initial load
    if (productType !== ProductType.SAAS && demoPlans.length > 0 && product?.product?.id) {
      setDemoPlans([]);
    }
  }, [productType, product?.product?.id]);

  useEffect(() => {
    if (product) {
      // Auto-populate productType, brandId, and subcategoryId from API response
      const brandId = brandIdFromUrl || product.product?.brand?.id || "";
      const subcategoryId = subcategoryIdFromUrl || product.product?.subcategory?.id || "";
      const productTypeValue = (product.product?.productType as ProductType) || ProductType.PHYSICAL;

      // Parse demo plans from feature field
      let loadedDemoPlans: DemoPlan[] = [];
      if (product.product?.feature && typeof product.product.feature === 'string') {
        try {
          const parsed = JSON.parse(product.product.feature);
          // Check if it's the new demo plans format (array with name, price, yearlyPrice)
          if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].name !== undefined) {
            loadedDemoPlans = parsed.map((plan: any) => ({
              name: plan.name || "",
              price: plan.price?.toString() || "",
              yearlyPrice: plan.yearlyPrice?.toString() || "",
              period: plan.period || "per month",
              features: plan.features || [],
              description: plan.description || "",
              buttonText: plan.buttonText || "Get Started",
              href: plan.href || "/sign-up",
              isPopular: plan.isPopular || false
            }));
          }
          // Check if it's the old SAAS features format (object with title, packages)
          else if (parsed.title && parsed.packages) {
            loadedDemoPlans = parsed.packages.map((pkg: any) => ({
              name: pkg.title || "",
              price: pkg.price?.toString() || "",
              yearlyPrice: pkg.yearlyDiscount
                ? (pkg.price * (1 - pkg.yearlyDiscount / 100)).toFixed(0)
                : pkg.price?.toString() || "",
              period: "per month",
              features: pkg.features || [],
              description: parsed.shortDesc || "",
              buttonText: "Get Started",
              href: "/sign-up",
              isPopular: false
            }));
          }
        } catch (e) {
          // Not JSON, treat as regular feature text
          console.log("Feature is not JSON, treating as regular text");
        }
      }

      // Reset form with all values
      form.reset({
        name: product.product?.name || "",
        slug: product.product?.slug || "",
        model: product.product?.model || "",
        price: product.product?.price?.toString() || "",
        mrp: product.product?.mrp?.toString() || "",
        shortDescription: product.product?.shortDescription || "",
        description: product.product?.description || "",
        technology: product.product?.technology || "",
        feature: loadedDemoPlans.length > 0 ? "" : (product.product?.feature || ""),
        saasFeatures: undefined,
        metaTitle: product.product?.metaTitle || "",
        metatag: product.product?.metatag || [],
        metadescription: product.product?.metadescription || "",
        isPublished: product.product?.isPublished ?? false,
        isPopular: product.product?.isPopular ?? false,
        productType: productTypeValue,
        brandId: brandId,
        subcategoryId: subcategoryId,
      });

      // Set demo plans AFTER form reset to avoid being cleared by productType watch
      if (loadedDemoPlans.length > 0) {
        // Use setTimeout to ensure this happens after form reset
        setTimeout(() => {
          setDemoPlans(loadedDemoPlans);
        }, 0);
      }

      // Set image previews
      if (product.product.coverImage) {
        setCoverImagePreview(product.product.coverImage);
        setExistingCoverImage(product.product.coverImage);
      }
      if (product.product.detailImage) {
        const detailImgs = Array.isArray(product.product.detailImage)
          ? product.product.detailImage
          : [product.product.detailImage];
        setExistingDetailImages(detailImgs);
        setDetailImagePreviews(detailImgs);
      }
      if (product.product.icons) {
        const icons = Array.isArray(product.product.icons)
          ? product.product.icons
          : [product.product.icons];
        setExistingIcons(icons);
        setIconPreviews(icons);
      }
    }
  }, [product, form, brandIdFromUrl, subcategoryIdFromUrl]);

  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    form.setValue("slug", slug);
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("coverImage", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDetailImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const currentImages = form.getValues("detailImage") || [];
      const newFiles = Array.from(files);
      const totalImages = detailImagePreviews.length + newFiles.length;

      if (totalImages > 10) {
        toast.error("Maximum 10 detail images allowed");
        return;
      }

      const updatedImages = [...currentImages, ...newFiles];
      form.setValue("detailImage", updatedImages);

      // Generate previews for new files
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setDetailImagePreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeCoverImage = () => {
    // If it's an existing cover image, track it for deletion
    if (existingCoverImage && coverImagePreview === existingCoverImage) {
      setRemoveUrls(prev => [...prev, existingCoverImage]);
      setExistingCoverImage(null);
    }
    setCoverImagePreview(null);
    form.setValue("coverImage", undefined);
    if (coverImageRef.current) {
      coverImageRef.current.value = "";
    }
  };

  const removeDetailImage = (index: number) => {
    // Remove from preview
    const removedPreview = detailImagePreviews[index];
    setDetailImagePreviews(prev => prev.filter((_, i) => i !== index));

    // If it's an existing image, track it for deletion
    if (existingDetailImages.includes(removedPreview)) {
      setRemoveUrls(prev => [...prev, removedPreview]);
      setExistingDetailImages(prev => prev.filter(img => img !== removedPreview));
    }

    const currentImages = form.getValues("detailImage") || [];
    const updatedImages = currentImages.filter((_, i) => {
      // Calculate the offset based on existing images count
      const newFileIndex = i - (detailImagePreviews.length - currentImages.length);
      return newFileIndex !== index;
    });
    form.setValue("detailImage", updatedImages);

    if (detailImagesRef.current && detailImagePreviews.length === 1) {
      detailImagesRef.current.value = "";
    }
  };

  const handleIconsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const currentIcons = form.getValues("icons") || [];
      const newFiles = Array.from(files);

      const updatedIcons = [...currentIcons, ...newFiles];
      form.setValue("icons", updatedIcons);

      // Generate previews for new files
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setIconPreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeIcon = (index: number) => {
    // Remove from preview
    const removedPreview = iconPreviews[index];
    setIconPreviews(prev => prev.filter((_, i) => i !== index));

    // If it's an existing icon, track it for deletion
    if (existingIcons.includes(removedPreview)) {
      setRemoveUrls(prev => [...prev, removedPreview]);
      setExistingIcons(prev => prev.filter(img => img !== removedPreview));
    }

    const currentIcons = form.getValues("icons") || [];
    const updatedIcons = currentIcons.filter((_, i) => {
      // Calculate the offset based on existing icons count
      const newFileIndex = i - (iconPreviews.length - currentIcons.length);
      return newFileIndex !== index;
    });
    form.setValue("icons", updatedIcons);

    if (iconsRef.current && iconPreviews.length === 1) {
      iconsRef.current.value = "";
    }
  };

  const addMetaTag = () => {
    if (metaTagInput.trim()) {
      const currentTags = form.getValues("metatag") || [];
      if (!currentTags.includes(metaTagInput.trim())) {
        form.setValue("metatag", [...currentTags, metaTagInput.trim()]);
        setMetaTagInput("");
      } else {
        toast.error("Tag already exists");
      }
    }
  };

  const removeMetaTag = (tagToRemove: string) => {
    const currentTags = form.getValues("metatag") || [];
    form.setValue(
      "metatag",
      currentTags.filter((tag) => tag !== tagToRemove)
    );
  };

  const handleMetaTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addMetaTag();
    }
  };

  const isSaasBrand = useMemo(() => {
    return selectedBrand && (selectedBrand as any).usp === BrandUSPType.SAAS;
  }, [selectedBrand]);

  const isSaasProduct = productType === ProductType.SAAS || isLoadedProductSaas;

  const addDemoPlan = () => {
    setDemoPlans([...demoPlans, {
      name: "",
      price: "",
      yearlyPrice: "",
      period: "per month",
      features: [],
      description: "",
      buttonText: "Get Started",
      href: "/sign-up",
      isPopular: false
    }]);
  };

  const removeDemoPlan = (index: number) => {
    setDemoPlans(demoPlans.filter((_, i) => i !== index));
  };

  const updateDemoPlan = (index: number, field: keyof DemoPlan, value: any) => {
    const updated = [...demoPlans];
    updated[index] = { ...updated[index], [field]: value };
    setDemoPlans(updated);
  };

  const addDemoPlanFeature = (planIndex: number) => {
    const input = demoPlanFeatureInputs[planIndex];
    if (input?.trim()) {
      const updated = [...demoPlans];
      updated[planIndex].features = [...updated[planIndex].features, input.trim()];
      setDemoPlans(updated);
      setDemoPlanFeatureInputs({ ...demoPlanFeatureInputs, [planIndex]: "" });
    }
  };

  const removeDemoPlanFeature = (planIndex: number, featureIndex: number) => {
    const updated = [...demoPlans];
    updated[planIndex].features = updated[planIndex].features.filter((_, i) => i !== featureIndex);
    setDemoPlans(updated);
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      const formData = new FormData();

      // Required fields - always send
      formData.append("name", data.name);
      formData.append("slug", data.slug);
      
      // Send boolean fields - always send both to ensure backend processes them
      formData.append("isPublished", data.isPublished ? "true" : "false");
      formData.append("isPopular", data.isPopular ? "true" : "false");
      
      formData.append("productType", data.productType);
      formData.append("brandId", data.brandId);
      formData.append("subcategoryId", data.subcategoryId);

      // Edit mode: always send all fields (even if empty) so backend knows to clear them
      formData.append("model", data.model || "");
      formData.append("shortDescription", data.shortDescription || "");
      formData.append("description", data.description || "");
      formData.append("metaTitle", data.metaTitle || "");
      formData.append("metadescription", data.metadescription || "");
      
      if (data.price) formData.append("price", data.price.toString());
      if (data.mrp) formData.append("mrp", data.mrp.toString());
      if (data.technology) formData.append("technology", data.technology);

      // Feature field - always send in edit mode (even if empty)
      if (isSaasProduct && demoPlans.length > 0) {
        formData.append("feature", JSON.stringify(demoPlans));
      } else if (isSaasBrand && data.saasFeatures) {
        formData.append("feature", JSON.stringify(data.saasFeatures));
      } else {
        // Always send feature field in edit mode, even if empty
        formData.append("feature", data.feature || "");
      }

      if (data.metatag && data.metatag.length > 0) {
        data.metatag.forEach((tag) => formData.append("metatag[]", tag));
      }

      if (data.coverImage instanceof File) {
        formData.append("coverImage", data.coverImage);
      }

      // Append new detail images
      if (data.detailImage && data.detailImage.length > 0) {
        data.detailImage.forEach((file) => {
          formData.append("detailImage", file);
        });
      }

      if (data.icons && data.icons.length > 0) {
        data.icons.forEach((file) => {
          formData.append("icons", file);
        });
      }

      if (removeUrls.length > 0) {
        removeUrls.forEach((url) => formData.append("removeUrls[]", url));
      }



      await updateMutation.mutateAsync(formData);
      toast.success("Product updated successfully");
      navigateBack();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to update product"
      );
    }
  };

  if (isLoadingProduct) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-500">Product not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const breadcrumbLinks = [
    { label: selectedBrand?.name || "Brands", href: "/dashboard/brands" },
    { label: selectedCategory?.title || "Product Types", href: `/dashboard/category/${selectedBrand?.slug || ""}` },
    { label: selectedSubcategory?.title || "Categories", href: `/dashboard/category/${selectedBrand?.slug || ""}/subcategory/${selectedCategory?.slug || ""}` },
    { label: selectedProduct?.name || "Products", href: `/dashboard/category/${selectedBrand?.slug || ""}/subcategory/${selectedCategory?.slug || ""}/products/${selectedSubcategory?.slug || selectedSubcategory?.original?.slug || ""}` },
    { label: "Edit", isActive: true },
  ];

  return (
    <div className="min-h-screen bg-background">

      <Breadcrumb links={breadcrumbLinks} />

      <div className="max-w-7xl  py-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, err => {
            const firstErrorField = Object.values(err)[0];
            if (firstErrorField) {
              toast.error(firstErrorField.message || "Please check the form for errors.");
            }
          })} className="space-y-6 bg-muted/50 p-6 rounded-lg">

            <div className="mx-0 !p-0 space-y-6">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">Basic Information</h2>
                <p className="text-sm">
                  Update the basic details of the product
                </p>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Product Name *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter product name"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              handleNameChange(e.target.value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Slug *</FormLabel>
                        <FormControl>
                          <Input placeholder="product-slug" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="col-span-2 grid lg:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Model </FormLabel>
                          <FormControl>
                            <Input placeholder="Model number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="technology"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Technology</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Technology details..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="productType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Product Type *</FormLabel>
                        <Select
                          key={field.value} // Force re-render when value changes
                          onValueChange={(value) => {
                            field.onChange(value);
                            if (value !== ProductType.SAAS && demoPlans.length > 0) {
                              setDemoPlans([]);
                            }
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select product type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={ProductType.PHYSICAL}>{ProductType.PHYSICAL}</SelectItem>
                            <SelectItem value={ProductType.DIGITAL}>{ProductType.DIGITAL}</SelectItem>
                            <SelectItem value={ProductType.SERVICE}>{ProductType.SERVICE}</SelectItem>
                            <SelectItem value={ProductType.SAAS}>{ProductType.SAAS}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="shortDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Short Description</FormLabel>
                      <FormControl>
                        <RichTextEditor value={field.value} onChange={field.onChange} />
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
                      <FormLabel className="text-sm font-medium">Full Description</FormLabel>
                      <FormControl>
                        <RichTextEditor value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {isSaasProduct ? (
                  <div className="space-y-4 bg-muted/30 rounded-lg p-5 border">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-base">Pricing Plans</h3>
                        <p className="text-xs text-muted-foreground mt-1">Add pricing plans for SaaS product</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addDemoPlan}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Plan
                      </Button>
                    </div>

                    {demoPlans.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <p className="text-sm">No pricing plans added yet.</p>
                        <p className="text-xs mt-1">Click "Add Plan" to create your first pricing plan.</p>
                      </div>
                    )}

                    {demoPlans.map((plan, planIndex) => (
                      <div key={planIndex} className="bg-background rounded-lg p-5 border space-y-4">
                        <div className="flex items-center justify-between border-b pb-3">
                          <h4 className="font-medium text-sm">Plan {planIndex + 1}</h4>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => removeDemoPlan(planIndex)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove
                          </Button>
                        </div>

                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">Plan Name *</label>
                              <Input
                                placeholder="e.g., STARTER, PROFESSIONAL"
                                value={plan.name}
                                onChange={(e) => updateDemoPlan(planIndex, "name", e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Period</label>
                              <Input
                                placeholder="per month"
                                value={plan.period}
                                onChange={(e) => updateDemoPlan(planIndex, "period", e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">Monthly Price *</label>
                              <Input
                                placeholder="50"
                                value={plan.price}
                                onChange={(e) => updateDemoPlan(planIndex, "price", e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Yearly Price *</label>
                              <Input
                                placeholder="40"
                                value={plan.yearlyPrice}
                                onChange={(e) => updateDemoPlan(planIndex, "yearlyPrice", e.target.value)}
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-sm font-medium">Description *</label>
                            <Textarea
                              placeholder="Perfect for individuals and small projects"
                              rows={2}
                              value={plan.description}
                              onChange={(e) => updateDemoPlan(planIndex, "description", e.target.value)}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">Button Text</label>
                              <Input
                                placeholder="Get Started"
                                value={plan.buttonText}
                                onChange={(e) => updateDemoPlan(planIndex, "buttonText", e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Button Link</label>
                              <Input
                                placeholder="/sign-up"
                                value={plan.href}
                                onChange={(e) => updateDemoPlan(planIndex, "href", e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={plan.isPopular}
                              onCheckedChange={(checked) => updateDemoPlan(planIndex, "isPopular", checked)}
                            />
                            <label className="text-sm font-medium">Mark as Popular</label>
                          </div>

                          <div>
                            <label className="text-sm font-medium">Plan Features *</label>
                            <div className="space-y-3 mt-2">
                              <div className="flex ">
                                <Input
                                  placeholder="Enter a feature and press Enter"
                                  value={demoPlanFeatureInputs[planIndex] || ""}
                                  onChange={(e) => setDemoPlanFeatureInputs({ ...demoPlanFeatureInputs, [planIndex]: e.target.value })}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      addDemoPlanFeature(planIndex);
                                    }
                                  }}
                                />
                                <Button
                                  type="button"
                                  onClick={() => addDemoPlanFeature(planIndex)}
                                  variant="outline"
                                  className="rounded-xs! border-l-0  hover:bg-primary hover:text-white"
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                              {plan.features.length > 0 && (
                                <div className="flex flex-wrap gap-4 items-center">
                                  {plan.features.map((feature, featureIndex) => (
                                    <div key={featureIndex} className="flex items-center justify-between bg-secondary/50 px-3 py-2 gap-4 rounded">
                                      <span className="text-sm">{feature}</span>
                                      <button
                                        type="button"
                                        onClick={() => removeDemoPlanFeature(planIndex, featureIndex)}
                                        className="text-destructive cursor-pointer hover:text-destructive/80"
                                      >
                                        <Icon icon={"ic:baseline-delete"} className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <FormField
                    control={form.control}
                    name="feature"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Features</FormLabel>
                        <FormControl>
                          <RichTextEditor value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>

            {/* Images */}
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">Product Images</h2>
                <p className="text-sm">
                  Update product images (leave unchanged to keep existing)
                </p>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-1  gap-5">
                  <FormField
                    control={form.control}
                    name="coverImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Cover Image</FormLabel>
                        <FormControl>
                          <div className="space-y-4">
                            {coverImagePreview ? (
                              <div className="relative">
                                <img
                                  src={coverImagePreview}
                                  alt="Cover preview"
                                  className="w-full h-48 object-cover rounded-lg border"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="absolute top-2 right-2 text-white"
                                  onClick={removeCoverImage}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ) : (
                              <div
                                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                                onClick={() => coverImageRef.current?.click()}
                              >
                                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                  Click to upload cover image
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  PNG, JPG up to 10MB
                                </p>
                              </div>
                            )}
                            <input
                              ref={coverImageRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleCoverImageChange}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="detailImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Detail Images (Max 10)</FormLabel>
                        <FormControl>
                          <div className="space-y-4">
                            {detailImagePreviews.length > 0 && (
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {detailImagePreviews.map((preview, index) => (
                                  <div key={index} className="relative">
                                    <img
                                      src={preview}
                                      alt={`Detail ${index + 1}`}
                                      className="w-full h-32 object-cover rounded-lg border"
                                    />
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="icon"
                                      className="absolute top-1 right-1 h-6 w-6 text-white"
                                      onClick={() => removeDetailImage(index)}
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                            {detailImagePreviews.length < 10 && (
                              <div
                                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                                onClick={() => detailImagesRef.current?.click()}
                              >
                                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                  Click to upload detail images ({detailImagePreviews.length}/10)
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  PNG, JPG up to 10MB each
                                </p>
                              </div>
                            )}
                            <input
                              ref={detailImagesRef}
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              onChange={handleDetailImagesChange}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="icons"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Icons</FormLabel>
                        <FormControl>
                          <div className="space-y-4">
                            {iconPreviews.length > 0 && (
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {iconPreviews.map((preview, index) => (
                                  <div key={index} className="relative">
                                    <img
                                      src={preview}
                                      alt={`Icon ${index + 1}`}
                                      className="w-full h-32 object-cover rounded-lg border"
                                    />
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="icon"
                                      className="absolute top-1 right-1 h-6 w-6 text-white"
                                      onClick={() => removeIcon(index)}
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                    {existingIcons.includes(preview) && (
                                      <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded">
                                        Existing
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            <div
                              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                              onClick={() => iconsRef.current?.click()}
                            >
                              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">
                                Click to upload icons ({iconPreviews.length} uploaded)
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                PNG, JPG, SVG up to 10MB each
                              </p>
                            </div>
                            <input
                              ref={iconsRef}
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              onChange={handleIconsChange}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* SEO & Meta */}
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">SEO & Meta Information</h2>
                <p className="text-sm">
                  Optimize for search engines
                </p>
              </div>

              <div className="space-y-5">
                <div className="grid lg:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="metaTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Meta Title</FormLabel>
                        <FormControl className="mt-2">
                          <Input placeholder="SEO title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="metatag"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Meta Tags</FormLabel>
                        <FormControl>
                          <div className="space-y-3 mt-2">
                            <div className="flex gap-2">
                              <Input
                                placeholder="Enter a meta tag and press Enter"
                                value={metaTagInput}
                                onChange={(e) => setMetaTagInput(e.target.value)}
                                onKeyDown={handleMetaTagKeyDown}
                                className="max-w-xl"
                              />
                              <Button
                                type="button"
                                onClick={addMetaTag}
                                size="icon"
                                variant="outline"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                            {field.value && field.value.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {field.value.map((tag, index) => (
                                  <div key={index} className="flex items-center">
                                    <span className="px-3 bg-green-100 text-green-500 border-green-500 py-0.5 pb-1 text-sm">
                                      {tag}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => removeMetaTag(tag)}
                                      className="cursor-pointer hover:text-red-500 h-full px-2 border-l-0"
                                    >
                                      <Trash className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="metadescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Meta Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="SEO description..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">Product Settings</h2>
                <p className="text-sm">
                  Configure product visibility and features
                </p>
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="isPublished"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-0.5 leading-none">
                        <FormLabel className="text-sm font-medium">Published</FormLabel>
                        <FormDescription className="text-xs">
                          Make this product visible to customers
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isPopular"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-0.5 leading-none">
                        <FormLabel className="text-sm font-medium">Popular</FormLabel>
                        <FormDescription className="text-xs">
                          Feature this product as popular
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-[2px]"
                onClick={navigateBack}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending} className="min-w-[140px]">
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Product"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}