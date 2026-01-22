import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { useGetSeoById, useUpdateSeo } from "@/hooks/useSeoMetadata";
import { EntityType } from "@/types/ISeoMetadata";
import { ArrowLeft, Loader2 } from "lucide-react";
import { TableShimmer } from "../table-shimmer";
import { toast } from "sonner";

const seoSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  keywords: z.string().min(1, "Keywords are required"),
  canonicalUrl: z.string().url("Must be a valid URL"),
  entityType: z.nativeEnum(EntityType).optional(),
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
  robotsIndex: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((val) => {
      if (typeof val === "string") return val === "true";
      return val ?? true;
    }),
  robotsFollow: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((val) => {
      if (typeof val === "string") return val === "true";
      return val ?? true;
    }),
  robotsMaxSnippet: z.union([z.number(), z.string()]).optional(),
  robotsMaxImagePreview: z.string().optional(),
  robotsMaxVideoPreview: z.union([z.number(), z.string()]).optional(),

  // Alternates
  alternatesEn: z.string().optional(),
  alternatesNe: z.string().optional(),

  // JsonLd
  jsonLdContext: z.string().default("https://schema.org"),
  jsonLdType: z.string().min(1, "JsonLd type is required"),
  jsonLdName: z.string().optional(),
  jsonLdBrand: z.string().optional(),
  jsonLdSku: z.string().optional(),
  jsonLdModel: z.string().optional(),

  // Extra Meta
  themeColor: z.string().optional(),
  category: z.string().optional(),
});

type SeoFormData = z.infer<typeof seoSchema>;

