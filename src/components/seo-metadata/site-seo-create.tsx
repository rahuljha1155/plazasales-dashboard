import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateSeoMetadata } from "@/services/seoMetadata";
import { ArrowLeft, Loader2, X } from "lucide-react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { toast } from "sonner";

const seoSchema = z.object({
    slug: z.string().min(1, "Slug is required"),
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    keywords: z.string().min(1, "Keywords are required"),
    canonicalUrl: z.string().url("Must be a valid URL"),
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
    robotsIndex: z.boolean().default(true),
    robotsFollow: z.boolean().default(true),
    robotsMaxSnippet: z.number().default(-1),
    robotsMaxImagePreview: z.string().default("large"),
    robotsMaxVideoPreview: z.number().default(-1),

    // Alternates
    alternatesEn: z.string().optional(),
    alternatesNe: z.string().optional(),

    // JsonLd - Site Schema
    jsonLdContext: z.string().default("https://schema.org"),
    jsonLdType: z.string().min(1, "JsonLd type is required"),
    jsonLdName: z.string().optional(),
    jsonLdDescription: z.string().optional(),
    jsonLdImage: z.string().optional(),

    // Extra Meta
    themeColor: z.string().optional(),
    category: z.string().optional(),
});



type SeoFormData = z.infer<typeof seoSchema>;

export default function ALLSITESEO() {
    const navigate = useNavigate();
    const createMutation = useCreateSeoMetadata();

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



    const onSubmit = async (data: SeoFormData) => {
        try {
            const jsonLdObject: any = {
                "@context": data.jsonLdContext,
                "@type": data.jsonLdType,
            };

            if (data.jsonLdName) jsonLdObject.name = data.jsonLdName;
            if (data.jsonLdDescription) jsonLdObject.description = data.jsonLdDescription;
            if (data.jsonLdImage) jsonLdObject.image = [data.jsonLdImage];

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

            await createMutation.mutateAsync(payload);
            navigate(-1);
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to create SEO metadata. Please check all fields and try again.";
            toast.error(errorMessage);
        }
    };



    return (
        <div className="p-6 space-y-6">
            <Button
                variant="outline"
                onClick={() => navigate(-1)}
            >
                <ArrowLeft className="size-4 shrink-0" /> Back
            </Button>
            <div className="flex items-center gap-4">

                <div>
                    <h1 className="text-2xl font-bold">Whole Site SEO</h1>
                    <p className="text-sm text-muted-foreground">
                        CREATE comprehensive SEO metadata for your content
                    </p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Card>
                        <CardHeader className="px-0">
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>Core SEO metadata fields</CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4 px-0">


                            <FormField
                                control={form.control}
                                name="slug"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Slug *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="home" {...field} />
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
                                            <Input placeholder="Your Site Name - Best Products & Services" {...field} />
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
                                                placeholder="Discover quality products and services at great prices..."
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
                                            <Input placeholder="ecommerce, online shopping, products" {...field} />
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
                                            <Input placeholder="https://example.com" {...field} />
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
                                                <Input placeholder="WebSite" {...field} />
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
                                            <Input placeholder="Your Site Name" {...field} />
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
                                            <Textarea placeholder="Your site description" {...field} />
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
                                            <Input placeholder="https://example.com/logo.jpg" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
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
                                                <Input placeholder="General" {...field} />
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
                        <Button type="submit" disabled={createMutation.isPending}>
                            {createMutation.isPending && (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            )}
                            Create SEO Metadata
                        </Button>
                    </div>
                </form>
            </Form >
        </div >
    );
}
