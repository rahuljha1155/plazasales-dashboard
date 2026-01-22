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
import { Icon } from "@iconify/react/dist/iconify.js";
import { TableShimmer } from "../table-shimmer";
import { ImagePreview, ExistingImagePreview, FilePreview, ExistingFilePreview } from "./FilePreviewComponents";
import { toast } from "sonner";

const seoSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  keywords: z.string().min(1, "Keywords are required"),
  canonicalUrl: z.string().url("Must be a valid URL"),
  entityType: z.nativeEnum(EntityType),
  entityId: z.string().min(1, "Entity ID is required"),
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

interface UpdateSeoMetadataProps {
  seoId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function UpdateSeoMetadataSimplified({ seoId, onSuccess, onCancel }: UpdateSeoMetadataProps) {
  const navigate = useNavigate();
  const { data: seoData, isLoading } = useGetSeoById(seoId);
  const updateMutation = useUpdateSeo(seoId);
  
  // Existing files/images from server
  const [existingOgImages, setExistingOgImages] = useState<string[]>([]);
  const [existingTwitterImages, setExistingTwitterImages] = useState<string[]>([]);
  const [existingSitemap, setExistingSitemap] = useState<string | null>(null);
  const [existingManifest, setExistingManifest] = useState<string | null>(null);
  
  // New files/images to upload
  const [newOpenGraphImages, setNewOpenGraphImages] = useState<File[]>([]);
  const [newTwitterImages, setNewTwitterImages] = useState<File[]>([]);
  const [newSitemapFile, setNewSitemapFile] = useState<File | null>(null);
  const [newManifestFile, setNewManifestFile] = useState<File | null>(null);

  const form = useForm<SeoFormData>({
    resolver: zodResolver(seoSchema) as any,
    defaultValues: {
      slug: "",
      entityType: undefined,
      entityId: "",
      isIndexable: true,
      isOptimized: true,
      openGraph: JSON.stringify({}, null, 2),
      twitter: JSON.stringify({}, null, 2),
      robots: JSON.stringify({}, null, 2),
      alternates: JSON.stringify({}, null, 2),
      jsonLd: JSON.stringify({}, null, 2),
      extraMeta: JSON.stringify({}, null, 2),
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
        openGraph: JSON.stringify(seo.openGraph, null, 2),
        twitter: JSON.stringify(seo.twitter, null, 2),
        robots: JSON.stringify(seo.robots, null, 2),
        alternates: JSON.stringify(seo.alternates, null, 2),
        jsonLd: JSON.stringify(seo.jsonLd, null, 2),
        extraMeta: JSON.stringify(seo.extraMeta, null, 2),
      });
      
      // Set existing files
      setExistingOgImages(seo.openGraphImages || []);
      setExistingTwitterImages(seo.twitterImages || []);
      setExistingSitemap(seo.sitemapFile || null);
      setExistingManifest(seo.manifestFile || null);
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
      formData.append("entityType", data.entityType);
      formData.append("entityId", data.entityId);
      formData.append("isIndexable", String(data.isIndexable));
      formData.append("isOptimized", String(data.isOptimized));
      
      // Keywords as array
      const keywordsArray = data.keywords.split(",").map((k) => k.trim());
      keywordsArray.forEach((keyword) => {
        formData.append("keywords[]", keyword);
      });

      // Metadata objects
      formData.append("openGraph", data.openGraph);
      formData.append("twitter", data.twitter);
      formData.append("robots", data.robots);
      if (data.alternates) formData.append("alternates", data.alternates);
      formData.append("jsonLd", data.jsonLd);
      if (data.extraMeta) formData.append("extraMeta", data.extraMeta);

      // New files
      newOpenGraphImages.forEach((file) => {
        formData.append("openGraphImages", file);
      });
      newTwitterImages.forEach((file) => {
        formData.append("twitterImages", file);
      });
      if (newSitemapFile) formData.append("sitemapFile", newSitemapFile);
      if (newManifestFile) formData.append("manifestFile", newManifestFile);

      await updateMutation.mutateAsync(formData);
      onSuccess();
    } catch (error: any) {
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
          <p className="text-sm text-muted-foreground">Modify SEO metadata for your content</p>
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
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="slug" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug *</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="entityType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entity Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
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
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl><Textarea {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="keywords" render={({ field }) => (
                <FormItem>
                  <FormLabel>Keywords * (comma-separated)</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="canonicalUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel>Canonical URL *</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
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




              <Card>
                <CardHeader>
                  <CardTitle>OpenGraph Metadata</CardTitle>
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
                    {existingOgImages.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mt-2 mb-1">Existing Images</p>
                        <ExistingImagePreview urls={existingOgImages} />
                      </div>
                    )}
                    <Input type="file" accept="image/*" multiple onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setNewOpenGraphImages(prev => [...prev, ...files]);
                    }} className="mt-2" />
                    {newOpenGraphImages.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mt-2 mb-1">New Images to Upload</p>
                        <ImagePreview files={newOpenGraphImages} onRemove={(i) => setNewOpenGraphImages(prev => prev.filter((_, idx) => idx !== i))} />
                      </div>
                    )}
                  </div>
                </CardContent>
          </Card>



              <Card>
                <CardHeader>
                  <CardTitle>Twitter Metadata</CardTitle>
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
                    {existingTwitterImages.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mt-2 mb-1">Existing Images</p>
                        <ExistingImagePreview urls={existingTwitterImages} />
                      </div>
                    )}
                    <Input type="file" accept="image/*" multiple onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setNewTwitterImages(prev => [...prev, ...files]);
                    }} className="mt-2" />
                    {newTwitterImages.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mt-2 mb-1">New Images to Upload</p>
                        <ImagePreview files={newTwitterImages} onRemove={(i) => setNewTwitterImages(prev => prev.filter((_, idx) => idx !== i))} />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>



              <Card>
                <CardHeader>
                  <CardTitle>Robots Configuration</CardTitle>
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



              <Card>
                <CardHeader>
                  <CardTitle>JSON-LD Schema</CardTitle>
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



              <Card>
                <CardHeader>
                  <CardTitle>Extra Metadata & Files</CardTitle>
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
                      {existingSitemap && (
                        <div>
                          <p className="text-xs text-muted-foreground mt-2 mb-1">Current File</p>
                          <ExistingFilePreview
                            url={existingSitemap}
                            filename="sitemap.xml"
                            icon={<Icon icon="solar:document-text-bold" className="w-5 h-5 text-orange-600" />}
                          />
                        </div>
                      )}
                      <Input type="file" accept=".xml" onChange={(e) => setNewSitemapFile(e.target.files?.[0] || null)} className="mt-2" />
                      {newSitemapFile && (
                        <div>
                          <p className="text-xs text-muted-foreground mt-2 mb-1">New File to Upload</p>
                          <FilePreview
                            file={newSitemapFile}
                            onRemove={() => setNewSitemapFile(null)}
                            icon={<Icon icon="solar:document-text-bold" className="w-5 h-5 text-orange-600" />}
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <FormLabel>Manifest File (JSON)</FormLabel>
                      {existingManifest && (
                        <div>
                          <p className="text-xs text-muted-foreground mt-2 mb-1">Current File</p>
                          <ExistingFilePreview
                            url={existingManifest}
                            filename="manifest.json"
                            icon={<Icon icon="solar:code-file-bold" className="w-5 h-5 text-blue-600" />}
                          />
                        </div>
                      )}
                      <Input type="file" accept=".json" onChange={(e) => setNewManifestFile(e.target.files?.[0] || null)} className="mt-2" />
                      {newManifestFile && (
                        <div>
                          <p className="text-xs text-muted-foreground mt-2 mb-1">New File to Upload</p>
                          <FilePreview
                            file={newManifestFile}
                            onRemove={() => setNewManifestFile(null)}
                            icon={<Icon icon="solar:code-file-bold" className="w-5 h-5 text-blue-600" />}
                          />
                        </div>
                      )}
                    </div>
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
