import { useParams, useNavigate } from "react-router-dom";
import { format, isValid } from "date-fns";
import {
  Calendar,
  ArrowUpDown,
  Tag,
  Link2,
  ArrowLeft,
  Edit,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Breadcumb from "@/components/dashboard/Breadcumb";
import { useGetSubCategoryByIdOrSlug } from "@/services/subcategory";
import { useGetProductsBySubcategory } from "@/services/product";
import { Loader } from "lucide-react";

const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return isValid(date) ? format(date, "MMM d, yyyy 'at' h:mm a") : "N/A";
};

export default function SubcategoryViewPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { data: subcategoryData, isLoading } = useGetSubCategoryByIdOrSlug(params.subcategorySlug || "");

  //@ts-ignore
  const subcategory = subcategoryData;

  // Fetch products for this subcategory
  const { data: productsData, isLoading: productsLoading } = useGetProductsBySubcategory(
    subcategory?.subCategory?.id || "",
    { page: 1 }
  );

  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        <Card>
          <CardContent className="p-12 flex items-center justify-center">
            <Loader className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!subcategory) {
    return (
      <div className="w-full space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Subcategory not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Breadcumb
            links={[
              { label: params.brandSlug || "Brand", href: `/dashboard/brands` },
              { label: params.categorySlug || "Product Type", href: `/dashboard/category/${params.brandSlug}` },
              { label: "Product Category", href: `/dashboard/category/${params.brandSlug}/subcategory/${params.categorySlug}` },
              { label: subcategory?.subCategory?.title || "category", href: `/dashboard/category/${params.brandSlug}/subcategory/${params.categorySlug}` },
              { label: "View Subcategory", isActive: true },
            ]}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button
            size="sm"
            onClick={() => navigate(`/dashboard/category/${params.brandSlug}/subcategory/${params.categorySlug}/edit/${subcategory?.subCategory?.slug}`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6">
        {/* Title and Status */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <CardTitle className="text-3xl font-bold">
                  {subcategory?.subCategory?.title || "Untitled Subcategory"}
                </CardTitle>
              </div>
            </div>
          </CardHeader>

          {subcategory?.subCategory?.coverImage && (
            <CardContent>
              <div className="relative aspect-video max-w-2xl rounded-lg overflow-hidden bg-gray-100 border">
                <img
                  src={subcategory.subCategory.coverImage}
                  alt={subcategory.subCategory.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </CardContent>
          )}
        </Card>

        {/* Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Subcategory Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Link2 className="h-4 w-4" />
                  Slug
                </div>
                <div className="font-mono text-sm bg-muted p-4 rounded-lg break-all">
                  {subcategory?.subCategory?.slug}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  Category
                </div>
                <div className="text-sm bg-muted p-4 rounded-lg">
                  {subcategory?.subCategory?.title || "N/A"}
                </div>
              </div>

              {subcategory?.subCategory?.sortOrder !== undefined && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <ArrowUpDown className="h-4 w-4" />
                    Sort Order
                  </div>
                  <div className="text-sm bg-muted p-4 rounded-lg">
                    {subcategory?.subCategory?.sortOrder}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  Subcategory ID
                </div>
                <div className="font-mono text-xs bg-muted p-4 rounded-lg break-all">
                  {subcategory?.subCategory?.id}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>



        {/* Timestamps */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-4 bg-muted/50 p-4 rounded-lg">
                <div className="p-2 bg-background rounded-md">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Created</p>
                  <p className="text-sm font-semibold">{formatDate(subcategory?.subCategory?.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-muted/50 p-4 rounded-lg">
                <div className="p-2 bg-background rounded-md">
                  <ArrowUpDown className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                  <p className="text-sm font-semibold">{formatDate(subcategory?.subCategory?.updatedAt)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
