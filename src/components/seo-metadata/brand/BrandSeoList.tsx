import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import { useGetSeoByEntity } from "@/hooks/useSeoMetadata";
import { Icon } from "@iconify/react/dist/iconify.js";

export default function BrandSeoList() {
    const { entityId } = useParams<{ entityId: string }>();
    const navigate = useNavigate();

    const { data, isLoading, error } = useGetSeoByEntity("BRAND", entityId || "", true);

    if (isLoading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    const seo = data?.seoMetadata;

    return (
        <div className="p-6 space-y-4">
            <Button variant="outline" className="w-fit px-4" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            <div className="flex items-center justify-between">
                <div className="flex w-full justify-between items-center gap-4">

                    <div>
                        <h1 className="text-2xl font-bold">Brand SEO Optimization</h1>
                        <p className="text-sm text-muted-foreground">
                            Manage SEO metadata for this brand
                        </p>
                    </div>

                    {seo && (

                        <Button
                            variant="default"
                            className="rounded-md"
                            onClick={() => navigate(`/dashboard/brands/${entityId}/seo/edit/${seo.id}`)}
                        >
                            <Icon icon="solar:pen-bold" className="w-4 h-4 mr-2" />
                            Edit SEO
                        </Button>
                    )}
                </div>
                {!seo && !error && (
                    <Link to={`brands/${entityId}/seo/create`}>
                        <Button >
                            <Plus className="w-4 h-4 mr-2" />
                            Create SEO
                        </Button>
                    </Link>
                )}
            </div>


            {
                error && (
                    <Card className="bg-muted/80 w-full max-w-xl py-12 rounded-xl">
                        <CardContent className="p-6">
                            <div className="text-center space-y-4">
                                <Icon icon="solar:file-search-bold" className="w-16 h-16 mx-auto text-gray-400" />
                                <div>
                                    <h3 className="text-lg font-semibold">No SEO Metadata Found</h3>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        This brand doesn't have SEO metadata yet.
                                    </p>
                                </div>
                                <Button onClick={() => navigate(`/dashboard/brands/${entityId}/seo/create`)}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create SEO Metadata
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )
            }

            {
                seo && (
                    <div className="space-y-6">


                        {/* Basic Information */}
                        <Card className="bg-muted/80 p-4 rounded-xl">
                            <CardHeader className="px-0">
                                <CardTitle className="flex items-center gap-2">
                                    Basic Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 px-0">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-lg font-semibold ">Entity Type</p>
                                        <span >{seo.entityType}</span>
                                    </div>
                                    <div>
                                        <p className="text-lg font-semibold ">Slug</p>
                                        <p className="text-sm font-mono   py-1 rounded">{seo.slug}</p>
                                    </div>

                                    <div>
                                        <p className="text-lg font-semibold ">Title</p>
                                        <p className="text-sm">{seo.title}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-2">Keywords</p>
                                        <div className="flex flex-wrap gap-4">
                                            {seo.keywords.map((keyword, idx) => (
                                                <span key={idx} className="bg-green-100   text-green-500 px-2">
                                                    {keyword}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-lg font-semibold ">Description</p>
                                        <p className="text-sm text-muted-foreground">{seo.description}</p>
                                    </div>

                                    <div>
                                        <p className="text-lg font-semibold ">Canonical URL</p>
                                        <a
                                            href={seo.canonicalUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                                        >
                                            {seo.canonicalUrl}
                                            <Icon icon="solar:link-bold" className="w-3 h-3" />
                                        </a>
                                    </div>
                                </div>
                                <div className="flex gap-6 pt-4">
                                    <div className="flex items-center gap-2">
                                        <Icon
                                            icon={seo.isIndexable ? "garden:check-badge-fill-12" : "solar:close-circle-bold"}
                                            className={`w-5 h-5 ${seo.isIndexable ? "text-green-600" : "text-gray-400"}`}
                                        />
                                        <span className="text-sm font-medium">Indexable</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Icon
                                            icon={seo.isOptimized ? "garden:check-badge-fill-12" : "solar:close-circle-bold"}
                                            className={`w-5 h-5 ${seo.isOptimized ? "text-green-600" : "text-gray-400"}`}
                                        />
                                        <span className="text-sm font-medium">Optimized</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* OpenGraph Metadata */}
                        <Card className="bg-muted/80 p-4 rounded-xl">
                            <CardHeader className="px-0">
                                <CardTitle className="flex items-center gap-2">
                                    OpenGraph Metadata
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 px-0">
                                <div>
                                    <p className="text-lg font-semibold ">OG Title</p>
                                    <p className="text-sm">{seo.openGraph.title}</p>
                                </div>
                                <div>
                                    <p className="text-lg font-semibold ">OG Description</p>
                                    <p className="text-sm text-muted-foreground">{seo.openGraph.description}</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-lg font-semibold ">Type</p>
                                        <span>{seo.openGraph.type}</span>
                                    </div>
                                    <div>
                                        <p className="text-lg font-semibold ">Locale</p>
                                        <span>{seo.openGraph.locale}</span>
                                    </div>
                                    <div>
                                        <p className="text-lg font-semibold ">Site Name</p>
                                        <p className="text-sm">{seo.openGraph.siteName}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-lg font-semibold ">OG URL</p>
                                    <a
                                        href={seo.openGraph.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                                    >
                                        {seo.openGraph.url}
                                        <Icon icon="solar:link-bold" className="w-3 h-3" />
                                    </a>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Twitter Metadata */}
                        <Card className="bg-muted/80 p-4 rounded-xl">
                            <CardHeader className="px-0">
                                <CardTitle className="flex items-center gap-2">
                                    Twitter Metadata
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 px-0">
                                <div>
                                    <p className="text-lg font-semibold ">Card Type</p>
                                    <span>{seo.twitter.card}</span>
                                </div>
                                <div>
                                    <p className="text-lg font-semibold ">Twitter Title</p>
                                    <p className="text-sm">{seo.twitter.title}</p>
                                </div>
                                <div>
                                    <p className="text-lg font-semibold ">Twitter Description</p>
                                    <p className="text-sm text-muted-foreground">{seo.twitter.description}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Robots Configuration */}
                        <Card className="bg-muted/80 p-4 rounded-xl">
                            <CardHeader className="px-0">
                                <CardTitle className="flex items-center gap-2">
                                    Robots Configuration
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 px-0">
                                <div className="flex gap-6">
                                    <div className="flex items-center gap-2">
                                        <Icon
                                            icon={seo.robots.index ? "garden:check-badge-fill-12" : "solar:close-circle-bold"}
                                            className={`w-5 h-5 ${seo.robots.index ? "text-green-600" : "text-gray-400"}`}
                                        />
                                        <span className="text-sm font-medium">Index</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Icon
                                            icon={seo.robots.follow ? "garden:check-badge-fill-12" : "solar:close-circle-bold"}
                                            className={`w-5 h-5 ${seo.robots.follow ? "text-green-600" : "text-gray-400"}`}
                                        />
                                        <span className="text-sm font-medium">Follow</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-lg font-semibold ">Max Snippet</p>
                                        <p className="text-sm">{seo.robots.maxSnippet}</p>
                                    </div>
                                    <div>
                                        <p className="text-lg font-semibold ">Max Image Preview</p>
                                        <p className="text-sm">{seo.robots.maxImagePreview}</p>
                                    </div>
                                    <div>
                                        <p className="text-lg font-semibold ">Max Video Preview</p>
                                        <p className="text-sm">{seo.robots.maxVideoPreview}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Alternates */}
                        {seo.alternates?.languages && Object.keys(seo.alternates.languages).length > 0 && (
                            <Card className="bg-muted/80 p-4 rounded-xl">
                                <CardHeader className="px-0">
                                    <CardTitle className="flex items-center gap-2">
                                        Alternate Languages
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="px-0">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {Object.entries(seo.alternates.languages).map(([lang, url]) => (
                                            <div key={lang}>
                                                <p className="text-lg font-semibold ">
                                                    {lang.toUpperCase()}
                                                </p>
                                                <p className="text-sm text-blue-600">{url as string}</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* JSON-LD Schema */}
                        <Card className="bg-muted/80 px-4 rounded-xl">
                            <CardHeader className="px-0">
                                <CardTitle className="flex items-center gap-2">
                                    Structured Data (JSON-LD)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 px-0">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-lg font-semibold ">Context</p>
                                        <p className="text-sm font-mono">{seo.jsonLd["@context"]}</p>
                                    </div>
                                    <div>
                                        <p className="text-lg font-semibold ">Type</p>
                                        <span>{seo.jsonLd["@type"]}</span>
                                    </div>
                                </div>
                                {seo.jsonLd.name && (
                                    <div>
                                        <p className="text-lg font-semibold ">Name</p>
                                        <p className="text-sm">{seo.jsonLd.name}</p>
                                    </div>
                                )}
                                {seo.jsonLd.description && (
                                    <div>
                                        <p className="text-lg font-semibold ">Description</p>
                                        <p className="text-sm text-muted-foreground">{seo.jsonLd.description}</p>
                                    </div>
                                )}
                                {seo.jsonLd.brand && (
                                    <div>
                                        <p className="text-lg font-semibold ">Brand</p>
                                        <p className="text-sm">{seo.jsonLd.brand.name}</p>
                                    </div>
                                )}
                                {(seo.jsonLd.sku || seo.jsonLd.model) && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {seo.jsonLd.sku && (
                                            <div>
                                                <p className="text-lg font-semibold ">SKU</p>
                                                <p className="text-sm font-mono">{seo.jsonLd.sku}</p>
                                            </div>
                                        )}
                                        {seo.jsonLd.model && (
                                            <div>
                                                <p className="text-lg font-semibold ">Model</p>
                                                <p className="text-sm">{seo.jsonLd.model}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {seo.jsonLd.offers && (
                                    <div className="border-t pt-4">
                                        <p className="text-sm font-semibold mb-3">Offer Information</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-lg font-semibold ">Price</p>
                                                <p className="text-sm font-semibold">
                                                    {seo.jsonLd.offers.priceCurrency} {seo.jsonLd.offers.price}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-lg font-semibold ">Availability</p>
                                                <span>{seo.jsonLd.offers.availability}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className="border-t pt-4">
                                    <p className="text-sm font-medium text-muted-foreground mb-2">Full JSON-LD</p>
                                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto max-h-64">
                                        {JSON.stringify(seo.jsonLd, null, 2)}
                                    </pre>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Extra Metadata */}
                        {seo.extraMeta && Object.keys(seo.extraMeta).length > 0 && (
                            <Card className="bg-muted/80 px-4 rounded-xl">
                                <CardHeader className="px-0">
                                    <CardTitle className="flex items-center gap-2">
                                        Extra Metadata
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="px-0">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {seo.extraMeta.themeColor && (
                                            <div>
                                                <p className="text-lg font-semibold ">Theme Color</p>
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-6 h-6 rounded border"
                                                        style={{ backgroundColor: seo.extraMeta.themeColor }}
                                                    />
                                                    <p className="text-sm font-mono">{seo.extraMeta.themeColor}</p>
                                                </div>
                                            </div>
                                        )}
                                        {seo.extraMeta.category && (
                                            <div>
                                                <p className="text-lg font-semibold ">Category</p>
                                                <span>{seo.extraMeta.category}</span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Timestamps */}
                        <Card className="bg-muted/80 px-4 rounded-xl">
                            <CardHeader className="px-0">
                                <CardTitle className="flex items-center gap-2">
                                    Timestamps
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-0">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-lg font-semibold ">Created At</p>
                                        <p className="text-sm">{new Date(seo.createdAt).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-lg font-semibold ">Updated At</p>
                                        <p className="text-sm">{new Date(seo.updatedAt).toLocaleString()}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )
            }
        </div >
    );
}
