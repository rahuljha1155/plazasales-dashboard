import { useParams, useNavigate } from "react-router-dom";
import { format, isValid } from "date-fns";
import { 
  Calendar, 
  ArrowUpDown, 
  Tag, 
  Link2, 
  ArrowLeft,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Breadcumb from "@/components/dashboard/Breadcumb";
import { useGetBrandBySlug } from "@/services/brand";

// Helper function to safely format dates
const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return isValid(date) ? format(date, "MMM d, yyyy 'at' h:mm a") : "N/A";
};

export default function CategoryViewPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { data: brand } = useGetBrandBySlug(params.id || "");
  
  // Find the category by slug
  const category = brand?.brand?.categories?.find(
    (cat: any) => cat.slug === params.categorySlug
  );

  if (!category) {
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
            <p className="text-muted-foreground">Category not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }




  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start ">
        <div className="space-y-2">
          <Breadcumb
            links={[
              { label: params?.id || "Categories", href: "/dashboard/brands" },
              { label: params?.categorySlug || "Category", href: `/dashboard/category/${params.id || ""}` },
              { label: "View Product Type", isActive: true },
            ]}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 border rounded-xl">
        {/* Title and Status */}
        <Card className="">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <CardTitle className="text-xl font-bold">
                  {category.title}
                </CardTitle>
                <div className="flex gap-2">
                  {category.isDeleted === false && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  )}
                  {category.isDeleted === true && (
                    <Badge variant="secondary" className="bg-red-100 text-red-800">
                      Deleted
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          
          {category.coverImage && (
            <CardContent>
              <div className="relative max-w-2xl aspect-video rounded-lg overflow-hidden bg-gray-100 border">
                <img
                  src={category.coverImage}
                  alt={category.title}
                  className="w-full  h-full object-contain"
                />
              </div>
            </CardContent>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Category Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Link2 className="h-4 w-4" />
                  Slug
                </div>
                <div className="font-mono text-sm bg-muted p-4 rounded-lg break-all">
                  {category.slug}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  Brand
                </div>
                <div className="text-sm bg-muted p-4 rounded-lg">
                  {brand?.brand?.name || "N/A"}
                </div>
              </div>

              {category.sortOrder !== undefined && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <ArrowUpDown className="h-4 w-4" />
                    Sort Order
                  </div>
                  <div className="text-sm bg-muted p-4 rounded-lg">
                    {category.sortOrder}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  Category ID
                </div>
                <div className="font-mono text-xs bg-muted p-4 rounded-lg break-all">
                  {category.id}
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
                  <p className="text-sm font-semibold">{formatDate(category.createdAt)}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 bg-muted/50 p-4 rounded-lg">
                <div className="p-2 bg-background rounded-md">
                  <ArrowUpDown className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                  <p className="text-sm font-semibold">{formatDate(category.updatedAt)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
