import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useGetSeoById } from "@/hooks/useSeoMetadata";
import { TableShimmer } from "../table-shimmer";
import { Icon } from "@iconify/react/dist/iconify.js";
import { format } from "date-fns";

interface SeoDetailViewProps {
  seoId: string;
  onBack: () => void;
}

export function SeoDetailView({ seoId, onBack }: SeoDetailViewProps) {
  const { data, isLoading } = useGetSeoById(seoId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <TableShimmer />
      </div>
    );
  }

  const seo = data?.seoMetadata;

  if (!seo) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold">SEO Metadata Not Found</h1>
        </div>
      </div>
    );
  }

  const colorMap: Record<string, string> = {
    PRODUCT: "bg-blue-100 text-blue-800",
    BRAND: "bg-purple-100 text-purple-800",
    CATEGORY: "bg-green-100 text-green-800",
    SUBCATEGORY: "bg-yellow-100 text-yellow-800",
    BLOG: "bg-pink-100 text-pink-800",
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{seo.title}</h1>
          <p className="text-sm text-muted-foreground">{seo.slug}</p>
        </div>
        <Badge className={colorMap[seo.entityType] || "bg-gray-100 text-gray-800"}>
          {seo.entityType || "Whole Site"}
        </Badge>
      </div>

      {/* Basic Information */}
      <Card className="bg-muted/80 rounded-xl">
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Entity ID</p>
              <p className="text-sm font-mono">{seo.entityId}</p>
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
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
            <p className="text-sm">{seo.description}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Keywords</p>
            <div className="flex flex-wrap gap-2">
              {seo.keywords.map((keyword, index) => (
                <Badge key={index} variant="outline">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground pb-4">Indexable</p>
              <span className={seo.isIndexable ? "text-green-500" : "text-red-500"}>
                {seo.isIndexable ? <Icon icon="garden:check-badge-fill-12" className="size-8" /> : <Icon icon="simple-line-icons:close" className="size-8" />}

              </span>
            </div>
            <div>
              <p className="text-sm font-medium pb-4 text-muted-foreground">Optimized</p>
              <span className={seo.isOptimized ? "text-green-500" : "text-red-500"}>
                {seo.isOptimized ? <Icon icon="garden:check-badge-fill-12" className="size-8" /> : <Icon icon="simple-line-icons:close" className="size-8" />}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Created</p>
              <p className="text-sm">{format(new Date(seo.createdAt), "MMM dd, yyyy")}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Updated</p>
              <p className="text-sm">{format(new Date(seo.updatedAt), "MMM dd, yyyy")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* OpenGraph */}
      <Card className="bg-muted/80 rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="logos:facebook" width="20" />
            OpenGraph Metadata
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Title</p>
              <p className="text-sm">{seo.openGraph.title}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Type</p>
              <p className="text-sm">{seo.openGraph.type}</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
            <p className="text-sm">{seo.openGraph.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">URL</p>
              <a
                href={seo.openGraph.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                {seo.openGraph.url}
              </a>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Site Name</p>
              <p className="text-sm">{seo.openGraph.siteName}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Locale</p>
              <p className="text-sm">{seo.openGraph.locale}</p>
            </div>
            {seo.openGraph.images && seo.openGraph.images.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Images</p>
                <div className="flex flex-wrap gap-2">
                  {seo.openGraph.images.map((img: string, index: number) => (
                    <img
                      key={index}
                      src={img}
                      alt={`OG Image ${index + 1}`}
                      className="w-20 h-20 object-cover rounded border"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Twitter */}
      <Card className="bg-muted/80 rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="logos:twitter" width="20" />
            Twitter Metadata
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Card Type</p>
              <p className="text-sm">{seo.twitter.card}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Title</p>
              <p className="text-sm">{seo.twitter.title}</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
            <p className="text-sm">{seo.twitter.description}</p>
          </div>
          {seo.twitter.images && seo.twitter.images.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Images</p>
              <div className="flex flex-wrap gap-2">
                {seo.twitter.images.map((img: string, index: number) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Twitter Image ${index + 1}`}
                    className="w-20 h-20 object-cover rounded border"
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Robots */}
      <Card className="bg-muted/80 rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="solar:settings-bold" width="20" />
            Robots Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground pb-4">Index</p>
              <span className={seo?.robots?.index ? "text-green-500" : "text-red-500"}>
                {seo?.robots?.index ? <Icon icon="garden:check-badge-fill-12" className="size-8" /> : <Icon icon="simple-line-icons:close" className="size-8" />}

              </span>
            </div>
            <div>
              <p className="text-sm font-medium pb-4 text-muted-foreground">Follow</p>
              <span className={seo?.robots?.follow ? "text-green-500" : "text-red-500"}>
                {seo?.robots?.follow ? <Icon icon="garden:check-badge-fill-12" className="size-8" /> : <Icon icon="simple-line-icons:close" className="size-8" />}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Max Snippet</p>
              <p className="text-sm">{seo.robots.maxSnippet}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Max Image Preview</p>
              <p className="text-sm">{seo.robots.maxImagePreview}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Max Video Preview</p>
              <p className="text-sm">{seo.robots.maxVideoPreview}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* JSON-LD */}
      <Card className="bg-muted/80 rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="solar:code-bold" width="20" />
            JSON-LD Schema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-xs">
            {JSON.stringify(seo.jsonLd, null, 2)}
          </pre>
        </CardContent>
      </Card>

      {/* Alternates */}
      {Object.keys(seo.alternates.languages).length > 0 && (
        <Card className="bg-muted/80 rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon icon="solar:globus-bold" width="20" />
              Alternate Languages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(seo.alternates.languages).map(([lang, url]) => (
                <div key={lang}>
                  <p className="text-sm font-medium text-muted-foreground">{lang.toUpperCase()}</p>
                  <a
                    href={url as string || ""}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {url as string || ""}
                  </a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Extra Meta */}
      {Object.keys(seo.extraMeta).length > 0 && (
        <Card className="bg-muted/80 rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon icon="solar:tag-bold" width="20" />
              Extra Metadata
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-xs">
              {JSON.stringify(seo.extraMeta, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Files */}
      {(seo.sitemapFile || seo.manifestFile) && (
        <Card className="bg-muted/80 rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon icon="solar:documents-bold" width="20" />
              Files
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {seo.sitemapFile && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                <Icon icon="solar:document-text-bold" className="w-6 h-6 text-orange-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Sitemap File</p>
                  <a
                    href={seo.sitemapFile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Download / View Sitemap
                  </a>
                </div>
              </div>
            )}
            {seo.manifestFile && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                <Icon icon="solar:code-file-bold" className="w-6 h-6 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Manifest File</p>
                  <a
                    href={seo.manifestFile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Download / View Manifest
                  </a>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
