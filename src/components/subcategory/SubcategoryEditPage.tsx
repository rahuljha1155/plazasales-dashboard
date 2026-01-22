import { useParams, useNavigate } from "react-router-dom";
import Breadcumb from "@/components/dashboard/Breadcumb";
import { SubcategoryForm } from "./SubcategoryForm";
import { useGetSubCategoryByIdOrSlug } from "@/services/subcategory";
import { Card, CardContent } from "@/components/ui/card";
import { Loader } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

export default function SubcategoryEditPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { data: subcategoryData, isLoading } = useGetSubCategoryByIdOrSlug(params.subcategorySlug || "");

  const subcategory = subcategoryData;

  const handleSuccess = () => {
    navigate(`/dashboard/category/${params.brandSlug}/subcategory/${params.categorySlug}`);
  };

  const handleCancel = () => {
    navigate(`/dashboard/category/${params.brandSlug}/subcategory/${params.categorySlug}`);
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

  if (!subcategory) {
    return (
      <div className="w-full space-y-6">
        <Breadcumb
          links={[
            { label: params.brandSlug || "Brand", href: `/dashboard/brands` },
            { label: params.categorySlug || "Product Type", href: `/dashboard/category/${params.brandSlug}` },
            { label: "Product Category", href: `/dashboard/category/${params.brandSlug}/subcategory/${params.categorySlug}` },
            { label: "Sub Category", href: `#` },
            { label: "Edit Subcategory", isActive: true },
          ]}
        />
        <pre>{ }</pre>
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

      <Breadcumb
        links={[
          { label: params.brandSlug || "Brand", href: `/dashboard/brands` },
          { label: params.categorySlug || "Product Type", href: `/dashboard/category/${params.brandSlug}` },
          { label: "Product Category", href: `/dashboard/category/${params.brandSlug}/subcategory/${params.categorySlug}` },
          { label: subcategory?.subCategory?.title || "category", href: `/dashboard/category/${params.brandSlug}/subcategory/${params.categorySlug}` },
          { label: "Edit Subcategory", isActive: true },
        ]}
      />
      <SubcategoryForm
        categoryId={subcategory?.subCategory?.id}
        mode="edit"
        subcategory={subcategory?.subCategory}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}