interface UpdateSeoMetadataProps {
  seoId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function UpdateSeoMetadata({ seoId, onSuccess, onCancel }: UpdateSeoMetadataProps) {
  const navigate = useNavigate();
  const { data: seoData, isLoading } = useGetSeoById(seoId);
  const updateMutation = useUpdateSeo(seoId);
  const [openGraphImages, setOpenGraphImages] = useState<File[]>([]);
  const [twitterImages, setTwitterImages] = useState<File[]>([]);
  const [sitemap, setSitemap] = useState<File | null>(null);
  const [manifest, setManifest] = useState<File | null>(null);

  const form = useForm<SeoFormData>({
    resolver: zodResolver(seoSchema) as any,
    defaultValues: {
      slug: "",
      entityType: undefined,
      entityId: "",
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

  // Load existing data
  useEffect(() => {
    if (seoData?.seoMetadata) {
      const seo = seoData.seoMetadata;
      form.reset({
        slug: seo.slug,
        title: seo.title,
        description: seo.description,
        keywords: seo.keywords.join(", "),
        canonicalUrl: seo.canonicalUrl,
        entityType: seo.entityType,
        entityId: seo.entityId,
        isIndexable: seo.isIndexable,
        isOptimized: seo.isOptimized,
        ogTitle: seo.openGraph.title,
        ogDescription: seo.openGraph.description,
        ogType: seo.openGraph.type,
        ogUrl: seo.openGraph.url,
        ogSiteName: seo.openGraph.siteName,
        ogLocale: seo.openGraph.locale,
        twitterCard: seo.twitter.card,
        twitterTitle: seo.twitter.title,
        twitterDescription: seo.twitter.description,
        robotsIndex: seo.robots.index,
        robotsFollow: seo.robots.follow,
        robotsMaxSnippet: seo.robots.maxSnippet,
        robotsMaxImagePreview: seo.robots.maxImagePreview,
        robotsMaxVideoPreview: seo.robots.maxVideoPreview,
        alternatesEn: seo.alternates.languages.en,
        alternatesNe: seo.alternates.languages.ne,
        jsonLdContext: seo.jsonLd["@context"],
        jsonLdType: seo.jsonLd["@type"],
        jsonLdName: seo.jsonLd.name,
        jsonLdBrand: seo.jsonLd.brand?.name,
        jsonLdSku: seo.jsonLd.sku,
        jsonLdModel: seo.jsonLd.model,
        themeColor: seo.extraMeta?.themeColor,
        category: seo.extraMeta?.category,
      });
    }
  }, [seoData, form]);

  const onSubmit = async (data: SeoFormData) => {
    try {
      const formData = new FormData();

      // Basic fields
      formData.append("slug", data.slug);
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("canonicalUrl", data.canonicalUrl);
      if (data.entityType !== undefined) {
        formData.append("entityType", String(data.entityType));
      }
      if (data.entityId !== undefined) {
        formData.append("entityId", data.entityId);
      }
      formData.append("isIndexable", String(data.isIndexable));
      formData.append("isOptimized", String(data.isOptimized));

      // Keywords as array
      const keywordsArray = data.keywords.split(",").map((k) => k.trim());
      keywordsArray.forEach((keyword) => {
        formData.append("keywords[]", keyword);
      });

      // OpenGraph
      formData.append("openGraph[title]", data.ogTitle);
      formData.append("openGraph[description]", data.ogDescription);
      formData.append("openGraph[type]", data.ogType);
      formData.append("openGraph[url]", data.ogUrl);
      formData.append("openGraph[siteName]", data.ogSiteName);
      formData.append("openGraph[locale]", data.ogLocale);

      // Twitter
      formData.append("twitter[card]", data.twitterCard);
      formData.append("twitter[title]", data.twitterTitle);
      formData.append("twitter[description]", data.twitterDescription);

      // Robots
      formData.append("robots[index]", String(data.robotsIndex));
      formData.append("robots[follow]", String(data.robotsFollow));
      if (data.robotsMaxSnippet !== undefined && data.robotsMaxSnippet !== null && data.robotsMaxSnippet !== "") {
        formData.append("robots[maxSnippet]", String(data.robotsMaxSnippet));
      }
      if (data.robotsMaxImagePreview) {
        formData.append("robots[maxImagePreview]", data.robotsMaxImagePreview);
      }
      if (data.robotsMaxVideoPreview !== undefined && data.robotsMaxVideoPreview !== null && data.robotsMaxVideoPreview !== "") {
        formData.append("robots[maxVideoPreview]", String(data.robotsMaxVideoPreview));
      }

      // Alternates
      if (data.alternatesEn) formData.append("alternates[languages][en]", data.alternatesEn);
      if (data.alternatesNe) formData.append("alternates[languages][ne]", data.alternatesNe);

      // JsonLd
      formData.append("jsonLd[@context]", data.jsonLdContext);
      formData.append("jsonLd[@type]", data.jsonLdType);
      if (data.jsonLdName) formData.append("jsonLd[name]", data.jsonLdName);
      if (data.jsonLdBrand) formData.append("jsonLd[brand][name]", data.jsonLdBrand);
      if (data.jsonLdSku) formData.append("jsonLd[sku]", data.jsonLdSku);
      if (data.jsonLdModel) formData.append("jsonLd[model]", data.jsonLdModel);

      // Extra Meta
      if (data.themeColor) formData.append("extraMeta[themeColor]", data.themeColor);
      if (data.category) formData.append("extraMeta[category]", data.category);

      // Files
      openGraphImages.forEach((file) => {
        formData.append("openGraphImages", file);
      });
      twitterImages.forEach((file) => {
        formData.append("twitterImages", file);
      });
      if (sitemap) formData.append("sitemap", sitemap);
      if (manifest) formData.append("manifest", manifest);

      await updateMutation.mutateAsync(formData);
      onSuccess();
    } catch (error: any) {
      console.error("Failed to update SEO metadata:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to update SEO metadata. Please check all fields and try again.";
      toast.error(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <TableShimmer />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Update SEO Metadata</h1>
          <p className="text-sm text-muted-foreground">
            Modify SEO metadata for your content
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, (err) => {
          console.error("Form submission error:", err);
          const firstErrorKey = Object.keys(err)[0] as keyof typeof err;
          const firstErrorMessage = err[firstErrorKey]?.message;
          toast.error(firstErrorMessage || "Please check the form for errors.");
        })} className="space-y-6">
          <Card>
            <CardHeader className="">
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Core SEO metadata fields</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                <FormField
                  control={form.control}
                  name="entityType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entity Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
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

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Page title" {...field} />
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
                      <Textarea placeholder="Page description..." {...field} />
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
                      <Input placeholder="keyword1, keyword2, keyword3" {...field} />
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
                      <Input placeholder="https://example.com/page" {...field} />
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
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
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
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="!mt-0">Optimized</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="">
              <CardTitle>OpenGraph Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                <FormLabel>OpenGraph Images (New)</FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setOpenGraphImages(files);
                  }}
                />
              </div>
            </CardContent>
          </Card>



          <Card>
            <CardHeader className="">
              <CardTitle>Twitter Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                <FormLabel>Twitter Images (New)</FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setTwitterImages(files);
                  }}
                />
              </div>
            </CardContent>
          </Card>



          <Card>
            <CardHeader className="">
              <CardTitle>Robots Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="robotsIndex"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
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
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
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
            <CardHeader className="">
              <CardTitle>JSON-LD Schema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="jsonLdContext"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Context</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                      <Input {...field} />
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
                        <Input {...field} />
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
                        <Input {...field} />
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
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>



          <Card>
            <CardHeader className="">
              <CardTitle>Extra Metadata & Files</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                        <Input placeholder="Category name" {...field} />
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
                <FormLabel>Sitemap File (New)</FormLabel>
                <Input
                  type="file"
                  accept=".xml"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setSitemap(file);
                  }}
                />
              </div>
              <div className="space-y-2">
                <FormLabel>Manifest File (New)</FormLabel>
                <Input
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setManifest(file);
                  }}
                />
              </div>
            </CardContent>
          </Card>



          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Update SEO Metadata
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}



