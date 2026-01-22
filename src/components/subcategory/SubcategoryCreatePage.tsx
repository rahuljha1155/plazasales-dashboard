import { useParams, useNavigate } from "react-router-dom";
import Breadcumb from "@/components/dashboard/Breadcumb";
import { SubcategoryForm } from "./SubcategoryForm";
import { useGetCategoryBySlug } from "@/services/category";
import { Card, CardContent } from "@/components/ui/card";
import { Loader } from "lucide-react";

export default function SubcategoryCreatePage() {
  const params = useParams();
  const navigate = useNavigate();
  const { data: category, isLoading } = useGetCategoryBySlug(params.categorySlug || "");

  const handleSuccess = () => {
    navigate(-1);
  };

  const handleCancel = () => {
    navigate(-1);
  };

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

  return (
    <div className="w-full space-y-6">
      <Breadcumb
        links={[
          { label: params.brandSlug || "Brand", href: `/dashboard/brands` },
          { label: params.categorySlug || "Product Type", href: `/dashboard/category/${params.brandSlug}` },
          { label: "Product Category", href: `/dashboard/category/${params.brandSlug}/subcategory/${params.categorySlug}` },
          { label: "Create Subcategory", isActive: true },
        ]}
      />
      <SubcategoryForm
        mode="create"
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}
