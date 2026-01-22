import { useParams, useNavigate } from "react-router-dom";
import Breadcumb from "@/components/dashboard/Breadcumb";
import { CategoryForm } from "./CategoryForm";
import { useGetCategoryBySlug } from "@/services/category";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CategoryEditPage() {
  const params = useParams();
  const navigate = useNavigate();
  const categorySlug = params.categorySlug;

  // Fetch category by slug
  const { data: categoryData, isLoading: isCategoryLoading } = useGetCategoryBySlug(categorySlug || "");
  const category = categoryData?.category;


  const isLoading = isCategoryLoading;

  const handleSuccess = () => {
    navigate(`/dashboard/category/${params.id}`);
  };

  const handleCancel = () => {
    navigate(`/dashboard/category/${params.id}`);
  };





  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-6 w-16" />
        </div>
        <div className="max-w-4xl space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-80 w-full rounded-lg" />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="w-full space-y-6">
        <Breadcumb
          links={[
            { label: params?.id || "Categories", href: "/dashboard/brands" },
            { label: params?.categorySlug || "Category", href: `/dashboard/category/${params.id || ""}` },
            { label: "Edit Product Type", isActive: true },
          ]}
        />
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
      <Breadcumb
        links={[
          { label: params?.id || "Categories", href: "/dashboard/brands" },
          { label: params?.categorySlug || "Category", href: `/dashboard/category/${params.id || ""}` },
          { label: "Edit Product Type", isActive: true },
        ]}
      />
      <CategoryForm
        mode="edit"
        category={category}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}
