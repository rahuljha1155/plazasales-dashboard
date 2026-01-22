import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateSeoMetadata, useUpdateSeoMetadata } from "@/services/seoMetadata";
import { useGetSeoById } from "@/hooks/useSeoMetadata";
import { EntityType } from "@/types/ISeoMetadata";
import { ArrowLeft, Loader2, X } from "lucide-react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { toast } from "sonner";
import Breadcrumb from "../dashboard/Breadcumb";

const seoSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  keywords: z.string().min(1, "Keywords are required"),
  canonicalUrl: z.string().url("Must be a valid URL"),
  entityType: z.nativeEnum(EntityType),
  entityId: z.string().optional(),
  isIndexable: z.boolean().default(true),
  isOptimized: z.boolean().default(true),

  // OpenGraph
  ogTitle: z.string().min(1, "OpenGraph title is required"),
  ogDescription: z.string().min(1, "OpenGraph description is required"),
  ogType: z.string().default("website"),
  ogUrl: z.string().url("Must be a valid URL"),
  ogSiteName: z.string().min(1, "Site name is required"),
  ogLocale: z.string().default("en_US"),

  // Twitter
  twitterCard: z.string().default("summary_large_image"),
  twitterTitle: z.string().min(1, "Twitter title is required"),
  twitterDescription: z.string().min(1, "Twitter description is required"),

  // Robots
  robotsIndex: z.boolean().default(true).optional(),
  robotsFollow: z.boolean().default(true).optional(),
  robotsMaxSnippet: z.number().default(-1),
  robotsMaxImagePreview: z.any().default("large"),
  robotsMaxVideoPreview: z.any().default(1),

  // Alternates
  alternatesEn: z.string().optional(),
  alternatesNe: z.string().optional(),

  // JsonLd - Full Product Schema
  jsonLdContext: z.string().default("https://schema.org"),
  jsonLdType: z.string().min(1, "JsonLd type is required"),
  jsonLdName: z.string().optional(),
  jsonLdBrand: z.string().optional(),
  jsonLdSku: z.string().optional(),
  jsonLdModel: z.string().optional(),
  jsonLdDescription: z.string().optional(),
  jsonLdImage: z.string().optional(),
  jsonLdOfferPrice: z.string().optional(),
  jsonLdOfferCurrency: z.string().optional(),
  jsonLdOfferAvailability: z.string().optional(),
  jsonLdOfferUrl: z.string().optional(),

  // Extra Meta
  themeColor: z.string().optional(),
  category: z.string().optional(),
});



type SeoFormData = z.infer<typeof seoSchema>;

