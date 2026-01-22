import { useState, useRef, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useCreateProduct,
  useGetBrands,
  useGetSubcategories,
} from "@/hooks/useProduct";
import { productFormSchema, type ProductFormData, type DemoPlan, ProductType } from "@/schema/product";
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
  CardHeader,
  CardTitle,
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
import { ArrowLeft, Upload, X, Loader2, Plus, Trash2, Trash } from "lucide-react";
import { toast } from "sonner";
import RichTextEditor from "../ui/texteditor";
import { BrandUSPType } from "@/types/IBrand";
import { useSelectedDataStore } from "@/store/selectedStore";
import Breadcrumb from "../dashboard/Breadcumb";

export default function CreateProduct() {
  const navigate = useNavigate();
  const { selectedBrand, selectedCategory, selectedSubcategory, selectedProduct } = useSelectedDataStore();

  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    null
  );
  const [detailImagePreviews, setDetailImagePreviews] = useState<string[]>([]);
  const [iconPreviews, setIconPreviews] = useState<string[]>([]);
  const [metaTagInput, setMetaTagInput] = useState("");
  const [packageFeatureInputs, setPackageFeatureInputs] = useState<{ [key: number]: string }>({});
  const [demoPlanFeatureInputs, setDemoPlanFeatureInputs] = useState<{ [key: number]: string }>({});
  const [demoPlans, setDemoPlans] = useState<DemoPlan[]>([]);
  const coverImageRef = useRef<HTMLInputElement>(null);
  const detailImagesRef = useRef<HTMLInputElement>(null);
  const iconsRef = useRef<HTMLInputElement>(null);

  const { data: brands } = useGetBrands();
  const { data: subcategories } = useGetSubcategories();
  const createMutation = useCreateProduct();


  const navigateBack = () => {
    navigate(-1);
  };



  const breadcrumbLinks = [
    { label: selectedBrand?.name || "Brands", href: "/dashboard/brands" },
    { label: selectedCategory?.title || "Product Types", href: `/dashboard/category/${selectedBrand?.slug || ""}` },
    { label: selectedSubcategory?.title || "Categories", href: `/dashboard/category/${selectedBrand?.slug || ""}/subcategory/${selectedCategory?.slug || ""}` },
    { label: selectedProduct?.name || "Products", href: `/dashboard/category/${selectedBrand?.slug || ""}/subcategory/${selectedCategory?.slug || ""}/products/${selectedSubcategory?.slug || selectedSubcategory?.original?.slug || ""}` },
    { label: "Create Product", isActive: true },
  ];

  const form = useForm({
    resolver: zodResolver(productFormSchema),
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
      isPublished: true,
      isPopular: false,
      productType: ProductType.PHYSICAL,
      brandId: selectedBrand?.id || "",
      subcategoryId: selectedSubcategory?.id || selectedSubcategory?.original?.id || "",
    },
  });

  // Update form when store values change
  useEffect(() => {
    if (selectedBrand?.id) {
      form.setValue("brandId", selectedBrand.id);
    }
    if (selectedSubcategory?.id) {
      form.setValue("subcategoryId", selectedSubcategory.id || selectedSubcategory.original?.id);
    }
  }, [selectedBrand?.id, selectedSubcategory?.id, form]);

  const { fields: packageFields, append: appendPackage, remove: removePackage } = useFieldArray({
    control: form.control as any,
    name: "saasFeatures.packages" as any,
  });

  const productType = form.watch("productType");

  const isSaasBrand = useMemo(() => {
    return selectedBrand && (selectedBrand as any).usp === BrandUSPType.SAAS;
  }, [selectedBrand]);

  const isSaasProduct = productType === ProductType.SAAS;

  // Initialize saasFeatures ONLY when brand is SaaS (not just when product type is SAAS)
  // For SAAS products with non-SaaS brands, demoPlans will be used instead
  useEffect(() => {
    if (isSaasBrand && !form.getValues("saasFeatures")) {
      form.setValue("saasFeatures", {
        title: "",
        shortDesc: "",
        packages: []
      });
    }
  }, [isSaasBrand, form]);

  // Auto-generate slug from name
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
      const totalImages = currentImages.length + newFiles.length;

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
    setCoverImagePreview(null);
    form.setValue("coverImage", undefined);
    if (coverImageRef.current) {
      coverImageRef.current.value = "";
    }
  };

  const removeDetailImage = (index: number) => {
    const currentImages = form.getValues("detailImage") || [];
    const updatedImages = currentImages.filter((_, i) => i !== index);
    form.setValue("detailImage", updatedImages);

    setDetailImagePreviews(prev => prev.filter((_, i) => i !== index));

    if (detailImagesRef.current && updatedImages.length === 0) {
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
    const currentIcons = form.getValues("icons") || [];
    const updatedIcons = currentIcons.filter((_, i) => i !== index);
    form.setValue("icons", updatedIcons);
    setIconPreviews((prev) => prev.filter((_, i) => i !== index));

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

  const addPackageFeature = (packageIndex: number) => {
    const input = packageFeatureInputs[packageIndex];
    if (input?.trim()) {
      const currentFeatures = form.getValues(`saasFeatures.packages.${packageIndex}.features` as any) || [];
      form.setValue(`saasFeatures.packages.${packageIndex}.features` as any, [...currentFeatures, input.trim()]);
      setPackageFeatureInputs({ ...packageFeatureInputs, [packageIndex]: "" });
    }
  };

  const removePackageFeature = (packageIndex: number, featureIndex: number) => {
    const currentFeatures = form.getValues(`saasFeatures.packages.${packageIndex}.features` as any) || [];
    form.setValue(
      `saasFeatures.packages.${packageIndex}.features` as any,
      currentFeatures.filter((_: string, idx: number) => idx !== featureIndex)
    );
  };

  // Demo Plans handlers
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

      // Generate product URL automatically based on brand, category, and subcategory
      const selectedBrand = brands?.data?.brands?.find((b: any) => b.id === data.brandId);
      const selectedSubcategory = subcategories?.data?.subCategories?.find((s: any) => s.id === data.subcategoryId);

      let productUrl = "";
      if (selectedBrand && selectedSubcategory) {
        const brandSlug = selectedBrand.slug || selectedBrand.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const categorySlug = selectedSubcategory.category?.slug || "";
        const subcategorySlug = selectedSubcategory.slug || "";
        const productSlug = data.slug;
        productUrl = `/${brandSlug}/${categorySlug}/${subcategorySlug}/${productSlug}`;
      }

      // Append all text fields
      formData.append("name", data.name);
      formData.append("slug", data.slug);
      // if (productUrl) formData.append("url", productUrl);
      formData.append("model", data.model || "");
      if (data.mrp) formData.append("mrp", data.mrp.toString());
      formData.append("shortDescription", data.shortDescription || "");
      formData.append("description", data.description || "");
      if (data.technology) formData.append("technology", data.technology);

      // Handle features based on product type
      if (isSaasProduct && demoPlans.length > 0) {
        // For SaaS products, send demo plans as feature
        formData.append("feature", JSON.stringify(demoPlans));
      } else if (isSaasBrand && data.saasFeatures) {
        formData.append("feature", JSON.stringify(data.saasFeatures));
      } else if (data.feature) {
        formData.append("feature", data.feature);
      }

      if (data.metaTitle) formData.append("metaTitle", data.metaTitle);
      if (data.metadescription)
        formData.append("metadescription", data.metadescription);
      if (data.metatag && data.metatag.length > 0) {
        data.metatag.forEach((tag) => formData.append("metatag[]", tag));
      }

      formData.append("isPublished", data.isPublished.toString());
      formData.append("isPopular", data.isPopular.toString());
      formData.append("productType", data.productType);
      formData.append("brandId", data.brandId);
      formData.append("subcategoryId", data.subcategoryId);

      // Append files
      if (data.coverImage) formData.append("coverImage", data.coverImage);
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



      await createMutation.mutateAsync(formData);
      toast.success("Product created successfully");
      navigateBack();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to create product"
      );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl  ">

        <Breadcrumb links={breadcrumbLinks} />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, err => {
            const firstErrorField = Object.values(err)[0];
            if (firstErrorField) {
              toast.error(firstErrorField.message || "Please check the form for errors.");
            }
          })} className="space-y-6 mt-6 bg-muted/50 p-6 rounded-lg">
            {/* Basic Information */}
            <div className=" mx-0 !p-0 space-y-6">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">Basic Information</h2>
                <p className="text-sm">
                  Enter the basic details of the product
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
                          <FormLabel className="text-sm font-medium">Model</FormLabel>
                          <FormControl>
                            <Input placeholder="Model number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Price *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    /> */}

                    {/* <FormField
                      control={form.control}
                      name="mrp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Market Price (MRP)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-xs">Original/MSRP price</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    /> */}
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
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select product type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={ProductType.PHYSICAL}>Physical</SelectItem>
                            <SelectItem value={ProductType.DIGITAL}>Digital</SelectItem>
                            <SelectItem value={ProductType.SERVICE}>Service</SelectItem>
                            <SelectItem value={ProductType.SAAS}>SaaS</SelectItem>
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
                      <FormLabel className="text-sm font-medium">Short Description </FormLabel>
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
                      <FormLabel className="text-sm font-medium">Full Description </FormLabel>
                      <FormControl>
                        <RichTextEditor value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Conditional Feature Fields based on Brand USP Type */}
                {isSaasBrand ? (
                  <div className="space-y-4 bg-muted/30 rounded-lg p-5 border">
                    <h3 className="font-semibold text-base">SaaS Features & Packages</h3>

                    <FormField
                      control={form.control}
                      name="saasFeatures.title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Feature Title *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Pricing Plans" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="saasFeatures.shortDesc"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Short Description *</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Brief description of features..." rows={3} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="saasFeatures.packages"
                      render={({ field }) => (
                        <FormItem>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-sm">Packages *</h4>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => appendPackage({ title: "", price: 0, yearlyDiscount: 0, features: [] })}
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Package
                              </Button>
                            </div>
                            <FormMessage />

                            {packageFields.map((field, packageIndex) => (
                              <Card key={field.id}>
                                <CardHeader className="pb-4">
                                  <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-semibold">Package {packageIndex + 1}</CardTitle>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removePackage(packageIndex)}
                                    >
                                      <Trash2 className="w-4 h-4 text-destructive" />
                                    </Button>
                                  </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <FormField
                                    control={form.control}
                                    name={`saasFeatures.packages.${packageIndex}.title` as any}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel className="text-sm font-medium">Package Title *</FormLabel>
                                        <FormControl>
                                          <Input placeholder="e.g., Basic, Premium, Enterprise" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />

                                  <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                      control={form.control}
                                      name={`saasFeatures.packages.${packageIndex}.price` as any}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className="text-sm font-medium">Price *</FormLabel>
                                          <FormControl>
                                            <Input
                                              type="number"
                                              step="0.01"
                                              placeholder="0.00"
                                              {...field}
                                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />

                                    <FormField
                                      control={form.control}
                                      name={`saasFeatures.packages.${packageIndex}.yearlyDiscount` as any}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className="text-sm font-medium">Yearly Discount (%)</FormLabel>
                                          <FormControl>
                                            <Input
                                              type="number"
                                              step="1"
                                              min="0"
                                              max="100"
                                              placeholder="0"
                                              {...field}
                                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </div>

                                  <FormField
                                    control={form.control}
                                    name={`saasFeatures.packages.${packageIndex}.features` as any}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel className="text-sm font-medium">Package Features *</FormLabel>
                                        <FormControl>
                                          <div className="space-y-3">
                                            <div className="flex gap-2">
                                              <Input
                                                placeholder="Enter a feature and press Enter"
                                                value={packageFeatureInputs[packageIndex] || ""}
                                                onChange={(e) => setPackageFeatureInputs({ ...packageFeatureInputs, [packageIndex]: e.target.value })}
                                                onKeyDown={(e) => {
                                                  if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    addPackageFeature(packageIndex);
                                                  }
                                                }}
                                              />
                                              <Button
                                                type="button"
                                                onClick={() => addPackageFeature(packageIndex)}
                                                size="icon"
                                                variant="outline"
                                              >
                                                <Plus className="w-4 h-4" />
                                              </Button>
                                            </div>
                                            {field.value && field.value.length > 0 && (
                                              <div className="space-y-2">
                                                {field.value.map((feature: string, featureIndex: number) => (
                                                  <div key={featureIndex} className="flex items-center justify-between bg-secondary/50 px-3 py-2 rounded">
                                                    <span className="text-sm">{feature}</span>
                                                    <button
                                                      type="button"
                                                      onClick={() => removePackageFeature(packageIndex, featureIndex)}
                                                      className="text-destructive hover:text-destructive/80"
                                                    >
                                                      <X className="w-4 h-4" />
                                                    </button>
                                                  </div>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        </FormControl>
                                        <FormDescription className="text-xs">
                                          Add features included in this package
                                        </FormDescription>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                ) : isSaasProduct && !isSaasBrand ? (
                  <div className="space-y-4 bg-muted/30 rounded-lg p-5 border">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-base">Demo Plans (Pricing Plans)</h3>
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

                    {demoPlans.map((plan, planIndex) => (
                      <div key={planIndex} className="bg-background rounded-lg p-5 border space-y-4">
                        <div className="flex items-center justify-between border-b pb-3">
                          <h4 className="font-medium text-sm">Plan {planIndex + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
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
                              <div className="flex gap-2">
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
                                  size="icon"
                                  variant="outline"
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                              {plan.features.length > 0 && (
                                <div className="space-y-2">
                                  {plan.features.map((feature, featureIndex) => (
                                    <div key={featureIndex} className="flex items-center justify-between bg-secondary/50 px-3 py-2 rounded">
                                      <span className="text-sm">{feature}</span>
                                      <button
                                        type="button"
                                        onClick={() => removeDemoPlanFeature(planIndex, featureIndex)}
                                        className="text-destructive hover:text-destructive/80"
                                      >
                                        <X className="w-4 h-4" />
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
                  Upload product images
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
                                  className="absolute top-2 right-2"
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
                                      className="absolute top-1 right-1 h-6 w-6"
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
                                      className="absolute top-1 right-1 h-6 w-6"
                                      onClick={() => removeIcon(index)}
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
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
                                  <div className="flex items-center ">
                                    <span
                                      className="px-3 bg-green-100 text-green-500  border-green-500  py-0.5 pb-1 text-sm "
                                    >
                                      {tag}

                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => removeMetaTag(tag)}
                                      className="cursor-pointer  hover:text-red-500 h-full px-2 border-l-0"
                                    >
                                      <Trash className="w-3 h-3 " />
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
                          checked={field.value as boolean}
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
                          checked={field.value as boolean}
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
              <Button type="submit" disabled={createMutation.isPending} className="min-w-[140px]">
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Product"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
