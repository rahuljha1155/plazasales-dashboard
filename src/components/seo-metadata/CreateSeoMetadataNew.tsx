import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { useCreateSeoMetadata } from "@/services/seoMetadata";
import { EntityType } from "@/types/ISeoMetadata";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icon } from "@iconify/react/dist/iconify.js";
import { ImagePreview, FilePreview } from "./FilePreviewComponents";
import { toast } from "sonner";

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
  
  // Metadata as JSON strings
  openGraph: z.string().min(1, "OpenGraph metadata is required"),
  twitter: z.string().min(1, "Twitter metadata is required"),
  robots: z.string().min(1, "Robots configuration is required"),
  alternates: z.string().optional(),
  jsonLd: z.string().min(1, "JSON-LD schema is required"),
  extraMeta: z.string().optional(),
});

type SeoFormData = z.infer<typeof seoSchema>;

export default function CreateSeoMetadataSimplified() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const createMutation = useCreateSeoMetadata();
  const [openGraphImages, setOpenGraphImages] = useState<File[]>([]);
  const [twitterImages, setTwitterImages] = useState<File[]>([]);
  const [sitemapFile, setSitemapFile] = useState<File | null>(null);
  const [manifestFile, setManifestFile] = useState<File | null>(null);

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
      openGraph: JSON.stringify({ title: "", description: "", type: "website", url: "", siteName: "", locale: "en_US" }, null, 2),
      twitter: JSON.stringify({ card: "summary_large_image", title: "", description: "" }, null, 2),
      robots: JSON.stringify({ index: true, follow: true, maxSnippet: -1, maxImagePreview: "large", maxVideoPreview: -1 }, null, 2),
      alternates: JSON.stringify({ languages: {} }, null, 2),
      jsonLd: JSON.stringify({ "@context": "https://schema.org", "@type": "Product" }, null, 2),
      extraMeta: JSON.stringify({}, null, 2),
    },
  });

  useEffect(() => {
    if (urlSlug) form.setValue("slug", urlSlug);
    if (urlEntityType) form.setValue("entityType", urlEntityType);
    if (urlEntityId) form.setValue("entityId", urlEntityId);
  }, [urlSlug, urlEntityType, urlEntityId, form]);

  const onSubmit = async (data: SeoFormData) => {
    try {
      const payload = {
        slug: data.slug,
        title: data.title,
        description: data.description,
        keywords: data.keywords.split(",").map((k) => k.trim()),
        canonicalUrl: data.canonicalUrl,
        entityType: data.entityType,
        entityId: data.entityId,
        isIndexable: data.isIndexable,
        isOptimized: data.isOptimized,
        openGraph: JSON.parse(data.openGraph),
        twitter: JSON.parse(data.twitter),
        robots: JSON.parse(data.robots),
        alternates: data.alternates ? JSON.parse(data.alternates) : {},
        jsonLd: JSON.parse(data.jsonLd),
        extraMeta: data.extraMeta ? JSON.parse(data.extraMeta) : {},
        openGraphImages,
        twitterImages,
        sitemapFile: sitemapFile || undefined,
        manifestFile: manifestFile || undefined,
      };

      await createMutation.mutateAsync(payload as any);
      navigate(-1);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to create SEO metadata. Please check all fields and try again.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/seo-metadata")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create SEO Metadata</h1>
          <p className="text-sm text-muted-foreground">Add comprehensive SEO metadata for your content</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Core SEO metadata fields</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="slug" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug *</FormLabel>
                    <FormControl><Input placeholder="product-slug" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="entityType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entity Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {Object.values(EntityType).map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="entityId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Entity ID *</FormLabel>
                  <FormControl><Input placeholder="Entity UUID" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl><Input placeholder="SEO Page Title" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl><Textarea placeholder="SEO meta description..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="keywords" render={({ field }) => (
                <FormItem>
                  <FormLabel>Keywords * (comma-separated)</FormLabel>
                  <FormControl><Input placeholder="keyword1, keyword2, keyword3" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="canonicalUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel>Canonical URL *</FormLabel>
                  <FormControl><Input placeholder="https://example.com/page" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="flex gap-4">
                <FormField control={form.control} name="isIndexable" render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <FormLabel className="!mt-0">Indexable</FormLabel>
                  </FormItem>
                )} />
                <FormField control={form.control} name="isOptimized" render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <FormLabel className="!mt-0">Optimized</FormLabel>
                  </FormItem>
                )} />
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="opengraph" className="w-full">
            <TabsList className="grid h-fit w-full grid-cols-5">
              <TabsTrigger className="!rounded-full data-[state=active]:bg-primary data-[state=active]:text-white" value="opengraph">OpenGraph</TabsTrigger>
              <TabsTrigger className="!rounded-full data-[state=active]:bg-primary data-[state=active]:text-white" value="twitter">Twitter</TabsTrigger>
              <TabsTrigger className="!rounded-full data-[state=active]:bg-primary data-[state=active]:text-white" value="robots">Robots</TabsTrigger>
              <TabsTrigger className="!rounded-full data-[state=active]:bg-primary data-[state=active]:text-white" value="jsonld">JSON-LD</TabsTrigger>
              <TabsTrigger className="!rounded-full data-[state=active]:bg-primary data-[state=active]:text-white" value="extra">Extra & Files</TabsTrigger>
            </TabsList>

            <TabsContent value="opengraph">
              <Card>
                <CardHeader>
                  <CardTitle>OpenGraph Metadata</CardTitle>
                  <CardDescription>Define as JSON object</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="openGraph" render={({ field }) => (
                    <FormItem>
                      <FormLabel>OpenGraph Object (JSON) *</FormLabel>
                      <FormControl>
                        <Textarea className="font-mono text-sm min-h-[200px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div>
                    <FormLabel>OpenGraph Images</FormLabel>
                    <Input type="file" accept="image/*" multiple onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setOpenGraphImages(prev => [...prev, ...files]);
                    }} className="mt-2" />
                    {openGraphImages.length > 0 && (
                      <ImagePreview files={openGraphImages} onRemove={(i) => setOpenGraphImages(prev => prev.filter((_, idx) => idx !== i))} />
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="twitter">
              <Card>
                <CardHeader>
                  <CardTitle>Twitter Metadata</CardTitle>
                  <CardDescription>Define as JSON object</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="twitter" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Twitter Object (JSON) *</FormLabel>
                      <FormControl>
                        <Textarea className="font-mono text-sm min-h-[150px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div>
                    <FormLabel>Twitter Images</FormLabel>
                    <Input type="file" accept="image/*" multiple onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setTwitterImages(prev => [...prev, ...files]);
                    }} className="mt-2" />
                    {twitterImages.length > 0 && (
                      <ImagePreview files={twitterImages} onRemove={(i) => setTwitterImages(prev => prev.filter((_, idx) => idx !== i))} />
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="robots">
              <Card>
                <CardHeader>
                  <CardTitle>Robots Configuration</CardTitle>
                  <CardDescription>Define as JSON object</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="robots" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Robots Object (JSON) *</FormLabel>
                      <FormControl>
                        <Textarea className="font-mono text-sm min-h-[150px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="jsonld">
              <Card>
                <CardHeader>
                  <CardTitle>JSON-LD Schema</CardTitle>
                  <CardDescription>Define schema.org structured data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="jsonLd" render={({ field }) => (
                    <FormItem>
                      <FormLabel>JSON-LD Object (JSON) *</FormLabel>
                      <FormControl>
                        <Textarea className="font-mono text-sm min-h-[200px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="extra">
              <Card>
                <CardHeader>
                  <CardTitle>Extra Metadata & Files</CardTitle>
                  <CardDescription>Additional metadata and file uploads</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="alternates" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alternates (JSON)</FormLabel>
                      <FormControl>
                        <Textarea className="font-mono text-sm min-h-[100px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="extraMeta" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Extra Meta (JSON)</FormLabel>
                      <FormControl>
                        <Textarea className="font-mono text-sm min-h-[100px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <FormLabel>Sitemap File (XML)</FormLabel>
                      <Input type="file" accept=".xml" onChange={(e) => setSitemapFile(e.target.files?.[0] || null)} className="mt-2" />
                      {sitemapFile && (
                        <FilePreview
                          file={sitemapFile}
                          onRemove={() => setSitemapFile(null)}
                          icon={<Icon icon="solar:document-text-bold" className="w-5 h-5 text-orange-600" />}
                        />
                      )}
                    </div>

                    <div>
                      <FormLabel>Manifest File (JSON)</FormLabel>
                      <Input type="file" accept=".json" onChange={(e) => setManifestFile(e.target.files?.[0] || null)} className="mt-2" />
                      {manifestFile && (
                        <FilePreview
                          file={manifestFile}
                          onRemove={() => setManifestFile(null)}
                          icon={<Icon icon="solar:code-file-bold" className="w-5 h-5 text-blue-600" />}
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate("/dashboard/seo-metadata")}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create SEO Metadata
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