export default function CreateSeoMetadata() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { id: seoId } = useParams<{ id: string }>();
  const isEditMode = !!seoId;

  const createMutation = useCreateSeoMetadata();
  const updateMutation = useUpdateSeoMetadata(seoId || "");
  const { data: seoData, isLoading: isLoadingSeo } = useGetSeoById(seoId || "");

  const [openGraphImages, setOpenGraphImages] = useState<File[]>([]);
  const [twitterImages, setTwitterImages] = useState<File[]>([]);
  const [sitemap, setSitemap] = useState<File | null>(null);
  const [manifest, setManifest] = useState<File | null>(null);

  // Get URL parameters
  const urlEntityType = searchParams.get("entityType") as EntityType | null;
  const urlEntityId = searchParams.get("entityId");
  const urlSlug = searchParams.get("slug");

  const form = useForm<SeoFormData>({
    resolver: zodResolver(seoSchema) as any,
    defaultValues: {
      slug: urlSlug || "",
      entityType: urlEntityType || undefined,
      entityId: urlEntityId || "",
      isIndexable: true,
      isOptimized: true,
      ogType: "website",
      ogLocale: "en_US",
      twitterCard: "summary_large_image",
      robotsIndex: true,
      robotsFollow: true,
      robotsMaxSnippet: -1,
      robotsMaxImagePreview: "large",
      robotsMaxVideoPreview: -1,
      jsonLdContext: "https://schema.org",
    },
  });

  // Update form when URL parameters change
  useEffect(() => {
    if (urlSlug) {
      form.setValue("slug", urlSlug);
    }
    if (urlEntityType) {
      form.setValue("entityType", urlEntityType);
    }
    if (urlEntityId) {
      form.setValue("entityId", urlEntityId);
    }
  }, [urlSlug, urlEntityType, urlEntityId, form]);

  // Populate form with existing data in edit mode
  useEffect(() => {
    if (isEditMode && seoData?.seoMetadata) {
      const seo = seoData.seoMetadata;

      form.reset({
        slug: seo.slug,
        title: seo.title,
        description: seo.description,
        keywords: seo.keywords.join(", "),
        canonicalUrl: seo.canonicalUrl,
        entityType: seo.entityType as EntityType,
        entityId: seo.entityId,
        isIndexable: seo.isIndexable,
        isOptimized: seo.isOptimized,

        // OpenGraph
        ogTitle: seo.openGraph.title,
        ogDescription: seo.openGraph.description,
        ogType: seo.openGraph.type,
        ogUrl: seo.openGraph.url,
        ogSiteName: seo.openGraph.siteName,
        ogLocale: seo.openGraph.locale,

        // Twitter
        twitterCard: seo.twitter.card,
        twitterTitle: seo.twitter.title,
        twitterDescription: seo.twitter.description,

        // Robots
        robotsIndex: seo.robots.index,
        robotsFollow: seo.robots.follow,
        robotsMaxSnippet: seo.robots.maxSnippet,
        robotsMaxImagePreview: seo.robots.maxImagePreview,
        robotsMaxVideoPreview: seo.robots.maxVideoPreview,

        // Alternates
        alternatesEn: seo.alternates?.languages?.en || "",
        alternatesNe: seo.alternates?.languages?.ne || "",

        // JsonLd
        jsonLdContext: seo.jsonLd["@context"] || "https://schema.org",
        jsonLdType: seo.jsonLd["@type"] || "",
        jsonLdName: seo.jsonLd.name || "",
        jsonLdBrand: seo.jsonLd.brand?.name || "",
        jsonLdSku: seo.jsonLd.sku || "",
        jsonLdModel: seo.jsonLd.model || "",
        jsonLdDescription: seo.jsonLd.description || "",
        jsonLdImage: seo.jsonLd.image?.[0] || "",
        jsonLdOfferPrice: seo.jsonLd.offers?.price || "",
        jsonLdOfferCurrency: seo.jsonLd.offers?.priceCurrency || "",
        jsonLdOfferAvailability: seo.jsonLd.offers?.availability || "",
        jsonLdOfferUrl: seo.jsonLd.offers?.url || "",

        // Extra Meta
        themeColor: seo.extraMeta?.themeColor || "",
        category: seo.extraMeta?.category || "",
      });
    }
  }, [isEditMode, seoData, form]);

  const onSubmit = async (data: SeoFormData) => {
    try {
      // Build JSON-LD object
      const jsonLdObject: any = {
        "@context": data.jsonLdContext,
        "@type": data.jsonLdType,
      };

      if (data.jsonLdName) jsonLdObject.name = data.jsonLdName;
      if (data.jsonLdDescription) jsonLdObject.description = data.jsonLdDescription;
      if (data.jsonLdImage) jsonLdObject.image = [data.jsonLdImage];
      if (data.jsonLdBrand) {
        jsonLdObject.brand = { "@type": "Brand", name: data.jsonLdBrand };
      }
      if (data.jsonLdSku) jsonLdObject.sku = data.jsonLdSku;
      if (data.jsonLdModel) jsonLdObject.model = data.jsonLdModel;

      // Add offers if price is provided
      if (data.jsonLdOfferPrice) {
        jsonLdObject.offers = {
          "@type": "Offer",
          priceCurrency: data.jsonLdOfferCurrency || "USD",
          price: data.jsonLdOfferPrice,
          availability: data.jsonLdOfferAvailability || "https://schema.org/InStock",
          url: data.jsonLdOfferUrl || data.canonicalUrl,
        };
      }

      const payload: any = {
        slug: data.slug,
        title: data.title,
        description: data.description,
        keywords: data.keywords.split(",").map((k) => k.trim()),
        canonicalUrl: data.canonicalUrl,

        isIndexable: data.isIndexable,
        isOptimized: data.isOptimized,
        openGraph: {
          title: data.ogTitle,
          description: data.ogDescription,
          type: data.ogType,
          url: data.ogUrl,
          siteName: data.ogSiteName,
          images: [],
          locale: data.ogLocale,
        },
        twitter: {
          card: data.twitterCard,
          title: data.twitterTitle,
          description: data.twitterDescription,
          images: [],
        },
        robots: {
          index: data.robotsIndex,
          follow: data.robotsFollow,
          maxSnippet: data.robotsMaxSnippet,
          maxImagePreview: data.robotsMaxImagePreview,
          maxVideoPreview: data.robotsMaxVideoPreview,
        },
        alternates: {
          languages: {
            ...(data.alternatesEn && { en: data.alternatesEn }),
            ...(data.alternatesNe && { ne: data.alternatesNe }),
          },
        },
        jsonLd: jsonLdObject,
        extraMeta: {
          ...(data.themeColor && { themeColor: data.themeColor }),
          ...(data.category && { category: data.category }),
        },
        openGraphImages,
        twitterImages,
        sitemapFile: sitemap || undefined,
        manifestFile: manifest || undefined,
      };

      // Only include entityId if it exists and is not empty
      if (data.entityId && data.entityId.trim() !== "") {
        payload.entityId = data.entityId,
          payload.entityType = data.entityType
      }


      if (isEditMode) {
        await updateMutation.mutateAsync(payload);
      } else {
        await createMutation.mutateAsync(payload);
      }
      navigate(-1);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || `Failed to ${isEditMode ? 'update' : 'create'} SEO metadata. Please check all fields and try again.`;
      toast.error(errorMessage);
    }
  };

  if (isEditMode && isLoadingSeo) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className=" space-y-4">

      <Breadcrumb links={[
        { label: "SEO Metadata", isActive: false },
        { label: "Create", isActive: true },
      ]} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader className="px-0">
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Core SEO metadata fields</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 px-0">
              {/* Only show these fields if NOT provided via URL */}
              {!urlSlug && !urlEntityType && !urlEntityId && (
                <>
                  <div className="grid grid-cols-2 gap-4">

                    <FormField
                      control={form.control}
                      name="entityType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Entity Type *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select entity type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.values(EntityType).map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="entityId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Entity ID *</FormLabel>
                        <FormControl>
                          <Input placeholder="216d493e-18ad-4a5a-ad72-472f3a2e0817" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug *</FormLabel>
                    <FormControl>
                      <Input placeholder="panasonic-rice-cooker-1-8l" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Show info message when fields are auto-filled */}
              {(urlSlug || urlEntityType || urlEntityId) && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Icon icon="solar:info-circle-bold" className="text-blue-600 mt-0.5" width="18" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-900">Auto-filled from source</p>
                      <div className="mt-1 text-blue-700 space-y-1">
                        {urlEntityType && <p>Entity Type: <span className="font-semibold">{urlEntityType}</span></p>}
                        {urlSlug && <p>Slug: <span className="font-semibold">{urlSlug}</span></p>}
                        {urlEntityId && <p>Entity ID: <span className="font-mono text-xs">{urlEntityId}</span></p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Panasonic 1.8L Automatic Rice Cooker — Price & Features" {...field} />
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
                      <Textarea
                        placeholder="Panasonic 1.8L automatic rice cooker with non-stick inner pot..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="keywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Keywords * (comma-separated)</FormLabel>
                    <FormControl>
                      <Input placeholder="Panasonic, Rice Cooker, Automatic, 1.8L" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="canonicalUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Canonical URL *</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/products/panasonic-rice-cooker-1-8l" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="isIndexable"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Indexable</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isOptimized"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Optimized</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="px-0">
              <CardTitle>OpenGraph Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-0">
              <FormField
                control={form.control}
                name="ogTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OG Title *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ogDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OG Description *</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="ogType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>OG Type</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ogLocale"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>OG Locale</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="ogUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OG URL *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ogSiteName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OG Site Name *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <FormLabel>OpenGraph Images</FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setOpenGraphImages(files);
                  }}
                />
                {openGraphImages.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {openGraphImages.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Icon icon="solar:gallery-bold" className="text-blue-600" />
                        {file.name}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setOpenGraphImages(openGraphImages.filter((_, i) => i !== idx));
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="px-0">
              <CardTitle>Twitter Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-0">
              <FormField
                control={form.control}
                name="twitterCard"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Twitter Card</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="twitterTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Twitter Title *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="twitterDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Twitter Description *</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <FormLabel>Twitter Images</FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setTwitterImages(files);
                  }}
                />
                {twitterImages.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {twitterImages.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Icon icon="solar:gallery-bold" className="text-blue-600" />
                        {file.name}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setTwitterImages(twitterImages.filter((_, i) => i !== idx));
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="px-0">
              <CardTitle>Robots Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-0">
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="robotsIndex"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Index</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="robotsFollow"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Follow</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="robotsMaxSnippet"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Snippet</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="robotsMaxImagePreview"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Image Preview</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="robotsMaxVideoPreview"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Video Preview</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="px-0">
              <CardTitle>JSON-LD Schema</CardTitle>
              <CardDescription>Structured data for search engines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-0">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="jsonLdContext"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Context</FormLabel>
                      <FormControl>
                        <Input placeholder="https://schema.org" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="jsonLdType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type *</FormLabel>
                      <FormControl>
                        <Input placeholder="Product" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="jsonLdName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Panasonic Automatic Rice Cooker 1.8L" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="jsonLdDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Non-stick, auto shut-off, keep warm." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="jsonLdImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="jsonLdBrand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <FormControl>
                        <Input placeholder="Yasuda" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="jsonLdSku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
                      <FormControl>
                        <Input placeholder="PRC-18A" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="jsonLdModel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model</FormLabel>
                      <FormControl>
                        <Input placeholder="SRC-18A" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="border-t pt-4 mt-4">
                <h4 className="text-sm font-medium mb-3">Offer Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="jsonLdOfferPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input placeholder="39.99" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="jsonLdOfferCurrency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <FormControl>
                          <Input placeholder="USD" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <FormField
                    control={form.control}
                    name="jsonLdOfferAvailability"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Availability</FormLabel>
                        <FormControl>
                          <Input placeholder="https://schema.org/InStock" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="jsonLdOfferUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Offer URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/products/..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="px-0">
              <CardTitle>Extra Metadata & Files</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-0">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="themeColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Theme Color</FormLabel>
                      <FormControl>
                        <Input placeholder="#1428A0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input placeholder="Rice Cooker" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="alternatesEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alternate URL (EN)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="alternatesNe"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alternate URL (NE)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-2">
                <FormLabel>Sitemap File (XML)</FormLabel>
                <Input
                  type="file"
                  accept=".xml"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setSitemap(file);
                  }}
                />
                {sitemap && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon icon="solar:file-check-bold" className="text-green-600" />
                    {sitemap.name}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSitemap(null)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <FormLabel>Manifest File (JSON)</FormLabel>
                <Input
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setManifest(file);
                  }}
                />
                {manifest && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon icon="solar:file-check-bold" className="text-green-600" />
                    {manifest.name}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setManifest(null)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {isEditMode ? 'Update' : 'Create'} SEO Metadata
            </Button>
          </div>
        </form>
      </Form >
    </div >
  );
}