export function UpdateWholeSiteSeoMetadata({ seoId, onSuccess, onCancel }: UpdateSeoMetadataProps) {
  const { data: seoData, isLoading } = useGetSeoById(seoId);
  const updateMutation = useUpdateSeo(seoId);
  const [openGraphImages, setOpenGraphImages] = useState<File[]>([]);
  const [twitterImages, setTwitterImages] = useState<File[]>([]);
  const [sitemap, setSitemap] = useState<File | null>(null);
  const [manifest, setManifest] = useState<File | null>(null);

  const form = useForm<SeoFormData>({
    resolver: zodResolver(seoSchema) as any,
    defaultValues: {
      slug: "",
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

  // Load existing data
  useEffect(() => {
    if (seoData?.seoMetadata) {
      const seo = seoData.seoMetadata;
      form.reset({
        slug: seo.slug,
        title: seo.title,
        description: seo.description,
        keywords: seo.keywords.join(", "),
        canonicalUrl: seo.canonicalUrl,

        isIndexable: seo.isIndexable,
        isOptimized: seo.isOptimized,
        ogTitle: seo.openGraph.title,
        ogDescription: seo.openGraph.description,
        ogType: seo.openGraph.type,
        ogUrl: seo.openGraph.url,
        ogSiteName: seo.openGraph.siteName,
        ogLocale: seo.openGraph.locale,
        twitterCard: seo.twitter.card,
        twitterTitle: seo.twitter.title,
        twitterDescription: seo.twitter.description,
        robotsIndex: seo.robots.index,
        robotsFollow: seo.robots.follow,
        robotsMaxSnippet: seo.robots.maxSnippet,
        robotsMaxImagePreview: seo.robots.maxImagePreview,
        robotsMaxVideoPreview: seo.robots.maxVideoPreview,
        alternatesEn: seo.alternates.languages.en,
        alternatesNe: seo.alternates.languages.ne,
        jsonLdContext: seo.jsonLd["@context"],
        jsonLdType: seo.jsonLd["@type"],
        jsonLdName: seo.jsonLd.name,
        jsonLdBrand: seo.jsonLd.brand?.name,
        jsonLdSku: seo.jsonLd.sku,
        jsonLdModel: seo.jsonLd.model,
        themeColor: seo.extraMeta?.themeColor,
        category: seo.extraMeta?.category,
      });
    }
  }, [seoData, form]);

  const onSubmit = async (data: SeoFormData) => {
    try {
      const formData = new FormData();

      // Basic fields
      formData.append("slug", data.slug);
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("canonicalUrl", data.canonicalUrl);

      formData.append("isIndexable", String(data.isIndexable));
      formData.append("isOptimized", String(data.isOptimized));

      // Keywords as array
      const keywordsArray = data.keywords.split(",").map((k) => k.trim());
      keywordsArray.forEach((keyword) => {
        formData.append("keywords[]", keyword);
      });

      // OpenGraph
      formData.append("openGraph[title]", data.ogTitle);
      formData.append("openGraph[description]", data.ogDescription);
      formData.append("openGraph[type]", data.ogType);
      formData.append("openGraph[url]", data.ogUrl);
      formData.append("openGraph[siteName]", data.ogSiteName);
      formData.append("openGraph[locale]", data.ogLocale);

      // Twitter
      formData.append("twitter[card]", data.twitterCard);
      formData.append("twitter[title]", data.twitterTitle);
      formData.append("twitter[description]", data.twitterDescription);

      // Robots
      formData.append("robots[index]", String(data.robotsIndex));
      formData.append("robots[follow]", String(data.robotsFollow));
      if (data.robotsMaxSnippet !== undefined && data.robotsMaxSnippet !== null && data.robotsMaxSnippet !== "") {
        formData.append("robots[maxSnippet]", String(data.robotsMaxSnippet));
      }
      if (data.robotsMaxImagePreview) {
        formData.append("robots[maxImagePreview]", data.robotsMaxImagePreview);
      }
      if (data.robotsMaxVideoPreview !== undefined && data.robotsMaxVideoPreview !== null && data.robotsMaxVideoPreview !== "") {
        formData.append("robots[maxVideoPreview]", String(data.robotsMaxVideoPreview));
      }

      // Alternates
      if (data.alternatesEn) formData.append("alternates[languages][en]", data.alternatesEn);
      if (data.alternatesNe) formData.append("alternates[languages][ne]", data.alternatesNe);

      // JsonLd
      formData.append("jsonLd[@context]", data.jsonLdContext);
      formData.append("jsonLd[@type]", data.jsonLdType);
      if (data.jsonLdName) formData.append("jsonLd[name]", data.jsonLdName);
      if (data.jsonLdBrand) formData.append("jsonLd[brand][name]", data.jsonLdBrand);
      if (data.jsonLdSku) formData.append("jsonLd[sku]", data.jsonLdSku);
      if (data.jsonLdModel) formData.append("jsonLd[model]", data.jsonLdModel);

      // Extra Meta
      if (data.themeColor) formData.append("extraMeta[themeColor]", data.themeColor);
      if (data.category) formData.append("extraMeta[category]", data.category);

      // Files
      openGraphImages.forEach((file) => {
        formData.append("openGraphImages", file);
      });
      twitterImages.forEach((file) => {
        formData.append("twitterImages", file);
      });
      if (sitemap) formData.append("sitemap", sitemap);
      if (manifest) formData.append("manifest", manifest);

      await updateMutation.mutateAsync(formData);
      onSuccess();
    } catch (error: any) {
      console.error("Failed to update SEO metadata:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to update SEO metadata. Please check all fields and try again.";
      toast.error(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <TableShimmer />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Update Whole Site SEO Metadata</h1>
          <p className="text-sm text-muted-foreground">
            Modify SEO metadata for your content
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, (err) => {
          console.error("Form submission error:", err);
          const firstErrorKey = Object.keys(err)[0] as keyof typeof err;
          const firstErrorMessage = err[firstErrorKey]?.message;
          toast.error(firstErrorMessage || "Please check the form for errors.");
        })} className="space-y-6">
          <Card>
            <CardHeader className="">
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Core SEO metadata fields</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
              </div>



              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Page title" {...field} />
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
                      <Textarea placeholder="Page description..." {...field} />
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
                      <Input placeholder="keyword1, keyword2, keyword3" {...field} />
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
                      <Input placeholder="https://example.com/page" {...field} />
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
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
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
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="!mt-0">Optimized</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>




          <Card>
            <CardHeader className="">
              <CardTitle>OpenGraph Metadata</CardTitle>
              <CardDescription>Social media sharing metadata</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                <FormLabel>OpenGraph Images (New)</FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setOpenGraphImages(files);
                  }}
                />
              </div>
            </CardContent>
          </Card>



          <Card>
            <CardHeader className="">
              <CardTitle>Twitter Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                <FormLabel>Twitter Images (New)</FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setTwitterImages(files);
                  }}
                />
              </div>
            </CardContent>
          </Card>



          <Card>
            <CardHeader className="">
              <CardTitle>Robots Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="robotsIndex"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
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
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
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
            <CardHeader className="">
              <CardTitle>JSON-LD Schema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="jsonLdContext"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Context</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                      <Input {...field} />
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
                        <Input {...field} />
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
                        <Input {...field} />
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
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>



          <Card>
            <CardHeader className="">
              <CardTitle>Extra Metadata & Files</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                        <Input placeholder="Category name" {...field} />
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
                <FormLabel>Sitemap File (New)</FormLabel>
                <Input
                  type="file"
                  accept=".xml"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setSitemap(file);
                  }}
                />
              </div>
              <div className="space-y-2">
                <FormLabel>Manifest File (New)</FormLabel>
                <Input
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setManifest(file);
                  }}
                />
              </div>
            </CardContent>
          </Card>



          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Update SEO Metadata
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

