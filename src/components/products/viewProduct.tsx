import { useNavigate, useParams } from "react-router-dom";
import { useGetProductById } from "@/hooks/useProduct";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useSelectedDataStore } from "@/store/selectedStore";
import Breadcrumb from "../dashboard/Breadcumb";
import { Pricing } from "@/pages/seoContent/pricing";

export default function ViewProduct() {
  const { vid } = useParams<{ vid: string }>();
  const { selectedBrand, selectedCategory, selectedSubcategory, selectedProduct } = useSelectedDataStore()
  const decodeHtml = (html: string) => {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = html;
    return textarea.value;
  };


  const { data: product, isLoading } = useGetProductById(vid || "");

  const breadcrumbLinks = [
    { label: selectedBrand?.name || "Brands", href: "/dashboard/brands" },
    { label: selectedCategory?.title || "Product Types", href: `/dashboard/category/${selectedBrand?.slug || ""}` },
    { label: selectedSubcategory?.title || "Categories", href: `/dashboard/category/${selectedBrand?.slug || ""}/subcategory/${selectedCategory?.slug || ""}` },
    { label: selectedProduct?.name || "Products", href: `/dashboard/category/${selectedBrand?.slug || ""}/subcategory/${selectedCategory?.slug || ""}/products/${selectedSubcategory?.slug || selectedSubcategory?.original?.slug || ""}` },
    { label: "View Details", isActive: true },
  ];

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6">
        <Breadcrumb links={breadcrumbLinks} />
        <Card>
          <CardContent className="p-6">
            <p className="text-red-500">Product not found {vid}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className=" space-y-6 max-w-7xl mx-auto">
      <Breadcrumb links={breadcrumbLinks} />

      <div className="mt-4 bg-muted/80 p-6 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">

            <div>
              <h1 className="text-2xl font-bold">{product?.product?.name}</h1>
              <p className="text-muted-foreground">Product Details</p>
            </div>
          </div>
        </div>

        {(product?.product?.coverImage || product?.product?.detailImage) && (
          <Card>
            <CardHeader className="px-0">
              <CardTitle>Product Images</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <div className="grid grid-cols-1  gap-6">
                {product?.product?.coverImage && (
                  <div className="max-w-lg">
                    <p className="text-sm font-medium mb-2">Cover Image</p>
                    <img
                      src={product?.product?.coverImage}
                      alt={product?.product?.name}
                      className="w-full h-50 object-cover rounded-lg border"
                    />
                  </div>
                )}
                {product?.product?.detailImage && (
                  <div>
                    <p className="text-sm font-medium mb-2">Detail Image</p>
                    <div className="grid grid-cols-4 gap-4">
                      {
                        product?.product?.detailImage.map((imgUrl: string, index: number) => (
                          <div key={index} className="max-w-xs">
                            <img
                              src={imgUrl}
                              alt={`${product?.product?.name} - Detail ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border"
                            />
                          </div>
                        ))
                      }
                    </div>
                  </div>
                )}
                {product?.product?.icons && (
                  <div>
                    <p className="text-sm font-medium mb-2">Icons</p>
                    <div className="grid grid-cols-4 gap-4">
                      {
                        product?.product?.icons.map((iconUrl: string, index: number) => (
                          <div key={index} className="max-w-xs">
                            <img
                              src={iconUrl}
                              alt={`${product?.product?.name} - Icon ${index + 1}`}
                              className="w-full h-32 object-contain rounded-lg border bg-white p-2"
                            />
                          </div>
                        ))
                      }
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="px-0">
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Product Name
                </p>
                <p className=" font-semibold">{product?.product?.name}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Slug</p>
                <p className="">{product?.product?.slug}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Model</p>
                <p className="">{product?.product?.model}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">USP</p>
                <div className="flex items-center gap-3">
                  <p className=" font-semibold ">
                    {product?.product?.productType}
                  </p>
                  {product?.product?.mrp && (
                    <p className="text-sm text-muted-foreground line-through">
                      ${product?.product?.mrp}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Status
                </p>
                <div className="flex gap-4">
                  <span
                    className={`px-4 rounded-xs py-0.5 h-fit ${product?.product?.isPublished ? "bg-green-500 text-white" : "bg-blue-500 text-white"}`}
                  >
                    {product?.product?.isPublished ? "Published" : "Draft"}
                  </span>
                  {product?.product?.isPopular && <span className="bg-primary text-white px-4 rounded-xs  py-0.5 flex gap-2 items-center"><Icon icon={"garden:check-badge-fill-12"} /> Popular</span>}
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Short Description
              </p>
              <div dangerouslySetInnerHTML={{ __html: product?.product?.shortDescription }}></div>
            </div>

            <div>
              <p className=" font-medium  mb-2">
                Full Description
              </p>
              <div dangerouslySetInnerHTML={{ __html: product?.product?.description }}></div>

            </div>

            {product?.product?.technology && (
              <div>
                <p className=" font-medium  mb-2">
                  Technology
                </p>
                <p className="text-base whitespace-pre-wrap">
                  {product?.product?.technology}
                </p>
              </div>
            )}

            {product?.product?.feature && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Features
                </p>

                {product?.product?.productType?.toLowerCase() === 'saas' ? (
                  // Pricing UI for SAAS products
                  (() => {
                    try {
                      // Try to parse features as JSON
                      let featuresData = product?.product?.feature;

                      // If it's HTML encoded, decode it first
                      if (typeof featuresData === 'string' && featuresData.includes('&')) {
                        featuresData = decodeHtml(featuresData);
                      }

                      // Remove pre/code tags if present
                      if (typeof featuresData === 'string') {
                        featuresData = featuresData
                          .replace(/^<pre><code[^>]*>/, '')
                          .replace(/<\/code><\/pre>$/, '');
                      }

                      const pricingPlans = JSON.parse(featuresData);

                      // Transform array of strings to the expected format
                      const transformedPlans = Array.isArray(pricingPlans)
                        ? pricingPlans.map((plan: any) => ({
                          ...plan,
                          features: Array.isArray(plan.features) && typeof plan.features[0] === 'string'
                            ? [{ cat: 'Features', feature: plan.features }]
                            : plan.features
                        }))
                        : [pricingPlans].map((plan: any) => ({
                          ...plan,
                          features: Array.isArray(plan.features) && typeof plan.features[0] === 'string'
                            ? [{ cat: 'Features', feature: plan.features }]
                            : plan.features
                        }));

                      return <Pricing plans={transformedPlans} />;
                    } catch (e) {
                      // Fallback to regular HTML rendering if JSON parsing fails
                      return (
                        <div
                          className="editor"
                          dangerouslySetInnerHTML={{
                            __html: (() => {
                              let html = decodeHtml(product?.product?.feature || '');
                              html = html
                                .replace(/^<pre><code[^>]*>/, '')
                                .replace(/<\/code><\/pre>$/, '');
                              return html;
                            })()
                          }}
                        />
                      );
                    }
                  })()
                ) : (
                  // Regular HTML rendering for non-SAAS products
                  <div
                    className="editor"
                    dangerouslySetInnerHTML={{
                      __html: (() => {
                        let html = decodeHtml(product?.product?.feature || '');
                        html = html
                          .replace(/^<pre><code[^>]*>/, '')
                          .replace(/<\/code><\/pre>$/, '');
                        return html;
                      })()
                    }}
                  />
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* SEO Information */}
        {
          (product?.product?.metaTitle || product?.product?.metadescription || product?.product?.metatag) && (
            <Card className="px-0">
              <CardHeader className="p-0">
                <CardTitle className="px-0">SEO Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-0">
                {product?.product?.metaTitle && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Meta Title
                    </p>
                    <p className="text-base">{product?.product?.metaTitle}</p>
                  </div>
                )}

                {product?.product?.metadescription && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Meta Description
                    </p>
                    <p className="text-base">{product?.product?.metadescription}</p>
                  </div>
                )}

                {product?.product?.metatag && product?.product?.metatag.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Meta Tags
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {product?.product?.metatag.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        }

        {/* Metadata */}
        <Card>
          <CardHeader className="px-0">
            <CardTitle className="px-0">Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Product ID
                </p>
                <p className="text-sm font-mono">{product?.product?.id}</p>
              </div>

              {product?.product?.createdAt && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Created At
                  </p>
                  <p className="text-sm">
                    {new Date(product?.product?.createdAt).toLocaleString()}
                  </p>
                </div>
              )}

              {product?.product?.updatedAt && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Last Updated
                  </p>
                  <p className="text-sm">
                    {new Date(product?.product?.updatedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div >
  );
}
