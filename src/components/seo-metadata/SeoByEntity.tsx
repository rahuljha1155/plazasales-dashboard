import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import { useGetSeoByEntity, useGetSeoById } from "@/hooks/useSeoMetadata";
import { EntityType } from "@/types/ISeoMetadata";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@iconify/react/dist/iconify.js";

export default function SeoByEntity() {
    const { entityId, id } = useParams<{ entityId?: string; id?: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const entityType = searchParams.get("entityType") as EntityType;

    // If we have an id param, we're viewing by SEO ID, otherwise by entity ID
    const isViewingBySeoId = !!id;
    const { data: dataByEntity, isLoading: isLoadingByEntity, error: errorByEntity } = useGetSeoByEntity(entityType, entityId || "", !isViewingBySeoId);
    const { data: dataById, isLoading: isLoadingById } = useGetSeoById(id || "");

    const data = isViewingBySeoId ? dataById : dataByEntity;
    const isLoading = isViewingBySeoId ? isLoadingById : isLoadingByEntity;
    const error = isViewingBySeoId ? null : errorByEntity;

    if (isLoading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    const seo = data?.seoMetadata;

    return (
        <div className=" space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">SEO Optimization</h1>
                        <p className="text-sm text-muted-foreground">
                            {entityType ? `${entityType} SEO Metadata` : "Entity SEO Metadata"}
                        </p>
                    </div>
                </div>
                {!seo && !error && (
                    <Button onClick={() => navigate(`/dashboard/seo-metadata/create?entityId=${entityId}&entityType=${entityType}`)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create SEO Metadata
                    </Button>
                )}
            </div>

            {error && (
                <Card>
                    <CardContent className="p-6">
                        <div className="text-center space-y-4">
                            <Icon icon="solar:file-search-bold" className="w-16 h-16 mx-auto text-gray-400" />
                            <div>
                                <h3 className="text-lg font-semibold">No SEO Metadata Found</h3>
                                <p className="text-sm text-muted-foreground mt-2">
                                    This entity doesn't have SEO metadata yet.
                                </p>
                            </div>
                            <Button onClick={() => navigate(`/dashboard/seo-metadata/create?entityId=${entityId}&entityType=${entityType}`)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Create SEO Metadata
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {seo && (
                <div className="space-y-6">
                    {/* Basic Info */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Basic Information</CardTitle>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate(`/dashboard/seo-metadata/edit/${seo.id}`)}
                                >
                                    <Icon icon="solar:pen-bold" className="w-4 h-4 mr-2" />
                                    Edit
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Entity Type</p>
                                    <Badge variant="secondary">{seo.entityType}</Badge>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Slug</p>
                                    <p className="text-sm">{seo.slug}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Title</p>
                                <p className="text-sm">{seo.title}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Description</p>
                                <p className="text-sm">{seo.description}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Keywords</p>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {seo.keywords.map((keyword, idx) => (
                                        <Badge key={idx} variant="outline">
                                            {keyword}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Canonical URL</p>
                                <a
                                    href={seo.canonicalUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:underline"
                                >
                                    {seo.canonicalUrl}
                                </a>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium text-muted-foreground">Indexable:</p>
                                    <Badge variant={seo.isIndexable ? "default" : "secondary"}>
                                        {seo.isIndexable ? "Yes" : "No"}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium text-muted-foreground">Optimized:</p>
                                    <Badge variant={seo.isOptimized ? "default" : "secondary"}>
                                        {seo.isOptimized ? "Yes" : "No"}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* OpenGraph */}
                    <Card>
                        <CardHeader>
                            <CardTitle>OpenGraph Metadata</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">OG Title</p>
                                <p className="text-sm">{seo.openGraph.title}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">OG Description</p>
                                <p className="text-sm">{seo.openGraph.description}</p>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Type</p>
                                    <p className="text-sm">{seo.openGraph.type}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Locale</p>
                                    <p className="text-sm">{seo.openGraph.locale}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Site Name</p>
                                    <p className="text-sm">{seo.openGraph.siteName}</p>
                                </div>
                            </div>
                            {seo.openGraphImages && seo.openGraphImages.length > 0 && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-2">Images</p>
                                    <div className="grid grid-cols-3 gap-4">
                                        {seo.openGraphImages.map((img, idx) => (
                                            <img
                                                key={idx}
                                                src={img}
                                                alt={`OG Image ${idx + 1}`}
                                                className="w-full h-32 object-cover rounded border"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Twitter */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Twitter Metadata</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Card Type</p>
                                <p className="text-sm">{seo.twitter.card}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Title</p>
                                <p className="text-sm">{seo.twitter.title}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Description</p>
                                <p className="text-sm">{seo.twitter.description}</p>
                            </div>
                            {seo.twitterImages && seo.twitterImages.length > 0 && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-2">Images</p>
                                    <div className="grid grid-cols-3 gap-4">
                                        {seo.twitterImages.map((img, idx) => (
                                            <img
                                                key={idx}
                                                src={img}
                                                alt={`Twitter Image ${idx + 1}`}
                                                className="w-full h-32 object-cover rounded border"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* JSON-LD */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Structured Data (JSON-LD)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <pre className="bg-gray-50 p-4 rounded text-xs overflow-auto">
                                {JSON.stringify(seo.jsonLd, null, 2)}
                            </pre>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
