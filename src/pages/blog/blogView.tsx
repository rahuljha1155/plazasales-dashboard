import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar, Clock, User, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { blogApi } from "@/apis/api-call";
import type { IBlogDetailsResponse } from "@/types/IBlog";
import { format } from "date-fns";
import Breadcrumb from "@/components/dashboard/Breadcumb";

export default function BlogViewPage() {
  const { blogId } = useParams<{ blogId: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery<IBlogDetailsResponse>({
    queryKey: ["blog-details", blogId],
    queryFn: async () => {
      const response = await blogApi.getOne(blogId!);
      return response.data;
    },
    enabled: !!blogId,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data?.blog) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <p className="text-center text-red-600">
              Failed to load blog. Please try again.
            </p>
            <div className="flex justify-center mt-4">
              <Button onClick={() => navigate(-1)} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blogs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const blog = data.blog;

  return (
    <div className="container mx-auto  max-w-7xl">

      <div className="mb-6">
        <Breadcrumb links={[{ label: "Blogs", href: "/dashboard/blogs" }, { label: blog?.slug, href: `/dashboard/blogs` }, { label: "View", isActive: true }]} />
      </div>

      {/* Main Content */}
      <Card className="bg-muted/80 p-6">
        <CardContent className="px-0">
          {/* Title and Status */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <span


                className={
                  blog.isPublished
                    ? "bg-green-500 px-4 text-sm py-1 rounded-sm text-white"
                    : "bg-zinc-500 px-4 text-sm py-1 rounded-sm text-gray-800"
                }
              >
                {blog.isPublished ? "Published" : "Draft"}
              </span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              {blog.title}
            </h1>
            <p className="text-xl text-muted-foreground">{blog.excerpt}</p>
          </div>

          <Separator className="my-6" />

          {/* Meta Information */}
          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground mb-6">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>
                {typeof blog.author === 'string' ? blog.author : `${blog?.author?.firstname || ""} ${blog?.author?.lastname || ""}`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(blog.createdAt), "MMMM dd, yyyy")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{blog.estimatedReadTime} min read</span>
            </div>
            {blog.updatedAt !== blog.createdAt && (
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span>
                  Updated: {format(new Date(blog.updatedAt), "MMM dd, yyyy")}
                </span>
              </div>
            )}
          </div>

          <Separator className="my-6" />

          {/* Cover Image */}
          {blog.coverImage && (
            <div className="mb-8">
              <img
                src={blog.coverImage}
                alt={blog.title}
                className="w-full h-auto rounded-lg object-cover max-h-[500px]"
              />
            </div>
          )}

          {/* Blog Content */}
          <div
            className="prose prose-lg max-w-none mb-8"
            dangerouslySetInnerHTML={{ __html: blog.description }}
          />

          {/* Media Assets */}
          {blog.mediaAssets && blog.mediaAssets.length > 0 && (
            <>
              <Separator className="my-8" />
              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-4">Media Gallery</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {blog.mediaAssets.map((asset) => (
                    <div
                      key={asset.id}
                      className="rounded-lg overflow-hidden border"
                    >
                      {asset.type === "IMAGE" && (
                        <img
                          src={asset.fileUrl}
                          alt="Blog media"
                          className="w-full h-48 object-cover"
                        />
                      )}
                      {asset.type === "VIDEO" && (
                        <video
                          src={asset.fileUrl}
                          controls
                          className="w-full h-48 object-cover"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* SEO Metadata */}
          {blog.seoMetadata && (
            <>
              <Separator className="my-8" />
              <div>
                <h2 className="text-2xl font-semibold mb-4">SEO Information</h2>
                <div className="grid gap-4">
                  {blog.seoMetadata.metaTitle && (
                    <div>
                      <p className="font-medium text-sm text-muted-foreground mb-1">
                        Meta Title
                      </p>
                      <p>{blog.seoMetadata.metaTitle}</p>
                    </div>
                  )}
                  {blog.seoMetadata.metaDescription && (
                    <div>
                      <p className="font-medium text-sm text-muted-foreground mb-1">
                        Meta Description
                      </p>
                      <p>{blog.seoMetadata.metaDescription}</p>
                    </div>
                  )}
                  {blog.seoMetadata.keywords &&
                    blog.seoMetadata.keywords.length > 0 && (
                      <div>
                        <p className="font-medium text-sm text-muted-foreground mb-2">
                          Keywords
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {blog.seoMetadata.keywords.map((keyword, index) => (
                            <Badge key={index} variant="outline">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </>
          )}

          {/* Author Info */}
          <Separator className="my-8" />
          <div className="flex items-start gap-4">

            {typeof blog.author === 'string' && (
              <div>
                <p className="font-semibold text-lg">{blog.author}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Similar Blogs */}
      {data.similarBlogs && data.similarBlogs.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Similar Blogs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.similarBlogs.map((similarBlog) => (
              <Card
                key={similarBlog.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/blog/${similarBlog.id}`)}
              >
                {similarBlog.coverImage && (
                  <img
                    src={similarBlog.coverImage}
                    alt={similarBlog.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                )}
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                    {similarBlog.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {similarBlog.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {similarBlog.estimatedReadTime} min
                    </span>
                    <span>
                      {format(new Date(similarBlog.createdAt), "MMM dd, yyyy")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
